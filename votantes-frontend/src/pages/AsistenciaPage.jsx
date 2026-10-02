import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { exportarPDF } from "../lib/exportar";
import { fechaHora, numero, porcentaje } from "../lib/formato";
import { Boton } from "../ui/Boton";
import { Campo, Entrada } from "../ui/Campo";
import { Cifras, Encabezado } from "../ui/Pagina";

const CLAVE_PUESTO = "dynamic.puestoControl";

// Recuerda el puesto de control en este dispositivo para no reescribirlo con cada votante
const leerPuesto = () => {
  try {
    return localStorage.getItem(CLAVE_PUESTO) || "";
  } catch {
    return "";
  }
};
const guardarPuesto = (valor) => {
  try {
    localStorage.setItem(CLAVE_PUESTO, valor);
  } catch {
    /* almacenamiento bloqueado: el puesto solo dura esta sesión */
  }
};

function Dato({ etiqueta, children }) {
  return (
    <div>
      <dt className="rotulo text-tinta-3">{etiqueta}</dt>
      <dd className="mt-1 text-[16px] font-[620]">{children || "—"}</dd>
    </div>
  );
}

export default function AsistenciaPage() {
  const { usuario } = useAuth();
  const [cedula, setCedula] = useState("");
  const [votante, setVotante] = useState(null);
  const [noEncontrado, setNoEncontrado] = useState(null);
  const [buscando, setBuscando] = useState(false);
  const [puesto, setPuesto] = useState(leerPuesto);
  // Con un puesto ya guardado, el campo se muestra compacto para dejar la confirmación a la vista
  const [editandoPuesto, setEditandoPuesto] = useState(() => !leerPuesto());
  const [confirmando, setConfirmando] = useState(false);
  const [confirmado, setConfirmado] = useState(null); // último votante confirmado
  const [resumen, setResumen] = useState({ total: 0, asistieron: 0 });
  const entradaRef = useRef(null);

  const cargarResumen = useCallback(async () => {
    const [vt, as] = await Promise.all([api("/votantes/total"), api("/asistencia/resumen")]);
    setResumen({
      total: vt.ok ? vt.data.total : 0,
      asistieron: as.ok ? as.data.total_asistencias : 0,
    });
  }, []);

  // El conteo se actualiza solo cada 15 segundos
  useEffect(() => {
    cargarResumen();
    const intervalo = setInterval(cargarResumen, 15000);
    return () => clearInterval(intervalo);
  }, [cargarResumen, usuario?.campana?.id]);

  const buscar = async (e) => {
    e?.preventDefault();
    const valor = cedula.replace(/\D/g, "");
    if (valor.length < 5) {
      setNoEncontrado("Escriba la cédula completa, sin puntos.");
      return;
    }
    setBuscando(true);
    setVotante(null);
    setNoEncontrado(null);
    setConfirmado(null);
    const { ok, status, data } = await api(`/asistencia?cedula=${encodeURIComponent(valor)}`);
    setBuscando(false);
    if (status === 404) return setNoEncontrado(`La cédula ${numero(valor)} no está registrada en la campaña.`);
    if (!ok) return toast.error(data?.error || "No se pudo buscar el votante");
    setVotante(data);
  };

  const confirmar = async () => {
    if (!puesto.trim()) {
      setEditandoPuesto(true);
      toast.warning("Escriba el puesto de control antes de confirmar");
      return;
    }
    setConfirmando(true);
    const { ok, data } = await api("/asistencia", {
      method: "POST",
      body: { votante_uuid: votante.id, puesto_control: puesto.trim() },
    });
    setConfirmando(false);
    if (!ok) return toast.error(data?.error || "No se pudo registrar la asistencia");
    guardarPuesto(puesto.trim());
    setEditandoPuesto(false);
    setConfirmado(votante);
    setVotante(null);
    setCedula("");
    cargarResumen();
    entradaRef.current?.focus();
  };

  const faltan = Math.max(0, resumen.total - resumen.asistieron);

  const exportar = () =>
    exportarPDF({
      titulo: "Asistencia día E",
      columnas: ["Concepto", "Total"],
      filas: [
        ["Votantes", numero(resumen.total)],
        ["Asistieron", `${numero(resumen.asistieron)} (${porcentaje(resumen.asistieron, resumen.total)})`],
        ["Faltan", numero(faltan)],
      ],
      archivo: "asistencia.pdf",
    });

  return (
    <div className="flex flex-col">
      <Encabezado titulo="Asistencia día E" descripcion="Busque la cédula y confirme que el votante llegó.">
        <Boton variante="secundario" icono="bi-file-earmark-pdf" onClick={exportar} className="max-sm:hidden">Exportar</Boton>
      </Encabezado>

      {/* En celular, la búsqueda y la confirmación van primero; las cifras después */}
      <Cifras
        className="max-sm:order-3 max-sm:mt-6"
        items={[
          { etiqueta: "Asistieron", valor: resumen.asistieron, detalle: `${porcentaje(resumen.asistieron, resumen.total)} del total` },
          { etiqueta: "Faltan", valor: faltan },
          { etiqueta: "Votantes", valor: resumen.total },
        ]}
      />

      <div className="mt-6 grid grid-cols-1 gap-6 max-sm:order-2 max-sm:mt-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <form onSubmit={buscar} className="rounded-lg bg-papel p-5 ring-1 ring-filete sm:p-6">
          <label htmlFor="cedula-asistencia" className="condensada block text-[1.6rem] leading-none">Cédula del votante</label>
          <div className="mt-4 flex gap-2">
            <input
              id="cedula-asistencia"
              ref={entradaRef}
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              inputMode="numeric"
              autoComplete="off"
              autoFocus
              placeholder="Ej. 1067845123"
              aria-invalid={!!noEncontrado}
              className="cifra h-16 min-w-0 flex-1 rounded-md bg-papel px-4 text-[2rem] ring-1 ring-inset ring-filete-fuerte placeholder:text-[1.25rem] placeholder:font-[500] placeholder:text-tinta-3 focus:outline-none focus:ring-2 focus:ring-campana"
            />
            <Boton type="submit" cargando={buscando} className="h-16 px-5 text-[17px]" icono="bi-search">
              <span className="max-sm:sr-only">Buscar</span>
            </Boton>
          </div>
          {noEncontrado && <p className="mt-3 text-[15px] font-[560] text-error" role="alert">{noEncontrado}</p>}

          {editandoPuesto ? (
            <Campo etiqueta="Puesto de control" id="puesto" ayuda="Queda guardado en este dispositivo." className="mt-6">
              <Entrada id="puesto" value={puesto} onChange={(e) => setPuesto(e.target.value)} placeholder="Ej. Colegio San José, entrada norte" />
            </Campo>
          ) : (
            <p className="mt-4 flex flex-wrap items-center gap-x-2 text-[15px] text-tinta-2">
              <i className="bi bi-geo-alt" aria-hidden="true" />
              Puesto: <strong className="font-[650] text-tinta">{puesto}</strong>
              <button type="button" onClick={() => setEditandoPuesto(true)} className="inline-flex min-h-11 items-center font-[620] text-tinta underline">
                Cambiar
              </button>
            </p>
          )}
        </form>

        <section aria-live="polite" className="min-h-[260px]">
          {votante ? (
            <div className="overflow-hidden rounded-lg bg-papel ring-1 ring-filete animate-aparecer">
              <div className="border-b border-dashed border-filete-fuerte px-5 py-5 sm:px-6">
                <p className="condensada text-[2.25rem] uppercase leading-[0.92]">{votante.nombre_completo}</p>
                <p className="mt-1.5 text-[15px] tabular-nums text-tinta-2">C.C. {numero(votante.cedula)}</p>
              </div>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-4 px-5 py-5 sm:grid-cols-3 sm:px-6">
                <Dato etiqueta="Lugar">{votante.lugar_nombre}</Dato>
                <Dato etiqueta="Mesa"><span className="cifra text-[1.6rem]">{votante.mesa_numero || "—"}</span></Dato>
                <Dato etiqueta="Zona">{votante.zona}</Dato>
                <Dato etiqueta="Barrio">{votante.barrio_nombre}</Dato>
                <Dato etiqueta="Municipio">{votante.municipio_nombre}</Dato>
                <Dato etiqueta="Teléfono">{votante.telefono}</Dato>
              </dl>
              {votante.fecha_asistencia && (
                <p className="mx-5 mb-4 rounded-md bg-alerta-suave px-4 py-3 text-sm text-alerta sm:mx-6">
                  <i className="bi bi-exclamation-triangle mr-1.5" aria-hidden="true" />
                  Ya se registró el {fechaHora(votante.fecha_asistencia)} en {votante.puesto_control}. Confirme solo si es otro puesto.
                </p>
              )}
              <div className="border-t border-filete bg-fondo/60 px-5 py-4 sm:px-6">
                <Boton onClick={confirmar} cargando={confirmando} icono="bi-check2-circle" className="h-14 w-full justify-center text-[17px]">
                  Confirmar asistencia
                </Boton>
              </div>
            </div>
          ) : confirmado ? (
            <div className="flex h-full flex-col items-center justify-center rounded-lg bg-voto px-6 py-10 text-center text-tinta animate-aparecer">
              <svg viewBox="0 0 28 40" className="h-14 w-10" aria-hidden="true">
                <path d="M0 0h28v40l-14-8-14 8z" fill="#121417" />
                <path d="M7 15l5 5 9-10" fill="none" stroke="#FFD23F" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="condensada mt-4 text-[3rem] uppercase leading-none">Votó</p>
              <p className="mt-2 text-[17px] font-[680]">{confirmado.nombre_completo}</p>
              <p className="mt-1 text-sm">Asistencia número <span className="cifra text-[1.25rem]">{numero(resumen.asistieron)}</span>. Lista la siguiente cédula.</p>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center rounded-lg border border-dashed border-filete-fuerte px-6 py-10 text-center">
              <i className="bi bi-person-vcard text-[2rem] text-tinta-3" aria-hidden="true" />
              <p className="mt-3 text-[17px] font-[680]">Aquí aparece el votante</p>
              <p className="mt-1 max-w-[36ch] text-[15px] text-tinta-2">Con su lugar y mesa, para confirmar en un toque.</p>
            </div>
          )}
        </section>
      </div>

      <Boton variante="secundario" icono="bi-file-earmark-pdf" onClick={exportar} className="order-4 mt-4 justify-center sm:hidden">
        Exportar resumen
      </Boton>
    </div>
  );
}
