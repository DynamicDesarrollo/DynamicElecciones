// Marca de cada campaña.
// Mientras la campaña no tenga color propio configurado, recibe uno estable de esta paleta
// de colores de partido. Todos tienen contraste AA (≥4.5:1) con texto blanco.

export const PALETA_CAMPANA = [
  "#C8102E", // rojo
  "#0033A0", // azul
  "#00703C", // verde
  "#5B2C83", // morado
  "#B5390B", // naranja quemado
  "#00607A", // petróleo
  "#8A1538", // vino
  "#1F3A93", // índigo
];

// Hash simple y estable del id: la misma campaña siempre recibe el mismo color
const indiceDe = (texto) => {
  let h = 0;
  for (let i = 0; i < texto.length; i++) h = (h * 31 + texto.charCodeAt(i)) >>> 0;
  return h % PALETA_CAMPANA.length;
};

export const colorCampana = (campana) =>
  campana?.color || (campana?.id ? PALETA_CAMPANA[indiceDe(campana.id)] : "#121417");

// Variables CSS que visten la app con la campaña activa
export const estiloCampana = (campana) => ({
  "--campana": colorCampana(campana),
  "--campana-tinta": "#ffffff",
});
