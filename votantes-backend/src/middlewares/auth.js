import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import db from "../utils/db.js";
dotenv.config();
export const verificarToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar usuario en BD
    const result = await db.query(
      `SELECT id, rol, aspirante_concejo_id, aspirante_alcaldia_id FROM usuarios WHERE id = $1`,
      [decoded.id]
    );

    const usuario = result.rows[0];

    if (!usuario) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    req.usuario = {
      id: usuario.id,
      rol: usuario.rol,
      aspirante_concejo_id: usuario.aspirante_concejo_id,
      aspirante_alcaldia_id: usuario.aspirante_alcaldia_id,
    };

    next();
  } catch (err) {
    console.error('❌ Error al verificar token:', err.message);
    return res.status(401).json({ error: 'Token inválido' });
  }
};