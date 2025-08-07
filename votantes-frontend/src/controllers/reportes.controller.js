import db from '../utils/db.js';

export const getVotantesDuplicados = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        v.cedula,
        COUNT(*) AS cantidad,
        json_agg(json_build_object(
          'id', v.id,
          'nombre', v.nombre_completo,
          'activo', v.activo,
          'municipio', m.nombre,
          'barrio', b.nombre,
          'lider', l.nombre_completo,
          'concejal', ac.nombre_completo,
          'alcalde', aa.nombre_completo
        )) AS detalles
      FROM prospectos_votantes v
      LEFT JOIN municipios m ON v.municipio_id = m.id
      LEFT JOIN barrios b ON v.barrio_id = b.id
      LEFT JOIN lideres l ON v.lider_id = l.id
      LEFT JOIN aspirantes_concejo ac ON v.aspirante_concejo_id = ac.id
      LEFT JOIN aspirantes_alcaldia aa ON v.aspirante_alcaldia_id = aa.id
      GROUP BY v.cedula
      HAVING COUNT(*) > 1
      ORDER BY cantidad DESC;
    `);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener votantes duplicados', details: err.message });
  }
};
// ✅ Filtrar votantes
export const filtrarVotantes = async (req, res) => {
  try {
    const { userId, rol, aspirante_concejo_id, aspirante_alcaldia_id } = req.usuario;
    const { page = 1, limit = 10, busqueda = "", activo } = req.query;
    const offset = (page - 1) * limit;

    const condiciones = [];
    const valores = [];

    if (rol !== "admin") {
      if (aspirante_concejo_id) {
        condiciones.push(`v.aspirante_concejo_id = $${valores.length + 1}`);
        valores.push(aspirante_concejo_id);
      }

      if (aspirante_alcaldia_id) {
        condiciones.push(`v.aspirante_alcaldia_id = $${valores.length + 1}`);
        valores.push(aspirante_alcaldia_id);
      }

      if (condiciones.length === 0) {
        return res.status(403).json({ error: "No tiene permisos para ver votantes" });
      }
    }

    if (busqueda) {
      condiciones.push(`(v.nombre_completo ILIKE $${valores.length + 1} OR v.cedula ILIKE $${valores.length + 1})`);
      valores.push(`%${busqueda}%`);
    }

    if (activo === "true" || activo === "false") {
      condiciones.push(`v.activo = $${valores.length + 1}`);
      valores.push(activo === "true");
    }

    const whereClause = condiciones.length ? `WHERE ${condiciones.join(" AND ")}` : "";

    const totalQuery = `SELECT COUNT(*) AS total FROM prospectos_votantes v ${whereClause}`;
    const totalResult = await db.query(totalQuery, valores);
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
        ac.nombre_completo AS concejo_nombre,
        aa.nombre_completo AS alcaldia_nombre,
        l.nombre_completo AS lider_nombre,
        v.zona,
        v.mesa_id,
        v.lugar_id,
        v.sexo
      FROM prospectos_votantes v
      LEFT JOIN municipios m ON v.municipio_id = m.id
      LEFT JOIN barrios b ON v.barrio_id = b.id
      LEFT JOIN aspirantes_concejo ac ON v.aspirante_concejo_id = ac.id
      LEFT JOIN aspirantes_alcaldia aa ON v.aspirante_alcaldia_id = aa.id
      LEFT JOIN lideres l ON v.lider_id = l.id
      LEFT JOIN mesas_votacion mv ON v.mesa_id = mv.id
      LEFT JOIN lugares_votacion lv ON v.lugar_id = lv.id
      ${whereClause}
      ORDER BY ac.nombre_completo,v.nombre_completo
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


// ✅ Resumen del dashboard
export const getResumenVotantes = async (req, res) => {
  try {
    const { rol, aspirante_concejo_id, aspirante_alcaldia_id } = req.usuario;

    const condiciones = [];
    const valores = [];

    if (rol !== "admin") {
      if (aspirante_concejo_id) {
        condiciones.push(`aspirante_concejo_id = $${valores.length + 1}`);
        valores.push(aspirante_concejo_id);
      }
      if (aspirante_alcaldia_id) {
        condiciones.push(`aspirante_alcaldia_id = $${valores.length + 1}`);
        valores.push(aspirante_alcaldia_id);
      }
      if (condiciones.length === 0) {
        return res.status(403).json({ error: "No tiene permisos para ver el resumen" });
      }
    }

    const where = condiciones.length ? `WHERE ${condiciones.join(" OR ")}` : "";

    const votantesResult = await db.query(`SELECT COUNT(*) FROM prospectos_votantes ${where}`, valores);
    const lideresResult = await db.query(`SELECT COUNT(DISTINCT lider_id) FROM prospectos_votantes ${where} ${where ? "AND" : "WHERE"} lider_id IS NOT NULL`, valores);
    const barriosResult = await db.query(`SELECT COUNT(DISTINCT barrio_id) FROM prospectos_votantes ${where} ${where ? "AND" : "WHERE"} barrio_id IS NOT NULL`, valores);

    res.json({
      total_votantes: parseInt(votantesResult.rows[0].count, 10),
      total_lideres: parseInt(lideresResult.rows[0].count, 10),
      total_barrios: parseInt(barriosResult.rows[0].count, 10)
    });
  } catch (error) {
    console.error("Error al obtener datos del dashboard:", error);
    res.status(500).json({ error: "Error interno del servidor", detalle: error.message });
  }
};
// ✅ Resumen de votantes por partido
export const getVotantesPorPartido = async (req, res) => {
  try {
    const { userId, rol, aspirante_concejo_id, aspirante_alcaldia_id } = req.usuario;

    const condiciones = [];
    const valores = [];

    if (rol !== "admin") {
      if (aspirante_concejo_id) {
        condiciones.push(`v.aspirante_concejo_id = $${valores.length + 1}`);
        valores.push(aspirante_concejo_id);
      }
      if (aspirante_alcaldia_id) {
        condiciones.push(`v.aspirante_alcaldia_id = $${valores.length + 1}`);
        valores.push(aspirante_alcaldia_id);
      }
      if (condiciones.length === 0) {
        return res.status(403).json({ error: "No tiene permisos para ver datos del gráfico" });
      }
    }

    const where = condiciones.length ? `WHERE ${condiciones.join(" OR ")}` : "";

    const result = await db.query(`
      SELECT 
        pa.nombre AS partido,
        COUNT(*) AS total
      FROM prospectos_votantes v
      LEFT JOIN partidos pa ON pa.id = v.partido_id
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



