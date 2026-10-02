import db from '../utils/db.js';
import wikidata from '../services/wikidata.js';

const CAMPOS = ['nombre', 'sigla', 'eslogan', 'color', 'logo_url'];
const COLOR = /^#[0-9a-f]{6}$/i;

// Valores de los campos editables, con vacíos como NULL; el color tiene que ser #RRGGBB
const valoresPartido = (body) =>
  CAMPOS.map((c) => {
    const v = typeof body[c] === 'string' ? body[c].trim() : body[c];
    if (c === 'color') return COLOR.test(v || '') ? v : null;
    return v || null;
  });

const mensajeError = (err, accion) => {
  if (err.constraint === 'partidos_nombre_key') return [409, 'Ya existe un partido con ese nombre'];
  if (err.constraint === 'ux_partidos_wikidata') return [409, 'Ese partido ya está en el catálogo'];
  if (err.code === '23503') return [409, 'No se puede eliminar: hay aspirantes de ese partido'];
  return [500, `Error al ${accion} partido`];
};

// ✅ Catálogo de partidos (lo leen todas las campañas)
export const getPartidos = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT p.*, (SELECT COUNT(*) FROM aspirantes a WHERE a.partido_id = p.id)::int AS total_aspirantes
      FROM partidos p ORDER BY p.nombre`);
    // Las campañas no necesitan saber cuántos aspirantes de otras campañas usan cada partido
    const filas = req.usuario.rol === 'superadmin'
      ? result.rows
      : result.rows.map(({ total_aspirantes: _omitido, ...p }) => p);
    res.json(filas);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener partidos', details: err.message });
  }
};

// ✅ Crear partido a mano
export const createPartido = async (req, res) => {
  if (!req.body.nombre?.trim()) return res.status(400).json({ error: 'El nombre es obligatorio' });
  try {
    const result = await db.query(
      `INSERT INTO partidos (${CAMPOS.join(', ')}) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      valoresPartido(req.body)
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    const [estado, error] = mensajeError(err, 'crear');
    res.status(estado).json({ error });
  }
};

// ✅ Actualizar partido
export const updatePartido = async (req, res) => {
  if (!req.body.nombre?.trim()) return res.status(400).json({ error: 'El nombre es obligatorio' });
  try {
    const result = await db.query(
      `UPDATE partidos SET ${CAMPOS.map((c, i) => `${c} = $${i + 1}`).join(', ')} WHERE id = $6 RETURNING *`,
      [...valoresPartido(req.body), req.params.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Partido no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    const [estado, error] = mensajeError(err, 'actualizar');
    res.status(estado).json({ error });
  }
};

// ✅ Eliminar partido sin aspirantes
export const deletePartido = async (req, res) => {
  try {
    const result = await db.query('DELETE FROM partidos WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Partido no encontrado' });
    res.json({ message: 'Partido eliminado correctamente' });
  } catch (err) {
    const [estado, error] = mensajeError(err, 'eliminar');
    res.status(estado).json({ error });
  }
};

// ✅ Partidos de Colombia en Wikidata, marcando los que ya están en el catálogo
export const buscarEnWikidata = async (req, res) => {
  try {
    const [externos, propios] = await Promise.all([
      wikidata.partidosColombia(),
      db.query('SELECT wikidata_id, lower(nombre) AS nombre FROM partidos'),
    ]);
    const ids = new Set(propios.rows.map((p) => p.wikidata_id).filter(Boolean));
    const nombres = new Set(propios.rows.map((p) => p.nombre));
    res.json(externos.map((p) => ({ ...p, en_catalogo: ids.has(p.wikidata_id) || nombres.has(p.nombre.toLowerCase()) })));
  } catch (err) {
    console.error('Error consultando Wikidata:', err.message);
    res.status(502).json({ error: 'No se pudo consultar Wikidata. Intente de nuevo en un momento.' });
  }
};

// ✅ Importar uno o varios partidos de Wikidata al catálogo (con su logo, sigla, color y lema)
export const importarDeWikidata = async (req, res) => {
  const ids = Array.isArray(req.body.ids) ? req.body.ids : [];
  if (ids.length === 0) return res.status(400).json({ error: 'Elija al menos un partido' });
  try {
    const elegidos = (await wikidata.partidosColombia()).filter((p) => ids.includes(p.wikidata_id));
    let importados = 0;
    for (const p of elegidos) {
      const r = await db.query(
        `INSERT INTO partidos (nombre, sigla, eslogan, color, logo_url, wikidata_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT DO NOTHING`,
        [p.nombre, p.sigla, p.eslogan, p.color, p.logo_url, p.wikidata_id]
      );
      importados += r.rowCount;
    }
    res.json({ importados });
  } catch (err) {
    console.error('Error importando partidos:', err.message);
    res.status(502).json({ error: 'No se pudo importar desde Wikidata. Intente de nuevo en un momento.' });
  }
};
