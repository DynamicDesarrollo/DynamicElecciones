// src/components/Header.jsx
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { usuario } = useAuth();

  if (!usuario) {
    return (
      <div className="bg-light px-4 py-3 border-bottom shadow-sm text-muted">
        Cargando datos del usuario...
      </div>
    );
  }

  return (
    <div
      className="bg-light px-4 py-3 border-bottom shadow-sm"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        width: "100%",
      }}
    >
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <h5 className="mb-1 text-primary">
            👋 Bienvenido, <strong>{usuario.nombre || "Usuario"}</strong>
          </h5>
          <small className="text-secondary">
            Rol: <strong>{usuario.rol}</strong>{" "}
            {usuario.tipo_aspirante && (
              <>
                — Aspirante a <strong>{usuario.tipo_aspirante}</strong>{" "}
                {usuario.nombre_aspirante && (
                  <>(<em>{usuario.nombre_aspirante}</em>)</>
                )}
              </>
            )}
          </small>
        </div>
      </div>
    </div>
  );
}
