import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { api, apiLista } from "../lib/api";
import { esAdmin, nombreCargo } from "../lib/campana";
import { numero } from "../lib/formato";
import { Boton, BotonIcono } from "../ui/Boton";
import { Campo, Entrada, Seleccion } from "../ui/Campo";
import { useConfirmar } from "../ui/Confirmar";
import { Modal } from "../ui/Modal";
import { Cargando, Encabezado, Insignia, Tabla, Vacio } from "../ui/Pagina";

function FormPuesto({ puesto, admin, secundarios, onGuardado }) {
  const [form, setForm] = useState({
    nombre: puesto?.nombre || "",
    referencia: puesto?.referencia || "",
    aspirante_id: puesto?.aspirante_id || "",
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const guardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    const { ok, data } = await api(puesto ? `/puestos-control/${puesto.id}` : "/puestos-control", {
      method: puesto ? "PUT" : "POST",
      body: form,
    });
    setGuardando(false);
    if (!ok) return setError(data?.error || "No se pudo guardar el puesto de control");
    onGuardado(puesto ? "Puesto actualizado" : "Puesto creado");
  };

  return (
    <form onSubmit={guardar} className="flex flex-col gap-5">
      {error && <p className="rounded-md bg-error-suave px-4 py-3 text-cuerpo font-[560] text-error" role="alert">{error}</p>}
      <Campo etiqueta="Nombre del puesto" id="p-nombre">
        <Entrada id="p-nombre" name="nombre" value={form.nombre} onChange={handleChange} maxLength={100} required autoComplete="off" autoFocus placeholder="Ej. Colegio San José" />
      </Campo>
      <Campo etiqueta="Referencia (opcional)" id="p-ref" ayuda="Para que el equipo lo ubique: una entrada, una esquina, una carpa.">
        <Entrada id="p-ref" name="referencia" value={form.referencia} onChange={handleChange} maxLength={200} autoComplete="off" placeholder="Ej. Entrada norte, junto a la tienda" />
      </Campo>
      {admin && secundarios.length > 0 && (
        <Campo etiqueta="¿De quién es?" id="p-asp" ayuda="Los puestos de toda la campaña los puede usar cualquier equipo.">
          <Seleccion id="p-asp" name="aspirante_id" value={form.aspirante_id} onChange={handleChange}>
            <option value="">Toda la campaña</option>
            {secundarios.map((a) => (
              <option key={a.id} value={a.id}>{nombreCargo(a.cargo)} {a.nombre_completo}</option>
            ))}
          </Seleccion>
        </Campo>
      )}
      <div className="flex justify-end border-t border-filete pt-4">
        <Boton type="submit" cargando={guardando} className="max-sm:w-full max-sm:justify-center">Guardar</Boton>
      </div>
    </form>
  );
}

export default function PuestosPage() {
  const { usuario } = useAuth();
  const admin = esAdmin(usuario);
  const campana = usuario?.campana;
  const confirmar = useConfirmar();

  const [puestos, setPuestos] = useState(null);
  const [aspirantes, setAspirantes] = useState([]);
  const [editando, setEditando] = useState(null); // puesto, "nuevo" o null

  const cargar = () => apiLista("/puestos-control").then(setPuestos);

  useEffect(() => {
    cargar();
    if (admin) apiLista("/aspirantes").then(setAspirantes);
  }, [campana?.id, admin]);

  const secundarios = aspirantes.filter((a) => !a.es_principal);

  const eliminar = async (p) => {
    const ok = await confirmar({
      titulo: `¿Eliminar el puesto ${p.nombre}?`,
      texto: p.total_asistencias
        ? `Las ${numero(p.total_asistencias)} asistencias que ya se confirmaron allí se conservan.`
        : "Dejará de aparecer para confirmar asistencia.",
      accion: "Eliminar puesto",
    });
    if (!ok) return;
    const res = await api(`/puestos-control/${p.id}`, { method: "DELETE" });
    if (!res.ok) return toast.error(res.data?.error || "No se pudo eliminar el puesto");
    toast.success("Puesto eliminado");
    cargar();
  };

  if (!puestos) return <Cargando texto="Cargando puestos de control…" />;

  return (
    <>
      <Encabezado
        titulo="Puestos de control"
        descripcion={
          admin
            ? "Los puntos donde su gente confirma quién llegó a votar. Créelos antes del día de la elección."
            : `Los puntos donde su equipo confirma quién llegó a votar. Los de toda la campaña los define el administrador.`
        }
      >
        <Boton icono="bi-plus-lg" onClick={() => setEditando("nuevo")}>Nuevo puesto</Boton>
      </Encabezado>

      {puestos.length === 0 ? (
        <div className="rounded-lg bg-papel ring-1 ring-filete">
          <Vacio
            icono="bi-geo-alt"
            titulo="Aún no hay puestos de control"
            texto="Sin al menos un puesto no se puede confirmar asistencia el día de la elección."
          >
            <Boton icono="bi-plus-lg" onClick={() => setEditando("nuevo")}>Nuevo puesto</Boton>
          </Vacio>
        </div>
      ) : (
        <Tabla>
          <thead>
            <tr>
              <th>Puesto</th>
              <th>De quién es</th>
              <th className="!text-right">Asistencias</th>
              <th className="w-[1%]"><span className="sr-only">Acciones</span></th>
            </tr>
          </thead>
          <tbody>
            {puestos.map((p) => (
              <tr key={p.id}>
                <td className="max-sm:!block max-sm:!text-left max-sm:pb-2">
                  <p className="font-[680]">{p.nombre}</p>
                  {p.referencia && <p className="text-nota text-tinta-3">{p.referencia}</p>}
                </td>
                <td data-etiqueta="De quién es">
                  {p.aspirante_id ? (
                    `${nombreCargo(p.aspirante_cargo)} ${p.aspirante_nombre}`
                  ) : (
                    <Insignia>Toda la campaña</Insignia>
                  )}
                </td>
                <td data-etiqueta="Asistencias" className="sm:text-right">
                  <span className="cifra text-cifra-xs">{numero(p.total_asistencias)}</span>
                </td>
                <td className="max-sm:!justify-end">
                  {p.editable && (
                    <div className="flex items-center justify-end">
                      <BotonIcono etiqueta={`Editar el puesto ${p.nombre}`} icono="bi-pencil" onClick={() => setEditando(p)} />
                      <BotonIcono etiqueta={`Eliminar el puesto ${p.nombre}`} icono="bi-trash3" variante="peligro-suave" className="ml-4" onClick={() => eliminar(p)} />
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Tabla>
      )}

      <Modal
        abierto={!!editando}
        alCerrar={() => setEditando(null)}
        titulo={editando === "nuevo" ? "Nuevo puesto de control" : "Editar puesto de control"}
        ancho="sm:max-w-lg"
      >
        {editando && (
          <FormPuesto
            key={editando.id || "nuevo"}
            puesto={editando === "nuevo" ? null : editando}
            admin={admin}
            secundarios={secundarios}
            onGuardado={(mensaje) => { toast.success(mensaje); setEditando(null); cargar(); }}
          />
        )}
      </Modal>
    </>
  );
}
