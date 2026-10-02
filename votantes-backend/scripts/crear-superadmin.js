// Crea (o actualiza la contraseña de) un superadmin del SaaS.
// Uso: npm run crear-superadmin -- <correo> <contraseña> "<nombre>"

const bcrypt = require('bcrypt');
const db = require('../src/utils/db');

(async () => {
  const [correo, password, nombre = 'Superadmin'] = process.argv.slice(2);
  if (!correo || !password) {
    console.error('Uso: npm run crear-superadmin -- <correo> <contraseña> "<nombre>"');
    process.exit(1);
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await db.query(
      `INSERT INTO usuarios (nombre, correo, password, rol)
       VALUES ($1, $2, $3, 'superadmin')
       ON CONFLICT (correo) DO UPDATE SET password = EXCLUDED.password, rol = 'superadmin'
       RETURNING id, correo`,
      [nombre, correo, hash]
    );
    console.log(`✅ Superadmin listo: ${rows[0].correo}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error creando superadmin:', err.message);
    process.exit(1);
  }
})();
