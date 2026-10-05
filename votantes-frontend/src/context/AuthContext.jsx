import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { api, SESION_VENCIDA } from "../lib/api";

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

// Cada cuánto se renueva el token mientras la app está abierta (el token dura 8 horas)
const RENOVAR_CADA = 30 * 60 * 1000;

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true); // ✅ Nuevo estado

  const guardar = (userData) => {
    setUsuario(userData);
    localStorage.setItem("usuario", JSON.stringify(userData));
    if (userData.token) {
      localStorage.setItem("token", userData.token);
    }
  };

  const logout = useCallback(() => {
    setUsuario(null);
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
  }, []);

  // Vuelve a leer la sesión del backend (rol, campaña activa, aspirante)
  const refrescar = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const { ok, data } = await api("/auth/yo");
    if (!ok) return null;
    const actualizado = { ...data, token };
    guardar(actualizado);
    return actualizado;
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem("usuario");
    const token = localStorage.getItem("token");

    if (savedUser && token) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUsuario({ ...parsedUser, token });
        // Sesiones guardadas antes de las campañas no traen la campaña: se refrescan
        refrescar();
      } catch (error) {
        console.error("Error al leer usuario de localStorage:", error);
        localStorage.removeItem("usuario");
        localStorage.removeItem("token");
      }
    }

    setCargando(false); // ✅ Finaliza la carga
  }, [refrescar]);

  // El servidor rechazó la sesión (venció o el usuario fue retirado): se cierra y la app pasa
  // al login por sí sola, sin recargar la página.
  useEffect(() => {
    const alVencer = () => {
      if (!localStorage.getItem("token")) return; // varias peticiones pueden fallar a la vez
      logout();
      toast.info("Su sesión venció. Ingrese de nuevo.");
    };
    window.addEventListener(SESION_VENCIDA, alVencer);
    return () => window.removeEventListener(SESION_VENCIDA, alVencer);
  }, [logout]);

  // Mientras la app esté abierta, el token se renueva solo: nadie pierde un formulario
  // porque la sesión se venció a mitad de la jornada. Solo cambia el token guardado;
  // no toca el estado, así que no redibuja nada.
  const idUsuario = usuario?.id;
  useEffect(() => {
    if (!idUsuario) return;
    let ultima = Date.now();
    const renovar = async () => {
      const { ok, data } = await api("/auth/renovar", { method: "POST" });
      if (ok && data?.token) {
        localStorage.setItem("token", data.token);
        ultima = Date.now();
      }
    };
    const intervalo = setInterval(renovar, RENOVAR_CADA);
    // Al volver a la pestaña después de un rato (el intervalo se pausa en segundo plano)
    const alVolver = () => {
      if (document.visibilityState === "visible" && Date.now() - ultima > RENOVAR_CADA) renovar();
    };
    document.addEventListener("visibilitychange", alVolver);
    return () => {
      clearInterval(intervalo);
      document.removeEventListener("visibilitychange", alVolver);
    };
  }, [idUsuario]);

  const login = (userData) => guardar(userData);

  return (
    <AuthContext.Provider value={{ usuario, login, logout, refrescar, cargando }}>
      {children}
    </AuthContext.Provider>
  );
};
