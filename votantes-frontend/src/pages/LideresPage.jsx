// Forzar build Vercel - intento 2
// Forzar commit y push - build definitivo
// Forzar build Vercel 2026-02-02
// Forzar commit y push - 2026-02-02
// Forzar redeploy Vercel - 2026-02-02
// Cambio menor para forzar redeploy en Vercel

import { useAuth } from "../context/AuthContext";
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
  const { usuario } = useAuth();
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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/lideres`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      // Validar que la respuesta sea un array antes de usar .filter
      if (!Array.isArray(data)) {
        setLideres([]);
        setTotalPaginas(1);
        toast.error("❌ Error al cargar líderes: respuesta inválida");
        return;
      }

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
    if (!usuario) return;
    cargarLideres();
  }, [usuario, page, filtroNombre, filtroCedula]);

  const eliminarLider = async (id) => {
    const confirmar = await Swal.fire({
      title: '¿Desea eliminar este líder?',
      text: 'Esta acción eliminará el líder permanentemente',
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
        `${import.meta.env.VITE_API_URL}/api/lideres/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        cargarLideres();
        Swal.fire('✅ Eliminado', 'El líder fue eliminado correctamente.', 'success');
      } else {
        Swal.fire('❌ Error', 'No se pudo eliminar el líder.', 'error');
      }
    } catch (err) {
      console.error("Error al eliminar líder:", err);
      Swal.fire('⚠️ Error', 'Ocurrió un error inesperado.', 'error');
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

  if (!usuario) {
    return <div className="container mt-4 text-danger">❌ Usuario no autenticado</div>;
  }

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
                  <td>{l.municipio_nombre || "—"}</td>
                  <td>{l.telefono || "—"}</td>
                  <td>{l.barrio_nombre || "—"}</td>
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
                  setLiderAEditar(null); // Limpiar estado de edición
                  const modal = Modal.getInstance(modalCrearRef.current);
                  setTimeout(() => {
                    modal.hide();
                    toast.success("✅ Líder creado exitosamente");
                  }, 150); // Pequeño delay para asegurar refresco visual
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
