// Piezas de página: encabezado, cifras titulares, tabla, insignias, vacío y paginación.
import { Boton } from "./Boton";
import { numero } from "../lib/formato";

export function Encabezado({ titulo, descripcion, children }) {
  return (
    <header className="mb-7 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div className="min-w-0">
        <h1 className="titular text-pagina-sm leading-[0.95] text-balance sm:text-pagina">{titulo}</h1>
        {descripcion && <p className="mt-2.5 max-w-[62ch] text-cuerpo text-tinta-2">{descripcion}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </header>
  );
}

// Cifras titulares: el número es el protagonista de la pantalla
export function Cifras({ items, className = "" }) {
  return (
    <dl className={`grid ${items.length === 3 ? "grid-cols-3" : "grid-cols-2"} gap-px overflow-hidden rounded-lg bg-filete ring-1 ring-filete sm:grid-cols-[repeat(auto-fit,minmax(11rem,1fr))] ${className}`}>
      {items.map((c, i) => (
        <div
          key={c.etiqueta}
          // En celular (2 columnas), la última cifra de un número impar ocupa toda la fila
          className={`flex flex-col bg-papel px-4 py-4 sm:px-5 sm:py-5 ${items.length % 2 && items.length !== 3 && i === items.length - 1 ? "col-span-2 sm:col-span-1" : ""}`}
        >
          <dt className="rotulo text-tinta-3">{c.etiqueta}</dt>
          <dd className={`cifra mt-3 ${items.length === 3 ? "text-cifra-md" : "text-cifra-lg"} sm:text-cifra-xl`}>
            {typeof c.valor === "number" ? numero(c.valor) : c.valor}
          </dd>
          {c.detalle && <dd className="mt-2 text-nota text-tinta-2">{c.detalle}</dd>}
        </div>
      ))}
    </dl>
  );
}

// Tabla con filetes. En celular cada fila se vuelve una ficha: cada <td> necesita data-etiqueta.
export function Tabla({ children, className = "" }) {
  return (
    <div className={`overflow-hidden rounded-lg bg-papel ring-1 ring-filete ${className}`}>
      <div className="overflow-x-auto">
        <table
          className="w-full border-collapse text-cuerpo
            [&_th]:rotulo [&_th]:whitespace-nowrap [&_th]:border-b [&_th]:border-filete-fuerte [&_th]:px-4 [&_th]:py-3 [&_th]:text-left [&_th]:text-tinta-3
            [&_td]:border-b [&_td]:border-filete [&_td]:px-4 [&_td]:py-3 [&_td]:align-middle
            [&_tbody_tr:last-child_td]:border-b-0 [&_tbody_tr]:transition-colors [&_tbody_tr:hover]:bg-fondo/70
            max-sm:[&_thead]:hidden max-sm:[&_tr]:block max-sm:[&_tr]:border-b max-sm:[&_tr]:border-filete max-sm:[&_tr]:px-4 max-sm:[&_tr]:py-3
            max-sm:[&_tbody_tr:last-child]:border-b-0
            max-sm:[&_td]:flex max-sm:[&_td]:justify-between max-sm:[&_td]:gap-4 max-sm:[&_td]:border-0 max-sm:[&_td]:px-0 max-sm:[&_td]:py-1
            max-sm:[&_td]:text-right max-sm:[&_td[data-etiqueta]]:before:content-[attr(data-etiqueta)]
            max-sm:[&_td]:before:rotulo max-sm:[&_td]:before:shrink-0 max-sm:[&_td]:before:pt-0.5 max-sm:[&_td]:before:text-left max-sm:[&_td]:before:text-tinta-3"
        >
          {children}
        </table>
      </div>
    </div>
  );
}

const TONOS = {
  neutro: "bg-tinta/[0.06] text-tinta-2",
  ok: "bg-ok-suave text-ok",
  alerta: "bg-alerta-suave text-alerta",
  error: "bg-error-suave text-error",
  tinta: "bg-tinta text-white",
};

export function Insignia({ tono = "neutro", icono, children }) {
  return (
    <span className={`inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-nota font-[620] ${TONOS[tono]}`}>
      {icono && <i className={`bi ${icono}`} aria-hidden="true" />}
      {children}
    </span>
  );
}

export function Vacio({ icono = "bi-inbox", titulo, texto, children }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <i className={`bi ${icono} text-3xl text-tinta-3`} aria-hidden="true" />
      <p className="mt-3 text-destacado font-[680]">{titulo}</p>
      {texto && <p className="mt-1.5 max-w-[46ch] text-cuerpo text-tinta-2">{texto}</p>}
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}

export function Paginacion({ pagina, totalPaginas, total, porPagina, alCambiar }) {
  if (!total) return null;
  const desde = (pagina - 1) * porPagina + 1;
  const hasta = Math.min(pagina * porPagina, total);
  return (
    <nav className="mt-4 flex items-center justify-between gap-4" aria-label="Paginación">
      <p className="text-sm text-tinta-2">
        <span className="font-[650] text-tinta">{numero(desde)}–{numero(hasta)}</span> de {numero(total)}
      </p>
      <div className="flex gap-2">
        <Boton variante="secundario" tamano="sm" icono="bi-arrow-left" disabled={pagina <= 1} onClick={() => alCambiar(pagina - 1)}>
          Anterior
        </Boton>
        <Boton variante="secundario" tamano="sm" disabled={pagina >= totalPaginas} onClick={() => alCambiar(pagina + 1)}>
          Siguiente <i className="bi bi-arrow-right" aria-hidden="true" />
        </Boton>
      </div>
    </nav>
  );
}

// Bloque blanco con filete para formularios y secciones
export function Lamina({ titulo, descripcion, children, className = "" }) {
  return (
    <section className={`rounded-lg bg-papel p-5 ring-1 ring-filete sm:p-6 ${className}`}>
      {titulo && <h2 className="titular text-subseccion leading-none">{titulo}</h2>}
      {descripcion && <p className="mt-1.5 text-sm text-tinta-2">{descripcion}</p>}
      <div className={titulo ? "mt-5" : ""}>{children}</div>
    </section>
  );
}

export function Cargando({ texto = "Cargando…" }) {
  return (
    <div className="flex items-center gap-3 px-4 py-10 text-tinta-2" role="status">
      <i className="bi bi-arrow-repeat animate-spin" aria-hidden="true" /> {texto}
    </div>
  );
}
