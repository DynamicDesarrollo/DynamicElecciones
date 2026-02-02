
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
          <div style={{position:'fixed', inset:0, zIndex: 99999}}>
            <div style={{position:'absolute', inset:0, background:'#212529', opacity:0.96, width:'100%', height:'100%'}}></div>
            <div className="d-flex align-items-center justify-content-center h-100 w-100" style={{minHeight:'100vh', position:'relative'}}>
              <div className="modal-dialog modal-dialog-centered" style={{maxWidth:'420px', width:'100%', zIndex:100000}}>
                <div className="modal-content p-0 position-relative" style={{background:'#fff', borderRadius:'1rem', border:'1px solid #dee2e6', boxShadow:'0 0.5rem 1rem rgba(0,0,0,.15)'}}>
                  <button
                    type="button"
                    className="btn-close position-absolute end-0 top-0 m-3"
                    aria-label="Cerrar"
                    onClick={() => setMostrarModal(false)}
                  ></button>
                  <div className="modal-body p-4">
                    <CrearUsuarioForm
                      onUsuarioCreado={() => setMostrarModal(false)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </>
  );
}
