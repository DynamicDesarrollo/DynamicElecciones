import db from '../utils/db.js';
import wikidata from '../services/wikidata.js';
import cne from '../services/cne.js';
import logos from '../services/logos.js';

const CAMPOS = ['nombre', 'sigla', 'eslogan', 'color', 'logo_url'];
const COLOR = /^#[0-9a-f]{6}$/i;

// Columnas que viajan al frontend. El logo en sí (logo_datos) nunca va en el JSON:
// se sirve aparte como imagen; aquí solo se dice si existe.
const COLUMNAS = `p.id, p.nombre, p.sigla, p.eslogan, p.color, p.logo_url, p.wikidata_id,
  (p.logo_datos IS NOT NULL) AS logo_propio`;

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

// Descarga en segundo plano los logos que falten (no bloquea la respuesta)
const descargarLogosDespues = () => {
  logos.descargarPendientes().catch((err) => console.error('Error descargando logos:', err.message));
};

// ✅ Catálogo de partidos (lo leen todas las campañas)
export const getPartidos = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT ${COLUMNAS}, (SELECT COUNT(*) FROM aspirantes a WHERE a.partido_id = p.id)::int AS total_aspirantes
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

// ✅ Logo de un partido, servido desde nuestra base. Es público: los logos lo son,
// y una etiqueta <img> no puede enviar el token de sesión.
export const getLogo = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT logo_datos, logo_tipo FROM partidos WHERE id = $1', [req.params.id]);
    if (!rows[0]?.logo_datos) return res.status(404).end();
    res.set('Content-Type', rows[0].logo_tipo || 'image/png');
    res.set('Cache-Control', 'public, max-age=86400');
    // Un SVG ajeno no debe poder ejecutar nada si alguien abre la imagen directamente
    res.set('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'");
    res.set('X-Content-Type-Options', 'nosniff');
    res.send(rows[0].logo_datos);
  } catch {
    res.status(404).end();
  }
};

// ✅ Crear partido a mano
export const createPartido = async (req, res) => {
  if (!req.body.nombre?.trim()) return res.status(400).json({ error: 'El nombre es obligatorio' });
  try {
    const result = await db.query(
      `INSERT INTO partidos AS p (${CAMPOS.join(', ')}) VALUES ($1, $2, $3, $4, $5) RETURNING ${COLUMNAS}`,
      valoresPartido(req.body)
    );
    descargarLogosDespues();
    res.status(201).json(result.rows[0]);
  } catch (err) {
    const [estado, error] = mensajeError(err, 'crear');
    res.status(estado).json({ error });
  }
};

