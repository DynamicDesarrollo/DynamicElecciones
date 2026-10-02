import db from '../utils/db.js';
import { territorioDe, condicionMunicipios } from '../utils/territorio.js';

// ✅ Municipios del territorio de la campaña (todos para el superadmin o campañas sin territorio)
export const getMunicipios = async (req, res) => {
  try {
    const { sql, valores } = condicionMunicipios(await territorioDe(req.usuario));
    const result = await db.query(`SELECT * FROM municipios m WHERE ${sql} ORDER BY m.nombre`, valores);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener municipios', details: err.message });
  }
};

// ✅ Crear un municipio
export const createMunicipio = async (req, res) => {
  const { nombre } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO municipios (nombre) VALUES ($1) RETURNING *',
      [nombre]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: 'Error al crear municipio', details: err.message });
  }
};

// ✅ Actualizar un municipio
export const updateMunicipio = async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;
  try {
    const result = await db.query(
      'UPDATE municipios SET nombre = $1 WHERE id = $2 RETURNING *',
      [nombre, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Municipio no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar municipio', details: err.message });
  }
};

// ✅ Eliminar un municipio
export const deleteMunicipio = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM municipios WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Municipio no encontrado' });
    }
    res.json({ message: 'Municipio eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar municipio', details: err.message });
  }
};
