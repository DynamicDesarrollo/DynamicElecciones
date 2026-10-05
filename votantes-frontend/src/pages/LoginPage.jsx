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
      {/* Pendón de la plataforma: la marca cuelga en grande del borde superior */}
      <section className="relative flex flex-col justify-end overflow-hidden bg-tinta px-6 pb-8 pt-28 text-white sm:px-10 lg:min-h-dvh lg:px-14 lg:pb-12 lg:pt-[calc(46dvh+2rem)] xl:px-20">
        <div
          aria-hidden="true"
          className="absolute right-6 top-0 h-24 w-14 animate-colgar sm:right-10 lg:right-14 lg:h-[46dvh] lg:w-[clamp(160px,17vw,280px)] xl:right-20"
        >
          <div className="flex size-full items-center justify-center bg-voto pb-[12%] [clip-path:polygon(0_0,100%_0,100%_100%,50%_86%,0_100%)]">
            <svg viewBox="0 0 24 20" className="w-[46%]" fill="none" stroke="var(--color-tinta)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 10.5l6 6L21 3.5" />
            </svg>
          </div>
        </div>

        <h1 className="titular text-heroe-sm uppercase leading-[0.84] sm:text-heroe-md lg:text-heroe">
          Dynamic
          <br />
          <span className="text-voto">Electoral</span>
        </h1>
        <p className="mt-5 max-w-[34ch] text-destacado leading-relaxed text-white/80 lg:mt-7 lg:text-xl lg:leading-relaxed">
          Líderes, votantes y día E de tu campaña, organizados por aspirante y sin perder un voto.
        </p>
        <p className="mt-12 hidden border-t border-white/15 pt-5 text-sm text-white/65 lg:block">
          Cada campaña ve solo lo suyo. Cada aspirante, solo lo de su equipo.
        </p>
      </section>

      {/* Formulario */}
      <section className="flex items-start justify-center px-4 py-8 sm:px-10 sm:py-12 lg:items-center">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-[440px] rounded-xl bg-papel px-6 py-8 ring-1 ring-filete sm:px-10 sm:py-11"
          noValidate
        >
          <h2 className="titular text-pagina-sm leading-none sm:text-pagina">Ingresar</h2>
          <p className="mt-3 text-cuerpo text-tinta-2">Use el correo y la contraseña que le entregó su campaña.</p>

          {error && (
            <p className="mt-6 rounded-md bg-error-suave px-4 py-3 text-cuerpo font-[560] text-error" role="alert">
              {error}
            </p>
          )}

          <div className="mt-8 flex flex-col gap-5">
            <Campo etiqueta="Correo" id="login-correo">
              <Entrada
                id="login-correo"
                type="email"
                autoComplete="username"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12"
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
                  className="h-12 pr-12"
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

          <Boton type="submit" cargando={entrando} className="mt-8 h-12 w-full justify-center text-base">
            {entrando ? "Ingresando…" : "Ingresar"}
            {!entrando && <i className="bi bi-arrow-right" aria-hidden="true" />}
          </Boton>
          <p className="mt-7 border-t border-filete pt-5 text-nota text-tinta-3">
            ¿Olvidó la contraseña? Pídale al administrador de su campaña que la restablezca.
          </p>
        </form>
      </section>
    </div>
  );
}