// ✅ Actualizar partido. Si cambia la dirección del logo, se descarta el guardado y se vuelve a bajar.
export const updatePartido = async (req, res) => {
  if (!req.body.nombre?.trim()) return res.status(400).json({ error: 'El nombre es obligatorio' });
  try {
    const valores = valoresPartido(req.body);
    const result = await db.query(
      `UPDATE partidos AS p SET ${CAMPOS.map((c, i) => `${c} = $${i + 1}`).join(', ')},
         logo_datos = CASE WHEN p.logo_url IS DISTINCT FROM $5 THEN NULL ELSE p.logo_datos END,
         logo_respaldo = CASE WHEN p.logo_url IS DISTINCT FROM $5 THEN NULL ELSE p.logo_respaldo END
       WHERE p.id = $6 RETURNING ${COLUMNAS}`,
      [...valores, req.params.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Partido no encontrado' });
    descargarLogosDespues();
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

// ✅ Volver a intentar la descarga de los logos que falten (p. ej. cuando el CNE no respondía)
export const reintentarLogos = async (req, res) => {
  const { rows } = await db.query(
    `SELECT COUNT(*)::int AS pendientes FROM partidos
     WHERE logo_datos IS NULL AND (logo_url IS NOT NULL OR logo_respaldo IS NOT NULL)`
  );
  descargarLogosDespues();
  res.json({ pendientes: rows[0].pendientes, descargando: true });
};

// Datos de Wikidata por clave de nombre (color y logo de respaldo). Es un complemento:
// si Wikidata no responde, los partidos del CNE se cargan igual.
const complementoWikidata = async () => {
  try {
    const mapa = new Map();
    for (const p of await wikidata.partidosColombia()) {
      const clave = cne.clavePartido(p.nombre);
      const previo = mapa.get(clave) || {};
      mapa.set(clave, { color: previo.color || p.color, logo: previo.logo || p.logo_url });
    }
    return mapa;
  } catch {
    return new Map();
  }
};

// ✅ Partidos con personería jurídica vigente según el CNE (fuente oficial, con logosímbolo)
export const buscarEnCNE = async (req, res) => {
  try {
    const [oficiales, propios, extra] = await Promise.all([
      cne.partidosVigentes(),
      db.query('SELECT nombre FROM partidos'),
      complementoWikidata(),
    ]);
    const claves = new Set(propios.rows.map((p) => cne.clavePartido(p.nombre)));
    res.json(oficiales.map((p) => {
      const clave = cne.clavePartido(p.nombre);
      return {
        id_fuente: String(p.cne_numero),
        nombre: p.nombre,
        sigla: p.sigla,
        color: extra.get(clave)?.color || null,
        // En la lista previa no se pide la imagen al CNE desde el navegador (es lento y a veces
        // no responde): se muestra la de Wikimedia si existe. El logo oficial se baja al cargar.
        logo_url: extra.get(clave)?.logo || null,
        tiene_logo_oficial: !!p.logo_url,
        en_catalogo: claves.has(clave),
      };
    }));
  } catch (err) {
    console.error('Error consultando el CNE:', err.message);
    res.status(502).json({ error: 'No se pudo consultar la página del CNE. Intente de nuevo en un momento.' });
  }
};

// ✅ Cargar partidos del CNE al catálogo. Si el partido ya estaba (aunque con otro nombre),
// se actualiza con el nombre y el logo oficiales en vez de duplicarlo.
export const importarDeCNE = async (req, res) => {
  const ids = (Array.isArray(req.body.ids) ? req.body.ids : []).map(String);
  if (ids.length === 0) return res.status(400).json({ error: 'Elija al menos un partido' });
  try {
    const [oficiales, propios, extra] = await Promise.all([
      cne.partidosVigentes(),
      db.query('SELECT id, nombre, logo_url FROM partidos'),
      complementoWikidata(),
    ]);
    let importados = 0;
    for (const p of oficiales.filter((o) => ids.includes(String(o.cne_numero)))) {
      const clave = cne.clavePartido(p.nombre);
      const complemento = extra.get(clave) || {};
      const previo = propios.rows.find((x) => cne.clavePartido(x.nombre) === clave);
      if (previo) {
        // Si cambia la dirección del logo, se descarta el guardado para bajar el oficial
        await db.query(
          `UPDATE partidos SET nombre = $1, sigla = COALESCE($2, sigla),
             logo_datos = CASE WHEN $3::text IS NOT NULL AND logo_url IS DISTINCT FROM $3 THEN NULL ELSE logo_datos END,
             logo_url = COALESCE($3, logo_url), logo_respaldo = COALESCE($4, logo_respaldo),
             color = COALESCE(color, $5)
           WHERE id = $6`,
          [p.nombre, p.sigla, p.logo_url, complemento.logo || null, complemento.color || null, previo.id]
        );
      } else {
        await db.query(
          'INSERT INTO partidos (nombre, sigla, logo_url, logo_respaldo, color) VALUES ($1, $2, $3, $4, $5)',
          [p.nombre, p.sigla, p.logo_url, complemento.logo || null, complemento.color || null]
        );
      }
      importados += 1;
    }
    descargarLogosDespues();
    res.json({ importados });
  } catch (err) {
    console.error('Error importando del CNE:', err.message);
    res.status(502).json({ error: 'No se pudo importar desde el CNE. Intente de nuevo en un momento.' });
  }
};

// ✅ Partidos de Colombia en Wikidata, marcando los que ya están en el catálogo
export const buscarEnWikidata = async (req, res) => {
  try {
    const [externos, propios] = await Promise.all([
      wikidata.partidosColombia(),
      db.query('SELECT wikidata_id, nombre FROM partidos'),
    ]);
    const ids = new Set(propios.rows.map((p) => p.wikidata_id).filter(Boolean));
    const claves = new Set(propios.rows.map((p) => cne.clavePartido(p.nombre)));
    res.json(externos.map((p) => ({
      ...p,
      id_fuente: p.wikidata_id,
      en_catalogo: ids.has(p.wikidata_id) || claves.has(cne.clavePartido(p.nombre)),
    })));
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
    descargarLogosDespues();
    res.json({ importados });
  } catch (err) {
    console.error('Error importando partidos:', err.message);
    res.status(502).json({ error: 'No se pudo importar desde Wikidata. Intente de nuevo en un momento.' });
  }
};
