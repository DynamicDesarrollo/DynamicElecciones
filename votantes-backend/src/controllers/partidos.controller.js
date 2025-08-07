import db from '../utils/db.js';

// ✅ Obtener todos los partidos
export const getPartidos = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM partidos ORDER BY nombre');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener partidos', details: err.message });
  }
};

// ✅ Crear un nuevo partido
export const createPartido = async (req, res) => {
  const { nombre, logo_url } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO partidos (nombre, logo_url) VALUES ($1, $2) RETURNING *',
      [nombre, logo_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: 'Error al crear partido', details: err.message });
  }
};

// ✅ Actualizar partido
export const updatePartido = async (req, res) => {
  const { id } = req.params;
  const { nombre, logo_url } = req.body;
  try {
    const result = await db.query(
      'UPDATE partidos SET nombre = $1, logo_url = $2 WHERE id = $3 RETURNING *',
      [nombre, logo_url, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Partido no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar partido', details: err.message });
  }
};

// ✅ Eliminar partido
export const deletePartido = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM partidos WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Partido no encontrado' });
    }
    res.json({ message: 'Partido eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar partido', details: err.message });
  }
};
