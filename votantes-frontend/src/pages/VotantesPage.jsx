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
  const [totalPaginas, setTotalPaginas] = useState(1);
  const votantesPorPagina = 10;
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroCedula, setFiltroCedula] = useState("");
  const [activo, setActivo] = useState("");
  const modalRef = useRef();
  const [votanteAEditar, setVotanteAEditar] = useState(null);

  const cargarVotantes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/votantes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!Array.isArray(data)) {
        setVotantes([]);
        setTotalPaginas(1);
        toast.error("❌ Error al cargar votantes: respuesta inválida");
        return;
      }
      const filtrados = data.filter((v) =>
        v.nombre_completo.toLowerCase().includes(filtroNombre.toLowerCase()) &&
        (v.cedula || "").toLowerCase().includes(filtroCedula.toLowerCase()) &&
        (activo === "" || String(v.activo) === activo)
      );
      setTotalPaginas(Math.ceil(filtrados.length / votantesPorPagina));
      setVotantes(filtrados.slice((page - 1) * votantesPorPagina, page * votantesPorPagina));
    } catch (err) {
      toast.error("❌ Error al cargar votantes");
      setVotantes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarVotantes();
  }, [page, filtroNombre, filtroCedula, activo]);

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
        `${import.meta.env.VITE_API_URL}/api/votantes/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.ok) {
        cargarVotantes();
        Swal.fire('✅ Eliminado', 'El votante fue eliminado correctamente.', 'success');
      } else {
        Swal.fire('❌ Error', 'No se pudo eliminar el votante.', 'error');
      }
    } catch (err) {
      console.error("Error al eliminar votante:", err);
      Swal.fire('⚠️ Error', 'Ocurrió un error inesperado.', 'error');
    }
  };

  // Exportación Excel y PDF: traen todo el dataset
  const exportarExcel = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/votantes/exportar-excel`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("No autorizado");
      const blob = await res.blob();
      saveAs(blob, "votantes.xlsx");
    } catch (err) {
      Swal.fire('⚠️ Error', 'No se pudo exportar el Excel.', 'error');
    }
  };

  const exportarPDF = async () => {
    try {
      const token = localStorage.getItem("token");
      // Traer todos los votantes sin paginación (limit muy alto)
      const query = new URLSearchParams({
        page: 1,
        limit: 1000000,
      });
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/votantes/filtrar?${query}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("No autorizado");
      const result = await res.json();
      const allVotantes = result.data || [];
      const doc = new jsPDF();
      doc.text("Lista de Votantes", 14, 16);
      autoTable(doc, {
        startY: 20,
        head: [["Nombre", "Cédula", "Teléfono", "Barrio", "Municipio", "Lider", "Dirección del Líder"]],
        body: allVotantes.map((v) => [
          v.nombre_completo,
          v.cedula,
          v.telefono,
          v.barrio_nombre,
          v.municipio_nombre,
          v.lider_nombre || "N/A",
          v.direccion_lider || "N/A"
        ]),
      });
      doc.save("votantes.pdf");
    } catch (err) {
      Swal.fire('⚠️ Error', 'No se pudo exportar el PDF.', 'error');
    }
  };

  if (!usuario) {
    return <div className="container mt-4 text-danger">❌ Usuario no autenticado</div>;
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">📋 Lista de Votantes</h2>
      <div className="row mb-3 align-items-end">
        {usuario?.rol === 'admin' && (
          <>
            <div className="col-md-4 mb-2">
              <input
                type="text"
                className="form-control"
                placeholder="🔍 Buscar por nombre"
                value={filtroNombre}
                onChange={(e) => {
                  setFiltroNombre(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="col-md-4 mb-2">
              <input
                type="text"
                className="form-control"
                placeholder="🔍 Buscar por cédula"
                value={filtroCedula}
                onChange={(e) => {
                  setFiltroCedula(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </>
        )}
        <div className="col-md-2 mb-2">
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
        <div className="col-md-2 d-flex justify-content-end gap-2 mb-2">
          <button className="btn btn-success" onClick={abrirModalCrear}>
            <i className="bi bi-person-plus me-2"></i> Nuevo Prospecto Votante
          </button>
          <button
            className="btn btn-outline-success btn-sm"
            onClick={exportarExcel}
            disabled={usuario?.rol === 'user'}
            title={usuario?.rol === 'user' ? 'Exportación deshabilitada para usuarios' : ''}
          >
            📄 Excel
          </button>
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={exportarPDF}
            disabled={usuario?.rol === 'user'}
            title={usuario?.rol === 'user' ? 'Exportación deshabilitada para usuarios' : ''}
          >
            🧾 PDF
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
                  {usuario?.rol === 'admin' && <th>Lider</th>}
                  {usuario?.rol === 'admin' && <th>A quien pertenece</th>}
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {votantes.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center">
                      No hay votantes registrados
                    </td>
                  </tr>
                ) : (
                  votantes.map((v) => (
                    <tr key={v.id}>
                      <td>{v.cedula}</td>
                      <td>{v.nombre_completo}</td>
                      <td>{v.telefono}</td>
                      <td>{v.barrio_nombre}</td>
                      <td>{v.municipio_nombre}</td>
                      {usuario?.rol === 'admin' && <td>{v.lider_nombre}</td>}
                      {usuario?.rol === 'admin' && <td>{v.direccion_lider || '—'}</td>}
                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-warning me-2"
                          title="Editar"
                          onClick={() => abrirModalEditar(v)}
                        >
                          <i className="bi bi-pencil-square"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          title="Eliminar"
                          onClick={() => eliminarVotante(v.id)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="d-flex justify-content-center align-items-center mt-3 gap-3">
            <button
              className="btn btn-primary"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
            >
              ← Anterior
            </button>
            <span className="fw-bold text-primary">
              Página {page} de {totalPaginas}
            </span>
            <button
              className="btn btn-primary"
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPaginas))}
              disabled={page === totalPaginas}
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
            <div className="modal-body">
              {votanteAEditar ? (
                <EditarVotanteForm
                  votante={votanteAEditar}
                  onVotanteActualizado={() => {
                    cargarVotantes();
                    const modal = Modal.getInstance(modalRef.current);
                    modal.hide();
                    toast.success("✅ Votante actualizado con éxito");
                  }}
                />
              ) : (
                <CrearVotanteForm
                  onVotanteCreado={() => {
                    cargarVotantes();
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
    </div>
  );
}
