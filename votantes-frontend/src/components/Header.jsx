import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";

export default function Header() {
  const { usuario, logout } = useAuth();
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);

  const [form, setForm] = useState({
    nombre: usuario?.nombre || "",
    correo: usuario?.correo || "",
    contraseña: "",
    rol: usuario?.rol || "aspirante"
  });

  const handleLogout = () => {
    logout();
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const guardarUsuario = async (e) => {
    e.preventDefault();
    try {
      const url = modoEdicion
        ? `${import.meta.env.VITE_API_URL}/usuarios/${usuario.id}`
        : `${import.meta.env.VITE_API_URL}/usuarios`;

      const method = modoEdicion ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${usuario.token}`
        },
        body: JSON.stringify(form)
      });

      if (!res.ok) throw new Error("Error al guardar usuario");
      Swal.fire("Éxito", `Usuario ${modoEdicion ? "actualizado" : "creado"} correctamente`, "success");
      setMostrarModal(false);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo guardar el usuario", "error");
    }
  };

  return (
    <header className="bg-dark text-white d-flex justify-content-between align-items-center px-3 py-2">
      <h5>🗳️ Sistema de Votantes</h5>

      <div className="dropdown">
        <button
          className="btn btn-dark dropdown-toggle d-flex align-items-center"
          id="dropdownUser"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <img
            src={usuario?.foto || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
            alt="avatar"
            className="rounded-circle me-2"
            style={{ width: "35px", height: "35px", objectFit: "cover" }}
          />
          <span>{usuario?.nombre || "Usuario"}</span>
        </button>

        <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownUser">
          <li>
            <button
              className="dropdown-item"
              onClick={() => {
                setModoEdicion(true);
                setForm({
                  nombre: usuario?.nombre,
                  correo: usuario?.correo,
                  contraseña: "",
                  rol: usuario?.rol
                });
                setMostrarModal(true);
              }}
            >
              Editar mi usuario
            </button>
          </li>
          {usuario?.rol === "admin" && (
            <li>
              <button
                className="dropdown-item"
                onClick={() => {
                  setModoEdicion(false);
                  setForm({ nombre: "", correo: "", contraseña: "", rol: "aspirante" });
                  setMostrarModal(true);
                }}
              >
                Crear usuario
              </button>
            </li>
          )}
          <li><hr className="dropdown-divider" /></li>
          <li>
            <button className="dropdown-item text-danger" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </li>
        </ul>
      </div>

      {/* Modal para crear/editar usuario */}
      {mostrarModal && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <form onSubmit={guardarUsuario}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    {modoEdicion ? "Editar Usuario" : "Crear Usuario"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setMostrarModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <input
                    type="text"
                    name="nombre"
                    className="form-control mb-2"
                    placeholder="Nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    required
                  />
                  <input
                    type="email"
                    name="correo"
                    className="form-control mb-2"
                    placeholder="Correo"
                    value={form.correo}
                    onChange={handleChange}
                    required
                  />
                  <input
                    type="password"
                    name="contraseña"
                    className="form-control mb-2"
                    placeholder="Contraseña"
                    value={form.contraseña}
                    onChange={handleChange}
                    required={!modoEdicion}
                  />
                  <select
                    name="rol"
                    className="form-select"
                    value={form.rol}
                    onChange={handleChange}
                  >
                    <option value="aspirante">Aspirante al Concejo</option>
                    <option value="aspirante_alcaldia">Aspirante a la Alcaldía</option>
                    <option value="lider">Líder</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setMostrarModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {modoEdicion ? "Guardar cambios" : "Crear"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
