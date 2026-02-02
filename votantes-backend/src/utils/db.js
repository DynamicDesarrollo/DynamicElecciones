
const { Pool } = require('pg');
require('dotenv').config();

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
