// Modal sobre <dialog> nativo: foco atrapado, Esc para cerrar y fondo inerte sin librerías.
// En celular se abre como hoja desde abajo.
import { useEffect, useRef } from "react";
import { BotonIcono } from "./Boton";

export function Modal({ abierto, alCerrar, titulo, descripcion, ancho = "sm:max-w-2xl", children }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialogo = ref.current;
    if (!dialogo) return;
    if (abierto && !dialogo.open) {
      dialogo.showModal();
      // showModal enfoca el primer botón (cerrar); llevamos el foco a la acción o al primer campo
      const destino =
        dialogo.querySelector("[data-autofocus]") ||
        dialogo.querySelector("input:not([type=hidden]):not([disabled]), select, textarea");
      destino?.focus();
    }
    if (!abierto && dialogo.open) dialogo.close();
  }, [abierto]);

  return (
    <dialog
      ref={ref}
      onClose={alCerrar}
      onClick={(e) => e.target === ref.current && alCerrar()}
      aria-labelledby="modal-titulo"
      className={`m-auto w-full max-w-none overflow-hidden bg-papel p-0 text-tinta shadow-[0_24px_64px_-12px_rgb(18_20_23/0.35)]
        backdrop:bg-tinta/55 open:animate-aparecer
        max-sm:mb-0 max-sm:max-h-[92dvh] max-sm:rounded-t-2xl
        sm:max-h-[88dvh] sm:w-[calc(100%-2rem)] sm:rounded-xl ${ancho}`}
    >
      {abierto && (
        <div className="flex max-h-[inherit] flex-col">
          <header className="flex items-start justify-between gap-4 border-b border-filete px-5 py-4 sm:px-6">
            <div>
              <h2 id="modal-titulo" className="condensada text-[1.75rem] leading-none">{titulo}</h2>
              {descripcion && <p className="mt-1.5 text-sm text-tinta-2">{descripcion}</p>}
            </div>
            <BotonIcono etiqueta="Cerrar" icono="bi-x-lg" onClick={alCerrar} className="-mr-2 -mt-1" />
          </header>
          <div className="overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
        </div>
      )}
    </dialog>
  );
}
