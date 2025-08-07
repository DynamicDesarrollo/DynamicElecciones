import db from '../utils/db.js';

// ✅ Obtener todos los barrios
export const getBarrios = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT b.*, m.nombre AS municipio
      FROM barrios b
      JOIN municipios m ON b.municipio_id = m.id
      ORDER BY b.nombre
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener barrios', details: err.message });
  }
};

// ✅ Crear un barrio
export const createBarrio = async (req, res) => {
  const { nombre, municipio_id } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO barrios (nombre, municipio_id) VALUES ($1, $2) RETURNING *',
      [nombre, municipio_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: 'Error al crear barrio', details: err.message });
  }
};

// ✅ Actualizar barrio
export const updateBarrio = async (req, res) => {
  const { id } = req.params;
  const { nombre, municipio_id } = req.body;
  try {
    const result = await db.query(
      'UPDATE barrios SET nombre = $1, municipio_id = $2 WHERE id = $3 RETURNING *',
      [nombre, municipio_id, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Barrio no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar barrio', details: err.message });
  }
};

// ✅ Eliminar barrio
export const deleteBarrio = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM barrios WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Barrio no encontrado' });
    }
    res.json({ message: 'Barrio eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar barrio', details: err.message });
  }
};
