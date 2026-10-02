import db from '../utils/db.js';
import { filtroVotantes } from '../utils/scope.js';

// ✅ Filtrar votantes visibles (búsqueda por nombre/cédula y estado)
export const filtrarVotantes = async (req, res) => {
  try {
    const { page = 1, limit = 10, busqueda = "", activo } = req.query;
    const offset = (page - 1) * limit;

    const { condiciones, valores } = filtroVotantes(req.usuario, 'v');

    if (busqueda) {
      condiciones.push(`(v.nombre_completo ILIKE $${valores.length + 1} OR v.cedula ILIKE $${valores.length + 1})`);
      valores.push(`%${busqueda}%`);
    }

    if (activo === "true" || activo === "false") {
      condiciones.push(`v.activo = $${valores.push(activo === "true")}`);
    }

    const whereClause = `WHERE ${condiciones.join(" AND ")}`;

    const totalResult = await db.query(`SELECT COUNT(*) AS total FROM prospectos_votantes v ${whereClause}`, valores);
    const totalRows = parseInt(totalResult.rows[0].total, 10);
    const totalPages = Math.ceil(totalRows / limit);

    const dataQuery = `
      SELECT
        v.id,
        v.nombre_completo,
        v.cedula,
        v.telefono,
        v.direccion,
        v.activo,
        v.municipio_id,
        v.barrio_id,
        v.lider_id,
        m.nombre AS municipio_nombre,
        b.nombre AS barrio_nombre,
        a.nombre_completo AS aspirante_nombre,
        l.nombre_completo AS lider_nombre,
        v.zona,
        v.mesa_id,
        v.lugar_id,
        v.sexo
      FROM prospectos_votantes v
      JOIN aspirantes a ON a.id = v.aspirante_id
      LEFT JOIN municipios m ON v.municipio_id = m.id
      LEFT JOIN barrios b ON v.barrio_id = b.id
      LEFT JOIN lideres l ON v.lider_id = l.id
      ${whereClause}
      ORDER BY a.nombre_completo, v.nombre_completo
      LIMIT $${valores.length + 1}
      OFFSET $${valores.length + 2}
    `;
    const dataResult = await db.query(dataQuery, [...valores, limit, offset]);

    res.json({ data: dataResult.rows, page: parseInt(page), totalPages });
  } catch (err) {
    console.error("Error al filtrar votantes:", err);
    res.status(500).json({ error: "Error al filtrar votantes", details: err.message });
  }
};

// ✅ Resumen de votantes por partido (partido del aspirante al que pertenece cada votante)
export const getVotantesPorPartido = async (req, res) => {
  const { where, valores } = filtroVotantes(req.usuario, 'v');
  try {
    const result = await db.query(`
      SELECT
        COALESCE(pa.nombre, 'Sin partido') AS partido,
        COUNT(*) AS total
      FROM prospectos_votantes v
      JOIN aspirantes a ON a.id = v.aspirante_id
      LEFT JOIN partidos pa ON pa.id = a.partido_id
      ${where}
      GROUP BY pa.nombre
      ORDER BY total DESC
    `, valores);

    res.json(result.rows);
  } catch (err) {
    console.error("Error en getVotantesPorPartido:", err);
    res.status(500).json({ error: "Error obteniendo votantes por partido", detalle: err.message });
  }
};

// ✅ Resumen de votantes por aspirante (para ver el aporte de cada concejal/diputado)
export const getVotantesPorAspirante = async (req, res) => {
  const { where, valores } = filtroVotantes(req.usuario, 'v');
  try {
    const result = await db.query(`
      SELECT a.nombre_completo AS aspirante, a.cargo, COUNT(*)::int AS total
      FROM prospectos_votantes v
      JOIN aspirantes a ON a.id = v.aspirante_id
      ${where}
      GROUP BY a.id, a.nombre_completo, a.cargo
      ORDER BY total DESC
    `, valores);
    res.json(result.rows);
  } catch (err) {
    console.error("Error en getVotantesPorAspirante:", err);
    res.status(500).json({ error: "Error obteniendo votantes por aspirante", detalle: err.message });
  }
};

// ✅ Resumen del dashboard
export const obtenerResumenDashboard = async (req, res) => {
  const { where, valores } = filtroVotantes(req.usuario);
  try {
    const result = await db.query(`
      SELECT
        COUNT(*)::int AS total_votantes,
        COUNT(DISTINCT pv.lider_id)::int AS total_lideres,
        COUNT(DISTINCT pv.barrio_id)::int AS total_barrios
      FROM prospectos_votantes pv
      ${where}
    `, valores);
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al obtener datos del dashboard:", error);
    res.status(500).json({ error: "Error interno del servidor", detalle: error.message });
  }
};
