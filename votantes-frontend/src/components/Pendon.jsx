// El pendón de la campaña: franja en el color de la campaña con el aspirante principal,
// la navegación y la sesión. En celular se abre a pantalla completa desde la banda superior.
// El superadmin no pertenece a ninguna campaña: ve el pendón de Dynamic y solo gestiona campañas.
import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { Boton } from "../ui/Boton";
import { Campo, Entrada } from "../ui/Campo";
import { CampoPassword } from "../ui/CampoPassword";
import { Modal } from "../ui/Modal";
import { esAdmin, esEquipoAspirante, esSuperadmin, nombreCargo, ROLES, territorio } from "../lib/campana";

const opcionesMenu = (usuario) => {
  const admin = esAdmin(usuario);
  const equipo = esEquipoAspirante(usuario);
  const conCampana = !!usuario?.campana;
  return [
    { to: "/campanas", icono: "bi-flag", texto: "Campañas", visible: esSuperadmin(usuario) },
    { to: "/dashboard", icono: "bi-bar-chart-line", texto: "Resumen", visible: conCampana },
    { to: "/aspirantes", icono: "bi-person-badge", texto: "Aspirantes", visible: conCampana && admin },
    { to: "/lideres", icono: "bi-megaphone", texto: "Líderes", visible: conCampana },
    { to: "/votantes", icono: "bi-people", texto: "Votantes", visible: conCampana },
    { to: "/asistencia", icono: "bi-check2-square", texto: "Asistencia día E", visible: conCampana && (admin || equipo) },
    { to: "/usuarios", icono: "bi-person-gear", texto: admin ? "Usuarios" : "Mi equipo", visible: conCampana && (admin || equipo) },
    { to: "/informes", icono: "bi-files", texto: "Duplicados", visible: conCampana && admin },
  ].filter((o) => o.visible);
};

// Tamaño del nombre según su largo, para que el pendón no se desborde
const tamanoNombre = (nombre = "") =>
  nombre.length > 30 ? "text-[1.85rem]" : nombre.length > 18 ? "text-[2.35rem]" : "text-[2.9rem]";

// Cada usuario cambia su propia contraseña (exige la actual)
function FormCambiarClave({ onListo }) {
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  const guardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    const { ok, data } = await api("/auth/password", { method: "PUT", body: { actual, nueva } });
    setGuardando(false);
    if (!ok) return setError(data?.error || "No se pudo cambiar la contraseña");
    toast.success("Contraseña actualizada");
    onListo();
  };

  return (
    <form onSubmit={guardar} className="flex flex-col gap-4">
      {error && <p className="rounded-md bg-error-suave px-4 py-3 text-[15px] font-[560] text-error" role="alert">{error}</p>}
      <Campo etiqueta="Contraseña actual" id="cc-actual">
        <Entrada id="cc-actual" type="password" value={actual} onChange={(e) => setActual(e.target.value)} required autoComplete="current-password" autoFocus />
      </Campo>
      <CampoPassword id="cc-nueva" value={nueva} onChange={setNueva} conGenerar={false} ayuda="Mínimo 8 caracteres." />
      <div className="flex justify-end border-t border-filete pt-4">
        <Boton type="submit" cargando={guardando} className="max-sm:w-full max-sm:justify-center">Cambiar contraseña</Boton>
      </div>
    </form>
  );
}

