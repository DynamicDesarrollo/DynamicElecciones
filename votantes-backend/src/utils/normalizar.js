// Normaliza nombres geográficos para comparar fuentes distintas (DANE, Registraduría, datos viejos):
// mayúsculas, sin tildes, sin paréntesis ni puntuación. "La Apartada (Frontera)" → "LA APARTADA".
const normalizar = (texto = '') =>
  String(texto)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/\(.*?\)/g, ' ')
    .replace(/[^A-Z0-9Ñ ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

// ¿Dos nombres de municipio son el mismo? Exacto, o uno es el inicio/fin del otro
// ("PURISIMA" ↔ "PURISIMA DE LA CONCEPCION", "APARTADA" ↔ "LA APARTADA").
const mismoLugar = (a, b) => {
  const x = normalizar(a);
  const y = normalizar(b);
  if (!x || !y) return false;
  if (x === y) return true;
  const [corto, largo] = x.length <= y.length ? [x, y] : [y, x];
  return corto.length >= 5 && (largo.startsWith(`${corto} `) || largo.endsWith(` ${corto}`));
};

// "SAN JOSÉ DE URÉ" → "San José de Uré" (para mostrar nombres en minúsculas cuidadas)
const MINUSCULAS = new Set(['de', 'del', 'la', 'las', 'los', 'el', 'y', 'e']);
const titulo = (texto = '') =>
  String(texto)
    .toLowerCase()
    .split(' ')
    .map((p, i) => (i > 0 && MINUSCULAS.has(p) ? p : p.charAt(0).toUpperCase() + p.slice(1)))
    .join(' ');

module.exports = { normalizar, mismoLugar, titulo };
