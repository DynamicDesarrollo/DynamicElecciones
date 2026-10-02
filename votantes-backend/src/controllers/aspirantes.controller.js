import db from '../utils/db.js';
import { TIPOS_CAMPANA, CARGOS } from '../utils/campanas.js';
import { esAdmin } from '../utils/scope.js';

const CAMPOS = ['nombre_completo', 'cedula', 'telefono', 'direccion', 'barrio', 'fecha_nace', 'partido_id', 'municipio_id', 'coalicion'];

// Valores de los campos editables, con vacíos convertidos a NULL
const valoresCampos = (body) => CAMPOS.map((campo) => {
  if (campo === 'coalicion') return body.coalicion === true;
  const v = body[campo];
  return v === '' || v === undefined ? null : v;
});

// ✅ Aspirantes de la campaña: el principal primero, luego los secundarios.
// Un usuario de aspirante solo se ve a sí mismo.
export const listarAspirantes = async (req, res) => {
  const { campana_id, aspirante_id } = req.usuario;
  const soloPropio = !esAdmin(req.usuario) && aspirante_id;
  try {
    const result = await db.query(`
      SELECT a.*, (a.padre_id IS NULL) AS es_principal,
             p.nombre AS partido, m.nombre AS municipio, padre.nombre_completo AS padre_nombre,
             (SELECT COUNT(*) FROM lideres l WHERE l.aspirante_id = a.id)::int AS total_lideres,
             (SELECT COUNT(*) FROM prospectos_votantes pv WHERE pv.aspirante_id = a.id)::int AS total_votantes,
             (SELECT COUNT(*) FROM usuarios u WHERE u.aspirante_id = a.id)::int AS total_usuarios
      FROM aspirantes a
      LEFT JOIN partidos p ON p.id = a.partido_id
      LEFT JOIN municipios m ON m.id = a.municipio_id
      LEFT JOIN aspirantes padre ON padre.id = a.padre_id
      WHERE a.campana_id = $1 ${soloPropio ? 'AND a.id = $2' : ''}
      ORDER BY (a.padre_id IS NULL) DESC, a.nombre_completo
    `, soloPropio ? [campana_id, aspirante_id] : [campana_id]);
    res.json(result.rows.map((a) => ({ ...a, cargo_nombre: CARGOS[a.cargo] })));
  } catch (err) {
    console.error('Error al listar aspirantes:', err);
    res.status(500).json({ error: 'Error al obtener aspirantes' });
  }
};

// ✅ Crear aspirante secundario (concejal de la alcaldía, diputado de la gobernación).
// El principal se crea junto con la campaña.
export const createAspirante = async (req, res) => {
  const { campana_id } = req.usuario;
  if (!req.body.nombre_completo?.trim()) {
    return res.status(400).json({ error: 'El nombre es obligatorio' });
  }
  try {
    const { rows } = await db.query(
      `SELECT c.tipo, a.id AS principal_id
       FROM campanas c LEFT JOIN aspirantes a ON a.campana_id = c.id AND a.padre_id IS NULL
       WHERE c.id = $1`,
      [campana_id]
    );
    const { tipo, principal_id } = rows[0];
    const cargo = TIPOS_CAMPANA[tipo].secundario;
    if (!cargo) {
      return res.status(400).json({ error: `Una campaña de ${TIPOS_CAMPANA[tipo].nombre} no tiene aspirantes secundarios` });
    }

    const result = await db.query(
      `INSERT INTO aspirantes (campana_id, cargo, padre_id, ${CAMPOS.join(', ')})
       VALUES ($1, $2, $3, ${CAMPOS.map((_, i) => `$${i + 4}`).join(', ')})
       RETURNING *`,
      [campana_id, cargo, principal_id, ...valoresCampos(req.body)]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: 'Error al crear aspirante', details: err.message });
  }
};

// ✅ Actualizar datos de un aspirante (principal o secundario); el cargo y el padre no cambian
export const updateAspirante = async (req, res) => {
  const { id } = req.params;
  if (!req.body.nombre_completo?.trim()) {
    return res.status(400).json({ error: 'El nombre es obligatorio' });
  }
  try {
    const result = await db.query(
      `UPDATE aspirantes SET ${CAMPOS.map((c, i) => `${c} = $${i + 1}`).join(', ')}
       WHERE id = $${CAMPOS.length + 1} AND campana_id = $${CAMPOS.length + 2}
       RETURNING *`,
      [...valoresCampos(req.body), id, req.usuario.campana_id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Aspirante no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar aspirante', details: err.message });
  }
};

// ✅ Eliminar aspirante secundario sin líderes, votantes ni usuarios
export const deleteAspirante = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      'DELETE FROM aspirantes WHERE id = $1 AND campana_id = $2 AND padre_id IS NOT NULL',
      [id, req.usuario.campana_id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Aspirante no encontrado (el aspirante principal no se puede eliminar)' });
    }
    res.json({ message: 'Aspirante eliminado correctamente' });
  } catch (err) {
    if (err.code === '23503') {
      return res.status(409).json({ error: 'No se puede eliminar: tiene líderes, votantes o usuarios asociados.' });
    }
    res.status(500).json({ error: 'Error al eliminar aspirante', details: err.message });
  }
};
