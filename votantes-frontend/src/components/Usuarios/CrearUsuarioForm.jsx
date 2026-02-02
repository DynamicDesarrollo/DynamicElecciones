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
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-auto space-y-4">
      <div className="bg-blue-600 text-white rounded-t-lg py-3 px-4 text-center font-bold text-lg tracking-wide uppercase mb-2">
        Crear Usuario
      </div>
      <div>
        <label className="block text-gray-700 font-semibold mb-1">Nombre:</label>
        <input value={nombre} onChange={e => setNombre(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label className="block text-gray-700 font-semibold mb-1">Correo:</label>
        <input type="email" value={correo} onChange={e => setCorreo(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label className="block text-gray-700 font-semibold mb-1">Contraseña:</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label className="block text-gray-700 font-semibold mb-1">Rol:</label>
        <select value={rol} onChange={e => setRol(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
      </div>
      {error && (
        <div className="border-2 border-red-400 bg-red-100 text-red-700 font-bold text-center rounded p-2">
          {error}
        </div>
      )}
      <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200 disabled:opacity-60">
        {loading ? "Creando..." : "Crear Usuario"}
      </button>
    </form>
  );
}
