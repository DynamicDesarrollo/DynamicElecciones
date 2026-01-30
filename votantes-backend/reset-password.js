import bcrypt from 'bcryptjs';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Configurar conexión a PostgreSQL
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    })
  : new Pool({
      user: process.env.PGUSER,
      host: process.env.PGHOST,
      database: process.env.PGDATABASE,
      password: process.env.PGPASSWORD,
      port: process.env.PGPORT
    });

async function resetPassword(correo, nuevaContraseña) {
  try {
    console.log(`\n🔐 Resetear contraseña para: ${correo}`);
    console.log('⏳ Generando hash bcrypt...\n');

    // Generar hash bcrypt
    const hash = await bcrypt.hash(nuevaContraseña, 10);
    console.log(`✅ Hash generado:\n${hash}\n`);

    // Verificar que el usuario existe antes de actualizar
    const checkUser = await pool.query(
      'SELECT id, nombre, correo FROM usuarios WHERE correo = $1',
      [correo]
    );

    if (checkUser.rows.length === 0) {
      console.error(`❌ Error: No existe usuario con el correo: ${correo}`);
      await pool.end();
      return;
    }

    console.log(`✅ Usuario encontrado:`);
    console.log(`   - ID: ${checkUser.rows[0].id}`);
    console.log(`   - Nombre: ${checkUser.rows[0].nombre}`);
    console.log(`   - Correo: ${checkUser.rows[0].correo}\n`);

    // Actualizar contraseña
    const result = await pool.query(
      'UPDATE usuarios SET password = $1 WHERE correo = $2 RETURNING id, correo, nombre',
      [hash, correo]
    );

    if (result.rows.length > 0) {
      console.log('✅ ¡CONTRASEÑA ACTUALIZADA EXITOSAMENTE!\n');
      console.log(`📋 Detalles de la actualización:`);
      console.log(`   - Usuario ID: ${result.rows[0].id}`);
      console.log(`   - Correo: ${result.rows[0].correo}`);
      console.log(`   - Nueva contraseña: ${nuevaContraseña}\n`);
      console.log('🔐 Guarda esta contraseña en un lugar seguro.');
    } else {
      console.error('❌ Error: No se pudo actualizar la contraseña');
    }

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

// Ejecutar: node reset-password.js <correo> <nuevaContraseña>
const correo = process.argv[2];
const nuevaContraseña = process.argv[3];

if (!correo || !nuevaContraseña) {
  console.log('❌ Uso: node reset-password.js <correo> <nuevaContraseña>');
  console.log('\nEjemplo:');
  console.log('   node reset-password.js admin@demo.com NuevaClave123\n');
  process.exit(1);
}

resetPassword(correo, nuevaContraseña);
