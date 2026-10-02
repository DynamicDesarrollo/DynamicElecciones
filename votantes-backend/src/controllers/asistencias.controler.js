// controllers/asistencias.controler.js
import db from '../utils/db.js';
import { filtroVotantes } from '../utils/scope.js';

// Buscar votante por cédula para marcar asistencia.
// El día de la elección los puestos de control buscan en toda la campaña;
// si la cédula está bajo varios aspirantes, se devuelve el primero.
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
        m.nombre AS municipio_nombre,
        ult.puesto_control,
        ult.fecha_registro AS fecha_asistencia
      FROM prospectos_votantes pv
      LEFT JOIN lugares_votacion lv ON pv.lugar_id = lv.id
      LEFT JOIN mesas_votacion mv ON pv.mesa_id = mv.id
      LEFT JOIN municipios m ON pv.municipio_id = m.id
      LEFT JOIN barrios b ON pv.barrio_id = b.id
      LEFT JOIN LATERAL (
        SELECT a.puesto_control, a.fecha_registro
        FROM asistencia_votantes a
        WHERE a.votante_uuid = pv.id
        ORDER BY a.fecha_registro DESC
        LIMIT 1
      ) ult ON true
      WHERE pv.cedula = $1 AND pv.campana_id = $2
      ORDER BY pv.fecha_registro
      LIMIT 1
      `,
      [cedula, req.usuario.campana_id]
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
  if (!votante_uuid || !puesto_control) {
    return res.status(400).json({ error: "Falta votante_uuid o puesto_control" });
  }

  try {
    // Verificar que el votante exista en la campaña
    const votanteRes = await db.query(
      "SELECT id FROM prospectos_votantes WHERE id = $1 AND campana_id = $2",
      [votante_uuid, req.usuario.campana_id]
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

// Votantes únicos por cédula dentro del alcance del usuario
export const totalVotantes = async (req, res) => {
  const { where, valores } = filtroVotantes(req.usuario);
  try {
    const result = await db.query(
      `SELECT COUNT(DISTINCT pv.cedula) AS total
       FROM prospectos_votantes pv
       ${where} AND pv.cedula IS NOT NULL AND pv.cedula <> ''`,
      valores
    );
    res.json({ total: parseInt(result.rows[0].total, 10) });
  } catch (err) {
    console.error("Error obteniendo total de votantes:", err);
    res.status(500).json({ error: "Error obteniendo total de votantes" });
  }
};

// Votantes del alcance del usuario que ya asistieron
export const resumenAsistencias = async (req, res) => {
  const { where, valores } = filtroVotantes(req.usuario);
  try {
    const result = await db.query(
      `SELECT COUNT(DISTINCT a.votante_uuid) AS total_asistencias
       FROM asistencia_votantes a
       INNER JOIN prospectos_votantes pv ON a.votante_uuid = pv.id
       ${where}`,
      valores
    );
    res.json({ total_asistencias: parseInt(result.rows[0].total_asistencias, 10) });
  } catch (err) {
    console.error("Error obteniendo resumen de asistencias:", err);
    res.status(500).json({ error: "Error obteniendo resumen de asistencias", details: err.message });
  }
};
