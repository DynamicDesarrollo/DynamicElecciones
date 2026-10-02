const db = require('../utils/db');
const bcrypt = require('bcrypt');
const { esAdmin } = require('../utils/scope');

// Reglas de creación de usuarios:
// - admin (equipo del aspirante principal): crea más admins y UN solo usuario por aspirante secundario
// - aspirante (p. ej. un concejal): crea más usuarios de su mismo rol, ligados a él
// - superadmin: además puede crear otros superadmin
// Los líderes no tienen usuario.

// Listar usuarios: admin ve los de la campaña; un aspirante, los de su equipo
exports.listarUsuarios = async (req, res) => {
  const { rol, campana_id, aspirante_id } = req.usuario;
  const valores = [campana_id];
  let filtro = `u.campana_id = $1 AND u.rol <> 'superadmin'`;
  if (!esAdmin(req.usuario)) filtro += ` AND u.aspirante_id = $${valores.push(aspirante_id)}`;
  if (rol === 'superadmin') filtro = `(${filtro}) OR u.rol = 'superadmin'`;

  try {
    const result = await db.query(
      `SELECT u.id, u.nombre, u.correo, u.rol, u.aspirante_id,
              a.nombre_completo AS nombre_aspirante, a.cargo AS cargo_aspirante
       FROM usuarios u
       LEFT JOIN aspirantes a ON a.id = u.aspirante_id
       WHERE ${filtro}
       ORDER BY u.rol DESC, a.nombre_completo NULLS FIRST, u.nombre`,
      valores
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error al listar usuarios:', err);
    res.status(500).json({ error: 'Error al listar usuarios' });
  }
};

exports.crearUsuario = async (req, res) => {
  const creador = req.usuario;
  const { nombre, correo, password } = req.body;
  let { rol, aspirante_id } = req.body;

  if (!nombre?.trim() || !correo?.trim() || !password) {
    return res.status(400).json({ error: 'Nombre, correo y contraseña son obligatorios.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres.' });
  }

  try {
    // Un aspirante solo crea usuarios de su equipo
    if (!esAdmin(creador)) {
      rol = 'aspirante';
      aspirante_id = creador.aspirante_id;
    }

    if (!['superadmin', 'admin', 'aspirante'].includes(rol)) {
      return res.status(400).json({ error: 'Rol no válido.' });
    }
    if (rol === 'superadmin' && creador.rol !== 'superadmin') {
      return res.status(403).json({ error: 'Solo un superadmin puede crear otro superadmin.' });
    }

    const campanaId = rol === 'superadmin' ? null : creador.campana_id;
    if (rol !== 'superadmin' && !campanaId) {
      return res.status(409).json({ error: 'Seleccione una campaña para crear usuarios.', codigo: 'SIN_CAMPANA' });
    }

    if (rol === 'aspirante') {
      if (!aspirante_id) return res.status(400).json({ error: 'Seleccione el aspirante del usuario.' });
      const asp = await db.query(
        `SELECT a.padre_id,
                (SELECT COUNT(*) FROM usuarios u WHERE u.aspirante_id = a.id)::int AS total_usuarios
         FROM aspirantes a WHERE a.id = $1 AND a.campana_id = $2`,
        [aspirante_id, campanaId]
      );
      const aspirante = asp.rows[0];
      if (!aspirante) return res.status(400).json({ error: 'El aspirante no pertenece a la campaña.' });
      if (!aspirante.padre_id) {
        return res.status(400).json({ error: 'El equipo del aspirante principal usa usuarios administradores.' });
      }
      // El admin crea un solo usuario por aspirante; los demás los crea el propio aspirante
      if (esAdmin(creador) && aspirante.total_usuarios > 0) {
        return res.status(409).json({ error: 'Este aspirante ya tiene usuario. Sus demás usuarios los crea él mismo.' });
      }
    } else {
      aspirante_id = null;
    }

    const existe = await db.query('SELECT 1 FROM usuarios WHERE correo = $1', [correo.trim()]);
    if (existe.rows.length > 0) {
      return res.status(409).json({ error: 'El correo ya está registrado.' });
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await db.query(
      `INSERT INTO usuarios (nombre, correo, password, rol, campana_id, aspirante_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, nombre, correo, rol, aspirante_id`,
      [nombre.trim(), correo.trim(), hash, rol, campanaId, aspirante_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error al crear usuario:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// Eliminar usuario: admin, cualquiera de la campaña; aspirante, solo de su equipo
exports.eliminarUsuario = async (req, res) => {
  const { id } = req.params;
  if (id === req.usuario.id) {
    return res.status(400).json({ error: 'No puede eliminar su propio usuario.' });
  }
  const valores = [id, req.usuario.campana_id];
  let filtro = `id = $1 AND campana_id = $2 AND rol <> 'superadmin'`;
  if (!esAdmin(req.usuario)) filtro += ` AND aspirante_id = $${valores.push(req.usuario.aspirante_id)}`;

  try {
    const result = await db.query(`DELETE FROM usuarios WHERE ${filtro}`, valores);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar usuario:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// Restablecer la contraseña de un usuario que la perdió.
// Admin: cualquier usuario de su campaña; aspirante: solo los de su equipo.
exports.restablecerPassword = async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;
  if (!password || password.length < 8) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres.' });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    const valores = [hash, id, req.usuario.campana_id];
    let filtro = `id = $2 AND campana_id = $3 AND rol <> 'superadmin'`;
    if (!esAdmin(req.usuario)) filtro += ` AND aspirante_id = $${valores.push(req.usuario.aspirante_id)}`;
    const result = await db.query(`UPDATE usuarios SET password = $1 WHERE ${filtro}`, valores);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ message: 'Contraseña restablecida' });
  } catch (err) {
    console.error('Error al restablecer contraseña:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};
