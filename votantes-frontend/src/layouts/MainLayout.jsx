import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <div style={{ width: "200px", flexShrink: 0 }}>
        <Sidebar />
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
  );
}