function ContenidoPendon({ alNavegar }) {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const campana = usuario?.campana;
  const principal = campana?.aspirante_principal;
  const [cambiandoClave, setCambiandoClave] = useState(false);

  const salir = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex min-h-full flex-col px-5 pb-5 pt-7">
      {campana ? (
        <div>
          <p className={`condensada uppercase leading-[0.88] break-words ${tamanoNombre(principal)}`}>
            {principal || campana.nombre}
          </p>
          {principal && <p className="mt-3 text-[15px] font-[650] leading-snug">{campana.nombre}</p>}
          <p className="mt-1 text-[13px] font-[520] text-white/80">
            {campana.tipo_nombre} · {territorio(campana)}
          </p>
        </div>
      ) : (
        <p className="condensada text-[2.6rem] uppercase leading-[0.88]">Dynamic<br />Electoral</p>
      )}

      <nav className="mt-8" aria-label="Principal">
        <ul className="flex flex-col gap-0.5">
          {opcionesMenu(usuario).map((o) => (
            <li key={o.to}>
              <NavLink
                to={o.to}
                onClick={alNavegar}
                className={({ isActive }) =>
                  `flex h-11 items-center gap-3 rounded-md px-3 text-[15px] font-[620] transition-colors duration-150 ${
                    isActive ? "bg-white text-campana" : "text-white/88 hover:bg-white/12 hover:text-white"
                  }`
                }
              >
                <i className={`bi ${o.icono} text-[17px]`} aria-hidden="true" />
                {o.texto}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto pt-8">
        <div className="border-t border-white/25 pt-4">
          <p className="truncate text-[15px] font-[650]">{usuario?.nombre}</p>
          <p className="truncate text-[13px] text-white/80">
            {usuario?.nombre_aspirante
              ? `${nombreCargo(usuario.cargo_aspirante)} ${usuario.nombre_aspirante}`
              : ROLES[usuario?.rol] || usuario?.rol}
          </p>
          <div className="mt-3 flex flex-col items-start">
            <button
              type="button"
              onClick={() => setCambiandoClave(true)}
              className="inline-flex h-10 items-center gap-2 rounded-md px-3 -ml-3 text-sm font-[620] text-white/88 transition-colors hover:bg-white/12 hover:text-white"
            >
              <i className="bi bi-key" aria-hidden="true" /> Cambiar contraseña
            </button>
            <button
              type="button"
              onClick={salir}
              className="inline-flex h-10 items-center gap-2 rounded-md px-3 -ml-3 text-sm font-[620] text-white/88 transition-colors hover:bg-white/12 hover:text-white"
            >
              <i className="bi bi-box-arrow-right" aria-hidden="true" /> Cerrar sesión
            </button>
          </div>
        </div>
        <Modal abierto={cambiandoClave} alCerrar={() => setCambiandoClave(false)} titulo="Cambiar contraseña" ancho="sm:max-w-md">
          {cambiandoClave && <FormCambiarClave onListo={() => setCambiandoClave(false)} />}
        </Modal>
        {/* Firma discreta de la plataforma, solo cuando el pendón es de una campaña */}
        {campana && (
          <p className="mt-4 flex items-center gap-2 text-[12px] font-[560] text-white/65">
            <img src="/pendon.svg" alt="" className="size-4 rounded-[4px]" /> Dynamic Electoral
          </p>
        )}
      </div>
    </div>
  );
}

export default function Pendon() {
  const { usuario } = useAuth();
  const location = useLocation();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const campana = usuario?.campana;
  const llave = campana?.id || "sin-campana";

  // Cerrar el menú del celular al cambiar de página
  useEffect(() => setMenuAbierto(false), [location.pathname]);

  return (
    <>
      {/* Escritorio: el pendón se iza al entrar o al cambiar de campaña */}
      <aside
        key={llave}
        className="sticky top-0 hidden h-dvh w-[264px] shrink-0 overflow-y-auto bg-campana text-campana-tinta animate-izar lg:block"
      >
        <ContenidoPendon />
      </aside>

      {/* Celular y tableta: banda superior */}
      <div className="sticky top-0 z-30 flex h-14 items-center gap-2 bg-campana pl-2 pr-4 text-campana-tinta shadow-[0_1px_0_rgb(0_0_0/0.15)] lg:hidden">
        <button
          type="button"
          onClick={() => setMenuAbierto(true)}
          aria-label="Abrir menú"
          aria-expanded={menuAbierto}
          className="inline-flex size-11 items-center justify-center rounded-md text-xl hover:bg-white/12"
        >
          <i className="bi bi-list" aria-hidden="true" />
        </button>
        <p className="condensada truncate text-[1.45rem] uppercase leading-none">
          {campana?.aspirante_principal || campana?.nombre || "Dynamic Electoral"}
        </p>
      </div>

      {menuAbierto && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-campana text-campana-tinta animate-izar lg:hidden" role="dialog" aria-modal="true" aria-label="Menú">
          <button
            type="button"
            onClick={() => setMenuAbierto(false)}
            aria-label="Cerrar menú"
            className="absolute right-3 top-3 inline-flex size-11 items-center justify-center rounded-md text-xl hover:bg-white/12"
          >
            <i className="bi bi-x-lg" aria-hidden="true" />
          </button>
          <ContenidoPendon alNavegar={() => setMenuAbierto(false)} />
        </div>
      )}
    </>
  );
}
