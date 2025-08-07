import pg from 'pg';

// Configuración de la conexión
const pool = new pg.Pool({
  user: 'postgres',           // tu usuario de PostgreSQL
  host: 'localhost',
  database: 'votantes',       // nombre de la base de datos que creaste
  password: 'MasterKey',    // tu contraseña (cámbiala)
  port: 5432,                 // puerto por defecto
});

// Exportamos una función de consulta reutilizable
const db = {
  query: (text, params) => pool.query(text, params),
};

export default db;
