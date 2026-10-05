import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import Pendon from "../components/Pendon";
import { useAuth } from "../context/AuthContext";
import { esSuperadmin } from "../lib/campana";
import { estiloCampana } from "../lib/marca";
import { Lamina } from "../ui/Pagina";

// El superadmin administra el SaaS (campañas y catálogos); nunca entra a los datos de una campaña
const RUTAS_SUPERADMIN = ["/campanas", "/partidos", "/ajustes"];

export default function MainLayout() {
  const { usuario } = useAuth();
  const location = useLocation();
  // El superadmin solo gestiona campañas: no entra a los datos de ninguna
  const superadmin = esSuperadmin(usuario);
  const sinCampana = !superadmin && !usuario?.campana;

  // La barra del navegador en celular toma el color de la campaña
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = estiloCampana(usuario?.campana)["--campana"];
  }, [usuario?.campana]);

  return (
    <div style={estiloCampana(usuario?.campana)} className="min-h-dvh lg:flex">
      <Pendon />
      <main className="min-w-0 flex-1">
        <div className="mx-auto w-full max-w-[1240px] px-4 pb-16 pt-6 sm:px-8 sm:pt-10">
          {superadmin && !RUTAS_SUPERADMIN.includes(location.pathname) ? (
            <Navigate to="/campanas" replace />
          ) : sinCampana ? (
            <Lamina titulo="Sin campaña asignada" className="mx-auto max-w-lg">
              <p className="text-cuerpo text-tinta-2">
                Su usuario no tiene una campaña asignada. Contacte al administrador.
              </p>
            </Lamina>
          ) : (
            <Outlet />
          )}
        </div>
      </main>
    </div>
  );
}
