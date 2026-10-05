// Partidos y movimientos con personería jurídica vigente, de la página oficial del
// Consejo Nacional Electoral (con sus logosímbolos). No hay API: se lee la tabla de la página.
// Caché de 24 h. Si el CNE cambia el diseño de la página y no se reconoce la tabla, se informa el error.

const { normalizar, titulo } = require('../utils/normalizar');

const URL_CNE = 'https://www.cne.gov.co/index.php/partidos-movimientos-politicos-y-grupos-significativos/778';
const DURACION_CACHE = 24 * 60 * 60 * 1000;
let cache = null;

const ENTIDADES = {
  '&aacute;': 'á', '&eacute;': 'é', '&iacute;': 'í', '&oacute;': 'ó', '&uacute;': 'ú', '&ntilde;': 'ñ',
  '&Aacute;': 'Á', '&Eacute;': 'É', '&Iacute;': 'Í', '&Oacute;': 'Ó', '&Uacute;': 'Ú', '&Ntilde;': 'Ñ',
  '&ldquo;': '"', '&rdquo;': '"', '&quot;': '"', '&ndash;': '-', '&mdash;': '-', '&amp;': '&', '&nbsp;': ' ',
};
const texto = (html) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-zA-Z]+;/g, (e) => ENTIDADES[e] ?? ' ')
    .replace(/\s+/g, ' ')
    .trim();

// Siglas que deben quedar en mayúsculas al pasar el nombre a minúsculas cuidadas
const SIGLAS = ['MIRA', 'AICO', 'ASI', 'MAIS', 'ADA'];

// "PARTIDO ALIANZA SOCIAL INDEPENDIENTE "ASI"" → { nombre: "Partido Alianza Social Independiente", sigla: "ASI" }
const limpiarNombre = (crudo) => {
  let nombre = crudo.replace(/\s*-?\s*Res\.?\s*\d+\s*de\s*\d{4}/gi, '').trim();
  let sigla = null;
  const entreComillas = nombre.match(/"([^"]+)"/);
  if (entreComillas) {
    sigla = entreComillas[1].trim();
    nombre = nombre.replace(/"[^"]+"/, '').trim();
  }
  const partes = nombre.split(/\s+-\s+/);
  if (partes.length > 1) {
    nombre = partes[0].trim();
    sigla = sigla || titulo(partes[1].trim());
  }
  return { nombre: nombrePropio(nombre.replace(/[-\s]+$/, '')), sigla };
};

// "PARTIDO POLÍTICO LA FUERZA" → "Partido Político La Fuerza";
// "PARTIDO DE LA UNIÓN POR LA GENTE" → "Partido de la Unión por la Gente".
// Las palabras cortas van en minúscula, salvo cuando abren el nombre propio tras "Partido Político…".
const CORTAS = new Set(['de', 'del', 'la', 'las', 'los', 'el', 'y', 'e', 'por', 'en']);
const GENERICAS = new Set(['partido', 'movimiento', 'político', 'consejo', 'comunitario']);
const nombrePropio = (crudo) => {
  const palabras = crudo.toLowerCase().split(/\s+/);
  return palabras
    .map((p, i) => {
      if (SIGLAS.includes(p.toUpperCase())) return p.toUpperCase();
      const abreNombre = GENERICAS.has(palabras[i - 1]) && p !== 'de' && p !== 'del';
      if (i > 0 && CORTAS.has(p) && !abreNombre) return p;
      return p.charAt(0).toUpperCase() + p.slice(1);
    })
    .join(' ');
};

// Clave para reconocer el mismo partido escrito distinto en otra fuente o en el catálogo:
// "PARTIDO POLÍTICO DIGNIDAD & COMPROMISO" y "Dignidad y Compromiso" → "DIGNIDAD COMPROMISO"
const RELLENO = new Set(['PARTIDO', 'MOVIMIENTO', 'POLITICO', 'COLOMBIANO', 'COLOMBIA', 'DE', 'DEL', 'LA', 'EL', 'LOS', 'LAS', 'Y', 'POR']);
const clavePartido = (nombre) =>
  normalizar(String(nombre).replace(/"[^"]+"/g, ' ').split(/\s+-\s+/)[0])
    .split(' ')
    .filter((p) => p && !RELLENO.has(p))
    .join(' ');

// Lee la tabla de partidos del HTML de la página del CNE
const leerTabla = (html) => {
  const datos = [];
  for (const [, fila] of html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)) {
    const celdas = [...fila.matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g)].map((c) => c[1]);
    if (celdas.length < 2 || !/^\d+$/.test(texto(celdas[0]))) continue; // encabezados u otras tablas
    const imagen = fila.match(/<img[^>]+src="([^"]+)"/)?.[1];
    const { nombre, sigla } = limpiarNombre(texto(celdas[1]));
    if (!nombre) continue;
    datos.push({
      cne_numero: Number(texto(celdas[0])),
      nombre,
      sigla,
      logo_url: imagen ? new URL(imagen, URL_CNE).href : null,
      resolucion: celdas[3] ? texto(celdas[3]) : null,
    });
  }
  if (datos.length < 10) throw new Error('No se reconoció la tabla de partidos en la página del CNE');
  return datos;
};

// Copia de la lista guardada en el proyecto (scripts/generar-partidos-cne.js), para cuando
// cne.gov.co no responde.
const copiaGuardada = () => {
  try {
    return require('../../data/partidos-cne.json').partidos;
  } catch {
    return null;
  }
};

// Lista vigente: la página del CNE si responde; si no, la copia guardada.
const partidosVigentes = async () => {
  if (cache && Date.now() - cache.t < DURACION_CACHE) return cache.datos;
  try {
    const res = await fetch(URL_CNE, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DynamicElecciones/1.0)' },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) throw new Error(`cne.gov.co respondió ${res.status}`);
    const datos = leerTabla(await res.text());
    cache = { t: Date.now(), datos };
    return datos;
  } catch (err) {
    const copia = copiaGuardada();
    if (!copia) throw err;
    console.error(`CNE no disponible (${err.message}); se usa la copia guardada`);
    // Se reintenta en 10 minutos en vez de esperar las 24 h de la caché normal
    cache = { t: Date.now() - DURACION_CACHE + 10 * 60 * 1000, datos: copia };
    return copia;
  }
};

module.exports = { partidosVigentes, clavePartido, leerTabla, URL_CNE };
