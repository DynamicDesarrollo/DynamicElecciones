import db from '../utils/db.js';
import { territorioDe, condicionMunicipios } from '../utils/territorio.js';

// ✅ Puestos de votación del territorio de la campaña, con su municipio
export const getLugares = async (req, res) => {
  try {
    const territorio = await territorioDe(req.usuario);
    const { sql, valores } = condicionMunicipios(territorio);
    const result = await db.query(`
      SELECT l.*, m.nombre AS municipio_nombre
      FROM lugares_votacion l
      ${territorio ? 'JOIN' : 'LEFT JOIN'} municipios m ON m.id = l.municipio_id
      WHERE ${sql}
      ORDER BY l.nombre
    `, valores);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener lugares', details: err.message });
  }
};


// ✅ Crear Lugar
export const createLugar = async (req, res) => {
  const { nombre } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO lugares_votacion (nombre) VALUES ($1) RETURNING *',
      [nombre]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: 'Error al crear lugar', details: err.message });
  }
};

// ✅ Actualizar lugares_votacion
export const updateLugar = async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;
  try {
    const result = await db.query(
      'UPDATE lugares_votacion SET nombre = $1 WHERE id = $2 RETURNING *',
      [nombre, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Lugar no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar lugar', details: err.message });
  }
};

// ✅ Eliminar lugares_votacion
export const deleteLugar = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM lugares_votacion WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Lugar no encontrado' });
    }
    res.json({ message: 'Lugar eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar lugar', details: err.message });
  }
};
