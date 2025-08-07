import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Modal } from "bootstrap";
import { toast } from "react-toastify";
import Swal from 'sweetalert2';
import CrearVotanteForm from "../components/Votantes/CrearVotanteForm";
import EditarVotanteForm from "../components/Votantes/EditarVotanteForm";

export default function VotantesPage() {
  const { usuario } = useAuth();

  const [votantes, setVotantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [busqueda, setBusqueda] = useState("");
  const [activo, setActivo] = useState("");

  const modalRef = useRef();
  const [votanteAEditar, setVotanteAEditar] = useState(null);

  const abrirModalCrear = () => {
    setVotanteAEditar(null);
    const modal = new Modal(modalRef.current);
    modal.show();
  };

  const abrirModalEditar = (votante) => {
    setVotanteAEditar(votante);
    const modal = new Modal(modalRef.current);
    modal.show();
  };

  const cargarVotantes = async (pagina = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      const query = new URLSearchParams({
        page: pagina,
        limit: 10,
        busqueda,
        activo,
      });

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/votantes/filtrar?${query}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("No autorizado");

      const result = await res.json();
      setVotantes(result.data || []);
      setTotalPages(result.totalPages || 1);
      setPage(result.page || 1);
    } catch (error) {
      console.error("Error al cargar votantes:", error);
      setVotantes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarVotantes(page);
  }, [page]);

  const aplicarFiltro = () => {
    setPage(1);
    cargarVotantes(1);
  };

  const limpiarFiltros = () => {
    setBusqueda("");
    setActivo("");
    setPage(1);
    cargarVotantes(1);
  };

  const eliminarVotante = async (id) => {
    const confirmar = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el votante permanentemente',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });
    if (!confirmar.isConfirmed) return;

    try {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/votantes/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (res.ok) {
      setVotantes((prev) => prev.filter((v) => v.id !== id));
      Swal.fire('✅ Eliminado', 'El votante fue eliminado correctamente.', 'success');
    } else {
      Swal.fire('❌ Error', 'No se pudo eliminar el votante.', 'error');
    }
  } catch (err) {
    console.error("Error al eliminar votante:", err);
    Swal.fire('⚠️ Error', 'Ocurrió un error inesperado.', 'error');
  }
  };

  const exportarExcel = () => {
    const data = votantes.map((v) => ({
      Nombre: v.nombre_completo,
      Cédula: v.cedula,
      Teléfono: v.telefono,
      Barrio: v.barrio_nombre,
      Municipio: v.municipio_nombre,
      Concejo: v.concejo_nombre || "N/A",
      Alcaldía: v.alcaldia_nombre || "N/A",
      Lider: v.lider_nombre || "N/A"
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, worksheet, "Votantes");

    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "votantes.xlsx");
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text("Lista de Votantes", 14, 16);

    autoTable(doc, {
      startY: 20,
      head: [["Nombre", "Cédula", "Teléfono", "Barrio", "Municipio"]],
      body: votantes.map((v) => [
        v.nombre_completo,
        v.cedula,
        v.telefono,
        v.barrio_nombre,
        v.municipio_nombre,
        v.concejo_nombre || v.alcaldia_nombre || "N/A",
        v.lider_nombre || "N/A"
      ]),
    });

    doc.save("votantes.pdf");
  };

  return (
    <>
      <h2 className="mb-4">📋 Lista de Votantes</h2>

      <div className="row mb-3">
        <div className="col-md-4">
          <label>Buscar por Nombre o Cédula</label>
          <input
            className="form-control"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className="col-md-2">
          <label>Activo</label>
          <select
            className="form-select"
            value={activo}
            onChange={(e) => setActivo(e.target.value)}
          >
            <option value="">-- Todos --</option>
            <option value="true">Sí</option>
            <option value="false">No</option>
          </select>
        </div>

        <div className="col-md-6 d-flex align-items-end gap-2">
          <button className="btn btn-secondary" onClick={aplicarFiltro}>
            🔍 Filtrar
          </button>
          <button className="btn btn-outline-dark" onClick={limpiarFiltros}>
            Limpiar
          </button>
          <button className="btn btn-outline-success btn-sm" onClick={exportarExcel}>
                    📄 Excel
                </button>
                <button className="btn btn-outline-danger btn-sm" onClick={exportarPDF}>
                    🧾 PDF
                </button>
          <button className="btn btn-primary ms-auto" onClick={abrirModalCrear}>
            <i className="bi bi-plus-circle me-1"></i> Nuevo Votante
          </button>
        </div>
      </div>

      {loading ? (
        <p>Cargando votantes...</p>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-bordered table-hover table-striped">
              <thead className="table-dark">
                <tr>
                  <th>Cédula</th>
                  <th>Nombre del Votante</th>
                  <th>Teléfono</th>
                  <th>Barrio</th>
                  <th>Ciudad</th>
                  <th>Aspirante Concejo</th>
                  <th>Lider</th>

                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {votantes.map((v) => (
                  <tr key={v.id}>
                    <td>{v.cedula}</td>
                    <td>{v.nombre_completo}</td>
                    <td>{v.telefono}</td>
                    <td>{v.barrio_nombre}</td>
                    <td>{v.municipio_nombre}</td>
                    <td>{v.concejo_nombre}</td>
                    <td>{v.lider_nombre}</td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-warning me-2"
                        onClick={() => abrirModalEditar(v)}
                      >
                        <i className="bi bi-pencil-square"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => eliminarVotante(v.id)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {votantes.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center">
                      No hay votantes registrados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="d-flex justify-content-between align-items-center mt-3">
            <button
              className="btn btn-primary"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
            >
              ← Anterior
            </button>

            <span className="fw-bold">
              Página {page} de {totalPages}
            </span>

            <button
              className="btn btn-primary"
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
            >
              Siguiente →
            </button>
          </div>
        </>
      )}

      {/* Modal para crear/editar votante */}
      <div
        className="modal fade"
        tabIndex="-1"
        ref={modalRef}
        id="modalVotante"
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {votanteAEditar ? "Editar Votante" : "Registrar Nuevo Votante"}
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            {console.log("Votante a editar:", votanteAEditar)}
            <div className="modal-body">

              {votanteAEditar ? (
                <EditarVotanteForm
                  votante={votanteAEditar}
                  onVotanteActualizado={() => {
                    cargarVotantes(page);
                    const modal = Modal.getInstance(modalRef.current);
                    modal.hide();
                    toast.success("✅ Votante actualizado con éxito");
                  }}
                />
              ) : (
                <CrearVotanteForm
                  onVotanteCreado={() => {
                    cargarVotantes(page);
                    const modal = Modal.getInstance(modalRef.current);
                    modal.hide();
                    toast.success("✅ Votante creado con éxito");
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
