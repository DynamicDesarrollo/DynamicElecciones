
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
};

module.exports = db;
