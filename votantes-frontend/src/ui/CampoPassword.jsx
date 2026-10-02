// Campo de contraseña nueva con botón para generar una temporal y verla antes de entregarla.
import { useState } from "react";
import { generarPassword } from "../lib/password";
import { Campo, Entrada } from "./Campo";

export function CampoPassword({ id, etiqueta = "Nueva contraseña", value, onChange, ayuda = "Mínimo 8 caracteres. Entréguela en persona.", conGenerar = true, autoFocus }) {
  const [visible, setVisible] = useState(false);

  const generar = () => {
    onChange(generarPassword());
    setVisible(true);
  };

  return (
    <Campo etiqueta={etiqueta} id={id} ayuda={ayuda}>
      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <Entrada
            id={id}
            type={visible ? "text" : "password"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            autoFocus={autoFocus}
            className={`pr-12 ${visible ? "font-[620] tracking-wide" : ""}`}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="absolute right-1 top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-md text-tinta-3 hover:text-tinta"
          >
            <i className={`bi ${visible ? "bi-eye-slash" : "bi-eye"}`} aria-hidden="true" />
          </button>
        </div>
        {conGenerar && (
          <button
            type="button"
            onClick={generar}
            className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-md px-3 text-sm font-[620] text-tinta ring-1 ring-inset ring-filete-fuerte hover:bg-fondo"
          >
            <i className="bi bi-shuffle" aria-hidden="true" /> Generar
          </button>
        )}
      </div>
    </Campo>
  );
}
