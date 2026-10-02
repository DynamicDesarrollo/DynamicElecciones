const db = require('../utils/db.js');
const { filtroVotantes } = require('../utils/scope');
const { aspiranteParaVotante } = require('../utils/jerarquia');
const { barrioDesdeBody } = require('../utils/barrios');

// Responde errores de jerarquía con su estado; el resto como error genérico
const responderError = (res, err, mensaje, status = 500) => {
  if (err.status) return res.status(err.status).json({ error: err.message });
  console.error(`❌ ${mensaje}:`, err);
  return res.status(status).json({ error: mensaje, details: err.message });
};

// Votante con la misma cédula bajo el mismo aspirante (dentro de la campaña)
const buscarDuplicado = async (campana_id, aspirante_id, cedula, excluirId = null) => {
  const { rows } = await db.query(
    `SELECT pv.id, pv.nombre_completo AS votante_nombre, l.nombre_completo AS lider_nombre
     FROM prospectos_votantes pv
     LEFT JOIN lideres l ON pv.lider_id = l.id
     WHERE pv.campana_id = $1 AND pv.aspirante_id = $2 AND pv.cedula = $3
       AND ($4::uuid IS NULL OR pv.id <> $4)
     LIMIT 1`,
    [campana_id, aspirante_id, cedula, excluirId]
  );
  return rows[0] || null;
};

const vacioANull = (v) => (v === '' || v === undefined ? null : v);

// Mesa del votante: la elegida de la lista o, si el puesto no tiene mesas cargadas
// (la Registraduría no publica todas), la que se escribe a mano; se crea si no existe.
const resolverMesa = async ({ mesa_id, mesa_numero, lugar_id }) => {
  if (vacioANull(mesa_id) || !vacioANull(lugar_id) || !String(mesa_numero ?? '').trim()) return vacioANull(mesa_id);
  const numero = String(mesa_numero).trim();
  const existente = await db.query('SELECT id FROM mesas_votacion WHERE lugar_id = $1 AND numero = $2', [lugar_id, numero]);
  if (existente.rows[0]) return existente.rows[0].id;
  const nueva = await db.query('INSERT INTO mesas_votacion (numero, lugar_id) VALUES ($1, $2) RETURNING id', [numero, lugar_id]);
  return nueva.rows[0].id;
};

