import { useState, useEffect } from "react";
import { useRef } from "react";
import { Modal } from "bootstrap";
import CrearAspiranteForm from "../components/Aspirantes/CrearAspiranteForm";

export default function AspirantesPage() {
    const [mostrarModal, setMostrarModal] = useState(false);
    const modalRef = useRef();
  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    tipo_aspirante: "",
    partido: "",
    municipio: ""
  });
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [aspirantes, setAspirantes] = useState([]);
  const [recargar, setRecargar] = useState(false);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/aspirantes`)
      .then(res => res.json())
      .then(data => setAspirantes(Array.isArray(data) ? data : []));
  }, [recargar]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMensaje("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/aspirantes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear aspirante");
      setMensaje("Aspirante creado correctamente");
      setForm({ nombre: "", correo: "", telefono: "", tipo_aspirante: "", partido: "", municipio: "" });
      setRecargar(r => !r);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este aspirante?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/aspirantes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar");
      setRecargar(r => !r);
    } catch (err) {
      alert("No se pudo eliminar");
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Aspirantes</h2>
        <button className="btn btn-success" onClick={() => {
          setMostrarModal(true);
          setTimeout(() => {
            if (modalRef.current) {
              const modal = new Modal(modalRef.current);
              modal.show();
            }
          }, 100);
        }}>
          <i className="bi bi-person-plus me-2"></i> Crear Aspirante
        </button>
      </div>
      <div
        className="modal fade"
        tabIndex="-1"
        ref={modalRef}
        id="modalAspirante"
        style={{ display: mostrarModal ? 'block' : 'none' }}
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Crear Aspirante</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" onClick={() => {
                setMostrarModal(false);
                setTimeout(() => {
                  if (modalRef.current) {
                    const modal = Modal.getInstance(modalRef.current);
                    if (modal) modal.hide();
                  }
                }, 100);
              }} />
            </div>
            <div className="modal-body">
              <CrearAspiranteForm
                onAspiranteCreado={() => {
                  setMostrarModal(false);
                  setRecargar(r => !r);
                  setForm({ nombre: "", correo: "", telefono: "", tipo_aspirante: "", partido: "", municipio: "" });
                  setError("");
                  setMensaje("");
                  setTimeout(() => {
                    if (modalRef.current) {
                      const modal = Modal.getInstance(modalRef.current);
                      if (modal) modal.hide();
                    }
                  }, 100);
                }}
                onCancel={() => {
                  setMostrarModal(false);
                  setTimeout(() => {
                    if (modalRef.current) {
                      const modal = Modal.getInstance(modalRef.current);
                      if (modal) modal.hide();
                    }
                  }, 100);
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <hr className="my-5" />
      <h3 className="mb-3">Lista de Aspirantes</h3>
      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Correo</th>
              <th>Teléfono</th>
              <th>Partido</th>
              <th>Municipio</th>
              <th style={{minWidth:120}}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {aspirantes.length === 0 && (
              <tr><td colSpan={7} className="text-center">No hay aspirantes registrados</td></tr>
            )}
            {aspirantes.map(a => (
              <tr key={a.id}>
                <td>{a.nombre}</td>
                <td>{a.tipo_aspirante}</td>
                <td>{a.correo}</td>
                <td>{a.telefono}</td>
                <td>{a.partido}</td>
                <td>{a.municipio}</td>
                <td>
                  {/* Botón editar (no implementado aún) */}
                  <button className="btn btn-sm btn-warning me-2" disabled title="Editar próximamente">
                    <i className="bi bi-pencil"></i>
                  </button>
                  {/* Botón eliminar */}
                  <button className="btn btn-sm btn-danger" onClick={() => handleEliminar(a.id)}>
                    <i className="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
