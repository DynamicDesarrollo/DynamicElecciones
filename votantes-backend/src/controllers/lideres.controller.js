
// Control de commit: fix uuid join - Sirjhan Betancourt 2026-02-01
const db = require('../utils/db.js');

// Endpoint temporal para listar todos los líderes sin joins ni filtros
const getAllLideresRaw = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM lideres ORDER BY fecha_nace DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener todos los líderes', details: err.message });
  }
};

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
  let { id } = req.params;
  id = (id || '').trim();
  console.log('--- ELIMINAR LÍDER ---');
  console.log('ID recibido para eliminar líder:', id, '| typeof:', typeof id, '| length:', id.length);
  try {
    // Prueba de consulta sin ::uuid para aceptar cualquier string
    const result = await db.query('DELETE FROM lideres WHERE id = $1', [id]);
    console.log('Intento eliminar líder con id:', id, '| rowCount:', result.rowCount);
    if (result.rowCount === 0) {
      console.log('No se encontró líder con ese id.');
      return res.status(404).json({ error: 'Líder no encontrado', idRecibido: id });
    }
    console.log('Líder eliminado correctamente.');
    res.json({ message: 'Líder eliminado correctamente', idEliminado: id });
  } catch (err) {
    console.error('Error al eliminar líder:', err);
    res.status(500).json({ error: 'Error al eliminar líder', details: err.message, idRecibido: id });
  }
};
module.exports = {
  getLideres,
  createLider,
  updateLider,
  deleteLider,
  getLiderById,
  getAllLideresRaw
};