// Crear votante. El aspirante no se elige: sale del líder, del usuario o del principal.
// La misma cédula se permite bajo aspirantes distintos (el admin la ve en el informe de duplicados).
const createVotante = async (req, res) => {
  const {
    nombre_completo,
    cedula,
    telefono,
    direccion,
    municipio_id,
    barrio_id,
    lider_id,
    zona,
    mesa_id,
    lugar_id,
    sexo,
    activo = true // por defecto true si no viene
  } = req.body;
  const { id: userId, campana_id } = req.usuario;

  if (!nombre_completo?.trim() || !cedula?.trim()) {
    return res.status(400).json({ error: 'Nombre y cédula son obligatorios' });
  }

  try {
    const aspiranteId = await aspiranteParaVotante(req.usuario, vacioANull(lider_id));

    const duplicado = await buscarDuplicado(campana_id, aspiranteId, cedula.trim());
    if (duplicado) {
      return res.status(409).json({ existe: true, ...duplicado });
    }

    const result = await db.query(
      `INSERT INTO prospectos_votantes (
        nombre_completo, cedula, telefono, direccion,
        municipio_id, barrio_id, lider_id, zona,
        mesa_id, lugar_id, sexo, usuario_id, activo,
        campana_id, aspirante_id
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
      RETURNING *`,
      [
        nombre_completo.trim(),
        cedula.trim(),
        telefono,
        direccion,
        vacioANull(municipio_id),
        await barrioDesdeBody(req.body, vacioANull(municipio_id)),
        vacioANull(lider_id),
        vacioANull(zona),
        await resolverMesa(req.body),
        vacioANull(lugar_id),
        vacioANull(sexo),
        userId,
        activo,
        campana_id,
        aspiranteId
      ]
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    responderError(res, err, 'Error al crear votante', 400);
  }
};

// Total de votantes visibles (dashboard/asistencia)
const getTotalVotantes = async (req, res) => {
  const { where, valores } = filtroVotantes(req.usuario);
  try {
    const result = await db.query(`SELECT COUNT(*) AS total FROM prospectos_votantes pv ${where}`, valores);
    res.json({ total: parseInt(result.rows[0].total) });
  } catch (err) {
    responderError(res, err, 'Error al obtener total de votantes');
  }
};

// ✅ Votantes visibles para el usuario, paginados
const getVotantes = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const { condiciones, valores } = filtroVotantes(req.usuario);

  // Búsqueda por nombre o cédula y filtro de estado
  const busqueda = (req.query.busqueda || '').trim();
  if (busqueda) {
    condiciones.push(`(pv.nombre_completo ILIKE $${valores.length + 1} OR pv.cedula ILIKE $${valores.length + 1})`);
    valores.push(`%${busqueda}%`);
  }
  if (req.query.activo === 'true' || req.query.activo === 'false') {
    condiciones.push(`pv.activo = $${valores.push(req.query.activo === 'true')}`);
  }
  const where = `WHERE ${condiciones.join(' AND ')}`;

  try {
    const dataQuery = `
      SELECT
        pv.*,
        b.nombre AS barrio_nombre,
        m.nombre AS municipio_nombre,
        l.nombre_completo AS lider_nombre,
        l.direccion AS direccion_lider,
        a.nombre_completo AS aspirante_nombre,
        a.cargo AS aspirante_cargo
      FROM prospectos_votantes pv
      JOIN aspirantes a ON a.id = pv.aspirante_id
      LEFT JOIN barrios b ON pv.barrio_id = b.id
      LEFT JOIN municipios m ON pv.municipio_id = m.id
      LEFT JOIN lideres l ON pv.lider_id = l.id
      ${where}
      ORDER BY pv.fecha_registro DESC
      LIMIT $${valores.length + 1}
      OFFSET $${valores.length + 2}
    `;

    const totalQuery = `SELECT COUNT(*) AS count FROM prospectos_votantes pv ${where}`;

    const dataResult = await db.query(dataQuery, [...valores, limit, offset]);
    const totalResult = await db.query(totalQuery, valores);

    return res.json({
      data: dataResult.rows.map(row => ({
        ...row,
        direccion_lider: row.direccion_lider || ''
      })),
      total: parseInt(totalResult.rows[0].count),
      page,
      totalPages: Math.ceil(totalResult.rows[0].count / limit)
    });
  } catch (err) {
    responderError(res, err, 'Error al obtener votantes');
  }
};

