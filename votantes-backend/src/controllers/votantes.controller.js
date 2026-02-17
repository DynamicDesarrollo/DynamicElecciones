const db = require('../utils/db.js');


// Crear votante: si la cédula existe, responde con info; si no, inserta
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
    sexo
  } = req.body;
  const { id: userId, aspirante_concejo_id, aspirante_alcaldia_id, rol } = req.usuario;
  try {
    // Validar si existe la cédula
    const existe = await db.query(
      `SELECT pv.id, pv.nombre_completo AS votante_nombre, l.nombre_completo AS lider_nombre
       FROM prospectos_votantes pv
       LEFT JOIN lideres l ON pv.lider_id = l.id
       WHERE pv.cedula = $1 LIMIT 1`,
      [cedula]
    );
    if (existe.rows.length > 0) {
      return res.status(409).json({ existe: true, ...existe.rows[0] });
    }

    // Permitir que el rol 'user' cree votantes aunque no tenga aspirante asociado
    if (!aspirante_concejo_id && !aspirante_alcaldia_id && rol !== 'admin') {
      const result = await db.query(
        `INSERT INTO prospectos_votantes (
          nombre_completo, cedula, telefono, direccion,
          municipio_id, barrio_id, lider_id,
          zona, mesa_id, lugar_id, sexo, usuario_id
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
        RETURNING *`,
        [
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
          userId
        ]
      );
      return res.status(201).json(result.rows[0]);
    }

    let partido_id = null;
    if (aspirante_concejo_id) {
      const resPartido = await db.query("SELECT partido_id FROM aspirantes_concejo WHERE id = $1", [aspirante_concejo_id]);
      partido_id = resPartido.rows[0]?.partido_id || null;
    } else if (aspirante_alcaldia_id) {
      const resPartido = await db.query("SELECT partido_id FROM aspirantes_alcaldia WHERE id = $1", [aspirante_alcaldia_id]);
      partido_id = resPartido.rows[0]?.partido_id || null;
    }
    if (!partido_id) {
      return res.status(400).json({ error: "No se pudo determinar el partido del aspirante." });
    }
    const result = await db.query(
      `INSERT INTO prospectos_votantes (
        nombre_completo, cedula, telefono, direccion,
        municipio_id, barrio_id, lider_id,
        aspirante_concejo_id, aspirante_alcaldia_id, partido_id, zona,
        mesa_id, lugar_id, sexo
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
      RETURNING *`,
      [
        nombre_completo,
        cedula,
        telefono,
        direccion,
        municipio_id,
        barrio_id,
        lider_id,
        aspirante_concejo_id,
        aspirante_alcaldia_id,
        partido_id,
        zona,
        mesa_id,
        lugar_id,
        sexo
      ]
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error al crear votante:", err);
    res.status(400).json({ error: 'Error al crear votante', details: err.message });
  }
};

// Obtener el total de votantes (para dashboard/asistencia)
const getTotalVotantes = async (req, res) => {
  try {
    const result = await db.query('SELECT COUNT(*) AS total FROM prospectos_votantes');
    res.json({ total: parseInt(result.rows[0].total) });
  } catch (err) {
    console.error('❌ Error al obtener total de votantes:', err);
    res.status(500).json({ error: 'Error al obtener total de votantes' });
  }
};

// ✅ Obtener todos los votantes
const getVotantes = async (req, res) => {

  console.log('Entrando a getVotantes');
  const { id: userId, rol, aspirante_concejo_id, aspirante_alcaldia_id } = req.usuario;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const condiciones = [];
    const valores = [];

    if (rol !== "admin") {
      if (aspirante_concejo_id) {
        condiciones.push(`pv.aspirante_concejo_id = $${valores.length + 1}`);
        valores.push(aspirante_concejo_id);
      }
      if (aspirante_alcaldia_id) {
        condiciones.push(`pv.aspirante_alcaldia_id = $${valores.length + 1}`);
        valores.push(aspirante_alcaldia_id);
      }
      if (!aspirante_concejo_id && !aspirante_alcaldia_id && rol === 'user') {
        condiciones.push(`pv.usuario_id = $${valores.length + 1}`);
        valores.push(userId);
      }
    }

    const where = condiciones.length ? `WHERE ${condiciones.join(" OR ")}` : "";

    const dataQuery = `
      SELECT 
        pv.*,
        b.nombre AS barrio_nombre,
        m.nombre AS municipio_nombre,
        l.nombre_completo AS lider_nombre,
        l.direccion AS direccion_lider
      FROM prospectos_votantes pv
      LEFT JOIN barrios b ON pv.barrio_id = b.id
      LEFT JOIN municipios m ON pv.municipio_id = m.id
      LEFT JOIN lideres l ON pv.lider_id = l.id
      ${where}
      ORDER BY pv.fecha_registro DESC
      LIMIT $${valores.length + 1}
      OFFSET $${valores.length + 2}
    `;

    const totalQuery = `
      SELECT COUNT(*) AS count
      FROM prospectos_votantes pv
      ${where}
    `;

    const dataResult = await db.query(dataQuery, [...valores, limit, offset]);
    const totalResult = await db.query(totalQuery, valores);

    // Solo responder una vez
    if (!res.headersSent) {
      return res.json({
        data: dataResult.rows.map(row => ({
          ...row,
          direccion_lider: row.direccion_lider || ''
        })),
        total: parseInt(totalResult.rows[0].count),
        page,
        totalPages: Math.ceil(totalResult.rows[0].count / limit)
      });
    }
    return;
  } catch (err) {
    console.error("❌ Error al obtener votantes:", err);
    if (!res.headersSent) {
      return res.status(500).json({ error: "Error interno", detalle: err.message });
    }
    return;
  }
};

