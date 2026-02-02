import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import UsuariosPage from "./pages/UsuariosPage";
import VotantesPage from "./pages/VotantesPage";
import AspirantesConcejoPage from "./pages/AspirantesConcejoPage";
import AspirantesAlcaldiaPage from "./pages/AspirantesAlcaldiaPage";
import AspirantesPage from "./pages/AspirantesPage";
import LideresPage from "./pages/LideresPage";
import AsistenciaPage from "./pages/AsistenciaPage";
import InformesPage from "./pages/InformesPage";

import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />

        {/* Rutas protegidas con layout */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/usuarios" element={<UsuariosPage />} />
          <Route path="/votantes" element={<VotantesPage />} />
          <Route path="/concejo" element={<AspirantesConcejoPage />} />
          <Route path="/alcaldia" element={<AspirantesAlcaldiaPage />} />
          <Route path="/lideres" element={<LideresPage />} />
          <Route path="/asistencia" element={<AsistenciaPage />} />
          <Route path="/informes" element={<InformesPage />} />
          <Route path="/aspirantes" element={<AspirantesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
