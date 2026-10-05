// Descarga y guarda en la base los logos de los partidos.
// Se hace de a uno y con pausa, para no saturar a cne.gov.co (que es lento y a veces no responde).

const db = require('../utils/db');

const TAMANO_MAXIMO = 800 * 1024;
const PAUSA = 400;
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

const descargar = async (url) => {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DynamicElecciones/1.0)' },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`respondió ${res.status}`);
  const tipo = (res.headers.get('content-type') || '').split(';')[0].trim();
  if (!tipo.startsWith('image/')) throw new Error(`no es una imagen (${tipo || 'sin tipo'})`);
  const datos = Buffer.from(await res.arrayBuffer());
  if (datos.length === 0 || datos.length > TAMANO_MAXIMO) throw new Error(`tamaño no válido (${datos.length} bytes)`);
  return { datos, tipo };
};

const servidorDe = (url) => {
  try {
    return new URL(url).host;
  } catch {
    return '';
  }
};

// Guarda el logo de un partido: primero la dirección oficial y, si falla, la de respaldo.
// `caidos` reúne los servidores que no respondieron en esta tanda, para no esperar el tiempo
// límite por cada logo cuando un sitio entero está caído. Devuelve true si quedó guardado.
const guardarLogo = async (partido, caidos = new Set()) => {
  for (const url of [partido.logo_url, partido.logo_respaldo].filter(Boolean)) {
    if (caidos.has(servidorDe(url))) continue;
    try {
      const { datos, tipo } = await descargar(url);
      await db.query('UPDATE partidos SET logo_datos = $1, logo_tipo = $2 WHERE id = $3', [datos, tipo, partido.id]);
      return true;
    } catch (err) {
      // Un 404 es de esa imagen; un fallo de conexión o de tiempo es del servidor completo
      if (!/respondió|no es una imagen|tamaño/.test(err.message)) caidos.add(servidorDe(url));
      console.error(`Logo de ${partido.nombre} (${url.slice(0, 60)}…): ${err.message}`);
    }
  }
  return false;
};

let enCurso = false;

// Descarga los logos que falten. Corre en segundo plano: no bloquea la respuesta al usuario.
const descargarPendientes = async () => {
  if (enCurso) return;
  enCurso = true;
  try {
    const { rows } = await db.query(
      `SELECT id, nombre, logo_url, logo_respaldo FROM partidos
       WHERE logo_datos IS NULL AND (logo_url IS NOT NULL OR logo_respaldo IS NOT NULL)
       ORDER BY nombre`
    );
    const caidos = new Set();
    for (const partido of rows) {
      await guardarLogo(partido, caidos);
      await esperar(PAUSA);
    }
  } finally {
    enCurso = false;
  }
};

const descargando = () => enCurso;

module.exports = { guardarLogo, descargarPendientes, descargando };
