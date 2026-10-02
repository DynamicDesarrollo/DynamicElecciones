// Cambia la contraseña de un usuario.
// Uso: npm run reset-password -- <correo> <nuevaContraseña>

const bcrypt = require('bcrypt');
const db = require('../src/utils/db');

(async () => {
  const [correo, nuevaPassword] = process.argv.slice(2);
  if (!correo || !nuevaPassword) {
    console.error('Uso: npm run reset-password -- <correo> <nuevaContraseña>');
    process.exit(1);
  }
  try {
    const hash = await bcrypt.hash(nuevaPassword, 10);
    const result = await db.query(
      'UPDATE usuarios SET password = $1 WHERE correo = $2 RETURNING correo',
      [hash, correo]
    );
    console.log(result.rowCount ? `✅ Contraseña actualizada para ${correo}` : `❌ Usuario no encontrado: ${correo}`);
    process.exit(result.rowCount ? 0 : 1);
  } catch (err) {
    console.error('❌ Error al actualizar contraseña:', err.message);
    process.exit(1);
  }
})();
