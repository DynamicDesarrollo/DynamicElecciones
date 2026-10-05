import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { api, apiLista } from "../lib/api";
import { esAdmin, nombreCargo, plural, territorio } from "../lib/campana";
import { exportarPDF } from "../lib/exportar";
import { numero, porcentaje } from "../lib/formato";
import { Boton } from "../ui/Boton";
import { Cifras, Encabezado, Lamina, Vacio } from "../ui/Pagina";

// Fila de un desglose: nombre, barra proporcional en tinta y cifra
function FilaDesglose({ nombre, detalle, total, maximo, totalGeneral, cabeza }) {
  const ancho = maximo ? Math.max(2, (total / maximo) * 100) : 0;
  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-x-4 gap-y-2 py-3.5">
      <div className="min-w-0">
        <p className={cabeza ? "titular text-subseccion uppercase leading-none" : "truncate text-base font-[680]"}>{nombre}</p>
        {detalle && <p className="text-nota text-tinta-3">{detalle}</p>}
      </div>
      <p className="text-right">
        <span className="cifra text-cifra-sm">{numero(total)}</span>
        <span className="ml-2 text-nota font-[600] text-tinta-3">{porcentaje(total, totalGeneral)}</span>
      </p>
      <div className="col-span-2 h-2 overflow-hidden rounded-full bg-tinta/[0.07]">
        <div
          className="h-full rounded-full bg-tinta transition-[width] duration-700 ease-[var(--ease-salida)]"
          style={{ width: `${ancho}%` }}
        />
      </div>
    </li>
  );
}

// Desglose en forma de plantel: la cabeza de la campaña primero y aparte, luego el resto por aporte
function Desglose({ titulo, descripcion, filas, totalGeneral, rotuloResto }) {
  const maximo = Math.max(0, ...filas.map((f) => f.total));
  const cabeza = filas.find((f) => f.cabeza);
  const resto = filas.filter((f) => !f.cabeza);
  return (
    <Lamina titulo={titulo} descripcion={descripcion}>
      {filas.length === 0 ? (
        <Vacio icono="bi-bar-chart" titulo="Aún no hay votantes" texto="El desglose aparece en cuanto se registre el primero." />
      ) : (
        <>
          {cabeza && (
            <ol className="-mt-3.5 mb-2 border-b border-filete-fuerte">
              <FilaDesglose {...cabeza} maximo={maximo} totalGeneral={totalGeneral} />
            </ol>
          )}
          {cabeza && resto.length > 0 && rotuloResto && <p className="rotulo mt-4 text-tinta-3">{rotuloResto}</p>}
          <ol className={`divide-y divide-filete ${cabeza ? "" : "-mt-3.5"} -mb-3.5`}>
            {resto.map((f) => (
              <FilaDesglose key={f.nombre} {...f} maximo={maximo} totalGeneral={totalGeneral} />
            ))}
          </ol>
        </>
      )}
    </Lamina>
  );
}

export default function DashboardPage() {
  const { usuario } = useAuth();
  const admin = esAdmin(usuario);
  const campana = usuario?.campana;
  const [resumen, setResumen] = useState(null);
  const [asistencias, setAsistencias] = useState(0);
  const [porPartido, setPorPartido] = useState([]);
  const [porAspirante, setPorAspirante] = useState([]);

  useEffect(() => {
    if (!campana) return;
    api("/reportes/dashboard").then(({ ok, data }) => ok && setResumen(data));
    api("/asistencia/resumen").then(({ ok, data }) => ok && setAsistencias(data.total_asistencias || 0));
    if (admin) {
      apiLista("/reportes/votantesporpartido").then(setPorPartido);
      apiLista("/reportes/votantesporaspirante").then(setPorAspirante);
    }
  }, [campana, admin]);

  const total = resumen?.total_votantes || 0;

  const filasAspirante = porAspirante.map((a) => ({
    nombre: a.aspirante,
    detalle: nombreCargo(a.cargo),
    total: a.total,
    cabeza: a.cargo === campana?.cargo_principal,
  }));
  const filasPartido = porPartido.map((p) => ({ nombre: p.partido, total: Number(p.total) }));

  const exportar = async () => {
    try {
      await exportarPDF({
        titulo: `Resumen · ${campana.nombre}`,
        subtitulo: `${campana.tipo_nombre} · ${territorio(campana)} · ${new Date().toLocaleString("es-CO")}`,
        columnas: ["Concepto", "Total"],
        filas: [
          ["Votantes", numero(total)],
          ["Líderes con votantes", numero(resumen?.total_lideres)],
          ["Barrios", numero(resumen?.total_barrios)],
          ["Asistieron el día E", `${numero(asistencias)} (${porcentaje(asistencias, total)})`],
          ...filasAspirante.map((a) => [`${a.detalle} ${a.nombre}`, numero(a.total)]),
        ],
        archivo: "resumen-campana.pdf",
      });
    } catch {
      toast.error("No se pudo generar el PDF");
    }
  };

  const titulo = !admin && usuario?.nombre_aspirante ? usuario.nombre_aspirante : "Resumen";
  const descripcion = !admin && usuario?.nombre_aspirante
    ? `Sus votantes como ${nombreCargo(usuario.cargo_aspirante).toLowerCase()} en ${campana?.nombre}.`
    : `${campana?.tipo_nombre} · ${territorio(campana)}`;

  return (
    <>
      <Encabezado titulo={titulo} descripcion={descripcion}>
        <Boton variante="secundario" icono="bi-file-earmark-pdf" onClick={exportar} disabled={!resumen}>
          Exportar PDF
        </Boton>
      </Encabezado>

      <Cifras
        items={[
          { etiqueta: "Votantes", valor: total },
          { etiqueta: "Líderes activos", valor: resumen?.total_lideres ?? 0, detalle: "con al menos un votante" },
          { etiqueta: "Barrios", valor: resumen?.total_barrios ?? 0 },
          { etiqueta: "Asistieron", valor: asistencias, detalle: total ? `${porcentaje(asistencias, total)} de los votantes` : "el día de la elección" },
        ]}
      />

      {admin && (
        <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <Desglose
            titulo="Por aspirante"
            descripcion="Cuántos votantes aporta cada uno a la campaña."
            filas={filasAspirante}
            totalGeneral={total}
            rotuloResto={campana?.cargo_secundario ? plural(nombreCargo(campana.cargo_secundario)) : null}
          />
          <Desglose
            titulo="Por partido"
            descripcion="Según el partido de cada aspirante."
            filas={filasPartido}
            totalGeneral={total}
          />
        </div>
      )}
    </>
  );
}
