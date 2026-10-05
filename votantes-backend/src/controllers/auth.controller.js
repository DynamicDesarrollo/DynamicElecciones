import db from '../utils/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { describirCampana } from '../utils/campanas.js';

dotenv.config(); // Cargar variables de entorno

const secret = process.env.JWT_SECRET; // ✅ Clave secreta desde .env

// Datos de sesión que usa el frontend: usuario, su campaña y su aspirante
const sesionUsuario = async (id) => {
  const { rows } = await db.query(
    `SELECT u.id, u.nombre, u.correo, u.rol,
            a.id AS aspirante_id, a.nombre_completo AS nombre_aspirante, a.cargo AS cargo_aspirante,
            c.id AS c_id, c.nombre AS c_nombre, c.tipo AS c_tipo, c.departamento AS c_departamento,
            c.municipio AS c_municipio, c.activa AS c_activa,
            (SELECT p.nombre_completo FROM aspirantes p WHERE p.campana_id = c.id AND p.padre_id IS NULL) AS c_principal
     FROM usuarios u
     LEFT JOIN aspirantes a ON a.id = u.aspirante_id
     -- El superadmin no pertenece a ninguna campaña
     LEFT JOIN campanas c ON c.id = u.campana_id AND u.rol <> 'superadmin'
     WHERE u.id = $1`,
    [id]
  );
  const u = rows[0];
  if (!u) return null;
  return {
    id: u.id,
    nombre: u.nombre,
    correo: u.correo,
    rol: u.rol,
    aspirante_id: u.aspirante_id,
    nombre_aspirante: u.nombre_aspirante,
    cargo_aspirante: u.cargo_aspirante,
    campana: u.c_id
      ? describirCampana({ id: u.c_id, nombre: u.c_nombre, tipo: u.c_tipo, departamento: u.c_departamento, municipio: u.c_municipio, activa: u.c_activa, aspirante_principal: u.c_principal })
      : null,
  };
};

// -----------------------------
// LOGIN
// -----------------------------
export const login = async (req, res) => {
  const { correo, password } = req.body;

  if (!correo || !password) {
    return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
  }

  try {
    const result = await db.query('SELECT id, password FROM usuarios WHERE correo = $1', [correo]);
    const usuario = result.rows[0];

    // Mismo mensaje para correo inexistente y contraseña errada: no revela qué correos existen
    const passwordValida = usuario ? await bcrypt.compare(password, usuario.password) : false;
    if (!passwordValida) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }

    const sesion = await sesionUsuario(usuario.id);
    if (sesion.rol !== 'superadmin' && sesion.campana && !sesion.campana.activa) {
      return res.status(403).json({ error: 'La campaña está inactiva. Contacte al administrador.' });
    }

    // ✅ Crear token con variable de entorno
    const token = jwt.sign({ id: usuario.id }, secret, { expiresIn: "8h" });

    res.json({ token, usuario: sesion });
  } catch (error) {
    console.error("🔥 Error al autenticar:", error);
    res.status(500).json({ error: 'Error al autenticar' });
  }
};

// -----------------------------
// USUARIO ACTUAL (refresca la sesión, p. ej. al cambiar de campaña)
// -----------------------------
export const yo = async (req, res) => {
  try {
    res.json(await sesionUsuario(req.usuario.id));
  } catch (error) {
    console.error("🔥 Error al obtener usuario actual:", error);
    res.status(500).json({ error: 'Error al obtener usuario actual' });
  }
};

// -----------------------------
// RENOVAR SESIÓN: token nuevo para quien sigue trabajando, así no se vence en mitad de un formulario
// -----------------------------
export const renovar = (req, res) => {
  res.json({ token: jwt.sign({ id: req.usuario.id }, secret, { expiresIn: "8h" }) });
};

// -----------------------------
// CAMBIAR MI CONTRASEÑA (exige la actual)
// -----------------------------
export const cambiarPassword = async (req, res) => {
  const { actual, nueva } = req.body;
  if (!actual || !nueva) {
    return res.status(400).json({ error: 'Escriba la contraseña actual y la nueva' });
  }
  if (nueva.length < 8) {
    return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 8 caracteres' });
  }
  try {
    const { rows } = await db.query('SELECT password FROM usuarios WHERE id = $1', [req.usuario.id]);
    const valida = rows[0] && (await bcrypt.compare(actual, rows[0].password));
    if (!valida) return res.status(400).json({ error: 'La contraseña actual no es correcta' });
    const hash = await bcrypt.hash(nueva, 10);
    await db.query('UPDATE usuarios SET password = $1 WHERE id = $2', [hash, req.usuario.id]);
    res.json({ message: 'Contraseña actualizada' });
  } catch (error) {
    console.error('🔥 Error al cambiar contraseña:', error);
    res.status(500).json({ error: 'Error al cambiar la contraseña' });
  }
};
