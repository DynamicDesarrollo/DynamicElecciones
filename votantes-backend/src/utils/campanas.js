// Tipos de campaña del SaaS: qué cargo encabeza cada una y cuál va debajo.
// Para agregar un tipo (p. ej. Senado o Cámara) basta con sumarlo aquí y en el CHECK de la tabla campanas.

const TIPOS_CAMPANA = {
  gobernacion: { nombre: 'Gobernación', territorio: 'departamento', principal: 'gobernador', secundario: 'diputado' },
  asamblea:    { nombre: 'Asamblea',    territorio: 'departamento', principal: 'diputado',   secundario: null },
  alcaldia:    { nombre: 'Alcaldía',    territorio: 'municipio',    principal: 'alcalde',    secundario: 'concejal' },
  concejo:     { nombre: 'Concejo',     territorio: 'municipio',    principal: 'concejal',   secundario: null },
};

const CARGOS = {
  gobernador: 'Gobernador',
  diputado: 'Diputado',
  alcalde: 'Alcalde',
  concejal: 'Concejal',
};

// Datos públicos de una campaña para el frontend (incluye los cargos de su jerarquía)
const describirCampana = (c) => {
  if (!c) return null;
  const tipo = TIPOS_CAMPANA[c.tipo] || {};
  return {
    id: c.id,
    nombre: c.nombre,
    tipo: c.tipo,
    tipo_nombre: tipo.nombre,
    departamento: c.departamento,
    municipio: c.municipio,
    codigo_departamento: c.codigo_departamento ?? null,
    codigo_municipio: c.codigo_municipio ?? null,
    activa: c.activa,
    aspirante_principal: c.aspirante_principal ?? null,
    cargo_principal: tipo.principal,
    cargo_secundario: tipo.secundario,
  };
};

module.exports = { TIPOS_CAMPANA, CARGOS, describirCampana };
