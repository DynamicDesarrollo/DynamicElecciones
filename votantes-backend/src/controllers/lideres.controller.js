
// Control de commit: fix uuid join - Sirjhan Betancourt 2026-02-01
const db = require('../utils/db.js');
const { filtroLideres } = require('../utils/scope');
const { aspiranteParaLider } = require('../utils/jerarquia');
const { barrioDesdeBody } = require('../utils/barrios');

// Responde errores de jerarquía con su estado; el resto como error genérico
const responderError = (res, err, mensaje) => {
  if (err.status) return res.status(err.status).json({ error: err.message });
  console.error(mensaje, err);
  return res.status(500).json({ error: mensaje, details: err.message });
};

const SELECT_LIDER = `
  SELECT l.*, a.nombre_completo AS aspirante_nombre, a.cargo AS aspirante_cargo,
    (SELECT COUNT(*) FROM prospectos_votantes pv WHERE pv.lider_id = l.id)::int AS total_votantes,
    m.nombre AS municipio_nombre,
    b.nombre AS barrio_nombre
  FROM lideres l
  JOIN aspirantes a ON a.id = l.aspirante_id
  LEFT JOIN municipios m ON l.municipio = m.id
  LEFT JOIN barrios b ON l.barrio = b.id`;

// Obtener un líder por id
const getLiderById = async (req, res) => {
  const { valores, condiciones } = filtroLideres(req.usuario, 'l', [req.params.id]);
  try {
    const result = await db.query(`${SELECT_LIDER} WHERE l.id = $1 AND ${condiciones.join(' AND ')}`, valores);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Líder no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    responderError(res, err, 'Error al obtener líder');
  }
};

// Líderes visibles: toda la campaña para admin, solo los suyos para un aspirante
const getLideres = async (req, res) => {
  const { where, valores } = filtroLideres(req.usuario);
  try {
    const result = await db.query(`${SELECT_LIDER} ${where} ORDER BY l.nombre_completo`, valores);
    res.json(result.rows);
  } catch (err) {
    responderError(res, err, 'Error al obtener líderes');
  }
};

const createLider = async (req, res) => {
    const {
      nombre_completo,
      cedula,
      direccion,
      municipio,
      // Commit control: Sirjhan Betancourt 2026-02-01
      telefono,
      barrio,
      fecha_nace
    } = req.body;
    const { campana_id } = req.usuario;

    try {
      const aspiranteId = await aspiranteParaLider(req.usuario, req.body.aspirante_id);
      // Validar si ya existe un líder con la misma cédula en la campaña
      if (cedula) {
        const existe = await db.query('SELECT id FROM lideres WHERE cedula = $1 AND campana_id = $2', [cedula, campana_id]);
        if (existe.rows.length > 0) {
          return res.status(400).json({ error: 'Ya existe un líder con esa cédula.' });
        }
      }
      const result = await db.query(
        `INSERT INTO lideres (
          nombre_completo, aspirante_id,
          cedula, direccion, municipio, telefono, barrio, fecha_nace, campana_id
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
        [nombre_completo, aspiranteId, cedula || null, direccion, municipio || null, telefono, await barrioDesdeBody(req.body, municipio || null, 'barrio'), fecha_nace || null, campana_id]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      responderError(res, err, 'Error al crear líder');
    }
  };


const updateLider = async (req, res) => {
    const {
      nombre_completo,
      cedula,
      direccion,
      municipio,
      telefono,
      barrio,
      fecha_nace
    } = req.body;

    try {
      const aspiranteId = await aspiranteParaLider(req.usuario, req.body.aspirante_id);
      const { condiciones, valores } = filtroLideres(req.usuario, 'l', [
        nombre_completo, aspiranteId, cedula || null, direccion, municipio || null,
        telefono, await barrioDesdeBody(req.body, municipio || null, 'barrio'), fecha_nace || null, req.params.id,
      ]);
      const result = await db.query(
        `UPDATE lideres l SET
          nombre_completo = $1,
          aspirante_id = $2,
          cedula = $3,
          direccion = $4,
          municipio = $5,
          telefono = $6,
          barrio = $7,
          fecha_nace = $8
        WHERE l.id = $9 AND ${condiciones.join(' AND ')} RETURNING *`,
        valores
      );
      if (result.rowCount === 0) return res.status(404).json({ error: 'Líder no encontrado' });
      // Los votantes del líder siguen a su nuevo aspirante
      await db.query('UPDATE prospectos_votantes SET aspirante_id = $1 WHERE lider_id = $2', [aspiranteId, req.params.id]);
      res.json(result.rows[0]);
    } catch (err) {
      responderError(res, err, 'Error al actualizar líder');
    }
  };


const deleteLider = async (req, res) => {
  const id = (req.params.id || '').trim();
  try {
    // Validar si el líder tiene votantes asociados
    const votantesResult = await db.query('SELECT COUNT(*) AS total FROM prospectos_votantes WHERE lider_id = $1', [id]);
    const totalVotantes = parseInt(votantesResult.rows[0].total, 10);
    if (totalVotantes > 0) {
      return res.status(400).json({
        error: 'No se puede eliminar el líder porque tiene votantes asociados.',
        totalVotantes
      });
    }
    const { condiciones, valores } = filtroLideres(req.usuario, 'l', [id]);
    const result = await db.query(`DELETE FROM lideres l WHERE l.id = $1 AND ${condiciones.join(' AND ')}`, valores);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Líder no encontrado' });
    }
    res.json({ message: 'Líder eliminado correctamente', idEliminado: id });
  } catch (err) {
    responderError(res, err, 'Error al eliminar líder');
  }
};
module.exports = {
  getLideres,
  createLider,
  updateLider,
  deleteLider,
  getLiderById
};
