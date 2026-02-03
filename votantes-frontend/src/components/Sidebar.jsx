import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom";



export default function Sidebar({ onAbrirCrearUsuario }) {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      <div className="bg-dark text-white d-flex flex-column p-3" style={{ minHeight: "100vh", width: "200px" }}>
        <h4 className="mb-4">🗳️ Menú</h4>

        <ul className="nav flex-column mb-auto">
          {/* Opción para crear usuario solo visible para admin */}
          {usuario?.rol === "admin" && (
            <li className="nav-item mb-2">
              <button
                className="nav-link text-white w-100 text-start bg-success fw-bold rounded shadow"
                style={{ outline: 'none', border: 'none' }}
                onClick={onAbrirCrearUsuario}
              >
                <i className="bi bi-person-plus-fill me-2"></i> Crear usuario
              </button>
            </li>
          )}

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
          {/* Opción Aspirantes solo visible para admin */}
          {usuario?.rol === "admin" && (
            <li className="nav-item mb-2">
              <Link
                to="/aspirantes"
                className={`nav-link ${location.pathname === "/aspirantes" ? "bg-primary text-white fw-bold rounded shadow" : "text-white"}`}
              >
                <i className="bi-person-badge me-2"></i> Aspirantes
              </Link>
            </li>
          )}
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
              to="/votantes"
              className={`nav-link ${location.pathname === "/votantes" ? "bg-primary text-white fw-bold rounded shadow" : "text-white"}`}
            >
              <i className="bi bi-people-fill me-2"></i> Votantes
            </Link>
          </li>

          {/* Mostrar Asistencia e Informes solo si el usuario NO es 'user' */}
          {usuario?.rol !== 'user' && (
            <>
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
            </>
          )}

        </ul>

        <div className="mt-auto pt-3 border-top">
          <button onClick={handleLogout} className="btn btn-outline-light w-100">
            <i className="bi bi-box-arrow-right me-2"></i> Cerrar sesión
          </button>
        </div>
      </div>
      {/* ...el modal ahora se renderiza en MainLayout... */}
    </>
  );
}
