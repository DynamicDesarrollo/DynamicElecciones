import { useState } from "react";
import { useAuth } from "../context/AuthContext";

import CrearUsuarioForm from "./Usuarios/CrearUsuarioForm";
import ModalPortal from "./ModalPortal";

export default function Header() {
  const { usuario, logout } = useAuth();
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const handleLogout = () => {
    logout();
  };

  const [openMenu, setOpenMenu] = useState(false);
  return (
    <header style={{ background: '#007bff' }} className="text-white flex justify-between items-center px-3 py-2 relative">
      <h5>🗳️ Sistema de Votantes</h5>
      <div className="relative">
        <button
          className="flex items-center bg-black bg-opacity-70 rounded-full px-3 py-1 focus:outline-none hover:bg-opacity-90 transition"
          onClick={() => setOpenMenu((v) => !v)}
        >
          <img
            src={usuario?.foto || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
            alt="avatar"
            className="rounded-full mr-2"
            style={{ width: "35px", height: "35px", objectFit: "cover" }}
          />
          <span>{usuario?.nombre || "Usuario"}</span>
          <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
        </button>
        {openMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-lg shadow-lg z-50 py-2 animate-fadeIn">
            <button
              className="w-full text-left px-4 py-2 hover:bg-blue-100 rounded"
              onClick={() => {
                setModoEdicion(true);
                setEditUser({
                  nombre: usuario?.nombre,
                  correo: usuario?.correo,
                  rol: usuario?.rol,
                  id: usuario?.id
                });
                setMostrarModal(true);
                setOpenMenu(false);
              }}
            >
              Editar mi usuario
            </button>
            {usuario?.rol === "admin" && (
              <button
                className="w-full text-left px-4 py-2 hover:bg-blue-100 rounded"
                onClick={() => {
                  setModoEdicion(false);
                  setEditUser(null);
                  setMostrarModal(true);
                  setOpenMenu(false);
                }}
              >
                Crear usuario
              </button>
            )}
            <hr className="my-1" />
            <button
              className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-100 rounded"
              onClick={handleLogout}
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
      {/* Modal para crear/editar usuario */}
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
                  key={modoEdicion ? (editUser?.id || 'edit') : 'create'}
                  onUsuarioCreado={() => { setMostrarModal(false); }}
                  initialValues={modoEdicion && editUser ? editUser : undefined}
                  modoEdicion={modoEdicion}
                />
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </header>
  );
}
