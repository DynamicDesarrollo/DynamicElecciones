import db from '../utils/db.js';

// ✅ Obtener todos los aspirantes al concejo
export const getAspirantesConcejo = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT ac.*, 
             p.nombre AS partido, 
             m.nombre AS municipio,
             a.nombre_completo AS alcalde_apoyado
      FROM aspirantes_concejo ac
      LEFT JOIN partidos p ON ac.partido_id = p.id
      LEFT JOIN municipios m ON ac.municipio_id = m.id
      LEFT JOIN aspirantes_alcaldia a ON ac.alcaldia_id = a.id
      ORDER BY ac.nombre_completo
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener aspirantes', details: err.message });
  }
};

// ✅ Crear aspirante al concejo
export const createAspiranteConcejo = async (req, res) => {
    const {
      nombre_completo,
      partido_id,
      municipio_id,
      alcaldia_id,
      cedula,
      direccion,
      telefono,
      barrio,
      fecha_nace
    } = req.body;
  
    try {
      const result = await db.query(
        `INSERT INTO aspirantes_concejo (
          nombre_completo, partido_id, municipio_id, alcaldia_id,
          cedula, direccion, telefono, barrio, fecha_nace
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
        [nombre_completo, partido_id, municipio_id, alcaldia_id, cedula, direccion, telefono, barrio, fecha_nace]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(400).json({ error: 'Error al crear concejal', details: err.message });
    }
  };
  

// ✅ Actualizar aspirante al concejo
export const updateAspiranteConcejo = async (req, res) => {
    const { id } = req.params;
    const {
      nombre_completo,
      partido_id,
      municipio_id,
      alcaldia_id,
      cedula,
      direccion,
      telefono,
      barrio,
      fecha_nace
    } = req.body;
  
    try {
      const result = await db.query(
        `UPDATE aspirantes_concejo SET
          nombre_completo = $1,
          partido_id = $2,
          municipio_id = $3,
          alcaldia_id = $4,
          cedula = $5,
          direccion = $6,
          telefono = $7,
          barrio = $8,
          fecha_nace = $9
        WHERE id = $10 RETURNING *`,
        [nombre_completo, partido_id, municipio_id, alcaldia_id, cedula, direccion, telefono, barrio, fecha_nace, id]
      );
      if (result.rowCount === 0) return res.status(404).json({ error: 'Aspirante no encontrado' });
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: 'Error al actualizar concejal', details: err.message });
    }
  };
  

// ✅ Eliminar aspirante al concejo
export const deleteAspiranteConcejo = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM aspirantes_concejo WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Aspirante no encontrado' });
    }
    res.json({ message: 'Aspirante eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar aspirante', details: err.message });
  }
};
