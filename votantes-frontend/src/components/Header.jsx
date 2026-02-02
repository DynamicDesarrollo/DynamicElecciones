import { useState } from "react";
import { useAuth } from "../context/AuthContext";

import CrearUsuarioForm from "./Usuarios/CrearUsuarioForm";

export default function Header() {
  const { usuario, logout } = useAuth();
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const handleLogout = () => {
    logout();
  };

  return (
    <header style={{ background: '#007bff' }} className="text-white d-flex justify-content-between align-items-center px-3 py-2">
      <h5>🗳️ Sistema de Votantes</h5>

      <div className="dropdown">
        <button
          className="btn btn-dark dropdown-toggle d-flex align-items-center"
          id="dropdownUser"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <img
            src={usuario?.foto || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
            alt="avatar"
            className="rounded-circle me-2"
            style={{ width: "35px", height: "35px", objectFit: "cover" }}
          />
          <span>{usuario?.nombre || "Usuario"}</span>
        </button>

        <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownUser">
          <li>
            <button
              className="dropdown-item"
              onClick={() => {
                setModoEdicion(true);
                setEditUser({
                  nombre: usuario?.nombre,
                  correo: usuario?.correo,
                  rol: usuario?.rol,
                  id: usuario?.id
                });
                setMostrarModal(true);
              }}
            >
              Editar mi usuario
            </button>
          </li>
          {usuario?.rol === "admin" && (
            <li>
              <button
                className="dropdown-item"
                onClick={() => {
                  setModoEdicion(false);
                  setEditUser(null);
                  setMostrarModal(true);
                }}
              >
                Crear usuario
              </button>
            </li>
          )}
          <li><hr className="dropdown-divider" /></li>
          <li>
            <button className="dropdown-item text-danger" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </li>
        </ul>
      </div>

      {/* Modal para crear/editar usuario */}
      {mostrarModal && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content p-3">
              <button
                type="button"
                className="btn-close ms-auto"
                style={{position:'absolute',right:10,top:10,zIndex:2}}
                onClick={() => setMostrarModal(false)}
              ></button>
              <CrearUsuarioForm
                key={modoEdicion ? (editUser?.id || 'edit') : 'create'}
                onUsuarioCreado={() => { setMostrarModal(false); }}
                initialValues={modoEdicion && editUser ? editUser : undefined}
                modoEdicion={modoEdicion}
              />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
