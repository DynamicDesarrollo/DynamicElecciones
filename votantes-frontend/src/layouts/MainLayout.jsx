
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Outlet } from "react-router-dom";
import { useState } from "react";
import CrearUsuarioForm from "../components/Usuarios/CrearUsuarioForm";
import ModalPortal from "../components/ModalPortal";

export default function MainLayout() {
  const [mostrarModal, setMostrarModal] = useState(false);
  return (
    <>
      <div className="d-flex" style={{ minHeight: "100vh" }}>
        {/* Sidebar */}
        <div style={{ width: "200px", flexShrink: 0 }}>
          <Sidebar onAbrirCrearUsuario={() => setMostrarModal(true)} />
        </div>

        {/* Contenedor principal */}
        <div className="flex-grow-1 d-flex flex-column min-vh-100">
          {/* Header */}
          <div style={{ flexShrink: 0 }}>
            <Header />
          </div>

          {/* Contenido scrollable */}
          <div
            className="flex-grow-1 overflow-auto p-4"
            style={{ backgroundColor: "#f8f9fa", minHeight: 'calc(100vh - 64px)' }}
          >
            <Outlet />
          </div>
        </div>
      </div>
      {/* Modal para crear usuario, fuera del layout principal */}
      {mostrarModal && (
        <ModalPortal>
          <div style={{position:'fixed', inset:0, zIndex: 99999, background:'rgba(0,0,0,0.7)'}} className="flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-100 p-0 relative flex flex-col items-center animate-fadeIn" style={{margin:'auto'}}>
              <button
                type="button"
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl font-bold focus:outline-none"
                onClick={() => setMostrarModal(false)}
                aria-label="Cerrar"
              >
                &times;
              </button>
              <div className="w-100 p-6 sm:p-8 flex flex-col items-center">
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
