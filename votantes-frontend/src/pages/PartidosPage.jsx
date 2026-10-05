// Catálogo de partidos del SaaS: lo administra el superadmin y lo usan todas las campañas.
// Se pueden importar de Wikidata (con logo, color y lema cuando existen) o crear a mano.
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { api, apiLista } from "../lib/api";
import { numero } from "../lib/formato";
import { Boton, BotonIcono } from "../ui/Boton";
import { Campo, Entrada, Rejilla } from "../ui/Campo";
import { useConfirmar } from "../ui/Confirmar";
import { Modal } from "../ui/Modal";
import { Cargando, Encabezado, Insignia, Vacio } from "../ui/Pagina";

const FORM_VACIO = { nombre: "", sigla: "", eslogan: "", color: "", logo_url: "" };

// Logo del partido; si no hay imagen (o no carga), su sigla sobre el color del partido
function LogoPartido({ partido, tamano = "size-12" }) {
  const [fallo, setFallo] = useState(false);
  const iniciales = (partido.sigla || partido.nombre || "?")
    .replace(/^(Partido|Movimiento)\s+/i, "")
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();

  // El logo guardado en nuestra base va primero. Los del CNE no se piden directo desde el
  // navegador: su servidor es lento y a veces no responde, así que mientras no esté guardado
  // se muestran las iniciales.
  const externo = partido.logo_url && !/cne\.gov\.co/.test(partido.logo_url) ? partido.logo_url : null;
  const src = partido.logo_propio
    ? `${import.meta.env.VITE_API_URL}/api/publico/partidos/${partido.id}/logo`
    : externo;

  if (src && !fallo) {
    return (
      <span className={`${tamano} inline-flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-papel ring-1 ring-filete`}>
        <img src={src} alt="" loading="lazy" onError={() => setFallo(true)} className="max-h-full max-w-full object-contain p-1" />
      </span>
    );
  }
  return (
    <span
      className={`${tamano} inline-flex shrink-0 items-center justify-center rounded-md text-nota font-[750] text-white`}
      style={{ background: partido.color || "var(--color-tinta-3)" }}
      aria-hidden="true"
    >
      {iniciales}
    </span>
  );
}

function FormPartido({ partido, onGuardado }) {
  const [form, setForm] = useState(() =>
    partido ? Object.fromEntries(Object.keys(FORM_VACIO).map((k) => [k, partido[k] ?? ""])) : FORM_VACIO
  );
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const guardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    const { ok, data } = await api(partido ? `/partidos/${partido.id}` : "/partidos", {
      method: partido ? "PUT" : "POST",
      body: form,
    });
    setGuardando(false);
    if (!ok) return setError(data?.error || "No se pudo guardar el partido");
    onGuardado(partido ? "Partido actualizado" : "Partido creado");
  };

  return (
    <form onSubmit={guardar} className="flex flex-col gap-5">
      {error && <p className="rounded-md bg-error-suave px-4 py-3 text-cuerpo font-[560] text-error" role="alert">{error}</p>}
      <div className="flex items-center gap-4">
        <LogoPartido partido={form} tamano="size-16" />
        <p className="text-sm text-tinta-2">Así se verá el partido en la plataforma.</p>
      </div>
      <Rejilla columnas={2}>
        <Campo etiqueta="Nombre" id="p-nombre" className="sm:col-span-2">
          <Entrada id="p-nombre" name="nombre" value={form.nombre} onChange={handleChange} required autoFocus />
        </Campo>
        <Campo etiqueta="Sigla" id="p-sigla">
          <Entrada id="p-sigla" name="sigla" value={form.sigla} onChange={handleChange} maxLength={30} />
        </Campo>
        <Campo etiqueta="Color" id="p-color" ayuda="Color oficial del partido.">
          <div className="flex gap-2">
            <input
              type="color"
              aria-label="Elegir color"
              value={/^#[0-9a-f]{6}$/i.test(form.color) ? form.color : "#121417"}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
              className="h-11 w-14 shrink-0 cursor-pointer rounded-md bg-papel p-1 ring-1 ring-inset ring-filete-fuerte"
            />
            <Entrada id="p-color" name="color" value={form.color} onChange={handleChange} placeholder="#C8102E" pattern="#[0-9a-fA-F]{6}" />
          </div>
        </Campo>
        <Campo etiqueta="Eslogan" id="p-eslogan" className="sm:col-span-2">
          <Entrada id="p-eslogan" name="eslogan" value={form.eslogan} onChange={handleChange} />
        </Campo>
        <Campo etiqueta="Dirección del logo" id="p-logo" className="sm:col-span-2" ayuda="Enlace a la imagen (PNG o SVG). Los importados de Wikidata ya lo traen.">
          <Entrada id="p-logo" name="logo_url" type="url" inputMode="url" value={form.logo_url} onChange={handleChange} placeholder="https://…" />
        </Campo>
      </Rejilla>
      <div className="flex justify-end border-t border-filete pt-4">
        <Boton type="submit" cargando={guardando} className="max-sm:w-full max-sm:justify-center">Guardar</Boton>
      </div>
    </form>
  );
}

