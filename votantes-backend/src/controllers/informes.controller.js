import db from '../utils/db.js';
// 🔍 INFORME 1: Votantes Duplicados
export const votantesDuplicados = async (req, res) => {
  const { rol, aspirante_concejo_id: usuarioId } = req.usuario;

  try {
    let result;

    if (rol === 'admin') {
      result = await db.query(`
        SELECT 
          pv.cedula,
          pv.nombre_completo,
          ac.nombre_completo AS nombre_aspirante,
          l.nombre_completo AS nombre_lider
        FROM prospectos_votantes pv
        INNER JOIN (
          SELECT cedula
          FROM prospectos_votantes
          WHERE cedula IS NOT NULL AND cedula <> ''
          GROUP BY cedula
          HAVING COUNT(*) > 1
        ) duplicados ON pv.cedula = duplicados.cedula
        LEFT JOIN aspirantes_concejo ac ON ac.id = pv.aspirante_concejo_id
        LEFT JOIN lideres l ON l.id = pv.lider_id
        ORDER BY pv.cedula
      `);
    } else if (rol === 'aspirante_concejo' || rol === 'aspirante') {
      result = await db.query(`
        SELECT 
          pv.cedula,
          pv.nombre_completo,
          ac.nombre_completo AS nombre_aspirante,
          l.nombre_completo AS nombre_lider
        FROM prospectos_votantes pv
        INNER JOIN (
          SELECT cedula
          FROM prospectos_votantes
          WHERE cedula IS NOT NULL AND cedula <> ''
          GROUP BY cedula
          HAVING COUNT(*) > 1
        ) duplicados ON pv.cedula = duplicados.cedula
        LEFT JOIN aspirantes_concejo ac ON ac.id = pv.aspirante_concejo_id
        LEFT JOIN lideres l ON l.id = pv.lider_id
        WHERE pv.cedula IN (
          SELECT cedula FROM prospectos_votantes WHERE aspirante_concejo_id = $1
        )
        ORDER BY pv.cedula
      `, [usuarioId]);
    } else {
      return res.status(403).json({ error: "Rol no autorizado para acceder al informe" });
    }

    res.json(result.rows);
  } catch (err) {
    console.error("Error en votantes duplicados:", err);
    res.status(500).json({ error: "Error en informe de votantes duplicados" });
  }
};

// 🔍 INFORME 2: Asistencias Duplicadas
export const asistenciasDuplicadas = async (req, res) => {
  const { rol, aspirante_concejo_id: usuarioId } = req.usuario;

  try {
    let result;

    if (rol === 'admin') {
      result = await db.query(`
        SELECT 
          pv.cedula,
          pv.nombre_completo,
          a.puesto_control,
          a.fecha_registro,
          ac.nombre_completo AS nombre_aspirante
        FROM asistencia_votantes a
        INNER JOIN prospectos_votantes pv ON pv.id = a.votante_uuid
        LEFT JOIN aspirantes_concejo ac ON ac.id = pv.aspirante_concejo_id
        WHERE pv.cedula IN (
          SELECT pv.cedula
          FROM asistencia_votantes a
          INNER JOIN prospectos_votantes pv ON pv.id = a.votante_uuid
          GROUP BY pv.cedula
          HAVING COUNT(*) > 1
        )
        ORDER BY pv.cedula, a.fecha_registro DESC
      `);
    } else if (rol === 'aspirante_concejo' || rol === 'aspirante') {
      result = await db.query(`
        SELECT 
          pv.cedula,
          pv.nombre_completo,
          a.puesto_control,
          a.fecha_registro,
          ac.nombre_completo AS nombre_aspirante
        FROM asistencia_votantes a
        INNER JOIN prospectos_votantes pv ON pv.id = a.votante_uuid
        LEFT JOIN aspirantes_concejo ac ON ac.id = pv.aspirante_concejo_id
        WHERE pv.cedula IN (
          SELECT pv.cedula
          FROM asistencia_votantes a
          INNER JOIN prospectos_votantes pv ON pv.id = a.votante_uuid
          GROUP BY pv.cedula
          HAVING COUNT(*) > 1
        )
        AND pv.cedula IN (
          SELECT cedula FROM prospectos_votantes WHERE aspirante_concejo_id = $1
        )
        ORDER BY pv.cedula, a.fecha_registro DESC
      `, [usuarioId]);
    } else {
      return res.status(403).json({ error: "Rol no autorizado para acceder al informe" });
    }

    res.json(result.rows);
  } catch (err) {
    console.error("Error en asistencias duplicadas:", err);
    res.status(500).json({ error: "Error en informe de asistencias duplicadas" });
  }
};
