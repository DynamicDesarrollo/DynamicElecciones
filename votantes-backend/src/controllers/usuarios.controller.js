const db = require('../utils/db');
const bcrypt = require('bcrypt');

// Crear usuario
exports.crearUsuario = async (req, res) => {
  try {
    const { nombre, correo, password, rol, aspirante_concejo_id, aspirante_alcaldia_id } = req.body;
    if (!nombre || !correo || !password) {
      return res.status(400).json({ error: 'Faltan campos obligatorios.' });
    }
    // Verificar si el correo ya existe
    const existe = await db.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
    if (existe.rows.length > 0) {
      return res.status(409).json({ error: 'El correo ya está registrado.' });
    }
    // Hashear la contraseña
    const hash = await bcrypt.hash(password, 10);
    // Insertar usuario
    const result = await db.query(
      `INSERT INTO usuarios (nombre, correo, password, rol, aspirante_concejo_id, aspirante_alcaldia_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [nombre, correo, hash, rol || 'admin', aspirante_concejo_id || null, aspirante_alcaldia_id || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error al crear usuario:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};
