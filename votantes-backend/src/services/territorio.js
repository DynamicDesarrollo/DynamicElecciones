// Carga el territorio de una campaña en los catálogos: sus municipios (con código DANE),
// los puestos de votación de esos municipios y sus mesas.
// Es idempotente: se puede repetir sin duplicar, y enlaza los registros viejos que coinciden por nombre
// (p. ej. "Apartada (CORD)" pasa a ser "La Apartada" con su código), sin romper los votantes existentes.

const db = require('../utils/db');
const { normalizar, mismoLugar } = require('../utils/normalizar');
const divipola = require('./divipola');

const prepararTerritorio = async (campanaId) => {
  const { rows } = await db.query(
    'SELECT codigo_departamento, codigo_municipio FROM campanas WHERE id = $1',
    [campanaId]
  );
  const campana = rows[0];
  if (!campana?.codigo_departamento) return { municipios: 0, puestos: 0, mesas: 0 };

  const departamento = (await divipola.departamentos()).find((d) => d.codigo === campana.codigo_departamento);
  if (!departamento) throw new Error('Departamento no encontrado en el DANE');
  const todos = await divipola.municipios(campana.codigo_departamento);
  const objetivo = campana.codigo_municipio ? todos.filter((m) => m.codigo === campana.codigo_municipio) : todos;
  const puestos = await divipola.puestosDepartamento(departamento.oficial);

  return db.transaction(async (client) => {
    // 1. Municipios: actualizar los que ya existen (por código o por nombre) e insertar los nuevos
    const existentes = (await client.query('SELECT id, nombre, codigo_dane FROM municipios')).rows;
    const idPorCodigo = {};
    for (const m of objetivo) {
      const previo =
        existentes.find((e) => e.codigo_dane === m.codigo) ||
        existentes.find((e) => !e.codigo_dane && mismoLugar(e.nombre, m.oficial));
      if (previo) {
        await client.query(
          `UPDATE municipios SET nombre = $1, codigo_dane = $2, codigo_departamento = $3, departamento = $4 WHERE id = $5`,
          [m.nombre, m.codigo, departamento.codigo, departamento.nombre, previo.id]
        );
        previo.codigo_dane = m.codigo;
        idPorCodigo[m.codigo] = previo.id;
      } else {
        const r = await client.query(
          `INSERT INTO municipios (nombre, codigo_dane, codigo_departamento, departamento)
           VALUES ($1, $2, $3, $4) RETURNING id`,
          [m.nombre, m.codigo, departamento.codigo, departamento.nombre]
        );
        idPorCodigo[m.codigo] = r.rows[0].id;
      }
    }
    const idsMunicipios = Object.values(idPorCodigo);

    // 2. Puestos de votación: enlazar los existentes por nombre y crear los que faltan (en lote)
    const lugares = (await client.query(
      `SELECT id, nombre, municipio, municipio_id FROM lugares_votacion
       WHERE municipio_id = ANY($1::uuid[]) OR municipio_id IS NULL`,
      [idsMunicipios]
    )).rows;

    const nuevos = [];
    const actualizar = [];
    for (const m of objetivo) {
      const municipioId = idPorCodigo[m.codigo];
      for (const p of puestos.filter((x) => mismoLugar(x.municipio, m.oficial))) {
        const datos = {
          nombre: p.puesto,
          municipio_id: municipioId,
          departamento: p.departamento,
          municipio: p.municipio,
          direccion: p.direccion || null,
          comuna: p.comuna || null,
          latitud: p.latitud ? Number(String(p.latitud).replace(',', '.')) || null : null,
          longitud: p.longitud ? Number(String(p.longitud).replace(',', '.')) || null : null,
          mesas: divipola.mesasDelPuesto(p.departamento, p.municipio, p.puesto),
        };
        const previo = lugares.find(
          (l) =>
            normalizar(l.nombre) === normalizar(p.puesto) &&
            (l.municipio_id === municipioId || (!l.municipio_id && mismoLugar(l.municipio, m.oficial)))
        );
        if (previo) actualizar.push({ id: previo.id, ...datos });
        else nuevos.push(datos);
      }
    }

    const columnas = ['nombre', 'municipio_id', 'departamento', 'municipio', 'direccion', 'comuna', 'latitud', 'longitud', 'mesas'];
    const tipos = ['text', 'uuid', 'text', 'text', 'text', 'text', 'numeric', 'numeric', 'int'];
    const arreglos = (filas) => columnas.map((c) => filas.map((f) => f[c]));

    if (nuevos.length) {
      await client.query(
        `INSERT INTO lugares_votacion (${columnas.join(', ')}, fuente)
         SELECT *, 'registraduria-2023' FROM unnest(${tipos.map((t, i) => `$${i + 1}::${t}[]`).join(', ')})`,
        arreglos(nuevos)
      );
    }
    if (actualizar.length) {
      await client.query(
        `UPDATE lugares_votacion l SET
           municipio_id = v.municipio_id, departamento = v.departamento, municipio = v.municipio,
           direccion = v.direccion, comuna = v.comuna, latitud = v.latitud, longitud = v.longitud,
           mesas = COALESCE(v.mesas, l.mesas), fuente = 'registraduria-2023'
         FROM unnest($1::uuid[], ${tipos.map((t, i) => `$${i + 2}::${t}[]`).join(', ')})
           AS v(id, ${columnas.join(', ')})
         WHERE l.id = v.id`,
        [actualizar.map((f) => f.id), ...arreglos(actualizar)]
      );
    }

    // 3. Mesas: las que falten de 1 a N en cada puesto (conserva las que ya existen)
    const mesas = await client.query(
      `INSERT INTO mesas_votacion (numero, lugar_id)
       SELECT g::text, l.id
       FROM lugares_votacion l
       CROSS JOIN LATERAL generate_series(1, COALESCE(l.mesas, 0)) g
       WHERE l.municipio_id = ANY($1::uuid[])
         AND NOT EXISTS (SELECT 1 FROM mesas_votacion m WHERE m.lugar_id = l.id AND m.numero = g::text)`,
      [idsMunicipios]
    );

    return { municipios: objetivo.length, puestos: nuevos.length + actualizar.length, mesas: mesas.rowCount };
  });
};

module.exports = { prepararTerritorio };
