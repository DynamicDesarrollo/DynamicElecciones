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
    <form onSubmit={handleSubmit}>
      <div style={{background:'#007bff',color:'#fff',padding:'10px',borderRadius:'5px',marginBottom:'15px',textAlign:'center',fontWeight:'bold',fontSize:'1.2em',zIndex:1000,position:'relative',boxShadow:'0 2px 8px #0002',border:'2px solid #0056b3',letterSpacing:'1px',textTransform:'uppercase',lineHeight:'1.2',WebkitUserSelect:'none',userSelect:'none',pointerEvents:'auto',display:'block',width:'100%',boxSizing:'border-box',fontFamily:'inherit',backgroundColor:'#007bff !important',color:'#fff !important'}}>
        Crear Usuario
      </div>
      <div>
        <label>Nombre:</label>
        <input value={nombre} onChange={e => setNombre(e.target.value)} required />
      </div>
      <div>
        <label>Correo:</label>
        <input type="email" value={correo} onChange={e => setCorreo(e.target.value)} required />
      </div>
      <div>
        <label>Contraseña:</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
      </div>
      <div>
        <label>Rol:</label>
        <select value={rol} onChange={e => setRol(e.target.value)}>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
      </div>
      {error && (
        <div className="alert alert-danger mt-2" role="alert" style={{border: '2px solid red', fontWeight: 'bold', fontSize: '1.2em', background: '#fff0f0'}}>
          [DEBUG] {error}
        </div>
      )}
      <button type="submit" disabled={loading}>{loading ? "Creando..." : "Crear Usuario"}</button>
    </form>
  );
}
