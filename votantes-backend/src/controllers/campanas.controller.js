import bcrypt from 'bcrypt';
import db from '../utils/db.js';
import { TIPOS_CAMPANA, CARGOS, describirCampana } from '../utils/campanas.js';
import divipola from '../services/divipola.js';
import { prepararTerritorio } from '../services/territorio.js';

// ✅ Tipos de campaña disponibles y sus cargos
export const getTipos = (req, res) => {
  res.json({ tipos: TIPOS_CAMPANA, cargos: CARGOS });
};

// ✅ Listar campañas (superadmin: todas; resto: solo la suya).
// Solo datos de gestión: el superadmin no ve usuarios, votantes ni totales de ninguna campaña;
// sabe únicamente si la campaña ya tiene administrador y si su territorio está cargado.
export const getCampanas = async (req, res) => {
  const { rol, campana_id } = req.usuario;
  try {
    const result = await db.query(
      `SELECT c.*,
         (SELECT nombre_completo FROM aspirantes a WHERE a.campana_id = c.id AND a.padre_id IS NULL) AS aspirante_principal,
         EXISTS (SELECT 1 FROM usuarios u WHERE u.campana_id = c.id AND u.rol = 'admin') AS tiene_admin,
         (SELECT COUNT(*) FROM lugares_votacion l JOIN municipios m ON m.id = l.municipio_id
          WHERE c.codigo_departamento IS NOT NULL AND m.codigo_departamento = c.codigo_departamento
            AND (c.codigo_municipio IS NULL OR m.codigo_dane = c.codigo_municipio))::int AS puestos_cargados
       FROM campanas c
       ${rol === 'superadmin' ? '' : 'WHERE c.id = $1'}
       ORDER BY c.nombre`,
      rol === 'superadmin' ? [] : [campana_id]
    );
    res.json(result.rows.map((c) => ({
      ...describirCampana(c),
      descripcion: c.descripcion,
      created_at: c.created_at,
      aspirante_principal: c.aspirante_principal,
      tiene_admin: c.tiene_admin,
      puestos_cargados: c.puestos_cargados,
    })));
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener campañas', details: err.message });
  }
};

// Convierte los códigos DANE elegidos en nombres oficiales (y valida que existan)
const resolverTerritorio = async ({ tipo, codigo_departamento, codigo_municipio }) => {
  const depto = (await divipola.departamentos()).find((d) => d.codigo === codigo_departamento);
  if (!depto) return { error: 'Elija un departamento válido' };
  if (TIPOS_CAMPANA[tipo]?.territorio !== 'municipio') {
    return { departamento: depto.nombre, codigo_departamento, municipio: null, codigo_municipio: null };
  }
  const muni = (await divipola.municipios(codigo_departamento)).find((m) => m.codigo === codigo_municipio);
  if (!muni) return { error: `Una campaña de ${TIPOS_CAMPANA[tipo].nombre} necesita un municipio válido` };
  return { departamento: depto.nombre, codigo_departamento, municipio: muni.nombre, codigo_municipio };
};

// Carga municipios, puestos y mesas del territorio. Si datos.gov.co falla, la campaña igual queda guardada.
const cargarTerritorio = async (id) => {
  try {
    return { territorio: await prepararTerritorio(id) };
  } catch (err) {
    console.error('Error cargando territorio:', err.message);
    return { aviso: 'La campaña quedó guardada, pero no se pudieron cargar los puestos de votación. Use "Recargar territorio" más tarde.' };
  }
};

const mensajeDuplicado = ({ tipo, departamento, municipio }) =>
  `Ya existe una campaña de ${TIPOS_CAMPANA[tipo].nombre} en ${municipio ? `${municipio}, ` : ''}${departamento}`;

