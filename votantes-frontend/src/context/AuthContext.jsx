import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

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

  const login = (userData) => guardar(userData);

  const logout = () => {
    setUsuario(null);
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout, refrescar, cargando }}>
      {children}
    </AuthContext.Provider>
  );
};