// Fuentes para traer partidos al catálogo
const FUENTES = {
  cne: {
    ruta: "/partidos/cne",
    cargando: "Consultando el CNE…",
    pie: "Fuente: Consejo Nacional Electoral, personería jurídica vigente.",
    // Los que ya están también se pueden elegir: se actualizan con el nombre y el logo oficiales
    reimportable: true,
  },
  wikidata: {
    ruta: "/partidos/wikidata",
    cargando: "Consultando Wikidata…",
    pie: "Fuente: Wikidata. Incluye movimientos sin personería; revise los datos después.",
    reimportable: false,
  },
};

// Lista de partidos de una fuente externa para elegir cuáles traer al catálogo
function Importar({ fuente, onImportados }) {
  const config = FUENTES[fuente];
  const [partidos, setPartidos] = useState(null);
  const [error, setError] = useState(null);
  const [elegidos, setElegidos] = useState(() => new Set());
  const [busqueda, setBusqueda] = useState("");
  const [importando, setImportando] = useState(false);

  const elegible = (p) => config.reimportable || !p.en_catalogo;

  useEffect(() => {
    api(config.ruta).then(({ ok, data }) => {
      if (!ok) return setError(data?.error || "No se pudo consultar la fuente");
      setPartidos(data);
      // La lista oficial llega con todo elegido: lo normal es cargarla completa
      if (fuente === "cne") setElegidos(new Set(data.map((p) => p.id_fuente)));
    });
  }, [config.ruta, fuente]);

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return (partidos || []).filter((p) => !q || p.nombre.toLowerCase().includes(q) || (p.sigla || "").toLowerCase().includes(q));
  }, [partidos, busqueda]);

  const alternar = (id) =>
    setElegidos((prev) => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      return s;
    });

  const todos = (partidos || []).filter(elegible).map((p) => p.id_fuente);
  const todosElegidos = todos.length > 0 && todos.every((id) => elegidos.has(id));

  const importar = async () => {
    setImportando(true);
    const { ok, data } = await api(config.ruta, { method: "POST", body: { ids: [...elegidos] } });
    setImportando(false);
    if (!ok) return toast.error(data?.error || "No se pudo importar");
    onImportados(data.importados);
  };

  if (error) return <p className="rounded-md bg-error-suave px-4 py-3 text-cuerpo font-[560] text-error" role="alert">{error}</p>;
  if (!partidos) return <Cargando texto={config.cargando} />;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1 basis-52">
          <i className="bi bi-search pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-tinta-3" aria-hidden="true" />
          <Entrada type="search" placeholder="Buscar partido" aria-label="Buscar partido" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="pl-10" />
        </div>
        <Boton variante="secundario" onClick={() => setElegidos(todosElegidos ? new Set() : new Set(todos))}>
          {todosElegidos ? "Quitar todos" : "Elegir todos"}
        </Boton>
      </div>

      <ul className="divide-y divide-filete rounded-lg ring-1 ring-filete">
        {visibles.map((p) => (
          <li key={p.id_fuente}>
            <label className={`flex min-h-16 items-center gap-3 px-4 py-2.5 ${elegible(p) ? "cursor-pointer hover:bg-fondo/70" : "opacity-60"}`}>
              <input
                type="checkbox"
                className="size-5 shrink-0 rounded accent-campana"
                checked={elegible(p) ? elegidos.has(p.id_fuente) : true}
                disabled={!elegible(p)}
                onChange={() => alternar(p.id_fuente)}
              />
              <LogoPartido partido={p} tamano="size-11" />
              <span className="min-w-0 flex-1">
                <span className="block text-cuerpo font-[650]">{p.nombre}</span>
                {(p.sigla || p.eslogan) && (
                  <span className="block truncate text-nota text-tinta-3">{[p.sigla, p.eslogan].filter(Boolean).join(" · ")}</span>
                )}
              </span>
              {p.en_catalogo && <Insignia>{config.reimportable ? "Se actualiza" : "En el catálogo"}</Insignia>}
            </label>
          </li>
        ))}
        {visibles.length === 0 && <li className="px-4 py-6 text-center text-cuerpo text-tinta-2">Ningún partido coincide.</li>}
      </ul>

      <div className="sticky -bottom-5 -mx-5 -mb-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-filete bg-papel/95 px-5 py-4 backdrop-blur-sm sm:-mx-6 sm:px-6">
        <p className="min-w-0 flex-1 basis-56 text-sm text-tinta-2">{config.pie}</p>
        <Boton onClick={importar} cargando={importando} disabled={elegidos.size === 0}>
          Cargar {elegidos.size > 0 ? numero(elegidos.size) : ""}
        </Boton>
      </div>
    </div>
  );
}

