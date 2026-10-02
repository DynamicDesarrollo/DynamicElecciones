// Cliente de la API: agrega el token, serializa JSON y normaliza errores.
// Devuelve { ok, status, data }; `data.error` trae el mensaje del backend cuando falla.

const BASE = import.meta.env.VITE_API_URL;

export async function api(ruta, { method = "GET", body } = {}) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE}/api${ruta}`, {
    method,
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  // Sesión vencida o usuario eliminado: volver al login
  if (res.status === 401 && ruta !== "/auth/login") {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.assign("/");
  }

  return { ok: res.ok, status: res.status, data };
}

// Para listas: devuelve [] si la respuesta no es un arreglo
export async function apiLista(ruta) {
  const { ok, data } = await api(ruta);
  return ok && Array.isArray(data) ? data : [];
}
