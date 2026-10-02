import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api, apiLista } from "../lib/api";
import { nombreCargo, plural, territorio } from "../lib/campana";
import { colorCampana } from "../lib/marca";
import { Boton } from "../ui/Boton";
import { Campo, Entrada, Rejilla, Seleccion } from "../ui/Campo";
import { CampoPassword } from "../ui/CampoPassword";
import SelectorTerritorio from "../components/SelectorTerritorio";
import { numero } from "../lib/formato";
import { useConfirmar } from "../ui/Confirmar";
import { Modal } from "../ui/Modal";
import { Cargando, Encabezado, Insignia, Vacio } from "../ui/Pagina";

// Silueta de pendón en el color de la campaña (el mismo motivo del ícono de la app)
function MiniPendon({ color }) {
  return (
    <svg viewBox="0 0 28 40" className="h-10 w-7 shrink-0" aria-hidden="true">
      <path d="M0 0h28v40l-14-8-14 8z" fill={color} />
    </svg>
  );
}

const FORM_VACIO = {
  nombre: "",
  tipo: "alcaldia",
  departamento: "",
  municipio: "",
  aspirante_principal: "",
  admin_nombre: "",
  admin_correo: "",
  admin_password: "",
};

function FormCampana({ tipos, onCreada }) {
  const [form, setForm] = useState(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const tipoActual = tipos[form.tipo];
  const esMunicipal = tipoActual?.territorio === "municipio";

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const crear = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    const conAdmin = form.admin_correo.trim() !== "";
    const { ok, data } = await api("/campanas", {
      method: "POST",
      body: {
        nombre: form.nombre,
        tipo: form.tipo,
        codigo_departamento: form.departamento,
        codigo_municipio: esMunicipal ? form.municipio : null,
        aspirante_principal: form.aspirante_principal,
        admin: conAdmin ? { nombre: form.admin_nombre, correo: form.admin_correo, password: form.admin_password } : undefined,
      },
    });
    setGuardando(false);
    if (!ok) return setError(data?.error || "No se pudo crear la campaña");
    onCreada(data);
  };

  return (
    <form onSubmit={crear} className="flex flex-col gap-6">
      {error && <p className="rounded-md bg-error-suave px-4 py-3 text-[15px] font-[560] text-error" role="alert">{error}</p>}
      <Rejilla columnas={2}>
        <Campo etiqueta="Tipo de campaña" id="c-tipo" className="sm:col-span-2">
          <Seleccion id="c-tipo" name="tipo" value={form.tipo} onChange={handleChange}>
            {Object.entries(tipos).map(([clave, t]) => (
              <option key={clave} value={clave}>
                {t.nombre}: {nombreCargo(t.principal)}{t.secundario ? ` con ${plural(nombreCargo(t.secundario)).toLowerCase()}` : ""}
              </option>
            ))}
          </Seleccion>
        </Campo>
        <Campo etiqueta="Nombre de la campaña" id="c-nombre" className="sm:col-span-2" ayuda="Suele ser el lema: así la verá el equipo en el pendón.">
          <Entrada id="c-nombre" name="nombre" value={form.nombre} onChange={handleChange} required autoFocus />
        </Campo>
        <SelectorTerritorio
          idBase="c"
          conMunicipio={esMunicipal}
          departamento={form.departamento}
          municipio={form.municipio}
          onCambio={({ departamento, municipio }) => setForm({ ...form, departamento, municipio })}
        />
        <Campo etiqueta={`${nombreCargo(tipoActual?.principal)} (aspirante principal)`} id="c-principal" className="sm:col-span-2">
          <Entrada id="c-principal" name="aspirante_principal" value={form.aspirante_principal} onChange={handleChange} required placeholder="Nombre completo" />
        </Campo>
      </Rejilla>

      <fieldset className="border-t border-filete pt-5">
        <legend className="rotulo float-left mb-1 w-full text-tinta-3">Administrador de la campaña</legend>
        <p className="clear-both mb-4 text-[13px] text-tinta-2">Opcional. Es el acceso que se entrega al cliente; desde ahí crea el resto del equipo.</p>
        <Rejilla columnas={3}>
          <Campo etiqueta="Nombre" id="c-anombre">
            <Entrada id="c-anombre" name="admin_nombre" value={form.admin_nombre} onChange={handleChange} required={!!form.admin_correo} />
          </Campo>
          <Campo etiqueta="Correo" id="c-acorreo">
            <Entrada id="c-acorreo" name="admin_correo" type="email" value={form.admin_correo} onChange={handleChange} autoComplete="off" />
          </Campo>
          <Campo etiqueta="Contraseña" id="c-apass">
            <Entrada id="c-apass" name="admin_password" type="password" value={form.admin_password} onChange={handleChange} required={!!form.admin_correo} minLength={8} autoComplete="new-password" />
          </Campo>
        </Rejilla>
      </fieldset>

      <div className="flex justify-end border-t border-filete pt-4">
        <Boton type="submit" cargando={guardando} className="max-sm:w-full max-sm:justify-center">Crear campaña</Boton>
      </div>
    </form>
  );
}

