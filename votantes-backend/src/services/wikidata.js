// Partidos políticos de Colombia vigentes, desde Wikidata (gratis, sin clave).
// Trae nombre, sigla, logo (Wikimedia Commons), color y lema cuando existen. Caché de 24 h.

const ENDPOINT = 'https://query.wikidata.org/sparql';
const DURACION_CACHE = 24 * 60 * 60 * 1000;
let cache = null;

// Partidos (o subclases) con país Colombia y sin fecha de disolución
const CONSULTA = `
SELECT ?p ?pLabel ?sigla ?logo ?lema ?color WHERE {
  ?p wdt:P31/wdt:P279* wd:Q7278; wdt:P17 wd:Q739.
  FILTER NOT EXISTS { ?p wdt:P576 ?fin }
  OPTIONAL { ?p wdt:P154 ?logo }
  OPTIONAL { ?p wdt:P1813 ?sigla }
  OPTIONAL { ?p wdt:P1451 ?lema }
  OPTIONAL { ?p wdt:P465 ?color }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "es,en". }
}`;

// Logo servido por Commons a un tamaño razonable
const urlLogo = (valor) =>
  valor ? `${valor.replace(/^http:/, 'https:')}?width=240` : null;

const partidosColombia = async () => {
  if (cache && Date.now() - cache.t < DURACION_CACHE) return cache.datos;

  const url = `${ENDPOINT}?${new URLSearchParams({ query: CONSULTA })}`;
  const res = await fetch(url, {
    headers: {
      Accept: 'application/sparql-results+json',
      // Wikidata pide identificar la aplicación
      'User-Agent': 'DynamicElecciones/1.0 (gestión de campañas; https://dynamic-elecciones.vercel.app)',
    },
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`Wikidata respondió ${res.status}`);
  const { results } = await res.json();

  // Una fila por partido (la consulta repite filas cuando hay varios valores)
  const porId = new Map();
  for (const f of results.bindings) {
    const id = f.p.value.split('/').pop();
    if (!porId.has(id)) {
      porId.set(id, {
        wikidata_id: id,
        nombre: f.pLabel.value,
        sigla: f.sigla?.value || null,
        logo_url: urlLogo(f.logo?.value),
        eslogan: f.lema?.value || null,
        color: f.color?.value ? `#${f.color.value}` : null,
      });
    }
  }
  // Sin etiqueta en español Wikidata devuelve el id (Q123): esos no sirven
  const datos = [...porId.values()]
    .filter((p) => !/^Q\d+$/.test(p.nombre))
    .sort((a, b) => Number(!!b.logo_url) - Number(!!a.logo_url) || a.nombre.localeCompare(b.nombre, 'es'));

  cache = { t: Date.now(), datos };
  return datos;
};

module.exports = { partidosColombia };
