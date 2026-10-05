// Ajustes generales del SaaS (solo superadmin)
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "../lib/api";
import { Boton } from "../ui/Boton";
import { Campo, Entrada } from "../ui/Campo";
import { Cargando, Encabezado, Lamina } from "../ui/Pagina";

export default function AjustesPage() {
  const [url, setUrl] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    api("/ajustes").then(({ ok, data }) => setUrl(ok ? data.url_consulta_votacion || "" : ""));
  }, []);

  const guardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    const { ok, data } = await api("/ajustes", { method: "PUT", body: { url_consulta_votacion: url } });
    setGuardando(false);
    if (!ok) return setError(data?.error || "No se pudo guardar");
    toast.success("Ajuste guardado");
  };

  if (url === null) return <Cargando texto="Cargando ajustes…" />;

  return (
    <>
      <Encabezado titulo="Ajustes" descripcion="Valen para todas las campañas." />

      <Lamina
        titulo="Consulta de puesto y mesa"
        descripcion="Página oficial de la Registraduría que se abre desde el formulario de votantes con el botón “Consultar en la Registraduría”. Cambia con cada elección."
        className="max-w-3xl"
      >
        <form onSubmit={guardar} className="flex flex-col gap-4">
          <Campo
            etiqueta="Dirección de la consulta"
            id="aj-url"
            error={error}
            ayuda="Cópiela del sitio de la Registraduría (Electoral → Consulte su lugar de votación)."
          >
            <Entrada id="aj-url" type="url" inputMode="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" required />
          </Campo>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-filete pt-4">
            <a
              href={url || undefined}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-1.5 text-sm font-[650] text-tinta underline underline-offset-[3px]"
            >
              Probar que abre <i className="bi bi-box-arrow-up-right" aria-hidden="true" />
            </a>
            <Boton type="submit" cargando={guardando}>Guardar</Boton>
          </div>
        </form>
      </Lamina>
    </>
  );
}
