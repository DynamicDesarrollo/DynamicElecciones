// Barrios: no hay fuente oficial, así que se escriben a mano.
// El nombre se busca en el municipio (sin importar mayúsculas ni tildes) y se crea si no existe,
// para que "San Mateo", "san mateo" y "SAN MATEO" terminen siendo el mismo barrio.
const db = require('./db');
const { normalizar } = require('./normalizar');

const resolverBarrio = async (municipioId, nombre) => {
  const limpio = String(nombre || '').trim().replace(/\s+/g, ' ');
  if (!limpio || !municipioId) return null;
  const { rows } = await db.query('SELECT id, nombre FROM barrios WHERE municipio_id = $1', [municipioId]);
  const existente = rows.find((b) => normalizar(b.nombre) === normalizar(limpio));
  if (existente) return existente.id;
  const nuevo = await db.query('INSERT INTO barrios (nombre, municipio_id) VALUES ($1, $2) RETURNING id', [limpio, municipioId]);
  return nuevo.rows[0].id;
};

// El formulario manda barrio_nombre (texto); si no viene, se respeta el id que ya tenía
const barrioDesdeBody = async (body, municipioId, campoId = 'barrio_id') => {
  if (Object.prototype.hasOwnProperty.call(body, 'barrio_nombre')) {
    return resolverBarrio(municipioId, body.barrio_nombre);
  }
  return body[campoId] || null;
};

module.exports = { resolverBarrio, barrioDesdeBody };