// ✅ Actualizar votante
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
    partido_id,
    zona,
    mesa_id,
    lugar_id,
    sexo
  } = req.body;
  console.log("Trae información de votante:", req.body);
  try {
    // Traer los valores actuales
    const current = await 
    db.query(
      'SELECT aspirante_concejo_id, aspirante_alcaldia_id, partido_id FROM prospectos_votantes WHERE id = $1', [id]);

    if (current.rowCount === 0) {
      return res.status(404).json({ error: 'Votante no encontrado' });
    }

    const existing = current.rows[0];

    const result = await db.query(
      `UPDATE prospectos_votantes SET
        nombre_completo = $1,
        cedula = $2,
        telefono = $3,
        direccion = $4,
        municipio_id = $5,
        barrio_id = $6,
        lider_id = $7,
        aspirante_concejo_id = $8,
        aspirante_alcaldia_id = $9,
        partido_id = $10,
        zona = $11,
        mesa_id = $12,
        lugar_id = $13,
        sexo = $14
      WHERE id = $15
      RETURNING *`,
      [
        nombre_completo,
        cedula,
        telefono,
        direccion,
        municipio_id,
        barrio_id,
        lider_id,
        existing.aspirante_concejo_id,
        existing.aspirante_alcaldia_id,
        existing.partido_id,
        zona,
        mesa_id,
        lugar_id,
        sexo,
        id
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar votante', details: err.message });
  }
};

// ✅ Eliminar votante
const deleteVotante = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM prospectos_votantes WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Votante no encontrado' });
    }
    res.json({ message: 'Votante eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar votante', details: err.message });
  }
};

// Validar si la cédula ya existe
const validarCedula = async (req, res) => {
  const { cedula } = req.params;
  
  try {
    const existe = await db.query(
      `SELECT pv.id, pv.nombre_completo AS votante_nombre, l.nombre_completo AS lider_nombre
       FROM prospectos_votantes pv
       LEFT JOIN lideres l ON pv.lider_id = l.id
       WHERE pv.cedula = $1 LIMIT 1`,
      [cedula]
    );
    
    if (existe.rows.length > 0) {
      return res.json({ existe: true, ...existe.rows[0] });
    } else {
      return res.json({ existe: false });
    }
  } catch (err) {
    console.error('❌ Error al validar cédula:', err);
    res.status(500).json({ error: 'Error al validar cédula', details: err.message });
  }
};

// Exportar votantes a Excel (masivo)
const exportarExcelVotantes = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT pv.*, b.nombre AS barrio_nombre, m.nombre AS municipio_nombre, l.nombre_completo AS lider_nombre, l.direccion AS direccion_lider
      FROM prospectos_votantes pv
      LEFT JOIN barrios b ON pv.barrio_id = b.id
      LEFT JOIN municipios m ON pv.municipio_id = m.id
      LEFT JOIN lideres l ON pv.lider_id = l.id
      ORDER BY pv.fecha_registro DESC
    `);
    const votantes = result.rows;
    // Convertir a formato Excel
    const XLSX = require('xlsx');
    const data = votantes.map(v => ({
      Nombre: v.nombre_completo,
      Cedula: v.cedula,
      Telefono: v.telefono,
      Barrio: v.barrio_nombre,
      Municipio: v.municipio_nombre,
      Lider: v.lider_nombre || '',
      'A Quien Pertenece': v.direccion_lider || ''
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
    console.error('❌ Error al exportar votantes:', err);
    res.status(500).json({ error: 'Error al exportar votantes', details: err.message });
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