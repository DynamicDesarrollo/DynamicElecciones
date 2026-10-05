// Guarda una copia de la lista oficial de partidos del CNE en data/partidos-cne.json.
// El backend la usa cuando cne.gov.co no responde. Conviene regenerarla antes de cada elección.
// Uso: npm run partidos-cne            (descarga la página)
//      npm run partidos-cne -- <archivo.html>   (usa una página ya descargada)

const fs = require('fs');
const path = require('path');
const { leerTabla, URL_CNE } = require('../src/services/cne');

(async () => {
  try {
    const archivo = process.argv[2];
    const html = archivo
      ? fs.readFileSync(archivo, 'utf8')
      : await (await fetch(URL_CNE, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DynamicElecciones/1.0)' }, signal: AbortSignal.timeout(40000) })).text();
    const partidos = leerTabla(html);
    const destino = path.join(__dirname, '..', 'data', 'partidos-cne.json');
    fs.writeFileSync(destino, JSON.stringify({
      fuente: URL_CNE,
      generado: new Date().toISOString().slice(0, 10),
      partidos,
    }, null, 1));
    console.log(`✅ ${partidos.length} partidos → ${path.relative(process.cwd(), destino)}`);
  } catch (err) {
    console.error('❌ No se pudo generar la copia:', err.message);
    process.exit(1);
  }
})();
