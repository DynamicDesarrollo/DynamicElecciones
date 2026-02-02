import { useState } from "react";

export default function CrearUsuarioForm({ onUsuarioCreado }) {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("admin");
  const [tipoAspirante, setTipoAspirante] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/usuarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, correo, password, rol, tipoAspirante })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Error al crear usuario");
        return;
      }
      onUsuarioCreado && onUsuarioCreado(data);
      setNombre(""); setCorreo(""); setPassword(""); setRol("admin"); setTipoAspirante("");
    } catch (err) {
      setError("Error de red o inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="needs-validation" noValidate>
      <h2 className="text-center mb-4"><i className="bi bi-person-circle fs-2 me-2"></i>Crear Usuario</h2>
      <div className="mb-3">
        <label className="form-label fw-semibold">Nombre</label>
        <input
          className="form-control"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          required
        />
      </div>
      <div className="mb-3">
        <label className="form-label fw-semibold">Correo</label>
        <input
          type="email"
          className="form-control"
          value={correo}
          onChange={e => setCorreo(e.target.value)}
          required
        />
      </div>
      <div className="mb-3">
        <label className="form-label fw-semibold">Contraseña</label>
        <input
          type="password"
          className="form-control"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
      </div>
      <div className="mb-3">
        <label className="form-label fw-semibold">Rol</label>
        <select
          className="form-select"
          value={rol}
          onChange={e => setRol(e.target.value)}
        >
          <option value="admin">Administrador</option>
          <option value="user">Usuario</option>
        </select>
      </div>
      <div className="mb-3">
        <label className="form-label fw-semibold">Tipo de Aspirante</label>
        <select
          className="form-select"
          value={tipoAspirante}
          onChange={e => setTipoAspirante(e.target.value)}
          required
        >
          <option value="">Seleccione...</option>
          <option value="senado">Aspirante al Senado</option>
          <option value="camara">Aspirante a la Cámara</option>
          <option value="alcaldia">Aspirante a la Alcaldía</option>
          <option value="concejo">Aspirante al Concejo</option>
            <option value="gobernacion">Aspirante a la Gobernación</option>
        </select>
      </div>
      {error && (
        <div className="alert alert-danger text-center py-2 mb-3">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary w-100 fw-bold"
      >
        {loading ? "Creando..." : "Crear Usuario"}
      </button>
    </form>
  );
}
