import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Cargando } from "../ui/Pagina";

export default function ProtectedRoute({ children }) {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return <Cargando texto="Cargando sesión…" />;
  }

  if (!usuario) {
    return <Navigate to="/" replace />;
  }

  return children;
}
