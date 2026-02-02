// === NUEVA TABLA GENERAL DE ASPIRANTES ===
// Crear aspirante
export const crearAspirante = async (req, res) => {
  try {
    const { nombre, correo, telefono, tipo_aspirante, partido, municipio } = req.body;
    if (!nombre || !correo || !tipo_aspirante) {
      return res.status(400).json({ error: 'Faltan campos obligatorios.' });
    }
    const result = await db.query(
      `INSERT INTO aspirantes (nombre, correo, telefono, tipo_aspirante, partido, municipio)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [nombre, correo, telefono, tipo_aspirante, partido, municipio]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error al crear aspirante:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// Listar aspirantes
export const listarAspirantes = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM aspirantes ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error al listar aspirantes:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};
import db from '../utils/db.js';

// ✅ Obtener todos los aspirantes a la alcaldía
export const getAspirantesAlcaldia = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT a.*, p.nombre AS partido, m.nombre AS municipio
      FROM aspirantes_alcaldia a
      LEFT JOIN partidos p ON a.partido_id = p.id
      LEFT JOIN municipios m ON a.municipio_id = m.id
      ORDER BY a.nombre_completo
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener aspirantes', details: err.message });
  }
};

// ✅ Crear aspirante
export const createAspiranteAlcaldia = async (req, res) => {
    const {
      nombre_completo,
      partido_id,
      municipio_id,
      coalicion,
      cedula,
      direccion,
      telefono,
      barrio,
      fecha_nace
    } = req.body;
  
    try {
      const result = await db.query(
        `INSERT INTO aspirantes_alcaldia (
          nombre_completo, partido_id, municipio_id, coalicion,
          cedula, direccion, telefono, barrio, fecha_nace
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
        [nombre_completo, partido_id, municipio_id, coalicion, cedula, direccion, telefono, barrio, fecha_nace]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(400).json({ error: 'Error al crear aspirante', details: err.message });
    }
  };
  

// ✅ Actualizar aspirante
export const updateAspiranteAlcaldia = async (req, res) => {
    const { id } = req.params;
    const {
      nombre_completo,
      partido_id,
      municipio_id,
      coalicion,
      cedula,
      direccion,
      telefono,
      barrio,
      fecha_nace
    } = req.body;
  
    try {
      const result = await db.query(
        `UPDATE aspirantes_alcaldia SET
          nombre_completo = $1,
          partido_id = $2,
          municipio_id = $3,
          coalicion = $4,
          cedula = $5,
          direccion = $6,
          telefono = $7,
          barrio = $8,
          fecha_nace = $9
        WHERE id = $10 RETURNING *`,
        [nombre_completo, partido_id, municipio_id, coalicion, cedula, direccion, telefono, barrio, fecha_nace, id]
      );
      if (result.rowCount === 0) return res.status(404).json({ error: 'Aspirante no encontrado' });
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: 'Error al actualizar aspirante', details: err.message });
    }
  };
  

// ✅ Eliminar aspirante
export const deleteAspiranteAlcaldia = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM aspirantes_alcaldia WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Aspirante no encontrado' });
    }
    res.json({ message: 'Aspirante eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar aspirante', details: err.message });
  }
};
