import { useState } from "react";

export default function CrearUsuarioForm({ onUsuarioCreado }) {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("admin");
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
        body: JSON.stringify({ nombre, correo, password, rol })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Error al crear usuario");
        return;
      }
      onUsuarioCreado && onUsuarioCreado(data);
      setNombre(""); setCorreo(""); setPassword(""); setRol("admin");
    } catch (err) {
      setError("Error de red o inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-2xl p-6 space-y-4"
    >
      <h2 className="text-center text-2xl font-bold text-gray-800 mb-2">
        👤 Crear Usuario
      </h2>

      <div>
        <label className="text-sm font-semibold text-gray-600">Nombre</label>
        <input
          className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="text-sm font-semibold text-gray-600">Correo</label>
        <input
          type="email"
          className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          value={correo}
          onChange={e => setCorreo(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="text-sm font-semibold text-gray-600">Contraseña</label>
        <input
          type="password"
          className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="text-sm font-semibold text-gray-600">Rol</label>
        <select
          className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          value={rol}
          onChange={e => setRol(e.target.value)}
        >
          <option value="admin">Administrador</option>
          <option value="user">Usuario</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-2 rounded text-center font-semibold">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition disabled:opacity-50"
      >
        {loading ? "Creando..." : "Crear Usuario"}
      </button>
    </form>
  );
}
