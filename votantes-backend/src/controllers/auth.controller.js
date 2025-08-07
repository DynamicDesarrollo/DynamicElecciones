import db from '../utils/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config(); // Cargar variables de entorno

const secret = process.env.JWT_SECRET; // ✅ Clave secreta desde .env

// -----------------------------
// LOGIN
// -----------------------------
export const login = async (req, res) => {
  const { correo, password } = req.body;

  try {
    // Buscar el usuario por correo
    const result = await db.query(
      `SELECT * FROM usuarios WHERE correo = $1`,
      [correo]
    );

    const usuario = result.rows[0];

    if (!usuario) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    // Comparar contraseñas
    const passwordValida = await bcrypt.compare(password, usuario.password);

    if (!passwordValida) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    // Determinar tipo de aspirante
    let tipo_aspirante = null;
    let aspirante_id = null;
    let nombre_aspirante = null;

    if (usuario.aspirante_concejo_id) {
      tipo_aspirante = "concejo";
      aspirante_id = usuario.aspirante_concejo_id;

      const concejal = await db.query(
        `SELECT nombre_completo FROM aspirantes_concejo WHERE id = $1`,
        [aspirante_id]
      );

      nombre_aspirante = concejal.rows[0]?.nombre_completo || null;
    }

    if (usuario.aspirante_alcaldia_id) {
      tipo_aspirante = "alcaldia";
      aspirante_id = usuario.aspirante_alcaldia_id;

      const alcalde = await db.query(
        `SELECT nombre_completo FROM aspirantes_alcaldia WHERE id = $1`,
        [aspirante_id]
      );

      nombre_aspirante = alcalde.rows[0]?.nombre_completo || null;
    }

    // ✅ Crear token con variable de entorno
    const token = jwt.sign({ 
      id: usuario.id,
      rol: usuario.rol,
     }, secret, {
      expiresIn: "8h",
    });

    // Devolver token + usuario
    res.json({
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        rol: usuario.rol,
        tipo_aspirante,
        aspirante_id,
        nombre_aspirante,
      },
    });
  } catch (error) {
    console.error("🔥 Error al autenticar:", error);
    res.status(500).json({ error: 'Error al autenticar', detalle: error.message });
  }
};

// -----------------------------
// REGISTER
// -----------------------------
export const register = async (req, res) => {
  const { nombre, correo, password, rol, aspirante_concejo_id, aspirante_alcaldia_id } = req.body;

  try {
    const existe = await db.query(`SELECT * FROM usuarios WHERE correo = $1`, [correo]);
    if (existe.rows.length > 0) {
      return res.status(400).json({ error: 'Correo ya registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(`
      INSERT INTO usuarios (nombre, correo, password, rol, aspirante_concejo_id, aspirante_alcaldia_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, nombre, correo, rol
    `, [nombre, correo, hashedPassword, rol, aspirante_concejo_id, aspirante_alcaldia_id]);

    res.status(201).json({ mensaje: 'Usuario creado', usuario: result.rows[0] });
  } catch (error) {
    console.error("🔥 Error al registrar:", error);
    res.status(500).json({ error: 'Error al registrar', detalle: error.message });
  }
};
