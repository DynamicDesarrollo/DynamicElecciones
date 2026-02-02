
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import CrearUsuarioForm from "./Usuarios/CrearUsuarioForm";
import ModalPortal from "./ModalPortal";

export default function Sidebar() {

  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mostrarModal, setMostrarModal] = useState(false);

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
                onClick={() => setMostrarModal(true)}
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
      {/* Modal para crear usuario */}
      {mostrarModal && (
        <ModalPortal>
          <div className="fixed inset-0 min-h-screen min-w-full z-[9999] flex items-center justify-center bg-black bg-opacity-70">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-0 relative flex flex-col items-center animate-fadeIn">
              <button
                type="button"
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl font-bold focus:outline-none"
                onClick={() => setMostrarModal(false)}
                aria-label="Cerrar"
              >
                &times;
              </button>
              <div className="w-full p-6 sm:p-8 flex flex-col items-center">
                <CrearUsuarioForm
                  onUsuarioCreado={() => { setMostrarModal(false); }}
                />
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </>
  );
}
