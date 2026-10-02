// Aplica, en orden, las migraciones de /migrations que todavía no se han aplicado.
// Uso: npm run migrate
// Cada archivo corre en su propia transacción y queda registrado en schema_migrations.

const fs = require('fs');
const path = require('path');
const db = require('../src/utils/db');

const DIR = path.join(__dirname, '..', 'migrations');

(async () => {
  try {
    await db.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
      nombre      text PRIMARY KEY,
      aplicada_en timestamptz NOT NULL DEFAULT now()
    )`);

    const { rows } = await db.query('SELECT nombre FROM schema_migrations');
    const aplicadas = new Set(rows.map((r) => r.nombre));
    const pendientes = fs.readdirSync(DIR).filter((f) => f.endsWith('.sql') && !aplicadas.has(f)).sort();

    if (pendientes.length === 0) {
      console.log('✅ No hay migraciones pendientes.');
      process.exit(0);
    }

    for (const archivo of pendientes) {
      const sql = fs.readFileSync(path.join(DIR, archivo), 'utf8');
      await db.transaction(async (client) => {
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (nombre) VALUES ($1)', [archivo]);
      });
      console.log(`✅ Aplicada ${archivo}`);
    }
    process.exit(0);
  } catch (err) {
    console.error('❌ Error aplicando migraciones:', err.message);
    process.exit(1);
  }
})();
