import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config(); // Para leer variables de entorno

const { Pool } = pg;

// Si existe DATABASE_URL (Railway) la usa, si no usa tu config local
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false } // Necesario para conexión segura
      }
    : {
        user: 'postgres',           
        host: 'localhost',
        database: 'votantes',       
        password: 'MasterKey',    
        port: 5432
      }
);

// Función de consulta reutilizable
const db = {
  query: (text, params) => pool.query(text, params),
};

export default db;
