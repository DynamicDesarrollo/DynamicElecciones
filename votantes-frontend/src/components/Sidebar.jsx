import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom";

export default function Sidebar() {

  const { usuario } = useAuth();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };
  const location = useLocation();
  return (
    <div className="bg-dark text-white d-flex flex-column p-3" style={{ minHeight: "100vh", width: "200px" }}>
      <h4 className="mb-4">🗳️ Menú</h4>

      <ul className="nav flex-column mb-auto">

        <li className="nav-item mb-2">
          <Link
            to="/dashboard"
            className={`nav-link ${location.pathname === "/dashboard" ? "bg-primary text-white fw-bold rounded shadow"
              : "text-white"}`}
          >
            <i className="bi bi-speedometer2 me-2"></i> Dashboard
          </Link>
        </li>
        {/* Aquí insertas la nueva opción solo visible para admin */}
        <li className="nav-item mb-2">
          {usuario?.rol === "admin" && (
            <Link
              to="/alcaldia"
              className={`nav-link ${location.pathname === "/alcaldia" ? "bg-primary text-white fw-bold rounded shadow"
                : "text-white"}`}
            >
              <i className="bi-building me-2"></i> A la Alcaldía
            </Link>
          )}

        </li>

        {/* Aquí insertas la nueva opción solo visible para admin */}
        <li className="nav-item mb-2">
          {usuario?.rol === "admin" && (
            <Link
              to="/concejo"
              className={`nav-link ${location.pathname === "/concejo" ? "bg-primary text-white fw-bold rounded shadow"
                : "text-white"}`}
            >
              <i className="bi-people-fill me-2"></i> Al Concejo
            </Link>
          )}

        </li>
        <li className="nav-item mb-2">
          <Link
            to="/votantes"
            className={`nav-link ${location.pathname === "/votantes" ? "bg-primary text-white fw-bold rounded shadow"
              : "text-white"}`}
          >
            <i className="bi-person-check-fill me-2"></i> Votantes
          </Link>
        </li>
        <li className="nav-item mb-2">
          <Link
            to="/lideres"
            className={`nav-link ${location.pathname === "/lideres" ? "bg-primary text-white fw-bold rounded shadow"
              : "text-white"}`}
          >
            <i className="bi-person-lines-fill me-2"></i> Líderes
          </Link>
        </li>
        <li className="nav-item mb-2">
          <Link
            to="/asistencia"
            className={`nav-link ${location.pathname === "/asistencia" ? "bg-primary text-white fw-bold rounded shadow"
              : "text-white"}`}
          >
            <i className="bi-person-lines-fill me-2"></i> Asistencia
          </Link>
        </li>

        <li className="nav-item mb-2">
          <Link
            to="/informes"
            className={`nav-link ${location.pathname === "/informes" ? "bg-primary text-white fw-bold rounded shadow" : "text-white"}`}
          >
            <i className="bi bi-graph-up me-2"></i> Informes
          </Link>
        </li>

      </ul>

      <div className="mt-auto pt-3 border-top">
        <button onClick={handleLogout} className="btn btn-outline-light w-100">
          <i className="bi bi-box-arrow-right me-2"></i> Cerrar sesión
        </button>
      </div>
    </div>
  );
}