// Editar la configuración de la campaña. El tipo no cambia: define la jerarquía de cargos.
function FormEditar({ campana, onGuardada }) {
  const [form, setForm] = useState({
    nombre: campana.nombre,
    departamento: campana.codigo_departamento || "",
    municipio: campana.codigo_municipio || "",
    aspirante_principal: campana.aspirante_principal || "",
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const esMunicipal = campana.tipo === "alcaldia" || campana.tipo === "concejo";

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const guardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    const { ok, data } = await api(`/campanas/${campana.id}`, {
      method: "PUT",
      body: {
        nombre: form.nombre,
        aspirante_principal: form.aspirante_principal,
        codigo_departamento: form.departamento,
        codigo_municipio: esMunicipal ? form.municipio : null,
      },
    });
    setGuardando(false);
    if (!ok) return setError(data?.error || "No se pudo guardar la campaña");
    onGuardada(data);
  };

  return (
    <form onSubmit={guardar} className="flex flex-col gap-5">
      {error && <p className="rounded-md bg-error-suave px-4 py-3 text-[15px] font-[560] text-error" role="alert">{error}</p>}
      <p className="text-sm text-tinta-2">Tipo: <strong className="text-tinta">{campana.tipo_nombre}</strong> (no se puede cambiar).</p>
      <Rejilla columnas={2}>
        <Campo etiqueta="Nombre de la campaña" id="e-nombre" className="sm:col-span-2">
          <Entrada id="e-nombre" name="nombre" value={form.nombre} onChange={handleChange} required />
        </Campo>
        {!campana.codigo_departamento && (
          <p className="sm:col-span-2 rounded-md bg-alerta-suave px-4 py-3 text-sm text-alerta">
            El territorio actual ({[campana.municipio, campana.departamento].filter(Boolean).join(", ")}) no está enlazado a la lista oficial.
            Elíjalo abajo para cargar sus municipios y puestos de votación.
          </p>
        )}
        <SelectorTerritorio
          idBase="e"
          conMunicipio={esMunicipal}
          departamento={form.departamento}
          municipio={form.municipio}
          onCambio={({ departamento, municipio }) => setForm({ ...form, departamento, municipio })}
        />
        <p className="sm:col-span-2 -mt-2 text-[13px] text-tinta-3">
          Al cambiar el territorio se cargan sus puestos de votación; los votantes ya registrados se conservan.
        </p>
        <Campo etiqueta={`${nombreCargo(campana.cargo_principal)} (aspirante principal)`} id="e-principal" className="sm:col-span-2">
          <Entrada id="e-principal" name="aspirante_principal" value={form.aspirante_principal} onChange={handleChange} required />
        </Campo>
      </Rejilla>
      <div className="flex justify-end border-t border-filete pt-4">
        <Boton type="submit" cargando={guardando} className="max-sm:w-full max-sm:justify-center">Guardar cambios</Boton>
      </div>
    </form>
  );
}

// Crear el administrador que se entrega al cliente
function FormAdmin({ campana, onCreado }) {
  const [form, setForm] = useState({ nombre: "", correo: "", password: "" });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const crear = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    const { ok, data } = await api(`/campanas/${campana.id}/admin`, { method: "POST", body: form });
    setGuardando(false);
    if (!ok) return setError(data?.error || "No se pudo crear el administrador");
    onCreado();
  };

  return (
    <form onSubmit={crear} className="flex flex-col gap-5">
      {error && <p className="rounded-md bg-error-suave px-4 py-3 text-[15px] font-[560] text-error" role="alert">{error}</p>}
      <Rejilla columnas={2}>
        <Campo etiqueta="Nombre" id="ad-nombre" className="sm:col-span-2">
          <Entrada id="ad-nombre" name="nombre" value={form.nombre} onChange={handleChange} required />
        </Campo>
        <Campo etiqueta="Correo" id="ad-correo">
          <Entrada id="ad-correo" name="correo" type="email" value={form.correo} onChange={handleChange} required autoComplete="off" />
        </Campo>
        <Campo etiqueta="Contraseña" id="ad-pass" ayuda="Mínimo 8 caracteres. Entréguela en persona.">
          <Entrada id="ad-pass" name="password" type="password" value={form.password} onChange={handleChange} required minLength={8} autoComplete="new-password" />
        </Campo>
      </Rejilla>
      <div className="flex justify-end border-t border-filete pt-4">
        <Boton type="submit" cargando={guardando} className="max-sm:w-full max-sm:justify-center">Crear administrador</Boton>
      </div>
    </form>
  );
}

