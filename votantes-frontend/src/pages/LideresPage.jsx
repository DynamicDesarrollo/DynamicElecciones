import { useEffect, useState, useRef } from "react";
import { Modal } from "bootstrap";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import CrearLiderForm from "../components/Lideres/CrearLiderForm";
import EditarLiderForm from "../components/Lideres/EditarLiderForm";

export default function LideresPage() {
  const [lideres, setLideres] = useState([]);
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroCedula, setFiltroCedula] = useState("");
  const [page, setPage] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const lideresPorPagina = 10;

  const [liderAEditar, setLiderAEditar] = useState(null);

  const modalCrearRef = useRef();
  const modalEditarRef = useRef();

  const cargarLideres = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/lideres`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      const filtrados = data.filter((l) =>
        l.nombre_completo.toLowerCase().includes(filtroNombre.toLowerCase()) &&
        (l.cedula || "").toLowerCase().includes(filtroCedula.toLowerCase())
      );

      setTotalPaginas(Math.ceil(filtrados.length / lideresPorPagina));
      setLideres(
        filtrados.slice((page - 1) * lideresPorPagina, page * lideresPorPagina)
      );
    } catch (err) {
      toast.error("❌ Error al cargar líderes");
      console.error(err);
    }
  };

  useEffect(() => {
    cargarLideres();
  }, [page, filtroNombre, filtroCedula]);

  const eliminarLider = async (id) => {
    const confirmacion = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esto eliminará al líder permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!confirmacion.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/lideres/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast.success("🗑️ Líder eliminado correctamente");
        cargarLideres();
      } else {
        toast.error("❌ No se pudo eliminar el líder");
      }
    } catch (err) {
      toast.error("❌ Error al eliminar líder");
      console.error(err);
    }
  };

  const exportarExcel = () => {
    const datos = lideres.map((l) => ({
      Nombre: l.nombre_completo,
      Cédula: l.cedula,
      Municipio: l.municipio,
      Teléfono: l.telefono,
      Barrio: l.barrio,
    }));
    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Lideres");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "lideres.xlsx");
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text("Líderes", 14, 15);
    const rows = lideres.map((l) => [
      l.nombre_completo,
      l.cedula,
      l.municipio,
      l.telefono,
      l.barrio,
    ]);
    autoTable(doc,{
      head: [["Nombre", "Cédula", "Municipio", "Teléfono", "Barrio"]],
      body: rows,
      startY: 20,
      styles: { fontSize: 8 },
    });
    doc.save("lideres.pdf");
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>👥 Líderes</h3>
        <button
          className="btn btn-primary"
          data-bs-toggle="modal"
          data-bs-target="#modalCrearLider"
        >
          <i className="bi bi-plus-circle me-2"></i>Nuevo Líder
        </button>
      </div>

      <div className="row mb-3 align-items-end">
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
        <div className="col-md-4 d-flex justify-content-end gap-2 mb-2">
          <button className="btn btn-outline-success btn-sm" onClick={exportarExcel}>
            📄 Excel
          </button>
          <button className="btn btn-outline-danger btn-sm" onClick={exportarPDF}>
            🧾 PDF
          </button>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-hover table-bordered">
          <thead className="table-dark">
            <tr>
              <th>Nombre</th>
              <th>Cédula</th>
              <th>Municipio</th>
              <th>Teléfono</th>
              <th>Barrio</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {lideres.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center">
                  No hay resultados
                </td>
              </tr>
            ) : (
              lideres.map((l) => (
                <tr key={l.id}>
                  <td>{l.nombre_completo}</td>
                  <td>{l.cedula || "—"}</td>
                  <td>{l.municipio || "—"}</td>
                  <td>{l.telefono || "—"}</td>
                  <td>{l.barrio || "—"}</td>
                  <td className="text-center">
                    <button
                      className="btn btn-sm btn-warning me-2"
                      title="Editar"
                      onClick={() => {
                        setLiderAEditar(l);
                        const modal = new Modal(modalEditarRef.current);
                        modal.show();
                      }}
                    >
                      <i className="bi bi-pencil-square"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      title="Eliminar"
                      onClick={() => eliminarLider(l.id)}
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

      {/* Modal crear */}
      <div
        className="modal fade"
        id="modalCrearLider"
        tabIndex="-1"
        aria-hidden="true"
        ref={modalCrearRef}
      >
        <div className="modal-dialog modal-lg modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Nuevo Líder</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" />
            </div>
            <div className="modal-body">
              <CrearLiderForm
                onLiderCreado={() => {
                  cargarLideres();
                  const modal = Modal.getInstance(modalCrearRef.current);
                  modal.hide();
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modal editar */}
      <div
        className="modal fade"
        id="modalEditarLider"
        tabIndex="-1"
        aria-hidden="true"
        ref={modalEditarRef}
      >
        <div className="modal-dialog modal-lg modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Editar Líder</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" />
            </div>
            <div className="modal-body">
              {liderAEditar && (
                <EditarLiderForm
                  lider={liderAEditar}
                  onLiderActualizado={() => {
                    cargarLideres();
                    const modal = Modal.getInstance(modalEditarRef.current);
                    modal.hide();
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
