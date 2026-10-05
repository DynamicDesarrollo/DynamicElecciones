import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { api, apiLista } from "../lib/api";
import { esAdmin, nombreCargo } from "../lib/campana";
import { exportarExcel, exportarPDF } from "../lib/exportar";
import { numero } from "../lib/formato";
import LiderForm from "../components/Lideres/LiderForm";
import { Boton, BotonIcono } from "../ui/Boton";
import { Entrada } from "../ui/Campo";
import { useConfirmar } from "../ui/Confirmar";
import { Modal } from "../ui/Modal";
import { Cargando, Encabezado, Paginacion, Tabla, Vacio } from "../ui/Pagina";

const POR_PAGINA = 15;

export default function LideresPage() {
  const { usuario } = useAuth();
  const admin = esAdmin(usuario);
  const legado = usuario?.rol === "user";
  const confirmar = useConfirmar();

  const [lideres, setLideres] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  const [editando, setEditando] = useState(null); // líder, "nuevo" o null

  const cargar = async () => {
    setCargando(true);
    setLideres(await apiLista("/lideres"));
    setCargando(false);
  };

  useEffect(() => {
    cargar();
  }, [usuario?.campana?.id]);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return lideres;
    return lideres.filter((l) => l.nombre_completo.toLowerCase().includes(q) || (l.cedula || "").includes(q));
  }, [lideres, busqueda]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const visibles = filtrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);
  const totalVotantes = lideres.reduce((s, l) => s + (l.total_votantes || 0), 0);

  const eliminar = async (l) => {
    if (l.total_votantes > 0) {
      return toast.error(`${l.nombre_completo} tiene ${numero(l.total_votantes)} votantes. Páselos a otro líder antes de eliminarlo.`);
    }
    const ok = await confirmar({
      titulo: "¿Eliminar líder?",
      texto: `${l.nombre_completo} se borrará de la campaña. Esta acción no se puede deshacer.`,
      accion: "Eliminar líder",
    });
    if (!ok) return;
    const { ok: listo, data } = await api(`/lideres/${l.id}`, { method: "DELETE" });
    if (!listo) return toast.error(data?.error || "No se pudo eliminar el líder");
    toast.success("Líder eliminado");
    cargar();
  };

  const filasExportar = () =>
    filtrados.map((l) => ({
      Nombre: l.nombre_completo,
      Cédula: l.cedula || "",
      Teléfono: l.telefono || "",
      Municipio: l.municipio_nombre || "",
      Barrio: l.barrio_nombre || "",
      "A quién pertenece": l.direccion || "",
      Aspirante: l.aspirante_nombre || "",
      Votantes: l.total_votantes,
    }));

  const exportarPdf = async () => {
    const filas = filasExportar();
    await exportarPDF({
      titulo: "Líderes",
      columnas: Object.keys(filas[0] || { Nombre: "" }),
      filas: filas.map((f) => Object.values(f)),
      archivo: "lideres.pdf",
      orientacion: "landscape",
    });
  };

  return (
    <>
      <Encabezado
        titulo="Líderes"
        descripcion={`${numero(lideres.length)} líderes reúnen ${numero(totalVotantes)} votantes.`}
      >
        {!legado && lideres.length > 0 && (
          <>
            <Boton variante="secundario" icono="bi-file-earmark-spreadsheet" onClick={() => exportarExcel({ hoja: "Líderes", filas: filasExportar(), archivo: "lideres.xlsx" })}>
              Excel
            </Boton>
            <Boton variante="secundario" icono="bi-file-earmark-pdf" onClick={exportarPdf}>PDF</Boton>
          </>
        )}
        <Boton icono="bi-person-plus" onClick={() => setEditando("nuevo")}>Nuevo líder</Boton>
      </Encabezado>

      <div className="relative mb-4 sm:max-w-md">
        <i className="bi bi-search pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-tinta-3" aria-hidden="true" />
        <Entrada
          type="search"
          placeholder="Buscar por nombre o cédula"
          aria-label="Buscar líderes por nombre o cédula"
          value={busqueda}
          onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }}
          className="pl-10"
        />
      </div>

      {visibles.length > 0 && (
        <Tabla>
          <thead>
            <tr>
              <th>Líder</th>
              <th>Teléfono</th>
              <th>Barrio</th>
              <th>A quién pertenece</th>
              {admin && <th>Aspirante</th>}
              <th className="text-right">Votantes</th>
              <th className="w-[1%]"><span className="sr-only">Acciones</span></th>
            </tr>
          </thead>
          <tbody>
            {visibles.map((l) => (
              <tr key={l.id}>
                <td className="max-sm:!block max-sm:!text-left max-sm:pb-2">
                  <p className="font-[680]">{l.nombre_completo}</p>
                  {l.cedula && <p className="text-nota tabular-nums text-tinta-3">C.C. {numero(l.cedula)}</p>}
                </td>
                <td data-etiqueta="Teléfono" className="tabular-nums">{l.telefono || "—"}</td>
                <td data-etiqueta="Barrio">
                  <span>
                    {l.barrio_nombre || "—"}
                    {l.municipio_nombre && <span className="block text-nota text-tinta-3">{l.municipio_nombre}</span>}
                  </span>
                </td>
                <td data-etiqueta="Pertenece a">{l.direccion || "—"}</td>
                {admin && (
                  <td data-etiqueta="Aspirante">
                    <span>
                      {l.aspirante_nombre}
                      <span className="block text-nota text-tinta-3">{nombreCargo(l.aspirante_cargo)}</span>
                    </span>
                  </td>
                )}
                <td data-etiqueta="Votantes" className="text-right">
                  <span className="cifra text-cifra-xs">{numero(l.total_votantes)}</span>
                </td>
                <td className="max-sm:!justify-end max-sm:pt-2">
                  <div className="flex items-center justify-end">
                    <BotonIcono etiqueta={`Editar a ${l.nombre_completo}`} icono="bi-pencil" onClick={() => setEditando(l)} />
                    <BotonIcono etiqueta={`Eliminar a ${l.nombre_completo}`} icono="bi-trash3" variante="peligro-suave" className="ml-4" onClick={() => eliminar(l)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Tabla>
      )}

      {cargando && lideres.length === 0 && <Cargando texto="Cargando líderes…" />}
      {!cargando && visibles.length === 0 && (
        <div className="rounded-lg bg-papel ring-1 ring-filete">
          <Vacio
            icono="bi-megaphone"
            titulo={busqueda ? "Ningún líder coincide" : "Todavía no hay líderes"}
            texto={busqueda ? "Pruebe con otra parte del nombre o con la cédula." : "Los líderes agrupan votantes y definen a qué aspirante pertenecen."}
          >
            {!busqueda && <Boton icono="bi-person-plus" onClick={() => setEditando("nuevo")}>Nuevo líder</Boton>}
          </Vacio>
        </div>
      )}

      <Paginacion pagina={pagina} totalPaginas={totalPaginas} total={filtrados.length} porPagina={POR_PAGINA} alCambiar={setPagina} />

      <Modal abierto={!!editando} alCerrar={() => setEditando(null)} titulo={editando === "nuevo" ? "Nuevo líder" : "Editar líder"}>
        {editando && (
          <LiderForm
            key={editando.id || "nuevo"}
            lider={editando === "nuevo" ? null : editando}
            onGuardado={() => { setEditando(null); cargar(); }}
          />
        )}
      </Modal>
    </>
  );
}
