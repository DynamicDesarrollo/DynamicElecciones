import bcrypt from 'bcrypt';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
  ssl: { rejectUnauthorized: false }
});

async function testPassword(correo, passwordTest) {
  try {
    const res = await pool.query('SELECT password FROM usuarios WHERE correo = $1', [correo]);
    if (res.rows.length === 0) {
      console.log('Usuario no encontrado:', correo);
      return;
    }
    const hash = res.rows[0].password;
    const match = await bcrypt.compare(passwordTest, hash);
    console.log(`¿La contraseña "${passwordTest}" es válida para el hash actual?`, match);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

// USO: node test-hash.js correo@nombredominio.com password
const [,, correo, passwordTest] = process.argv;
if (!correo || !passwordTest) {
  console.error('Uso: node test-hash.js <correo> <password>');
  process.exit(1);
}
testPassword(correo, passwordTest);
