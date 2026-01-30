import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
  ssl: { rejectUnauthorized: false }
});

async function checkUsers() {
  try {
    const res = await pool.query('SELECT id, correo, password FROM usuarios');
    console.log(res.rows);
  } catch (err) {
    console.error('Error al consultar la base de datos:', err);
  } finally {
    await pool.end();
  }
}

checkUsers();
