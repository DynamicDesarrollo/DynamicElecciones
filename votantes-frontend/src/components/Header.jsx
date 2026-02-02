import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { usuario } = useAuth();
  return (
    <header style={{ background: '#007bff', height: '64px', minHeight: '64px', overflow: 'visible' }} className="text-white d-flex align-items-center justify-content-between px-3 py-2 position-relative">
      <h5 className="font-bold text-lg m-0">🗳️ Sistema de Votantes</h5>
      <div className="ms-auto d-flex align-items-center" style={{minWidth:'180px', justifyContent:'flex-end'}}>
        {usuario && (
          <div className="d-flex align-items-center gap-2">
            <span className="bi bi-person-circle fs-4"></span>
            <span className="fw-bold">{usuario.nombre || usuario.correo || 'Usuario'}</span>
          </div>
        )}
      </div>
    </header>
  );
}
