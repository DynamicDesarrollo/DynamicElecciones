// Datos geográficos y electorales oficiales desde datos.gov.co (gratis, sin clave):
// - DANE DIVIPOLA (gdxc-w37w): departamentos y municipios con su código oficial.
// - Registraduría, Divipole territoriales 2023 (mv2e-prx5): puestos de votación con dirección y coordenadas.
// Las respuestas se guardan en memoria 24 h para no depender de la API en cada formulario.

const { normalizar, mismoLugar, titulo } = require('../utils/normalizar');

const URL_DANE = 'https://www.datos.gov.co/resource/gdxc-w37w.json';
const URL_PUESTOS = 'https://www.datos.gov.co/resource/mv2e-prx5.json';
const DURACION_CACHE = 24 * 60 * 60 * 1000;
const cache = new Map();

const consultar = async (url, params) => {
  const clave = `${url}?${new URLSearchParams(params)}`;
  const guardado = cache.get(clave);
  if (guardado && Date.now() - guardado.t < DURACION_CACHE) return guardado.datos;

  const res = await fetch(clave, { signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`datos.gov.co respondió ${res.status}`);
  const datos = await res.json();
  cache.set(clave, { t: Date.now(), datos });
  return datos;
};

// "BOGOTÁ, D.C." → "Bogotá, D.C."
const nombreBonito = (texto) => titulo(texto).replace(/D\.c\./g, 'D.C.');

const departamentos = async () => {
  const filas = await consultar(URL_DANE, { $select: 'distinct cod_dpto, dpto', $order: 'dpto', $limit: 100 });
  return filas.map((f) => ({ codigo: f.cod_dpto, nombre: nombreBonito(f.dpto), oficial: f.dpto }));
};

const municipios = async (codigoDepartamento) => {
  if (!/^\d{2}$/.test(codigoDepartamento)) throw new Error('Código de departamento no válido');
  const filas = await consultar(URL_DANE, {
    cod_dpto: codigoDepartamento,
    $select: 'cod_mpio, nom_mpio',
    $order: 'nom_mpio',
    $limit: 500,
  });
  return filas.map((f) => ({ codigo: f.cod_mpio, nombre: nombreBonito(f.nom_mpio), oficial: f.nom_mpio }));
};

// Nombre del departamento tal como lo escribe la Registraduría ("BOGOTA D.C.", "SAN ANDRES")
const departamentoRegistraduria = async (nombreDane) => {
  const filas = await consultar(URL_PUESTOS, { $select: 'distinct departamento', $limit: 100 });
  const nombres = filas.map((f) => f.departamento);
  const objetivo = normalizar(nombreDane);
  return (
    nombres.find((n) => normalizar(n) === objetivo) ||
    nombres.find((n) => mismoLugar(n, nombreDane)) ||
    // "ARCHIPIÉLAGO DE SAN ANDRÉS, PROVIDENCIA Y..." ↔ "SAN ANDRES"
    nombres.find((n) => objetivo.includes(normalizar(n)) || normalizar(n).includes(objetivo)) ||
    null
  );
};

// Todos los puestos de votación de un departamento (una sola consulta)
const puestosDepartamento = async (nombreDane) => {
  const depto = await departamentoRegistraduria(nombreDane);
  if (!depto) return [];
  return consultar(URL_PUESTOS, {
    departamento: depto,
    $select: 'departamento, municipio, puesto, comuna, direccion, latitud, longitud',
    $order: 'municipio, puesto',
    $limit: 10000,
  });
};

// Número de mesas por puesto: la API no lo trae; sale del Divipole en Excel (scripts/generar-mesas-divipole.js)
let tablaMesas = null;
const mesasDelPuesto = (departamento, municipio, puesto) => {
  if (!tablaMesas) {
    try {
      tablaMesas = require('../../data/mesas-divipole.json').mesas;
    } catch {
      tablaMesas = {};
    }
  }
  return tablaMesas[`${normalizar(departamento)}|${normalizar(municipio)}|${normalizar(puesto)}`] || null;
};

module.exports = { departamentos, municipios, puestosDepartamento, mesasDelPuesto };
