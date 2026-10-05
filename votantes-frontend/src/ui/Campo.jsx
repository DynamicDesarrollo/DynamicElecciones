// Campos de formulario: etiqueta arriba, control de 44px de alto (táctil), ayuda o error debajo.

const CONTROL =
  "block w-full h-11 rounded-md bg-papel px-3 text-tinta ring-1 ring-inset ring-filete-fuerte " +
  "placeholder:text-tinta-3 transition-shadow duration-150 " +
  "focus:outline-none focus:ring-2 focus:ring-campana " +
  "disabled:bg-fondo disabled:text-tinta-3 aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-error";

export function Campo({ etiqueta, id, ayuda, error, className = "", children }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-[620] text-tinta">
        {etiqueta}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 text-nota font-[560] text-error" role="alert">{error}</p>
      ) : (
        ayuda && <p className="mt-1.5 text-nota text-tinta-3">{ayuda}</p>
      )}
    </div>
  );
}

export function Entrada({ className = "", ...props }) {
  return <input className={`${CONTROL} ${className}`} {...props} />;
}

export function Seleccion({ className = "", children, ...props }) {
  return (
    <div className="relative">
      <select className={`${CONTROL} appearance-none pr-10 ${className}`} {...props}>
        {children}
      </select>
      <i
        className="bi bi-chevron-down pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-tinta-3"
        aria-hidden="true"
      />
    </div>
  );
}

export function Casilla({ etiqueta, id, ...props }) {
  return (
    <label htmlFor={id} className="inline-flex min-h-11 cursor-pointer items-center gap-3 text-cuerpo font-[560]">
      <input id={id} type="checkbox" className="size-5 rounded accent-campana" {...props} />
      {etiqueta}
    </label>
  );
}

// Rejilla de campos: una columna en celular, varias en pantallas anchas
export function Rejilla({ columnas = 2, className = "", children }) {
  const cols = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-2 lg:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4" };
  return <div className={`grid grid-cols-1 gap-x-5 gap-y-4 ${cols[columnas]} ${className}`}>{children}</div>;
}