export default function PartidosPage() {
  const confirmar = useConfirmar();
  const [partidos, setPartidos] = useState(null);
  const [modal, setModal] = useState(null); // { tipo: "nuevo" | "editar" | "cne" | "wikidata", partido }

  const cargar = () => apiLista("/partidos").then(setPartidos);

  useEffect(() => {
    cargar();
  }, []);

  // Los logos se descargan en segundo plano después de cargar o editar: la lista se vuelve
  // a leer un par de veces para mostrarlos sin que haya que recargar a mano.
  const cargarConLogos = () => {
    cargar();
    [5000, 15000, 40000].forEach((ms) => setTimeout(cargar, ms));
  };

  const cerrar = (mensaje) => {
    if (mensaje) toast.success(mensaje);
    setModal(null);
    cargarConLogos();
  };

  // Partidos con dirección de logo pero sin la imagen guardada todavía
  const sinLogo = (partidos || []).filter((p) => p.logo_url && !p.logo_propio).length;

  const reintentarLogos = async () => {
    const { ok, data } = await api("/partidos/logos/reintentar", { method: "POST" });
    if (!ok) return toast.error(data?.error || "No se pudo reintentar");
    toast.info(`Descargando ${numero(data.pendientes)} logos. Aparecerán en un momento.`);
    cargarConLogos();
  };

  const eliminar = async (p) => {
    const ok = await confirmar({
      titulo: `¿Eliminar ${p.nombre}?`,
      texto: "Sale del catálogo de todas las campañas. Solo se puede si ningún aspirante lo usa.",
      accion: "Eliminar partido",
    });
    if (!ok) return;
    const res = await api(`/partidos/${p.id}`, { method: "DELETE" });
    if (!res.ok) return toast.error(res.data?.error || "No se pudo eliminar el partido");
    toast.success("Partido eliminado");
    cargar();
  };

  if (!partidos) return <Cargando texto="Cargando partidos…" />;

  const titulos = {
    nuevo: ["Nuevo partido", null],
    editar: ["Editar partido", modal?.partido?.nombre],
    cne: ["Partidos del CNE", "Organizaciones con personería jurídica vigente y su logosímbolo oficial."],
    wikidata: ["Otros partidos y movimientos", "Los que no tienen personería en el CNE, según Wikidata."],
  };

  return (
    <>
      <Encabezado
        titulo="Partidos"
        descripcion={`${numero(partidos.length)} en el catálogo. Cada campaña elige de aquí el partido de sus aspirantes.`}
      >
        {sinLogo > 0 && (
          <Boton variante="secundario" icono="bi-arrow-repeat" onClick={reintentarLogos}>
            Reintentar {numero(sinLogo)} logos
          </Boton>
        )}
        <Boton variante="secundario" icono="bi-plus-lg" onClick={() => setModal({ tipo: "nuevo" })}>Nuevo</Boton>
        <Boton variante="secundario" icono="bi-globe2" onClick={() => setModal({ tipo: "wikidata" })}>Otros</Boton>
        <Boton icono="bi-cloud-download" onClick={() => setModal({ tipo: "cne" })}>Cargar del CNE</Boton>
      </Encabezado>

      {partidos.length === 0 ? (
        <div className="rounded-lg bg-papel ring-1 ring-filete">
          <Vacio icono="bi-bookmark-star" titulo="El catálogo está vacío" texto="Cargue la lista oficial del CNE con sus logos, o cree los partidos a mano.">
            <Boton icono="bi-cloud-download" onClick={() => setModal({ tipo: "cne" })}>Cargar del CNE</Boton>
          </Vacio>
        </div>
      ) : (
        <ul className="divide-y divide-filete rounded-lg bg-papel ring-1 ring-filete">
          {partidos.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3.5 sm:px-5">
              <LogoPartido partido={p} />
              <div className="min-w-0 flex-1 basis-56">
                <p className="text-base font-[700]">
                  {p.nombre}
                  {p.sigla && <span className="ml-2 font-[560] text-tinta-3">{p.sigla}</span>}
                </p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-nota text-tinta-2">
                  {p.eslogan ? <span>“{p.eslogan}”</span> : <span className="text-tinta-3">Sin eslogan</span>}
                  {p.color && (
                    <span className="inline-flex items-center gap-1.5 tabular-nums">
                      <span className="size-3 rounded-full ring-1 ring-tinta/15" style={{ background: p.color }} aria-hidden="true" />
                      {p.color.toUpperCase()}
                    </span>
                  )}
                </p>
              </div>
              <p className="text-right text-nota text-tinta-3">
                <span className="cifra block text-cifra-xs text-tinta">{numero(p.total_aspirantes)}</span>
                aspirante{p.total_aspirantes === 1 ? "" : "s"}
              </p>
              <div className="flex items-center">
                <BotonIcono etiqueta={`Editar ${p.nombre}`} icono="bi-pencil" onClick={() => setModal({ tipo: "editar", partido: p })} />
                <BotonIcono etiqueta={`Eliminar ${p.nombre}`} icono="bi-trash3" variante="peligro-suave" className="ml-4" onClick={() => eliminar(p)} />
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        abierto={!!modal}
        alCerrar={() => setModal(null)}
        titulo={modal ? titulos[modal.tipo][0] : ""}
        descripcion={modal ? titulos[modal.tipo][1] : ""}
      >
        {(modal?.tipo === "cne" || modal?.tipo === "wikidata") && (
          <Importar
            key={modal.tipo}
            fuente={modal.tipo}
            onImportados={(n) => cerrar(n === 1 ? "1 partido cargado" : `${numero(n)} partidos cargados`)}
          />
        )}
        {(modal?.tipo === "nuevo" || modal?.tipo === "editar") && (
          <FormPartido key={modal.partido?.id || "nuevo"} partido={modal.partido} onGuardado={cerrar} />
        )}
      </Modal>
    </>
  );
}
