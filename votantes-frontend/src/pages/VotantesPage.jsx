import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { esAdmin, nombreCargo } from "../lib/campana";
import { descargarArchivo, exportarPDF } from "../lib/exportar";
import { numero } from "../lib/formato";
import VotanteForm from "../components/Votantes/VotanteForm";
import { Boton, BotonIcono } from "../ui/Boton";
import { Entrada, Seleccion } from "../ui/Campo";
import { useConfirmar } from "../ui/Confirmar";
import { Modal } from "../ui/Modal";
import { Cargando, Encabezado, Insignia, Paginacion, Tabla, Vacio } from "../ui/Pagina";

const POR_PAGINA = 15;

export default function VotantesPage() {
  const { usuario } = useAuth();
  const admin = esAdmin(usuario);
  const legado = usuario?.rol === "user";
  const confirmar = useConfirmar();

  const [votantes, setVotantes] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [pagina, setPagina] = useState(1);
  const [busqueda, setBusqueda] = useState("");
  const [busquedaAplicada, setBusquedaAplicada] = useState("");
  const [activo, setActivo] = useState("");
  const [editando, setEditando] = useState(null); // votante, "nuevo" o null

  // Espera a que la persona deje de escribir antes de buscar
  useEffect(() => {
    const t = setTimeout(() => {
      setBusquedaAplicada(busqueda.trim());
      setPagina(1);
    }, 300);
    return () => clearTimeout(t);
  }, [busqueda]);

  const cargar = async () => {
    setCargando(true);
    const query = new URLSearchParams({ page: pagina, limit: POR_PAGINA, busqueda: busquedaAplicada, activo });
    const { ok, data } = await api(`/votantes?${query}`);
    setCargando(false);
    if (!ok) return toast.error(data?.error || "No se pudieron cargar los votantes");
    setVotantes(data.data);
    setTotal(data.total);
    setTotalPaginas(Math.max(1, data.totalPages));
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagina, busquedaAplicada, activo, usuario?.campana?.id]);

  const eliminar = async (v) => {
    const ok = await confirmar({
      titulo: "¿Eliminar votante?",
      texto: `${v.nombre_completo} (cédula ${v.cedula}) se borrará de la campaña. Esta acción no se puede deshacer.`,
      accion: "Eliminar votante",
    });
    if (!ok) return;
    const res = await api(`/votantes/${v.id}`, { method: "DELETE" });
    if (!res.ok) return toast.error(res.data?.error || "No se pudo eliminar el votante");
    toast.success("Votante eliminado");
    cargar();
  };

  const exportarExcel = async () => {
    try {
      await descargarArchivo("/votantes/exportar-excel", "votantes.xlsx");
    } catch {
      toast.error("No se pudo exportar el Excel");
    }
  };

  const exportarPdf = async () => {
    const query = new URLSearchParams({ page: 1, limit: 100000, busqueda: busquedaAplicada, activo });
    const { ok, data } = await api(`/votantes?${query}`);
    if (!ok) return toast.error("No se pudo generar el PDF");
    await exportarPDF({
      titulo: "Votantes",
      columnas: ["Nombre", "Cédula", "Teléfono", "Barrio", "Municipio", "Líder", "Aspirante"],
      filas: data.data.map((v) => [v.nombre_completo, v.cedula, v.telefono || "", v.barrio_nombre || "", v.municipio_nombre || "", v.lider_nombre || "", v.aspirante_nombre || ""]),
      archivo: "votantes.pdf",
      orientacion: "landscape",
    });
  };

  const alGuardar = () => {
    toast.success(editando === "nuevo" ? "Votante registrado" : "Votante actualizado");
    setEditando(null);
    cargar();
  };

  const filtrando = busquedaAplicada || activo;

  return (
    <>
      <Encabezado
        titulo="Votantes"
        descripcion={`${numero(total)} ${filtrando ? "encontrados" : "votantes registrados"}${!admin && usuario?.nombre_aspirante ? ` con ${usuario.nombre_aspirante}` : ""}.`}
      >
        {!legado && (
          <>
            <Boton variante="secundario" icono="bi-file-earmark-spreadsheet" onClick={exportarExcel}>Excel</Boton>
            <Boton variante="secundario" icono="bi-file-earmark-pdf" onClick={exportarPdf}>PDF</Boton>
          </>
        )}
        <Boton icono="bi-person-plus" onClick={() => setEditando("nuevo")}>Nuevo votante</Boton>
      </Encabezado>

      <div className="mb-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px]">
        <div className="relative">
          <i className="bi bi-search pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-tinta-3" aria-hidden="true" />
          <Entrada
            type="search"
            placeholder="Buscar por nombre o cédula"
            aria-label="Buscar votantes por nombre o cédula"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-10"
          />
        </div>
        <Seleccion aria-label="Filtrar por estado" value={activo} onChange={(e) => { setActivo(e.target.value); setPagina(1); }}>
          <option value="">Todos los estados</option>
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
        </Seleccion>
      </div>

      {votantes.length > 0 && (
        <Tabla>
          <thead>
            <tr>
              <th>Votante</th>
              <th>Teléfono</th>
              <th>Barrio</th>
              <th>Líder</th>
              {admin && <th>Aspirante</th>}
              <th className="w-[1%]"><span className="sr-only">Acciones</span></th>
            </tr>
          </thead>
          <tbody>
            {votantes.map((v) => (
              <tr key={v.id}>
                <td className="max-sm:!block max-sm:!text-left max-sm:pb-2">
                  <p className="font-[680]">
                    {v.nombre_completo}
                    {v.activo === false && <span className="ml-2 align-middle"><Insignia>Inactivo</Insignia></span>}
                  </p>
                  <p className="text-[13px] tabular-nums text-tinta-3">C.C. {numero(v.cedula)}</p>
                </td>
                <td data-etiqueta="Teléfono" className="tabular-nums">{v.telefono || "—"}</td>
                <td data-etiqueta="Barrio">
                  <span>
                    {v.barrio_nombre || "—"}
                    {v.municipio_nombre && <span className="block text-[13px] text-tinta-3">{v.municipio_nombre}</span>}
                  </span>
                </td>
                <td data-etiqueta="Líder">
                  <span>
                    {v.lider_nombre || <span className="text-tinta-3">Sin líder</span>}
                    {v.direccion_lider && <span className="block text-[13px] text-tinta-3">{v.direccion_lider}</span>}
                  </span>
                </td>
                {admin && (
                  <td data-etiqueta="Aspirante">
                    <span>
                      {v.aspirante_nombre}
                      <span className="block text-[13px] text-tinta-3">{nombreCargo(v.aspirante_cargo)}</span>
                    </span>
                  </td>
                )}
                <td className="max-sm:!justify-end max-sm:pt-2">
                  <div className="flex items-center justify-end">
                    <BotonIcono etiqueta={`Editar a ${v.nombre_completo}`} icono="bi-pencil" onClick={() => setEditando(v)} />
                    <BotonIcono etiqueta={`Eliminar a ${v.nombre_completo}`} icono="bi-trash3" variante="peligro-suave" className="ml-4" onClick={() => eliminar(v)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Tabla>
      )}

      {cargando && votantes.length === 0 && <Cargando texto="Cargando votantes…" />}
      {!cargando && votantes.length === 0 && (
        <div className="rounded-lg bg-papel ring-1 ring-filete">
          <Vacio
            icono="bi-people"
            titulo={filtrando ? "Ningún votante coincide" : "Todavía no hay votantes"}
            texto={filtrando ? "Pruebe con otra parte del nombre o con la cédula completa." : "Registre el primero; el sistema lo asigna a su aspirante según el líder."}
          >
            {!filtrando && <Boton icono="bi-person-plus" onClick={() => setEditando("nuevo")}>Nuevo votante</Boton>}
          </Vacio>
        </div>
      )}

      <Paginacion pagina={pagina} totalPaginas={totalPaginas} total={total} porPagina={POR_PAGINA} alCambiar={setPagina} />

      <Modal
        abierto={!!editando}
        alCerrar={() => setEditando(null)}
        titulo={editando === "nuevo" ? "Nuevo votante" : "Editar votante"}
        ancho="sm:max-w-3xl"
      >
        {editando && (
          <VotanteForm key={editando.id || "nuevo"} votante={editando === "nuevo" ? null : editando} onGuardado={alGuardar} />
        )}
      </Modal>
    </>
  );
}
