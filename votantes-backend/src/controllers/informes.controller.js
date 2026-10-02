import db from '../utils/db.js';

// Informes de duplicados: solo los ve el admin (aspirante principal) de la campaña.
// Así un concejal nunca se entera de que otro concejal registró a la misma persona.

// 🔍 INFORME 1: la misma cédula registrada bajo más de un aspirante (o repetida)
export const votantesDuplicados = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        pv.cedula,
        pv.nombre_completo,
        a.nombre_completo AS nombre_aspirante,
        l.nombre_completo AS nombre_lider
      FROM prospectos_votantes pv
      INNER JOIN (
        SELECT cedula
        FROM prospectos_votantes
        WHERE campana_id = $1 AND cedula IS NOT NULL AND cedula <> ''
        GROUP BY cedula
        HAVING COUNT(*) > 1
      ) duplicados ON pv.cedula = duplicados.cedula
      JOIN aspirantes a ON a.id = pv.aspirante_id
      LEFT JOIN lideres l ON l.id = pv.lider_id
      WHERE pv.campana_id = $1
      ORDER BY pv.cedula, a.nombre_completo
    `, [req.usuario.campana_id]);
    res.json(result.rows);
  } catch (err) {
    console.error("Error en votantes duplicados:", err);
    res.status(500).json({ error: "Error en informe de votantes duplicados" });
  }
};

// 🔍 INFORME 2: votantes con más de una asistencia registrada
export const asistenciasDuplicadas = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        pv.cedula,
        pv.nombre_completo,
        a.puesto_control,
        a.fecha_registro,
        asp.nombre_completo AS nombre_aspirante
      FROM asistencia_votantes a
      INNER JOIN prospectos_votantes pv ON pv.id = a.votante_uuid
      JOIN aspirantes asp ON asp.id = pv.aspirante_id
      WHERE pv.campana_id = $1
        AND pv.cedula IN (
          SELECT pv2.cedula
          FROM asistencia_votantes a2
          INNER JOIN prospectos_votantes pv2 ON pv2.id = a2.votante_uuid
          WHERE pv2.campana_id = $1
          GROUP BY pv2.cedula
          HAVING COUNT(*) > 1
        )
      ORDER BY pv.cedula, a.fecha_registro DESC
    `, [req.usuario.campana_id]);
    res.json(result.rows);
  } catch (err) {
    console.error("Error en asistencias duplicadas:", err);
    res.status(500).json({ error: "Error en informe de asistencias duplicadas" });
  }
};
