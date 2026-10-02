// Botones del sistema. La variante primaria lleva el color de la campaña;
// "peligro" va en contorno y siempre separada de las demás acciones.

const VARIANTES = {
  primario: "bg-campana text-campana-tinta shadow-[0_1px_2px_rgb(18_20_23/0.18)] hover:brightness-[1.08]",
  secundario: "bg-papel text-tinta ring-1 ring-inset ring-filete-fuerte hover:bg-fondo",
  fantasma: "text-tinta-2 hover:bg-tinta/[0.06] hover:text-tinta",
  peligro: "bg-papel text-error ring-1 ring-inset ring-error/45 hover:bg-error-suave",
  "peligro-suave": "text-error hover:bg-error-suave hover:ring-1 hover:ring-inset hover:ring-error/45",
  "peligro-solido": "bg-error text-white hover:brightness-110",
};

const TAMANOS = {
  md: "h-11 px-4 gap-2 text-[15px]",
  sm: "h-9 px-3 gap-1.5 text-sm",
  icono: "size-10 justify-center text-[17px]",
};

export function Boton({
  variante = "primario",
  tamano = "md",
  icono,
  cargando = false,
  className = "",
  children,
  type = "button",
  disabled,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || cargando}
      className={`inline-flex shrink-0 items-center rounded-md font-[620] whitespace-nowrap select-none
        transition-[transform,background-color,filter] duration-150 ease-[var(--ease-salida)]
        active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50
        ${VARIANTES[variante]} ${TAMANOS[tamano]} ${className}`}
      {...props}
    >
      {cargando ? (
        <i className="bi bi-arrow-repeat animate-spin" aria-hidden="true" />
      ) : (
        icono && <i className={`bi ${icono}`} aria-hidden="true" />
      )}
      {children}
    </button>
  );
}

// Botón solo con ícono: exige una etiqueta accesible
export function BotonIcono({ etiqueta, icono, variante = "fantasma", ...props }) {
  return (
    <Boton variante={variante} tamano="icono" aria-label={etiqueta} title={etiqueta} {...props}>
      <i className={`bi ${icono}`} aria-hidden="true" />
    </Boton>
  );
}
