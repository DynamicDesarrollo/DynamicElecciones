const db = require('../utils/db.js');

// Validar si una cédula ya existe en prospectos_votantes
const validarCedula = async (req, res) => {
  const { cedula } = req.params;
  try {
    const result = await db.query(
      `SELECT pv.id, pv.nombre_completo AS votante_nombre, l.nombre_completo AS lider_nombre
       FROM prospectos_votantes pv
       LEFT JOIN lideres l ON pv.lider_id = l.id
       WHERE pv.cedula = $1 LIMIT 1`,
      [cedula]
    );
    if (result.rows.length > 0) {
      return res.json({ existe: true, ...result.rows[0] });
    } else {
      return res.json({ existe: false });
    }
  } catch (err) {
    console.error('❌ Error al validar cédula:', err);
    res.status(500).json({ error: 'Error al validar cédula' });
  }
};

// Obtener el total de votantes (para dashboard/asistencia)
const getTotalVotantes = async (req, res) => {
  try {
    const result = await db.query('SELECT COUNT(*) AS total FROM prospectos_votantes');
    res.json({ total: parseInt(result.rows[0].total) });
  } catch (err) {
    console.error('❌ Error al obtener total de votantes:', err);
    res.status(500).json({ error: 'Error al obtener total de votantes' });
  }
};

// ✅ Obtener todos los votantes
const getVotantes = async (req, res) => {
  const { id: userId, rol, aspirante_concejo_id, aspirante_alcaldia_id } = req.usuario;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const condiciones = [];
    const valores = [];

    if (rol !== "admin") {
      if (aspirante_concejo_id) {
        condiciones.push(`pv.aspirante_concejo_id = $${valores.length + 1}`);
        valores.push(aspirante_concejo_id);
      }
      if (aspirante_alcaldia_id) {
        condiciones.push(`pv.aspirante_alcaldia_id = $${valores.length + 1}`);
        valores.push(aspirante_alcaldia_id);
      }
      // Si es user y no tiene aspirante, mostrar los votantes que él mismo creó
      if (!aspirante_concejo_id && !aspirante_alcaldia_id && rol === 'user') {
        condiciones.push(`pv.usuario_id = $${valores.length + 1}`);
        valores.push(userId);
      }
    }

    const where = condiciones.length ? `WHERE ${condiciones.join(" OR ")}` : "";

    const dataQuery = `
      SELECT 
        pv.*,
        b.nombre AS barrio_nombre,
        m.nombre AS municipio_nombre,
        l.nombre_completo AS lider_nombre,
        l.direccion AS direccion_lider
      FROM prospectos_votantes pv
      LEFT JOIN barrios b ON pv.barrio_id = b.id
      LEFT JOIN municipios m ON pv.municipio_id = m.id
      LEFT JOIN lideres l ON pv.lider_id = l.id
      ${where}
      ORDER BY pv.fecha_registro DESC
      LIMIT $${valores.length + 1}
      OFFSET $${valores.length + 2}
    `;

    const totalQuery = `
      SELECT COUNT(*) AS count
      FROM prospectos_votantes pv
      ${where}
    `;

    const dataResult = await db.query(dataQuery, [...valores, limit, offset]);
    const totalResult = await db.query(totalQuery, valores);

    // DEPURACIÓN: Mostrar la primera fila cruda que retorna la base de datos
    if (dataResult.rows && dataResult.rows.length > 0) {
      console.log('Fila cruda desde DB:', dataResult.rows[0]);
    } else {
      console.log('No hay filas de votantes para mostrar (DB).');
    }

    if (dataResult.rows && dataResult.rows.length > 0) {
      console.log('Ejemplo de fila votante:', dataResult.rows[0]);
    } else {
      console.log('No hay filas de votantes para mostrar.');
    }
    
      res.json({
        data: dataResult.rows,
        total: parseInt(totalResult.rows[0].count),
        page,
        totalPages: Math.ceil(totalResult.rows[0].count / limit)
      });

    res.json({
      data: dataResult.rows,
      total: parseInt(totalResult.rows[0].count),
      page,
      totalPages: Math.ceil(totalResult.rows[0].count / limit)
    });

  } catch (err) {
    console.error("❌ Error al obtener votantes:", err);
    res.status(500).json({ error: "Error interno", detalle: err.message });
  }
};