// ✅ Actualizar votante (solo dentro de lo que el usuario puede ver).
// Si cambia el líder, el votante pasa al aspirante de ese líder.
const updateVotante = async (req, res) => {
  const { id } = req.params;
  const {
    nombre_completo,
    cedula,
    telefono,
    direccion,
    municipio_id,
    barrio_id,
    lider_id,
    zona,
    mesa_id,
    lugar_id,
    sexo,
    activo
  } = req.body;

  try {
    const filtro = filtroVotantes(req.usuario, 'pv', [id]);
    const actual = await db.query(
      `SELECT pv.aspirante_id FROM prospectos_votantes pv WHERE pv.id = $1 AND ${filtro.condiciones.join(' AND ')}`,
      filtro.valores
    );
    if (actual.rowCount === 0) {
      return res.status(404).json({ error: 'Votante no encontrado' });
    }

    const aspiranteId = vacioANull(lider_id)
      ? await aspiranteParaVotante(req.usuario, lider_id)
      : actual.rows[0].aspirante_id;

    const duplicado = await buscarDuplicado(req.usuario.campana_id, aspiranteId, cedula?.trim(), id);
    if (duplicado) {
      return res.status(409).json({ existe: true, ...duplicado });
    }

    const result = await db.query(
      `UPDATE prospectos_votantes SET
        nombre_completo = $1,
        cedula = $2,
        telefono = $3,
        direccion = $4,
        municipio_id = $5,
        barrio_id = $6,
        lider_id = $7,
        aspirante_id = $8,
        zona = $9,
        mesa_id = $10,
        lugar_id = $11,
        sexo = $12,
        activo = COALESCE($13, activo)
      WHERE id = $14
      RETURNING *`,
      [
        nombre_completo,
        cedula?.trim(),
        telefono,
        direccion,
        vacioANull(municipio_id),
        await barrioDesdeBody(req.body, vacioANull(municipio_id)),
        vacioANull(lider_id),
        aspiranteId,
        vacioANull(zona),
        await resolverMesa(req.body),
        vacioANull(lugar_id),
        vacioANull(sexo),
        typeof activo === 'boolean' ? activo : null,
        id
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    responderError(res, err, 'Error al actualizar votante');
  }
};

// ✅ Eliminar votante (solo dentro de lo que el usuario puede ver)
const deleteVotante = async (req, res) => {
  const { condiciones, valores } = filtroVotantes(req.usuario, 'pv', [req.params.id]);
  try {
    const result = await db.query(
      `DELETE FROM prospectos_votantes pv WHERE pv.id = $1 AND ${condiciones.join(' AND ')}`,
      valores
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Votante no encontrado' });
    }
    res.json({ message: 'Votante eliminado correctamente' });
  } catch (err) {
    responderError(res, err, 'Error al eliminar votante');
  }
};

// Validar la cédula antes de guardar.
// `bloquea` es true solo si ya está bajo el mismo aspirante al que iría el votante (según ?lider_id).
// Si está bajo otro aspirante que el usuario puede ver (admin), se informa sin bloquear.
const validarCedula = async (req, res) => {
  const { cedula } = req.params;
  try {
    const aspiranteDestino = await aspiranteParaVotante(req.usuario, vacioANull(req.query.lider_id));
    const { condiciones, valores } = filtroVotantes(req.usuario, 'pv', [cedula]);
    const { rows } = await db.query(
      `SELECT pv.id, pv.nombre_completo AS votante_nombre, l.nombre_completo AS lider_nombre,
              a.nombre_completo AS aspirante_nombre, pv.aspirante_id
       FROM prospectos_votantes pv
       JOIN aspirantes a ON a.id = pv.aspirante_id
       LEFT JOIN lideres l ON pv.lider_id = l.id
       WHERE pv.cedula = $1 AND ${condiciones.join(' AND ')}
       ORDER BY (pv.aspirante_id = $${valores.push(aspiranteDestino)}) DESC
       LIMIT 1`,
      valores
    );
    const encontrado = rows[0];
    if (!encontrado) return res.json({ existe: false, bloquea: false });
    const { aspirante_id, ...datos } = encontrado;
    return res.json({ existe: true, bloquea: aspirante_id === aspiranteDestino, ...datos });
  } catch (err) {
    responderError(res, err, 'Error al validar cédula');
  }
};

// Exportar a Excel los votantes visibles para el usuario
const exportarExcelVotantes = async (req, res) => {
  const { where, valores } = filtroVotantes(req.usuario);
  try {
    const result = await db.query(`
      SELECT pv.*, b.nombre AS barrio_nombre, m.nombre AS municipio_nombre, l.nombre_completo AS lider_nombre, l.direccion AS direccion_lider,
              lv.nombre AS lugar_nombre, mv.numero AS mesa_nombre, a.nombre_completo AS aspirante_nombre
      FROM prospectos_votantes pv
      JOIN aspirantes a ON a.id = pv.aspirante_id
      LEFT JOIN barrios b ON pv.barrio_id = b.id
      LEFT JOIN municipios m ON pv.municipio_id = m.id
      LEFT JOIN lideres l ON pv.lider_id = l.id
      LEFT JOIN lugares_votacion lv ON pv.lugar_id = lv.id
      LEFT JOIN mesas_votacion mv ON pv.mesa_id = mv.id
      ${where}
      ORDER BY pv.fecha_registro DESC
    `, valores);
    const votantes = result.rows;
    // Convertir a formato Excel
    const XLSX = require('xlsx');
    const data = votantes.map(v => ({
      Nombre: v.nombre_completo,
      Cedula: v.cedula,
      Telefono: v.telefono,
      Barrio: v.barrio_nombre,
      Municipio: v.municipio_nombre,
      Aspirante: v.aspirante_nombre,
      Lider: v.lider_nombre || '',
      'A Quien Pertenece': v.direccion_lider || '',
      Lugar: v.lugar_nombre || '',
      Mesa: v.mesa_nombre || '',
      Zona: v.zona,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Votantes');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
    res.setHeader('Content-Disposition', 'attachment; filename="votantes.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    res.removeHeader && res.removeHeader('Last-Modified');
    res.removeHeader && res.removeHeader('ETag');
    return res.status(200).send(excelBuffer);
  } catch (err) {
    responderError(res, err, 'Error al exportar votantes');
  }
};

module.exports = {
  getVotantes,
  createVotante,
  updateVotante,
  deleteVotante,
  getTotalVotantes,
  validarCedula,
  exportarExcelVotantes
};
