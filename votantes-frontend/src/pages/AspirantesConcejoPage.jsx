import { useEffect, useState, useRef } from "react";
import { Modal } from "bootstrap";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import CrearAspiranteForm from "../components/Aspirantes/CrearAspiranteForm";
import EditarAspiranteForm from "../components/Aspirantes/EditarAspiranteForm";

export default function AspirantesConcejoPage() {
    const [aspirantes, setAspirantes] = useState([]);
    const [filtroNombre, setFiltroNombre] = useState("");
    const [filtroCedula, setFiltroCedula] = useState("");
    const [page, setPage] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const aspirantesPorPagina = 10;

    const [aspiranteAEditar, setAspiranteAEditar] = useState(null);

    const modalCrearRef = useRef();
    const modalEditarRef = useRef();

    const cargarAspirantes = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/concejo`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();

            const filtrados = Array.isArray(data) ? data.filter((a) =>
                a.nombre_completo.toLowerCase().includes(filtroNombre.toLowerCase()) &&
                (a.cedula || "").toLowerCase().includes(filtroCedula.toLowerCase())
            ) : [];

            setTotalPaginas(Math.ceil(filtrados.length / aspirantesPorPagina));
            setAspirantes(
                filtrados.slice((page - 1) * aspirantesPorPagina, page * aspirantesPorPagina)
            );
        } catch (err) {
            toast.error("❌ Error al cargar aspirantes");
            console.error(err);
        }
    };

    useEffect(() => {
        cargarAspirantes();
    }, [page, filtroNombre, filtroCedula]);

    const eliminarAspirante = async (id) => {
        const confirmacion = await Swal.fire({
            title: "¿Estás seguro?",
            text: "Esto eliminará al aspirante permanentemente.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        });

        if (!confirmacion.isConfirmed) return;

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/concejo/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                toast.success("🗑️ Aspirante eliminado correctamente");
            } else if (res.status === 404) {
                toast.warning("El aspirante ya no existe. Refrescando lista...");
            } else {
                toast.error("❌ No se pudo eliminar el aspirante");
            }
            cargarAspirantes();
        } catch (err) {
            toast.error("❌ Error al eliminar aspirante");
            console.error(err);
            cargarAspirantes();
        }
    };

    const exportarExcel = () => {
        const datos = aspirantes.map((a) => ({
            Nombre: a.nombre_completo,
            Cédula: a.cedula,
            Partido: a.partido,
            Municipio: a.municipio,
            "Apoya a": a.alcalde_apoyado,
            Teléfono: a.telefono,
        }));
        const ws = XLSX.utils.json_to_sheet(datos);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Aspirantes");
        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(blob, "aspirantes_concejo.xlsx");
    };

    const exportarPDF = () => {
        const doc = new jsPDF();
        doc.text("Aspirantes al Concejo", 14, 15);
        const rows = aspirantes.map((a) => [
            a.nombre_completo,
            a.cedula,
            a.partido,
            a.municipio,
            a.alcalde_apoyado,
            a.telefono,
        ]);
        autoTable(doc, {
            head: [["Nombre", "Cédula", "Partido", "Municipio", "Apoya a", "Teléfono"]],
            body: rows,
            startY: 20,
            styles: { fontSize: 8 },
        });
        doc.save("aspirantes_concejo.pdf");
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h3>🧑‍💼 Aspirantes al Concejo</h3>
                <button
                    className="btn btn-primary"
                    data-bs-toggle="modal"
                    data-bs-target="#modalCrearAspirante"
                >
                    <i className="bi bi-plus-circle me-2"></i>Nuevo Aspirante
                </button>
            </div>

            {/* Filtros + exportar */}
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
                {/* Botones de exportación */}
                <div className="col-md-4 d-flex justify-content-end gap-2 mb-2">
                    <button className="btn btn-outline-success btn-sm" onClick={exportarExcel}>
                        📄 Excel
                    </button>
                    <button className="btn btn-outline-danger btn-sm" onClick={exportarPDF}>
                        🧾 PDF
                    </button>
                </div>
            </div>
            {/* Tabla */}
            <div className="table-responsive">
                <table className="table table-hover table-bordered">
                    <thead className="table-dark">
                        <tr>
                            <th>Nombre</th>
                            <th>Cédula</th>
                            <th>Partido</th>
                            <th>Municipio</th>
                            <th>Apoya a</th>
                            <th>Teléfono</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {aspirantes.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="text-center">
                                    No hay resultados
                                </td>
                            </tr>
                        ) : (
                            aspirantes.map((a) => (
                                <tr key={a.id}>
                                    <td>{a.nombre_completo}</td>
                                    <td>{a.cedula || "—"}</td>
                                    <td>{a.partido || "—"}</td>
                                    <td>{a.municipio || "—"}</td>
                                    <td>{a.alcalde_apoyado || "—"}</td>
                                    <td>{a.telefono || "—"}</td>
                                    <td className="text-center">
                                        <button
                                            className="btn btn-sm btn-warning me-2"
                                            title="Editar"
                                            onClick={() => {
                                                setAspiranteAEditar(a);
                                                const modal = new Modal(modalEditarRef.current);
                                                modal.show();
                                            }}
                                        >
                                            <i className="bi bi-pencil-square"></i>
                                        </button>
                                        <button
                                            className="btn btn-sm btn-danger"
                                            title="Eliminar"
                                            onClick={() => {
                                                console.log("Intentando eliminar:", a);
                                                eliminarAspirante(a.id);
                                            }}
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

            {/* Paginador */}
            <div className="d-flex justify-content-between align-items-center mt-3">
                <button
                    className="btn btn-primary"
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                >
                    ← Anterior
                </button>
                <span className="fw-bold">
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
                id="modalCrearAspirante"
                tabIndex="-1"
                aria-hidden="true"
                ref={modalCrearRef}
            >
                <div className="modal-dialog modal-lg modal-dialog-scrollable">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Nuevo Aspirante al Concejo</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" />
                        </div>
                        <div className="modal-body">
                            <CrearAspiranteForm
                                onAspiranteCreado={() => {
                                    cargarAspirantes();
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
                id="modalEditarAspirante"
                tabIndex="-1"
                aria-hidden="true"
                ref={modalEditarRef}
            >
                <div className="modal-dialog modal-lg modal-dialog-scrollable">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Editar Aspirante</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" />
                        </div>
                        <div className="modal-body">
                            {aspiranteAEditar && (
                                <EditarAspiranteForm
                                    aspirante={aspiranteAEditar}
                                    onAspiranteActualizado={() => {
                                        cargarAspirantes();
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
