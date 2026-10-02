import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { Boton } from "../ui/Boton";
import { Campo, Entrada } from "../ui/Campo";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [error, setError] = useState("");
  const [entrando, setEntrando] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Escriba su correo y su contraseña.");
      return;
    }
    setEntrando(true);
    try {
      const { ok, data } = await api("/auth/login", {
        method: "POST",
        body: { correo: email.trim(), password },
      });
      if (!ok) {
        setError(data?.error || "No se pudo iniciar sesión");
        return;
      }
      login({ ...data.usuario, token: data.token });
      toast.success(`Hola, ${data.usuario.nombre?.split(" ")[0] || ""}`);
      // El superadmin sin campaña activa empieza en Campañas
      navigate(data.usuario.campana ? "/dashboard" : "/campanas");
    } catch {
      setError("No hay conexión con el servidor. Revise su internet e intente de nuevo.");
    } finally {
      setEntrando(false);
    }
  };

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      {/* Pendón de la plataforma */}
      <section className="relative flex flex-col justify-between overflow-hidden bg-tinta px-6 pb-8 pt-8 text-white animate-izar sm:px-10 lg:min-h-dvh lg:px-14 lg:py-14">
        <img src="/pendon.svg" alt="" className="size-11 rounded-[10px]" />
        <div className="mt-10 lg:mt-0">
          <h1 className="condensada text-[3.6rem] uppercase leading-[0.84] sm:text-[5rem] lg:text-[6rem]">
            Dynamic
            <br />
            <span className="text-voto">Electoral</span>
          </h1>
          <p className="mt-6 max-w-[34ch] text-[17px] leading-relaxed text-white/80">
            Líderes, votantes y día E de tu campaña, organizados por aspirante y sin perder un voto.
          </p>
        </div>
        <p className="mt-10 hidden text-[13px] text-white/60 lg:block">
          Cada campaña ve solo lo suyo. Cada aspirante, solo lo de su equipo.
        </p>
      </section>

      {/* Formulario */}
      <section className="flex items-start justify-center px-6 py-10 sm:px-10 lg:items-center">
        <form onSubmit={handleLogin} className="w-full max-w-[380px]" noValidate>
          <h2 className="condensada text-[2.5rem] leading-none">Ingresar</h2>
          <p className="mt-2 text-[15px] text-tinta-2">Use el correo y la contraseña que le entregó su campaña.</p>

          {error && (
            <p className="mt-6 rounded-md bg-error-suave px-4 py-3 text-[15px] font-[560] text-error" role="alert">
              {error}
            </p>
          )}

          <div className="mt-7 flex flex-col gap-4">
            <Campo etiqueta="Correo" id="login-correo">
              <Entrada
                id="login-correo"
                type="email"
                autoComplete="username"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </Campo>
            <Campo etiqueta="Contraseña" id="login-password">
              <div className="relative">
                <Entrada
                  id="login-password"
                  type={verPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setVerPassword((v) => !v)}
                  aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="absolute right-1 top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-md text-tinta-3 hover:text-tinta"
                >
                  <i className={`bi ${verPassword ? "bi-eye-slash" : "bi-eye"}`} aria-hidden="true" />
                </button>
              </div>
            </Campo>
          </div>

          <Boton type="submit" cargando={entrando} className="mt-7 w-full justify-center">
            {entrando ? "Ingresando…" : "Ingresar"}
          </Boton>
          <p className="mt-6 text-[13px] text-tinta-3">
            ¿Olvidó la contraseña? Pídale al administrador de su campaña que la restablezca.
          </p>
        </form>
      </section>
    </div>
  );
}
