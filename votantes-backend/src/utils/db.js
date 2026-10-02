
const { Pool } = require('pg');
require('dotenv').config();


console.log('--- CONEXIÓN BASE DE DATOS ---');
console.log('PGUSER:', process.env.PGUSER);
console.log('PGHOST:', process.env.PGHOST);
console.log('PGDATABASE:', process.env.PGDATABASE);
console.log('PGPASSWORD:', process.env.PGPASSWORD ? '***' : undefined);
console.log('PGPORT:', process.env.PGPORT);
console.log('PGSSLMODE:', process.env.PGSSLMODE);

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
  ...(process.env.PGSSLMODE === 'require' ? { ssl: { rejectUnauthorized: false } } : {})
});

const db = {
  query: (text, params) => pool.query(text, params),

  // Ejecuta fn(client) dentro de una transacción; hace ROLLBACK si fn lanza error
  transaction: async (fn) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await fn(client);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },
};

module.exports = db;
