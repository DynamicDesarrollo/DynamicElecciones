// Alcance de datos por campaña y rol.
// Toda consulta sobre datos de campaña debe pasar por aquí para no mezclar clientes.
//
// Roles:
// - superadmin: dueño del SaaS; trabaja sobre la campaña que tenga activa
// - admin:      equipo del aspirante principal; ve toda la campaña
// - aspirante:  equipo de un aspirante secundario (p. ej. un concejal); ve solo lo suyo
// - user:       rol anterior a la migración; ve solo lo que registró

const ROLES_ADMIN = ['superadmin', 'admin'];

const esAdmin = (usuario) => ROLES_ADMIN.includes(usuario?.rol);

// Condiciones sobre una tabla con campana_id y aspirante_id (votantes o líderes).
// `propios`: columna con el usuario que registró, para el rol "user" (si la tabla la tiene).
// `valores` se modifica: los parámetros se agregan al final.
const filtroAlcance = (usuario, alias, valores = [], { propios } = {}) => {
  const condiciones = [`${alias}.campana_id = $${valores.push(usuario.campana_id)}`];

  if (!esAdmin(usuario)) {
    if (usuario.aspirante_id) {
      condiciones.push(`${alias}.aspirante_id = $${valores.push(usuario.aspirante_id)}`);
    } else if (propios) {
      condiciones.push(`${alias}.${propios} = $${valores.push(usuario.id)}`);
    }
  }

  return { condiciones, valores, where: `WHERE ${condiciones.join(' AND ')}` };
};

const filtroVotantes = (usuario, alias = 'pv', valores = []) =>
  filtroAlcance(usuario, alias, valores, { propios: 'usuario_id' });

const filtroLideres = (usuario, alias = 'l', valores = []) =>
  filtroAlcance(usuario, alias, valores);

module.exports = { ROLES_ADMIN, esAdmin, filtroVotantes, filtroLideres };
