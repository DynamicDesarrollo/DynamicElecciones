// Obtener un líder por id
const getLiderById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM lideres WHERE id = $1::uuid', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Líder no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener líder', details: err.message });
  }
};
// Control de commit: fix uuid join - Sirjhan Betancourt 2026-02-01
const db = require('../utils/db.js');

const getLideres = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT l.*, ac.nombre_completo AS aspirante_concejo,
        m.nombre AS municipio_nombre,
        b.nombre AS barrio_nombre
      FROM lideres l
      LEFT JOIN aspirantes_concejo ac ON l.aspirante_concejo_id::text = ac.id::text
      LEFT JOIN municipios m ON l.municipio = m.id
      LEFT JOIN barrios b ON l.barrio = b.id
      ORDER BY l.nombre_completo
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error SQL en getLideres:', err);
    res.status(500).json({ error: 'Error al obtener líderes', details: err.message, sql: err.toString() });
  }
};

const createLider = async (req, res) => {
    const {
      nombre_completo,
      aspirante_concejo_id,
      cedula,
      direccion,
      municipio,
      // Commit control: Sirjhan Betancourt 2026-02-01
      telefono,
      barrio,
      fecha_nace
    } = req.body;
  
    try {
      const result = await db.query(
        `INSERT INTO lideres (
          nombre_completo, aspirante_concejo_id,
          cedula, direccion, municipio, telefono, barrio, fecha_nace
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
        [nombre_completo, aspirante_concejo_id, cedula, direccion, municipio, telefono, barrio, fecha_nace]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(400).json({ error: 'Error al crear líder', details: err.message });
    }
  };
  

const updateLider = async (req, res) => {
    const { id } = req.params;
    const {
      nombre_completo,
      aspirante_concejo_id,
      cedula,
      direccion,
      municipio,
      telefono,
      barrio,
      fecha_nace
    } = req.body;
  
    try {
      const result = await db.query(
        `UPDATE lideres SET
          nombre_completo = $1,
          aspirante_concejo_id = $2,
          cedula = $3,
          direccion = $4,
          municipio = $5,
          telefono = $6,
          barrio = $7,
          fecha_nace = $8
        WHERE id = $9 RETURNING *`,
        [nombre_completo, aspirante_concejo_id, cedula, direccion, municipio, telefono, barrio, fecha_nace, id]
      );
      if (result.rowCount === 0) return res.status(404).json({ error: 'Líder no encontrado' });
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: 'Error al actualizar líder', details: err.message });
    }
  };
  

const deleteLider = async (req, res) => {
    // Log de conexión a la base de datos
    console.log('DB HOST:', process.env.PGHOST, 'DB NAME:', process.env.PGDATABASE, 'DB USER:', process.env.PGUSER);
  let { id } = req.params;
  id = (id || '').trim();
  console.log('ID recibido para eliminar líder:', id, '| typeof:', typeof id, '| length:', id.length);
  try {
    const result = await db.query('DELETE FROM lideres WHERE id = $1::uuid', [id]);
    console.log('Resultado DELETE rowCount:', result.rowCount);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Líder no encontrado' });
    }
    res.json({ message: 'Líder eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar líder', details: err.message });
  }
};
module.exports = {
  getLideres,
  createLider,
  updateLider,
  deleteLider,
  getLiderById
};
