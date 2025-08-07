import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.warning("Debes completar ambos campos.");
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          correo: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Error al iniciar sesión");
        console.error("❌ Error en login:", data.detalle || data);
        return;
      }

      // ✅ Guardar token y usuario completo
      localStorage.setItem("token", data.token);
      login({ ...data.usuario, token: data.token });

      toast.success("¡Bienvenido!");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Ocurrió un error al conectar con el servidor");
      console.error("🔥 Error de red o servidor:", error);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center min-vh-100"
      style={{
        background: "linear-gradient(135deg, #1a1a40, #004e92, #af002d, #ff6f61)",
        backgroundSize: "400% 400%",
        animation: "gradientBG 15s ease infinite",
      }}
    >
      <style>
        {`
          @keyframes gradientBG {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      </style>

      <div className="d-flex flex-column align-items-center">
        {/* TÍTULO */}
        <div className="text-white text-center mb-4">
          <h1 className="fw-bold display-5 d-flex align-items-center justify-content-center gap-2" style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.6)" }}>
            <span role="img" aria-label="urna">🗳️</span> Dynamic Electoral
          </h1>
          <hr className="mt-2 mx-auto" style={{ width: "200px", borderTop: "3px solid white", opacity: 0.75 }} />
        </div>

        {/* FORMULARIO LOGIN */}
        <div
          className="card p-4 shadow-lg text-white"
          style={{ width: "360px", backgroundColor: "rgba(0,0,0,0.6)", borderRadius: "15px" }}
        >
          <h3 className="text-center mb-4">Iniciar Sesión</h3>

          <form onSubmit={handleLogin}>
            <div className="mb-3 input-group">
              <span className="input-group-text bg-dark border-0 text-white">
                <i className="bi bi-person-fill"></i>
              </span>
              <input
                type="text"
                className="form-control bg-dark text-white border-0"
                placeholder="Correo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="mb-4 input-group">
              <span className="input-group-text bg-dark border-0 text-white">
                <i className="bi bi-lock-fill"></i>
              </span>
              <input
                type="password"
                className="form-control bg-dark text-white border-0"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary w-100 fw-bold">
              Entrar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
