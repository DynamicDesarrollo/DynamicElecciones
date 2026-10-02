import bcrypt from 'bcrypt';
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
      port: process.env.PGPORT,
      ssl: { rejectUnauthorized: false }
    });



// USO: node reset-password.js correo@nombredominio.com nuevaPassword
const [,, correo, nuevaPassword] = process.argv;

if (!correo || !nuevaPassword) {
  console.error('Uso: node reset-password.js <correo> <nuevaPassword>');
  process.exit(1);
}

async function resetPassword() {
  try {
    const hash = await bcrypt.hash(nuevaPassword, 10);
    const result = await pool.query(
      'UPDATE usuarios SET password = $1 WHERE correo = $2 RETURNING id, correo',
      [hash, correo]
    );
    if (result.rowCount === 0) {
      console.log('Usuario no encontrado:', correo);
    } else {
      console.log('Contraseña actualizada para:', correo);
    }
    process.exit(0);
  } catch (err) {
    console.error('Error al actualizar contraseña:', err);
    process.exit(1);
  }
}

resetPassword();
