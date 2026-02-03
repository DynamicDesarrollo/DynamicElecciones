import { useState, useEffect } from "react";
import { useRef } from "react";
import { Modal } from "bootstrap";
import CrearUsuarioForm from "../components/Usuarios/CrearUsuarioForm";

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const modalRef = useRef();
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
      <div
        className="modal fade"
        tabIndex="-1"
        ref={modalRef}
        id="modalUsuario"
        style={{ display: mostrarModal ? 'block' : 'none' }}
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Crear Usuario</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" onClick={() => setMostrarModal(false)} />
            </div>
            <div className="modal-body">
              <CrearUsuarioForm
                onUsuarioCreado={() => {
                  setMostrarModal(false);
                  setRecargar(r => !r);
                  setForm({ nombre: "", correo: "", password: "", rol: "user" });
                  setError("");
                  setMensaje("");
                  setTimeout(() => {
                    document.body.classList.remove('modal-open');
                    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
                  }, 300);
                }}
                onCancel={() => {
                  setMostrarModal(false);
                  setTimeout(() => {
                    document.body.classList.remove('modal-open');
                    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
                  }, 300);
                }}
              />
            </div>
          </div>
        </div>
      </div>
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