// ✅ Crear un votante
const createVotante = async (req, res) => {
  const {
    nombre_completo,
    cedula,
    telefono,
    direccion,
    municipio_id,
    barrio_id,
    lider_id,
    zona,
    mesa_id,
    lugar_id,
    sexo
  } = req.body;

  try {
    const { id: userId, aspirante_concejo_id, aspirante_alcaldia_id } = req.usuario;

    // Permitir que el rol 'user' cree votantes aunque no tenga aspirante asociado
    if (!aspirante_concejo_id && !aspirante_alcaldia_id && req.usuario.rol !== 'admin') {
      // Para usuarios sin aspirante, partido_id será null y los campos de aspirante también
      const result = await db.query(
        `INSERT INTO prospectos_votantes (
          nombre_completo, cedula, telefono, direccion,
          municipio_id, barrio_id, lider_id,
          zona, mesa_id, lugar_id, sexo, usuario_id
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
        RETURNING *`,
        [
          nombre_completo,
          cedula,
          telefono,
          direccion,
          municipio_id,
          barrio_id,
          lider_id,
          zona,
          mesa_id,
          lugar_id,
          sexo,
          userId
        ]
      );
      return res.status(201).json(result.rows[0]);
    }

    let partido_id = null;

    if (aspirante_concejo_id) {
      const resPartido = await db.query("SELECT partido_id FROM aspirantes_concejo WHERE id = $1", [aspirante_concejo_id]);
      partido_id = resPartido.rows[0]?.partido_id || null;
    } else if (aspirante_alcaldia_id) {
      const resPartido = await db.query("SELECT partido_id FROM aspirantes_alcaldia WHERE id = $1", [aspirante_alcaldia_id]);
      partido_id = resPartido.rows[0]?.partido_id || null;
    }

    if (!partido_id) {
      return res.status(400).json({ error: "No se pudo determinar el partido del aspirante." });
    }

    const result = await db.query(
      `INSERT INTO prospectos_votantes (
        nombre_completo, cedula, telefono,direccion,
        municipio_id, barrio_id, lider_id,
        aspirante_concejo_id, aspirante_alcaldia_id, partido_id, zona,
        mesa_id, lugar_id, sexo
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
      RETURNING *`,
      [
        nombre_completo,
        cedula,
        telefono,
        direccion,
        municipio_id,
        barrio_id,
        lider_id,
        aspirante_concejo_id,
        aspirante_alcaldia_id,
        partido_id,
        zona,
        mesa_id,
        lugar_id,
        sexo
      ]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error("❌ Error al crear votante:", err);
    res.status(400).json({ error: 'Error al crear votante', details: err.message });
  }
};

// ✅ Actualizar votante
const updateVotante = async (req, res) => {
  const { id } = req.params;
  const {
    nombre_completo,
    cedula,
    telefono,
    direccion,
    municipio_id,
    barrio_id,
    lider_id,
    partido_id,
    zona,
    mesa_id,
    lugar_id,
    sexo
  } = req.body;
  console.log("Trae información de votante:", req.body);
  try {
    // Traer los valores actuales
    const current = await 
    db.query(
      'SELECT aspirante_concejo_id, aspirante_alcaldia_id, partido_id FROM prospectos_votantes WHERE id = $1', [id]);

    if (current.rowCount === 0) {
      return res.status(404).json({ error: 'Votante no encontrado' });
    }

    const existing = current.rows[0];

    const result = await db.query(
      `UPDATE prospectos_votantes SET
        nombre_completo = $1,
        cedula = $2,
        telefono = $3,
        direccion = $4,
        municipio_id = $5,
        barrio_id = $6,
        lider_id = $7,
        aspirante_concejo_id = $8,
        aspirante_alcaldia_id = $9,
        partido_id = $10,
        zona = $11,
        mesa_id = $12,
        lugar_id = $13,
        sexo = $14
      WHERE id = $15
      RETURNING *`,
      [
        nombre_completo,
        cedula,
        telefono,
        direccion,
        municipio_id,
        barrio_id,
        lider_id,
        existing.aspirante_concejo_id,
        existing.aspirante_alcaldia_id,
        existing.partido_id,
        zona,
        mesa_id,
        lugar_id,
        sexo,
        id
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar votante', details: err.message });
  }
};

// ✅ Eliminar votante
const deleteVotante = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM prospectos_votantes WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Votante no encontrado' });
    }
    res.json({ message: 'Votante eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar votante', details: err.message });
  }
};

module.exports = {
  getVotantes,
  createVotante,
  updateVotante,
  deleteVotante,
  getTotalVotantes,
  validarCedula
};