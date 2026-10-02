// Territorio de la campaña del usuario, para limitar los catálogos geográficos
// (municipios, barrios, puestos y mesas) a lo que le corresponde.
const db = require('./db');

// Devuelve { codigo_departamento, codigo_municipio } o null si no hay que filtrar
// (superadmin, o campaña antigua sin territorio codificado).
const territorioDe = async (usuario) => {
  if (!usuario?.campana_id) return null;
  const { rows } = await db.query(
    'SELECT codigo_departamento, codigo_municipio FROM campanas WHERE id = $1',
    [usuario.campana_id]
  );
  return rows[0]?.codigo_departamento ? rows[0] : null;
};

// Condición SQL sobre la tabla municipios (alias dado) y sus valores
const condicionMunicipios = (territorio, alias = 'm') =>
  territorio
    ? {
        sql: `${alias}.codigo_departamento = $1 AND ($2::text IS NULL OR ${alias}.codigo_dane = $2)`,
        valores: [territorio.codigo_departamento, territorio.codigo_municipio],
      }
    : { sql: 'true', valores: [] };

module.exports = { territorioDe, condicionMunicipios };
