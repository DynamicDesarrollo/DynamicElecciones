// Resuelve a qué aspirante pertenece un registro según la jerarquía de la campaña.
const db = require('./db');
const { esAdmin } = require('./scope');

class ErrorJerarquia extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

const aspirantePrincipal = async (campana_id) => {
  const { rows } = await db.query('SELECT id FROM aspirantes WHERE campana_id = $1 AND padre_id IS NULL', [campana_id]);
  if (!rows[0]) throw new ErrorJerarquia('La campaña no tiene aspirante principal. Regístrelo primero.', 409);
  return rows[0].id;
};

// Aspirante de un líder:
// - usuario de un aspirante: siempre el suyo
// - admin: el que elija (de la campaña) o, si no elige, el principal
const aspiranteParaLider = async (usuario, aspiranteElegido) => {
  if (!esAdmin(usuario) && usuario.aspirante_id) return usuario.aspirante_id;
  if (aspiranteElegido && esAdmin(usuario)) {
    const { rowCount } = await db.query(
      'SELECT 1 FROM aspirantes WHERE id = $1 AND campana_id = $2',
      [aspiranteElegido, usuario.campana_id]
    );
    if (rowCount === 0) throw new ErrorJerarquia('El aspirante no pertenece a la campaña');
    return aspiranteElegido;
  }
  return aspirantePrincipal(usuario.campana_id);
};

// Aspirante de un votante: el de su líder; si no tiene líder, el del usuario; si no, el principal.
// El líder tiene que ser visible para el usuario (de su campaña y, si aplica, de su aspirante).
const aspiranteParaVotante = async (usuario, lider_id) => {
  if (lider_id) {
    const { rows } = await db.query(
      'SELECT aspirante_id FROM lideres WHERE id = $1 AND campana_id = $2',
      [lider_id, usuario.campana_id]
    );
    const lider = rows[0];
    if (!lider) throw new ErrorJerarquia('El líder no pertenece a la campaña');
    if (!esAdmin(usuario) && usuario.aspirante_id && lider.aspirante_id !== usuario.aspirante_id) {
      throw new ErrorJerarquia('El líder no pertenece a su equipo', 403);
    }
    return lider.aspirante_id;
  }
  if (!esAdmin(usuario) && usuario.aspirante_id) return usuario.aspirante_id;
  return aspirantePrincipal(usuario.campana_id);
};

module.exports = { ErrorJerarquia, aspirantePrincipal, aspiranteParaLider, aspiranteParaVotante };