// El administrador de una campaña perdió su contraseña: el superadmin escribe su correo
// (no ve la lista de usuarios) y le asigna una temporal.
function FormRestablecerAdmin({ campana, onListo }) {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  const guardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    const { ok, data } = await api(`/campanas/${campana.id}/admin/password`, { method: "PUT", body: { correo, password } });
    setGuardando(false);
    if (!ok) return setError(data?.error || "No se pudo restablecer el acceso");
    onListo();
  };

  return (
    <form onSubmit={guardar} className="flex flex-col gap-5">
      {error && <p className="rounded-md bg-error-suave px-4 py-3 text-[15px] font-[560] text-error" role="alert">{error}</p>}
      <Campo etiqueta="Correo del administrador" id="ra-correo" ayuda="Solo funciona con un administrador de esta campaña.">
        <Entrada id="ra-correo" type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} required autoComplete="off" autoFocus />
      </Campo>
      <CampoPassword id="ra-pass" value={password} onChange={setPassword} />
      <div className="flex justify-end border-t border-filete pt-4">
        <Boton type="submit" cargando={guardando} className="max-sm:w-full max-sm:justify-center">Restablecer acceso</Boton>
      </div>
    </form>
  );
}

// Gestión de campañas del superadmin: crear, configurar, suspender y entregar el acceso.
// No muestra usuarios, votantes ni totales: esos datos son de cada campaña.
export default function CampanasPage() {
  const confirmar = useConfirmar();
  const [campanas, setCampanas] = useState(null);
  const [tipos, setTipos] = useState({});
  const [modal, setModal] = useState(null); // { tipo: "nueva" | "editar" | "admin", campana }

  const cargar = () => apiLista("/campanas").then(setCampanas);

  useEffect(() => {
    cargar();
    api("/campanas/tipos").then(({ ok, data }) => ok && setTipos(data.tipos));
  }, []);

  // Informa cuántos puestos se cargaron, o avisa si datos.gov.co no respondió
  const cerrarConTerritorio = (mensaje, d) => {
    if (d?.aviso) toast.warning(d.aviso);
    cerrar(d?.territorio ? `${mensaje}: ${numero(d.territorio.puestos)} puestos de votación cargados` : mensaje);
  };

  const recargar = async (c) => {
    const { ok, data } = await api(`/campanas/${c.id}/territorio`, { method: "POST" });
    if (!ok) return toast.error(data?.error || "No se pudo recargar el territorio");
    toast.success(`${numero(data.puestos)} puestos de votación cargados`);
    cargar();
  };

  const cerrar = (mensaje) => {
    if (mensaje) toast.success(mensaje);
    setModal(null);
    cargar();
  };

  const cambiarEstado = async (c) => {
    if (c.activa) {
      const ok = await confirmar({
        titulo: `¿Suspender ${c.nombre}?`,
        texto: "Sus usuarios no podrán entrar hasta que la reactive. Los datos se conservan.",
        accion: "Suspender campaña",
      });
      if (!ok) return;
    }
    const { ok, data } = await api(`/campanas/${c.id}`, { method: "PUT", body: { activa: !c.activa } });
    if (!ok) return toast.error(data?.error || "No se pudo actualizar la campaña");
    toast.success(c.activa ? "Campaña suspendida" : "Campaña reactivada");
    cargar();
  };

  if (!campanas) return <Cargando texto="Cargando campañas…" />;

  const titulosModal = {
    nueva: ["Nueva campaña", "Una sola campaña por tipo y territorio."],
    editar: ["Editar campaña", modal?.campana?.nombre],
    admin: ["Administrador de la campaña", modal?.campana?.nombre],
    reset: ["Restablecer acceso del administrador", modal?.campana?.nombre],
  };

  return (
    <>
      <Encabezado titulo="Campañas" descripcion="Cree y configure las campañas. Sus datos (usuarios, votantes, líderes) solo los ve cada campaña.">
        <Boton icono="bi-plus-lg" onClick={() => setModal({ tipo: "nueva" })}>Nueva campaña</Boton>
      </Encabezado>

      {campanas.length === 0 ? (
        <div className="rounded-lg bg-papel ring-1 ring-filete">
          <Vacio icono="bi-flag" titulo="Todavía no hay campañas" texto="Cree la primera y entregue el acceso de administrador al cliente.">
            <Boton icono="bi-plus-lg" onClick={() => setModal({ tipo: "nueva" })}>Nueva campaña</Boton>
          </Vacio>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {campanas.map((c) => (
            <li key={c.id} className="flex flex-col rounded-lg bg-papel p-5 ring-1 ring-filete">
              <div className="flex items-start gap-4">
                <MiniPendon color={c.activa ? colorCampana(c) : "var(--color-filete-fuerte)"} />
                <div className="min-w-0 flex-1">
                  <p className="condensada text-[1.75rem] uppercase leading-[0.95] break-words">{c.aspirante_principal || "Sin aspirante"}</p>
                  <p className="mt-1.5 text-[15px] font-[650]">{c.nombre}</p>
                  <p className="text-[13px] text-tinta-3">{c.tipo_nombre} · {territorio(c)}</p>
                </div>
              </div>
              {/* Estado de la campaña, con su acción al lado cuando falta el administrador */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {!c.activa && <Insignia tono="alerta" icono="bi-pause-circle">Suspendida</Insignia>}
                {!c.codigo_departamento ? (
                  <Insignia tono="alerta" icono="bi-geo-alt">Territorio sin enlazar</Insignia>
                ) : c.puestos_cargados > 0 ? (
                  <Insignia icono="bi-geo-alt">{numero(c.puestos_cargados)} puestos</Insignia>
                ) : (
                  <>
                    <Insignia tono="alerta" icono="bi-geo-alt">Sin puestos cargados</Insignia>
                    <button type="button" onClick={() => recargar(c)} className="inline-flex min-h-11 items-center px-1 text-sm font-[650] text-tinta underline underline-offset-[3px]">
                      Recargar
                    </button>
                  </>
                )}
                {c.tiene_admin ? (
                  <>
                    <Insignia icono="bi-person-check">Administrador entregado</Insignia>
                    <button
                      type="button"
                      onClick={() => setModal({ tipo: "reset", campana: c })}
                      className="inline-flex min-h-11 items-center px-1 text-sm font-[650] text-tinta underline underline-offset-[3px]"
                    >
                      Restablecer acceso
                    </button>
                  </>
                ) : (
                  <>
                    <Insignia tono="alerta" icono="bi-person-dash">Sin administrador</Insignia>
                    <button
                      type="button"
                      onClick={() => setModal({ tipo: "admin", campana: c })}
                      className="inline-flex min-h-11 items-center gap-1.5 px-1 text-sm font-[650] text-tinta underline underline-offset-[3px]"
                    >
                      Crear administrador
                    </button>
                  </>
                )}
              </div>
              <div className="mt-3 flex items-center gap-2 border-t border-filete pt-4">
                <Boton tamano="sm" variante="secundario" icono="bi-pencil" onClick={() => setModal({ tipo: "editar", campana: c })}>
                  Editar
                </Boton>
                <Boton tamano="sm" variante={c.activa ? "peligro" : "secundario"} className="ml-auto" onClick={() => cambiarEstado(c)}>
                  {c.activa ? "Suspender" : "Reactivar"}
                </Boton>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        abierto={!!modal}
        alCerrar={() => setModal(null)}
        titulo={modal ? titulosModal[modal.tipo][0] : ""}
        descripcion={modal ? titulosModal[modal.tipo][1] : ""}
      >
        {modal?.tipo === "nueva" && <FormCampana tipos={tipos} onCreada={(d) => cerrarConTerritorio("Campaña creada", d)} />}
        {modal?.tipo === "editar" && <FormEditar campana={modal.campana} onGuardada={(d) => cerrarConTerritorio("Campaña actualizada", d)} />}
        {modal?.tipo === "admin" && <FormAdmin campana={modal.campana} onCreado={() => cerrar("Administrador creado")} />}
        {modal?.tipo === "reset" && <FormRestablecerAdmin campana={modal.campana} onListo={() => cerrar("Acceso restablecido. Entregue la contraseña en persona.")} />}
      </Modal>
    </>
  );
}

