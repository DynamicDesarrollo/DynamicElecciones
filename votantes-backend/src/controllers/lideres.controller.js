import db from '../utils/db.js';

// ✅ Obtener todos los líderes
export const getLideres = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT l.*, ac.nombre_completo AS aspirante_concejo
      FROM lideres l
      LEFT JOIN aspirantes_concejo ac ON l.aspirante_concejo_id = ac.id
      ORDER BY l.nombre_completo
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener líderes', details: err.message });
  }
};

// ✅ Crear líder
export const createLider = async (req, res) => {
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
  

// ✅ Actualizar líder
export const updateLider = async (req, res) => {
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
  

// ✅ Eliminar líder
export const deleteLider = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM lideres WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Líder no encontrado' });
    }
    res.json({ message: 'Líder eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar líder', details: err.message });
  }
};
