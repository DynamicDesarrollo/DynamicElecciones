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

    // Rol, campaña y aspirante se leen siempre de la BD, no del token
    const result = await db.query(
      `SELECT u.id, u.nombre, u.rol, u.campana_id, u.aspirante_id, c.activa AS campana_activa
       FROM usuarios u
       LEFT JOIN campanas c ON c.id = u.campana_id
       WHERE u.id = $1`,
      [decoded.id]
    );

    const usuario = result.rows[0];

    if (!usuario) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    if (usuario.rol !== 'superadmin' && usuario.campana_activa === false) {
      return res.status(403).json({ error: 'La campaña está inactiva', codigo: 'CAMPANA_INACTIVA' });
    }

    req.usuario = {
      id: usuario.id,
      nombre: usuario.nombre,
      rol: usuario.rol,
      // El superadmin gestiona campañas pero nunca entra a sus datos
      campana_id: usuario.rol === 'superadmin' ? null : usuario.campana_id,
      aspirante_id: usuario.aspirante_id,
    };

    next();
  } catch (err) {
    console.error('❌ Error al verificar token:', err.message);
    return res.status(401).json({ error: 'Token inválido' });
  }
};

// Restringe la ruta a ciertos roles
export const requireRol = (...roles) => (req, res, next) => {
  if (!roles.includes(req.usuario?.rol)) {
    return res.status(403).json({ error: 'No tiene permisos para esta acción' });
  }
  next();
};

// Exige pertenecer a una campaña. El superadmin no tiene acceso a los datos de ninguna.
export const requireCampana = (req, res, next) => {
  if (req.usuario?.rol === 'superadmin') {
    return res.status(403).json({ error: 'El superadmin gestiona campañas pero no accede a sus datos', codigo: 'SUPERADMIN_SIN_DATOS' });
  }
  if (!req.usuario?.campana_id) {
    return res.status(409).json({ error: 'Seleccione una campaña para continuar', codigo: 'SIN_CAMPANA' });
  }
  next();
};