export const obtenerResumenDashboard = async (req, res) => {
  try {
    const { id: userId, rol } = req.usuario;

    let condiciones = [];
    let valores = [];

    if (rol !== "admin") {
      const resultUsuario = await db.query(
        "SELECT aspirante_concejo_id, aspirante_alcaldia_id FROM usuarios WHERE id = $1",
        [userId]
      );

      const usuario = resultUsuario.rows[0];

      if (!usuario) {
        return res.status(401).json({ error: "Usuario no válido" });
      }

      if (usuario.aspirante_concejo_id) {
        condiciones.push(`aspirante_concejo_id = $${valores.length + 1}`);
        valores.push(usuario.aspirante_concejo_id);
      }

      if (usuario.aspirante_alcaldia_id) {
        condiciones.push(`aspirante_alcaldia_id = $${valores.length + 1}`);
        valores.push(usuario.aspirante_alcaldia_id);
      }

      if (condiciones.length === 0) {
        return res.status(403).json({ error: "No tiene permisos para ver el resumen" });
      }
    }

    const filtroBase = condiciones.length ? `(${condiciones.join(" OR ")})` : null;

    const votantesQuery = `
      SELECT COUNT(*) FROM prospectos_votantes
      ${filtroBase ? `WHERE ${filtroBase}` : ""}
    `;

    const lideresQuery = `
      SELECT COUNT(DISTINCT lider_id) FROM prospectos_votantes
      ${filtroBase ? `WHERE ${filtroBase} AND lider_id IS NOT NULL` : `WHERE lider_id IS NOT NULL`}
    `;

    const barriosQuery = `
      SELECT COUNT(DISTINCT barrio_id) FROM prospectos_votantes
      ${filtroBase ? `WHERE ${filtroBase} AND barrio_id IS NOT NULL` : `WHERE barrio_id IS NOT NULL`}
    `;

    const [votantesResult, lideresResult, barriosResult] = await Promise.all([
      db.query(votantesQuery, valores),
      db.query(lideresQuery, valores),
      db.query(barriosQuery, valores),
    ]);

    res.json({
      total_votantes: parseInt(votantesResult.rows[0].count, 10),
      total_lideres: parseInt(lideresResult.rows[0].count, 10),
      total_barrios: parseInt(barriosResult.rows[0].count, 10),
    });

    console.log("📊 Resumen dashboard:", respuesta);
    res.json(respuesta);
  } catch (error) {
    console.error("Error al obtener datos del dashboard:", error);
    res.status(500).json({ error: "Error interno del servidor", detalle: error.message });
  }
};

