import { useState, useEffect } from "react";
import ModalPortal from "../components/ModalPortal";

export default function AspirantesPage() {
    const [mostrarModal, setMostrarModal] = useState(false);
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
        <button className="btn btn-success" onClick={() => setMostrarModal(true)}>
          <i className="bi bi-person-plus me-2"></i> Crear Aspirante
        </button>
      </div>
      {mostrarModal && (
        <ModalPortal key={"modal-aspirante"} onClose={() => {
          setMostrarModal(false);
          setForm({ nombre: "", correo: "", telefono: "", tipo_aspirante: "", partido: "", municipio: "" });
          setError("");
          setMensaje("");
        }}>
          <h2 className="mb-4">Registrar Aspirante</h2>
          <form className="card p-4 mx-auto border-0 shadow-none" style={{maxWidth: 500}} onSubmit={e => {handleSubmit(e); if (!error) setMostrarModal(false);}}>
            <div className="mb-3">
              <label className="form-label">Nombre</label>
              <input className="form-control" name="nombre" value={form.nombre} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Correo</label>
              <input className="form-control" name="correo" value={form.correo} onChange={handleChange} type="email" required />
            </div>
            <div className="mb-3">
              <label className="form-label">Teléfono</label>
              <input className="form-control" name="telefono" value={form.telefono} onChange={handleChange} />
            </div>
            <div className="mb-3">
              <label className="form-label">Tipo de Aspirante</label>
              <select className="form-select" name="tipo_aspirante" value={form.tipo_aspirante} onChange={handleChange} required>
                <option value="">Seleccione...</option>
                <option value="senado">Senado</option>
                <option value="camara">Cámara</option>
                <option value="alcaldia">Alcaldía</option>
                <option value="concejo">Concejo</option>
                <option value="gobernacion">Gobernación</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Partido</label>
              <select className="form-select" name="partido" value={form.partido} onChange={handleChange} required>
                <option value="">Seleccione...</option>
                <option value="Partido de la U">Partido de la U</option>
                <option value="Colombia Renaciente">Colombia Renaciente</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Municipio</label>
              <input className="form-control" name="municipio" value={form.municipio} onChange={handleChange} />
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
            {mensaje && <div className="alert alert-success">{mensaje}</div>}
            <button className="btn btn-primary w-100" type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Registrar Aspirante"}
            </button>
          </form>
        </ModalPortal>
      )}
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
