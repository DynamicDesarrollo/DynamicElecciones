// Etiquetas de roles y cargos según la campaña del usuario.

export const CARGOS = {
  gobernador: "Gobernador",
  diputado: "Diputado",
  alcalde: "Alcalde",
  concejal: "Concejal",
};

export const ROLES = {
  superadmin: "Superadmin",
  admin: "Administrador",
  aspirante: "Equipo de aspirante",
  user: "Usuario (anterior)",
};

export const esSuperadmin = (usuario) => usuario?.rol === "superadmin";
export const esAdmin = (usuario) => ["superadmin", "admin"].includes(usuario?.rol);
export const esEquipoAspirante = (usuario) => usuario?.rol === "aspirante";

export const nombreCargo = (cargo) => CARGOS[cargo] || cargo || "";

// "Concejal" → "Concejales", "Diputado" → "Diputados"
export const plural = (texto) => (texto.endsWith("l") ? `${texto}es` : `${texto}s`);

export const territorio = (campana) =>
  campana ? [campana.municipio, campana.departamento].filter(Boolean).join(", ") : "";
