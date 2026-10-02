// Formatos en español de Colombia
export const numero = (n) => Number(n || 0).toLocaleString("es-CO");

export const porcentaje = (parte, total) =>
  total ? `${Math.round((parte / total) * 100).toLocaleString("es-CO")} %` : "—";

export const fechaHora = (iso) =>
  iso ? new Date(iso).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" }) : "—";
