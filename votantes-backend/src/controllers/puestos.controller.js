// controllers/puestos.controller.js
// Puestos de control del día de la elección.
// - El admin crea puestos de toda la campaña o del equipo de un aspirante, y los ve todos.
// - El equipo de un aspirante crea y administra los suyos, y además puede usar los de la campaña.
import db from '../utils/db.js';
import { esAdmin, filtroVotantes } from '../utils/scope.js';

const limpiar = (v) => (typeof v === 'string' ? v.trim() : '');

// Condición de los puestos que el usuario puede ver y usar
export const filtroPuestos = (usuario, alias = 'pc', valores = []) => {
  const condiciones = [`${alias}.campana_id = $${valores.push(usuario.campana_id)}`];
  if (!esAdmin(usuario)) {
    condiciones.push(
      usuario.aspirante_id
        ? `(${alias}.aspirante_id IS NULL OR ${alias}.aspirante_id = $${valores.push(usuario.aspirante_id)})`
        : `${alias}.aspirante_id IS NULL`
    );
  }
  return { where: `WHERE ${condiciones.join(' AND ')}`, valores };
};

// El usuario puede modificar el puesto: el admin todos; el equipo de un aspirante, los suyos
const puedeAdministrar = (usuario, puesto) =>
  esAdmin(usuario) || (!!usuario.aspirante_id && puesto.aspirante_id === usuario.aspirante_id);

// Dueño de un puesto nuevo o editado: el equipo de un aspirante siempre crea para sí mismo
const resolverAspirante = async (usuario, aspiranteElegido) => {
  if (!esAdmin(usuario)) return usuario.aspirante_id || null;
  if (!aspiranteElegido) return null;
  const { rowCount } = await db.query(
    'SELECT 1 FROM aspirantes WHERE id = $1 AND campana_id = $2',
    [aspiranteElegido, usuario.campana_id]
  );
  if (rowCount === 0) throw Object.assign(new Error('El aspirante no pertenece a la campaña'), { status: 400 });
  return aspiranteElegido;
};

const responderError = (res, err, mensaje) => {
  if (err.code === '23505') return res.status(409).json({ error: 'Ya existe un puesto de control con ese nombre' });
  if (err.status) return res.status(err.status).json({ error: err.message });
  console.error(mensaje, err);
  res.status(500).json({ error: mensaje });
};

// ✅ Puestos visibles para el usuario, con cuántos votantes de su alcance se confirmaron en cada uno
export const listarPuestos = async (req, res) => {
  const { where, valores } = filtroPuestos(req.usuario);
  const votantes = filtroVotantes(req.usuario, 'pv', valores);
  try {
    const { rows } = await db.query(
      `SELECT pc.id, pc.nombre, pc.referencia, pc.aspirante_id, pc.created_at,
              asp.nombre_completo AS aspirante_nombre, asp.cargo AS aspirante_cargo,
              (SELECT COUNT(DISTINCT a.votante_uuid)
               FROM asistencia_votantes a
               JOIN prospectos_votantes pv ON pv.id = a.votante_uuid
               ${votantes.where} AND a.puesto_control_id = pc.id)::int AS total_asistencias
       FROM puestos_control pc
       LEFT JOIN aspirantes asp ON asp.id = pc.aspirante_id
       ${where}
       ORDER BY (pc.aspirante_id IS NULL) DESC, asp.nombre_completo, pc.nombre`,
      valores
    );
    res.json(rows.map((p) => ({ ...p, editable: puedeAdministrar(req.usuario, p) })));
  } catch (err) {
    responderError(res, err, 'Error al obtener los puestos de control');
  }
};

export const createPuesto = async (req, res) => {
  const nombre = limpiar(req.body.nombre);
  if (!nombre) return res.status(400).json({ error: 'El nombre del puesto es obligatorio' });
  if (!esAdmin(req.usuario) && !req.usuario.aspirante_id) {
    return res.status(403).json({ error: 'Su usuario no puede crear puestos de control' });
  }
  try {
    const aspirante_id = await resolverAspirante(req.usuario, req.body.aspirante_id);
    const { rows } = await db.query(
      `INSERT INTO puestos_control (campana_id, aspirante_id, nombre, referencia)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.usuario.campana_id, aspirante_id, nombre, limpiar(req.body.referencia) || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    responderError(res, err, 'No se pudo crear el puesto de control');
  }
};

// Busca el puesto dentro de la campaña y comprueba que el usuario lo pueda administrar
const puestoAdministrable = async (req, res) => {
  const { rows } = await db.query(
    'SELECT * FROM puestos_control WHERE id = $1 AND campana_id = $2',
    [req.params.id, req.usuario.campana_id]
  );
  const puesto = rows[0];
  if (!puesto || (!esAdmin(req.usuario) && puesto.aspirante_id && puesto.aspirante_id !== req.usuario.aspirante_id)) {
    res.status(404).json({ error: 'Puesto de control no encontrado' });
    return null;
  }
  if (!puedeAdministrar(req.usuario, puesto)) {
    res.status(403).json({ error: 'Este puesto es de toda la campaña; solo el administrador lo puede cambiar' });
    return null;
  }
  return puesto;
};

export const updatePuesto = async (req, res) => {
  const nombre = limpiar(req.body.nombre);
  if (!nombre) return res.status(400).json({ error: 'El nombre del puesto es obligatorio' });
  try {
    const puesto = await puestoAdministrable(req, res);
    if (!puesto) return;
    const aspirante_id = await resolverAspirante(req.usuario, req.body.aspirante_id);
    const { rows } = await db.query(
      `UPDATE puestos_control SET nombre = $1, referencia = $2, aspirante_id = $3 WHERE id = $4 RETURNING *`,
      [nombre, limpiar(req.body.referencia) || null, aspirante_id, puesto.id]
    );
    // El nombre guardado en las asistencias acompaña al puesto
    await db.query('UPDATE asistencia_votantes SET puesto_control = $1 WHERE puesto_control_id = $2', [nombre, puesto.id]);
    res.json(rows[0]);
  } catch (err) {
    responderError(res, err, 'No se pudo actualizar el puesto de control');
  }
};

// Las asistencias ya confirmadas se conservan con el nombre del puesto
export const deletePuesto = async (req, res) => {
  try {
    const puesto = await puestoAdministrable(req, res);
    if (!puesto) return;
    await db.query('DELETE FROM puestos_control WHERE id = $1', [puesto.id]);
    res.json({ ok: true });
  } catch (err) {
    responderError(res, err, 'No se pudo eliminar el puesto de control');
  }
};
