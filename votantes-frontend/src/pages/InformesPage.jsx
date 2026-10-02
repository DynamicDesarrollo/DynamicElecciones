import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { apiLista } from "../lib/api";
import { exportarExcel, exportarPDF } from "../lib/exportar";
import { fechaHora, numero } from "../lib/formato";
import { Boton } from "../ui/Boton";
import { Cargando, Cifras, Encabezado, Paginacion, Vacio } from "../ui/Pagina";

const VISTAS = {
  votantes: {
    nombre: "Votantes repetidos",
    ruta: "/informes/votantes-duplicados",
    descripcion: "La misma cédula registrada bajo más de un aspirante, o dos veces. Solo usted lo ve; los aspirantes no.",
    vacio: "Ninguna cédula está repetida en la campaña.",
  },
  asistencias: {
    nombre: "Asistencias repetidas",
    ruta: "/informes/asistencias-duplicadas",
    descripcion: "Votantes con más de una asistencia registrada el día E.",
    vacio: "Ningún votante tiene asistencia repetida.",
  },
};

const POR_PAGINA = 12;

export default function InformesPage() {
  const { usuario } = useAuth();
  const [vista, setVista] = useState("votantes");
  const [datos, setDatos] = useState(null);
  const [pagina, setPagina] = useState(1);

  useEffect(() => {
    setDatos(null);
    setPagina(1);
    apiLista(VISTAS[vista].ruta).then(setDatos);
  }, [vista, usuario?.campana?.id]);

  // Agrupa las filas por cédula
  const grupos = useMemo(() => {
    const mapa = new Map();
    (datos || []).forEach((d) => {
      if (!mapa.has(d.cedula)) mapa.set(d.cedula, { cedula: d.cedula, nombre: d.nombre_completo, filas: [] });
      mapa.get(d.cedula).filas.push(d);
    });
    return [...mapa.values()];
  }, [datos]);

  const visibles = grupos.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  const filasExportar = () =>
    (datos || []).map((d) =>
      vista === "votantes"
        ? { Cédula: d.cedula, Nombre: d.nombre_completo, Aspirante: d.nombre_aspirante || "", Líder: d.nombre_lider || "" }
        : { Cédula: d.cedula, Nombre: d.nombre_completo, "Puesto de control": d.puesto_control || "", Fecha: fechaHora(d.fecha_registro), Aspirante: d.nombre_aspirante || "" }
    );

  const exportarPdf = async () => {
    const filas = filasExportar();
    try {
      await exportarPDF({
        titulo: VISTAS[vista].nombre,
        columnas: Object.keys(filas[0]),
        filas: filas.map((f) => Object.values(f)),
        archivo: `${vista}-repetidos.pdf`,
      });
    } catch {
      toast.error("No se pudo generar el PDF");
    }
  };

  return (
    <>
      <Encabezado titulo="Duplicados" descripcion={VISTAS[vista].descripcion}>
        {datos?.length > 0 && (
          <>
            <Boton variante="secundario" icono="bi-file-earmark-spreadsheet" onClick={() => exportarExcel({ hoja: "Duplicados", filas: filasExportar(), archivo: `${vista}-repetidos.xlsx` })}>
              Excel
            </Boton>
            <Boton variante="secundario" icono="bi-file-earmark-pdf" onClick={exportarPdf}>PDF</Boton>
          </>
        )}
      </Encabezado>

      <div role="tablist" aria-label="Tipo de informe" className="mb-5 inline-flex rounded-lg bg-tinta/[0.06] p-1">
        {Object.entries(VISTAS).map(([clave, v]) => (
          <button
            key={clave}
            role="tab"
            type="button"
            aria-selected={vista === clave}
            onClick={() => setVista(clave)}
            className={`h-10 rounded-md px-4 text-[15px] font-[620] transition-colors duration-150 ${
              vista === clave ? "bg-papel text-tinta shadow-[0_1px_2px_rgb(18_20_23/0.12)]" : "text-tinta-2 hover:text-tinta"
            }`}
          >
            {v.nombre}
          </button>
        ))}
      </div>

      {!datos ? (
        <Cargando texto="Revisando cédulas…" />
      ) : grupos.length === 0 ? (
        <div className="rounded-lg bg-papel ring-1 ring-filete">
          <Vacio icono="bi-check2-circle" titulo="Sin duplicados" texto={VISTAS[vista].vacio} />
        </div>
      ) : (
        <>
          <Cifras
            className="mb-6"
            items={[
              { etiqueta: "Cédulas repetidas", valor: grupos.length },
              { etiqueta: vista === "votantes" ? "Registros involucrados" : "Asistencias involucradas", valor: datos.length },
            ]}
          />
          <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {visibles.map((g) => (
              <li key={g.cedula} className="rounded-lg bg-papel ring-1 ring-filete">
                <div className="flex items-baseline justify-between gap-4 border-b border-filete px-5 py-4">
                  <div className="min-w-0">
                    <p className="truncate text-[17px] font-[700]">{g.nombre}</p>
                    <p className="text-[13px] tabular-nums text-tinta-3">C.C. {numero(g.cedula)}</p>
                  </div>
                  <span className="cifra shrink-0 text-[1.9rem]">×{g.filas.length}</span>
                </div>
                <ul className="divide-y divide-filete">
                  {g.filas.map((f, i) => (
                    <li key={i} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-5 py-3 text-[15px]">
                      {vista === "votantes" ? (
                        <>
                          <span className="font-[620]">{f.nombre_aspirante || "Sin aspirante"}</span>
                          <span className="text-tinta-2">{f.nombre_lider ? `Líder ${f.nombre_lider}` : "Sin líder"}</span>
                        </>
                      ) : (
                        <>
                          <span className="font-[620]">{f.puesto_control}</span>
                          <span className="tabular-nums text-tinta-2">{fechaHora(f.fecha_registro)}</span>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
          <Paginacion pagina={pagina} totalPaginas={Math.ceil(grupos.length / POR_PAGINA)} total={grupos.length} porPagina={POR_PAGINA} alCambiar={setPagina} />
        </>
      )}
    </>
  );
}
