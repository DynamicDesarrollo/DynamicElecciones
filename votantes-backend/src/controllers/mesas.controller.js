import db from '../utils/db.js';
import { territorioDe, condicionMunicipios } from '../utils/territorio.js';

// ✅ Mesas de los puestos del territorio de la campaña, en orden numérico
export const getMesas = async (req, res) => {
  try {
    const territorio = await territorioDe(req.usuario);
    const { sql, valores } = condicionMunicipios(territorio, 'mu');
    const result = await db.query(`
      SELECT m.*
      FROM mesas_votacion m
      ${territorio ? `JOIN lugares_votacion l ON l.id = m.lugar_id JOIN municipios mu ON mu.id = l.municipio_id WHERE ${sql}` : ''}
      ORDER BY m.lugar_id, NULLIF(regexp_replace(m.numero, '\\D', '', 'g'), '')::int NULLS LAST, m.numero
    `, valores);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener mesas', details: err.message });
  }
};

// ✅ Crear una mesa
export const createMesa = async (req, res) => {
  const { numero, lugar_id } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO mesas_votacion (numero, lugar_id) VALUES ($1, $2) RETURNING *',
      [numero, lugar_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: 'Error al crear mesa', details: err.message });
  }
};

// ✅ Actualizar mesa
export const updateMesa = async (req, res) => {
  const { id } = req.params;
  const { numero, lugar_id } = req.body;
  try {
    const result = await db.query(
      'UPDATE mesas_votacion SET numero = $1, lugar_id = $2 WHERE id = $3 RETURNING *',
      [numero, lugar_id, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Mesa no encontrada' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar mesa', details: err.message });
  }
};

// ✅ Eliminar mesa
export const deleteMesa = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM mesas_votacion WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Mesa no encontrada' });
    }
    res.json({ message: 'Mesa eliminada correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar mesa', details: err.message });
  }
};
