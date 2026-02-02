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
    <header style={{ background: '#007bff' }} className="text-white flex justify-between items-center px-3 py-2 relative h-16 min-h-[4rem]">
      <h5 className="font-bold text-lg">🗳️ Sistema de Votantes</h5>
      <div className="fixed top-4 right-8 z-[100]">
        <div className="relative">
          <button
            className="flex items-center gap-2 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-full px-2 py-1 focus:outline-none shadow-lg transition"
            onClick={() => setOpenMenu((v) => !v)}
          >
            <img
              src={usuario?.foto || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'}
              alt="avatar"
              className="rounded-full border-2 border-white shadow w-10 h-10 object-cover"
            />
            <span className="hidden sm:block font-semibold drop-shadow">{usuario?.nombre || 'Usuario'}</span>
            <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </button>
          {openMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white text-gray-800 rounded-xl shadow-2xl z-50 py-2 border border-blue-100 animate-fadeIn">
              <button
                className="w-full text-left px-5 py-2 hover:bg-blue-50 rounded-t-xl font-medium"
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
              {usuario?.rol === 'admin' && (
                <button
                  className="w-full text-left px-5 py-2 hover:bg-blue-50 font-medium"
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
              <hr className="my-1 border-blue-100" />
              <button
                className="w-full text-left px-5 py-2 text-red-600 hover:bg-red-50 rounded-b-xl font-medium"
                onClick={handleLogout}
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
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
