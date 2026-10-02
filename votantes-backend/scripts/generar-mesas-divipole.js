// Genera data/mesas-divipole.json a partir del Excel de la Registraduría (Divipole).
// La API pública de puestos (datos.gov.co) no trae el número de mesas; este archivo lo complementa.
// Uso: node scripts/generar-mesas-divipole.js "<ruta al .xlsx>"

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const { normalizar } = require('../src/utils/normalizar');

const origen = process.argv[2] || path.join(__dirname, '..', '..', 'Dcoumentos', 'Divipole Elecciones Congreso Definitiva.xlsx');
const destino = path.join(__dirname, '..', 'data', 'mesas-divipole.json');

const wb = XLSX.readFile(origen);
const filas = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 });
const iEnc = filas.findIndex((f) => f.includes('departamento') && f.includes('mesas'));
if (iEnc < 0) throw new Error('No se encontró la fila de encabezados (departamento, municipio, puesto, mesas)');
const enc = filas[iEnc];
const col = (nombre) => enc.indexOf(nombre);

// Clave: DEPARTAMENTO|MUNICIPIO|PUESTO normalizados → número de mesas
const mesas = {};
for (const f of filas.slice(iEnc + 1)) {
  const [depto, muni, puesto, n] = [f[col('departamento')], f[col('municipio')], f[col('puesto')], f[col('mesas')]];
  if (!depto || !muni || !puesto || !n) continue;
  mesas[`${normalizar(depto)}|${normalizar(muni)}|${normalizar(puesto)}`] = Number(n);
}

fs.mkdirSync(path.dirname(destino), { recursive: true });
fs.writeFileSync(destino, JSON.stringify({
  fuente: 'Registraduría Nacional, Divipole Elecciones de Congreso 2022',
  generado: new Date().toISOString().slice(0, 10),
  mesas,
}));
console.log(`✅ ${Object.keys(mesas).length} puestos con número de mesas → ${path.relative(process.cwd(), destino)}`);
