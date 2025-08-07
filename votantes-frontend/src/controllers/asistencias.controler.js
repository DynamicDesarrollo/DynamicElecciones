// controllers/asistencias.controler.js
import db from '../utils/db.js';

const buildAspiranteFilter = (rol, aspirante_concejo_id, aspirante_alcaldia_id) => {
  const condiciones = [];
  const valores = [];

  if (rol !== 'admin') {
    if (aspirante_concejo_id) {
      condiciones.push(`pv.aspirante_concejo_id = $${valores.length + 1}`);
      valores.push(aspirante_concejo_id);
    }
    if (aspirante_alcaldia_id) {
      condiciones.push(`pv.aspirante_alcaldia_id = $${valores.length + 1}`);
      valores.push(aspirante_alcaldia_id);
    }
    if (condiciones.length === 0) {
      // No tiene asignado ningún aspirante: filtro que no devuelve nada
      return { where: 'WHERE false', valores };
    }
    return { where: `WHERE ${condiciones.join(' OR ')}`, valores };
  }
  return { where: '', valores };
};

export const getAsistencias = async (req, res) => {
  const { cedula } = req.query;
  try {
    const result = await db.query(
      `
      SELECT 
        pv.id,
        pv.nombre_completo,
        pv.cedula,
        pv.telefono,
        pv.zona,
        b.nombre AS barrio_nombre,
        lv.nombre AS lugar_nombre,
        mv.numero AS mesa_numero,
        m.nombre AS municipio_nombre
      FROM prospectos_votantes pv
      LEFT JOIN lugares_votacion lv ON pv.lugar_id = lv.id
      LEFT JOIN mesas_votacion mv ON pv.mesa_id = mv.id
      LEFT JOIN municipios m ON pv.municipio_id = m.id
      LEFT JOIN barrios b ON pv.barrio_id = b.id
      WHERE pv.cedula = $1
      LIMIT 1
      `,
      [cedula]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Votante no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error buscando votante:", err);
    res.status(500).json({ error: "Error buscando votante", details: err.message });
  }
};

export const createAsistencia = async (req, res) => {
  const { votante_uuid, puesto_control } = req.body;
  console.log("Creando asistencia para:", votante_uuid, "en puesto:", puesto_control);
  if (!votante_uuid || !puesto_control) {
    return res.status(400).json({ error: "Falta votante_uuid o puesto_control" });
  }

  try {
    // Verificar que el votante exista
    const votanteRes = await db.query(
      "SELECT id FROM prospectos_votantes WHERE id = $1",
      [votante_uuid]
    );
    if (votanteRes.rowCount === 0) {
      return res.status(404).json({ error: "Votante no existe" });
    }

    // Insertar la asistencia (puede repetirse en diferente puesto_control)
    await db.query(
      `INSERT INTO asistencia_votantes (votante_uuid, puesto_control, fecha_registro)
       VALUES ($1, $2, NOW())`,
      [votante_uuid, puesto_control]
    );

    res.json({ ok: true });
  } catch (err) {
    console.error("Error creando asistencia:", err);
    res.status(500).json({ error: "No se pudo registrar asistencia", details: err.message });
  }
};

export const totalVotantes = async (req, res) => {
  try {
    const { rol, aspirante_concejo_id, aspirante_alcaldia_id } = req.usuario;

    // Construir filtro según rol/aspirante
    const { where, valores } = buildAspiranteFilter(rol, aspirante_concejo_id, aspirante_alcaldia_id);

    // Contar votantes únicos por cédula (no nulos ni vacíos)
    const totalQuery = `
      SELECT COUNT(DISTINCT pv.cedula) AS total
      FROM prospectos_votantes pv
      ${where}
      ${where ? "AND" : "WHERE"} pv.cedula IS NOT NULL AND pv.cedula <> ''
    `;
    const result = await db.query(totalQuery, valores);
    res.json({ total: parseInt(result.rows[0].total, 10) });
  } catch (err) {
    console.error("Error obteniendo total de votantes:", err);
    res.status(500).json({ error: "Error obteniendo total de votantes" });
  }
};

export const resumenAsistencias = async (req, res) => {
  try {
    const { rol, aspirante_concejo_id, aspirante_alcaldia_id } = req.usuario;

    // Armar filtro sobre prospectos_votantes para limitar por aspirante si no es admin
    const { where, valores } = buildAspiranteFilter(rol, aspirante_concejo_id, aspirante_alcaldia_id);

    // Contar asistencias únicas por votante_uuid que además pertenezcan a los prospectos filtrados
    const asistenciasQuery = `
      SELECT COUNT(DISTINCT a.votante_uuid) AS total_asistencias
      FROM asistencia_votantes a
      INNER JOIN prospectos_votantes pv ON a.votante_uuid = pv.id
      ${where}
    `;
    const result = await db.query(asistenciasQuery, valores);
    res.json({ total_asistencias: parseInt(result.rows[0].total_asistencias, 10) });
  } catch (err) {
    console.error("Error obteniendo resumen de asistencias:", err);
    res.status(500).json({ error: "Error obteniendo resumen de asistencias", details: err.message });
  }
};
