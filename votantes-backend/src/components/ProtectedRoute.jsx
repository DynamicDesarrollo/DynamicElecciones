import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return <div className="text-center mt-5">Cargando sesión...</div>; // o spinner
  }

  if (!usuario) {
    return <Navigate to="/" replace />;
  }

  return children;
}
