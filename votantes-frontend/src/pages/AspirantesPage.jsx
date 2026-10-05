import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { api, apiLista } from "../lib/api";
import { nombreCargo, plural } from "../lib/campana";
import { numero } from "../lib/formato";
import { Boton, BotonIcono } from "../ui/Boton";
import { Campo, Casilla, Entrada, Rejilla, Seleccion } from "../ui/Campo";
import { useConfirmar } from "../ui/Confirmar";
import { Modal } from "../ui/Modal";
import { Cargando, Encabezado, Insignia, Vacio } from "../ui/Pagina";

const FORM_VACIO = {
  nombre_completo: "",
  cedula: "",
  telefono: "",
  direccion: "",
  barrio: "",
  fecha_nace: "",
  partido_id: "",
  municipio_id: "",
  coalicion: false,
};

// Ficha fija de cada aspirante: lo que aporta y si ya tiene acceso
function Ficha({ a }) {
  return (
    <dl className="flex gap-6 text-right">
      <div>
        <dt className="rotulo text-tinta-3">Líderes</dt>
        <dd className="cifra mt-1 text-cifra-xs">{numero(a.total_lideres)}</dd>
      </div>
      <div>
        <dt className="rotulo text-tinta-3">Votantes</dt>
        <dd className="cifra mt-1 text-cifra-xs">{numero(a.total_votantes)}</dd>
      </div>
    </dl>
  );
}