// ✅ Crear campaña con su aspirante principal y, opcionalmente, su primer administrador
export const createCampana = async (req, res) => {
  const { nombre, tipo, descripcion, aspirante_principal, admin } = req.body;
  const config = TIPOS_CAMPANA[tipo];
  if (!config) return res.status(400).json({ error: 'Tipo de campaña no válido' });
  if (!nombre?.trim()) return res.status(400).json({ error: 'El nombre de la campaña es obligatorio' });
  if (!aspirante_principal?.trim()) return res.status(400).json({ error: 'El nombre del aspirante principal es obligatorio' });
  if (admin && (!admin.nombre || !admin.correo || !admin.password)) {
    return res.status(400).json({ error: 'El administrador necesita nombre, correo y contraseña' });
  }

  let territorio;
  try {
    territorio = await resolverTerritorio(req.body);
  } catch {
    return res.status(502).json({ error: 'No se pudo consultar el DANE. Intente de nuevo en un momento.' });
  }
  if (territorio.error) return res.status(400).json({ error: territorio.error });

  try {
    const campana = await db.transaction(async (client) => {
      const { rows } = await client.query(
        `INSERT INTO campanas (nombre, tipo, departamento, municipio, codigo_departamento, codigo_municipio, descripcion)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [nombre.trim(), tipo, territorio.departamento, territorio.municipio,
         territorio.codigo_departamento, territorio.codigo_municipio, descripcion || null]
      );
      await client.query(
        'INSERT INTO aspirantes (campana_id, cargo, nombre_completo) VALUES ($1, $2, $3)',
        [rows[0].id, config.principal, aspirante_principal.trim()]
      );
      if (admin) {
        const hash = await bcrypt.hash(admin.password, 10);
        await client.query(
          `INSERT INTO usuarios (nombre, correo, password, rol, campana_id)
           VALUES ($1, $2, $3, 'admin', $4)`,
          [admin.nombre, admin.correo, hash, rows[0].id]
        );
      }
      return rows[0];
    });
    res.status(201).json({ ...describirCampana(campana), ...(await cargarTerritorio(campana.id)) });
  } catch (err) {
    if (err.constraint === 'ux_campanas_territorio') {
      return res.status(409).json({ error: mensajeDuplicado({ tipo, ...territorio }) });
    }
    if (err.constraint === 'usuarios_correo_key') {
      return res.status(409).json({ error: 'El correo del administrador ya está registrado' });
    }
    res.status(500).json({ error: 'Error al crear campaña', details: err.message });
  }
};

// ✅ Actualizar campaña. El tipo no se cambia: define la jerarquía de cargos ya creada.
// El territorio solo cambia si llegan códigos DANE distintos; en ese caso se carga el nuevo.
export const updateCampana = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, activa, aspirante_principal, codigo_departamento } = req.body;
  try {
    const actual = await db.query('SELECT * FROM campanas WHERE id = $1', [id]);
    if (actual.rowCount === 0) return res.status(404).json({ error: 'Campaña no encontrada' });
    const c = actual.rows[0];

    let datos = {
      departamento: c.departamento,
      municipio: c.municipio,
      codigo_departamento: c.codigo_departamento,
      codigo_municipio: c.codigo_municipio,
    };
    const cambiaTerritorio = !!codigo_departamento &&
      (codigo_departamento !== c.codigo_departamento || (req.body.codigo_municipio || null) !== c.codigo_municipio);
    if (cambiaTerritorio) {
      try {
        datos = await resolverTerritorio({ ...req.body, tipo: c.tipo });
      } catch {
        return res.status(502).json({ error: 'No se pudo consultar el DANE. Intente de nuevo en un momento.' });
      }
      if (datos.error) return res.status(400).json({ error: datos.error });
    }

    const result = await db.query(
      `UPDATE campanas SET nombre = $1, departamento = $2, municipio = $3, codigo_departamento = $4,
         codigo_municipio = $5, descripcion = $6, activa = $7
       WHERE id = $8 RETURNING *`,
      [nombre?.trim() || c.nombre, datos.departamento, datos.municipio, datos.codigo_departamento,
       datos.codigo_municipio, descripcion ?? c.descripcion, typeof activa === 'boolean' ? activa : c.activa, id]
    );
    // El nombre del aspirante principal es dato de configuración de la campaña
    if (aspirante_principal?.trim()) {
      await db.query(
        'UPDATE aspirantes SET nombre_completo = $1 WHERE campana_id = $2 AND padre_id IS NULL',
        [aspirante_principal.trim(), id]
      );
    }
    res.json({ ...describirCampana(result.rows[0]), ...(cambiaTerritorio ? await cargarTerritorio(id) : {}) });
  } catch (err) {
    if (err.constraint === 'ux_campanas_territorio') {
      return res.status(409).json({ error: 'Ya existe otra campaña de ese tipo en ese territorio' });
    }
    res.status(500).json({ error: 'Error al actualizar campaña', details: err.message });
  }
};

// ✅ Volver a cargar municipios, puestos y mesas (si falló la API o cambió la Registraduría)
export const recargarTerritorio = async (req, res) => {
  const resultado = await cargarTerritorio(req.params.id);
  if (resultado.aviso) {
    return res.status(502).json({ error: 'No se pudo consultar datos.gov.co. Intente de nuevo en un momento.' });
  }
  res.json(resultado.territorio);
};

// ✅ Crear un administrador para una campaña (p. ej. si se creó sin él).
// Es la única gestión de usuarios que hace el superadmin; el resto lo hace el admin de la campaña.
export const createAdminCampana = async (req, res) => {
  const { id } = req.params;
  const { nombre, correo, password } = req.body;
  if (!nombre?.trim() || !correo?.trim() || !password) {
    return res.status(400).json({ error: 'Nombre, correo y contraseña son obligatorios' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
  }
  try {
    const existe = await db.query('SELECT 1 FROM campanas WHERE id = $1', [id]);
    if (existe.rowCount === 0) return res.status(404).json({ error: 'Campaña no encontrada' });
    const hash = await bcrypt.hash(password, 10);
    await db.query(
      `INSERT INTO usuarios (nombre, correo, password, rol, campana_id) VALUES ($1, $2, $3, 'admin', $4)`,
      [nombre.trim(), correo.trim(), hash, id]
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    if (err.constraint === 'usuarios_correo_key') {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }
    res.status(500).json({ error: 'Error al crear el administrador', details: err.message });
  }
};

// ✅ Restablecer el acceso de un administrador de la campaña que perdió su contraseña.
// El superadmin escribe el correo (no ve la lista de usuarios); solo aplica a admins de esa campaña.
export const restablecerAdminCampana = async (req, res) => {
  const { id } = req.params;
  const { correo, password } = req.body;
  if (!correo?.trim() || !password) {
    return res.status(400).json({ error: 'Correo y nueva contraseña son obligatorios' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await db.query(
      `UPDATE usuarios SET password = $1 WHERE correo = $2 AND campana_id = $3 AND rol = 'admin'`,
      [hash, correo.trim(), id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Ese correo no es de un administrador de esta campaña' });
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al restablecer el acceso', details: err.message });
  }
};
