import { useState, useEffect } from "react";
import ModalPortal from "../components/ModalPortal";

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [form, setForm] = useState({ nombre: "", correo: "", password: "", rol: "user" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [recargar, setRecargar] = useState(false);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/usuarios`)
      .then(res => res.json())
      .then(data => setUsuarios(Array.isArray(data) ? data : []));
  }, [recargar]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMensaje("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/usuarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear usuario");
      setMensaje("Usuario creado correctamente");
      setForm({ nombre: "", correo: "", password: "", rol: "user" });
      setRecargar(r => !r);
      setMostrarModal(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Usuarios</h2>
        <button className="btn btn-success" onClick={() => setMostrarModal(true)}>
          <i className="bi bi-person-plus me-2"></i> Crear Usuario
        </button>
      </div>
      {mostrarModal && (
        <ModalPortal key={"modal-usuario"} onClose={() => {
          setMostrarModal(false);
          setForm({ nombre: "", correo: "", password: "", rol: "user" });
          setError("");
          setMensaje("");
        }}>
          <h2 className="mb-4">Registrar Usuario</h2>
          <form className="card p-4 mx-auto border-0 shadow-none" style={{maxWidth: 500}} onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Nombre</label>
              <input className="form-control" name="nombre" value={form.nombre} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Correo</label>
              <input className="form-control" name="correo" value={form.correo} onChange={handleChange} type="email" required />
            </div>
            <div className="mb-3">
              <label className="form-label">Contraseña</label>
              <input className="form-control" name="password" value={form.password} onChange={handleChange} type="password" required />
            </div>
            <div className="mb-3">
              <label className="form-label">Rol</label>
              <select className="form-select" name="rol" value={form.rol} onChange={handleChange} required>
                <option value="user">Usuario</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
            {mensaje && <div className="alert alert-success">{mensaje}</div>}
            <button className="btn btn-primary w-100" type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Registrar Usuario"}
            </button>
          </form>
        </ModalPortal>
      )}
      <hr className="my-5" />
      <h3 className="mb-3">Lista de Usuarios</h3>
      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.length === 0 && (
              <tr><td colSpan={3} className="text-center">No hay usuarios registrados</td></tr>
            )}
            {usuarios.map(u => (
              <tr key={u.id}>
                <td>{u.nombre}</td>
                <td>{u.correo}</td>
                <td>{u.rol}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