function FormAspirante({ aspirante, partidos, municipios, onGuardado }) {
  const [form, setForm] = useState(() =>
    aspirante
      ? {
          ...Object.fromEntries(Object.keys(FORM_VACIO).map((k) => [k, aspirante[k] ?? FORM_VACIO[k]])),
          fecha_nace: aspirante.fecha_nace ? aspirante.fecha_nace.slice(0, 10) : "",
        }
      : FORM_VACIO
  );
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const guardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    const { ok, data } = await api(aspirante ? `/aspirantes/${aspirante.id}` : "/aspirantes", {
      method: aspirante ? "PUT" : "POST",
      body: form,
    });
    setGuardando(false);
    if (!ok) return setError(data?.error || "No se pudo guardar el aspirante");
    onGuardado(aspirante ? "Aspirante actualizado" : "Aspirante registrado");
  };

  return (
    <form onSubmit={guardar} className="flex flex-col gap-5">
      {error && <p className="rounded-md bg-error-suave px-4 py-3 text-cuerpo font-[560] text-error" role="alert">{error}</p>}
      <Rejilla columnas={2}>
        <Campo etiqueta="Nombre completo" id="a-nombre" className="sm:col-span-2">
          <Entrada id="a-nombre" name="nombre_completo" value={form.nombre_completo} onChange={handleChange} required autoComplete="off" autoFocus />
        </Campo>
        <Campo etiqueta="Cédula" id="a-cedula">
          <Entrada id="a-cedula" name="cedula" value={form.cedula} onChange={handleChange} inputMode="numeric" />
        </Campo>
        <Campo etiqueta="Teléfono" id="a-tel">
          <Entrada id="a-tel" name="telefono" type="tel" inputMode="tel" value={form.telefono} onChange={handleChange} />
        </Campo>
        <Campo etiqueta="Partido" id="a-partido">
          <Seleccion id="a-partido" name="partido_id" value={form.partido_id} onChange={handleChange}>
            <option value="">Sin partido</option>
            {partidos.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </Seleccion>
        </Campo>
        <Campo etiqueta="Municipio" id="a-muni">
          <Seleccion id="a-muni" name="municipio_id" value={form.municipio_id} onChange={handleChange}>
            <option value="">Seleccione…</option>
            {municipios.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
          </Seleccion>
        </Campo>
        <Campo etiqueta="Dirección" id="a-dir">
          <Entrada id="a-dir" name="direccion" value={form.direccion} onChange={handleChange} />
        </Campo>
        <Campo etiqueta="Barrio" id="a-barrio">
          <Entrada id="a-barrio" name="barrio" value={form.barrio} onChange={handleChange} />
        </Campo>
        <Campo etiqueta="Fecha de nacimiento" id="a-fecha">
          <Entrada id="a-fecha" name="fecha_nace" type="date" value={form.fecha_nace} onChange={handleChange} />
        </Campo>
        {aspirante?.es_principal && (
          <div className="flex items-end">
            <Casilla id="a-coal" name="coalicion" etiqueta="Aspira en coalición" checked={form.coalicion} onChange={handleChange} />
          </div>
        )}
      </Rejilla>
      <div className="flex justify-end border-t border-filete pt-4">
        <Boton type="submit" cargando={guardando} className="max-sm:w-full max-sm:justify-center">Guardar</Boton>
      </div>
    </form>
  );
}

export default function AspirantesPage() {
  const { usuario } = useAuth();
  const campana = usuario?.campana;
  const cargoSecundario = nombreCargo(campana?.cargo_secundario);
  const confirmar = useConfirmar();

  const [aspirantes, setAspirantes] = useState(null);
  const [partidos, setPartidos] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [editando, setEditando] = useState(null); // aspirante, "nuevo" o null

  const cargar = () => apiLista("/aspirantes").then(setAspirantes);

  useEffect(() => {
    cargar();
    apiLista("/partidos").then(setPartidos);
    apiLista("/municipios").then(setMunicipios);
  }, [campana?.id]);

  const principal = aspirantes?.find((a) => a.es_principal);
  const secundarios = aspirantes?.filter((a) => !a.es_principal) || [];

  const eliminar = async (a) => {
    const ok = await confirmar({
      titulo: `¿Eliminar a ${a.nombre_completo}?`,
      texto: "Solo se puede eliminar si no tiene líderes, votantes ni usuarios.",
      accion: "Eliminar aspirante",
    });
    if (!ok) return;
    const res = await api(`/aspirantes/${a.id}`, { method: "DELETE" });
    if (!res.ok) return toast.error(res.data?.error || "No se pudo eliminar el aspirante");
    toast.success("Aspirante eliminado");
    cargar();
  };

  if (!aspirantes) return <Cargando texto="Cargando aspirantes…" />;

  return (
    <>
      <Encabezado
        titulo="Aspirantes"
        descripcion={
          campana?.cargo_secundario
            ? `El ${nombreCargo(campana.cargo_principal).toLowerCase()} encabeza la campaña y cada ${cargoSecundario.toLowerCase()} trae sus propios líderes y votantes.`
            : `Campaña de ${campana?.tipo_nombre}: un solo aspirante.`
        }
      >
        {campana?.cargo_secundario && (
          <Boton icono="bi-person-plus" onClick={() => setEditando("nuevo")}>Nuevo {cargoSecundario.toLowerCase()}</Boton>
        )}
      </Encabezado>

      {principal && (
        <section className="flex flex-col gap-5 rounded-lg bg-papel p-5 ring-1 ring-filete sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="min-w-0">
            <p className="titular text-nombre-sm uppercase leading-[0.9] sm:text-nombre">{principal.nombre_completo}</p>
            <p className="mt-2 text-cuerpo text-tinta-2">
              <span className="font-[650] text-tinta">{principal.cargo_nombre} principal</span>
              {principal.partido && <> · {principal.partido}</>}
              {principal.coalicion && <> · en coalición</>}
            </p>
          </div>
          <div className="flex items-center gap-4 max-sm:justify-between">
            <Ficha a={principal} />
            <BotonIcono etiqueta={`Editar a ${principal.nombre_completo}`} icono="bi-pencil" onClick={() => setEditando(principal)} variante="secundario" />
          </div>
        </section>
      )}

      {campana?.cargo_secundario && (
        <section className="mt-8">
          <h2 className="titular mb-3 text-seccion leading-none">
            {plural(cargoSecundario)} <span className="text-tinta-3">{secundarios.length}</span>
          </h2>
          <div className="rounded-lg bg-papel ring-1 ring-filete">
            {secundarios.length === 0 ? (
              <Vacio
                icono="bi-person-badge"
                titulo={`Aún no hay ${plural(cargoSecundario).toLowerCase()}`}
                texto={`Regístrelos para que cada uno tenga su usuario y vea solo a sus votantes.`}
              >
                <Boton icono="bi-person-plus" onClick={() => setEditando("nuevo")}>Nuevo {cargoSecundario.toLowerCase()}</Boton>
              </Vacio>
            ) : (
              <ul className="divide-y divide-filete">
                {secundarios.map((a) => (
                  <li key={a.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:gap-6 sm:px-6">
                    <div className="min-w-0 flex-1">
                      <p className="text-destacado font-[700]">{a.nombre_completo}</p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-nota text-tinta-2">
                        {a.partido || "Sin partido"}
                        {a.total_usuarios > 0 ? (
                          <Insignia icono="bi-person-check">{a.total_usuarios} usuario{a.total_usuarios > 1 ? "s" : ""}</Insignia>
                        ) : (
                          <Insignia tono="alerta" icono="bi-person-dash">Sin usuario</Insignia>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <Ficha a={a} />
                      <div className="flex items-center">
                        <BotonIcono etiqueta={`Editar a ${a.nombre_completo}`} icono="bi-pencil" onClick={() => setEditando(a)} />
                        <BotonIcono etiqueta={`Eliminar a ${a.nombre_completo}`} icono="bi-trash3" variante="peligro-suave" className="ml-4" onClick={() => eliminar(a)} />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      <Modal
        abierto={!!editando}
        alCerrar={() => setEditando(null)}
        titulo={editando === "nuevo" ? `Nuevo ${cargoSecundario.toLowerCase()}` : `Editar ${nombreCargo(editando?.cargo).toLowerCase()}`}
      >
        {editando && (
          <FormAspirante
            key={editando.id || "nuevo"}
            aspirante={editando === "nuevo" ? null : editando}
            partidos={partidos}
            municipios={municipios}
            onGuardado={(mensaje) => { toast.success(mensaje); setEditando(null); cargar(); }}
          />
        )}
      </Modal>
    </>
  );
}
