import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="d-flex" style={{ height: "100vh", overflow: "hidden" }}>
      {/* Sidebar */}
      <div style={{ width: "200px", flexShrink: 0 }}>
        <Sidebar />
      </div>

      {/* Contenedor principal */}
      <div className="flex-grow-1 d-flex flex-column">
        {/* Header */}
        <div style={{ flexShrink: 0 }}>
          <Header />
        </div>

        {/* Contenido scrollable */}
        <div
          className="flex-grow-1 overflow-auto p-4"
          style={{ backgroundColor: "#f8f9fa", minHeight: 0 }}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
}
