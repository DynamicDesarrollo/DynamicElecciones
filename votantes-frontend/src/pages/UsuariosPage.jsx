import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { api, apiLista } from "../lib/api";
import { esAdmin, nombreCargo, ROLES } from "../lib/campana";
import { Boton, BotonIcono } from "../ui/Boton";
import { Campo, Entrada, Rejilla, Seleccion } from "../ui/Campo";
import { CampoPassword } from "../ui/CampoPassword";
import { useConfirmar } from "../ui/Confirmar";
import { Modal } from "../ui/Modal";
import { Cargando, Encabezado, Insignia, Tabla, Vacio } from "../ui/Pagina";

const FORM_VACIO = { nombre: "", correo: "", password: "", rol: "aspirante", aspirante_id: "" };

const TONO_ROL = { superadmin: "tinta", admin: "neutro", aspirante: "neutro", user: "alerta" };

function FormUsuario({ admin, campana, aspirantes, onCreado }) {
  const cargoSecundario = nombreCargo(campana?.cargo_secundario);
  const [form, setForm] = useState({ ...FORM_VACIO, rol: admin && campana?.cargo_secundario ? "aspirante" : admin ? "admin" : "aspirante" });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const secundarios = aspirantes.filter((a) => !a.es_principal);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const crear = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    const { ok, data } = await api("/usuarios", { method: "POST", body: form });
    setGuardando(false);
    if (!ok) return setError(data?.error || "No se pudo crear el usuario");
    onCreado();
  };

  return (
    <form onSubmit={crear} className="flex flex-col gap-5">
      {error && <p className="rounded-md bg-error-suave px-4 py-3 text-[15px] font-[560] text-error" role="alert">{error}</p>}
      <Rejilla columnas={2}>
        {admin && (
          <Campo etiqueta="Tipo de usuario" id="u-rol" className="sm:col-span-2">
            <Seleccion id="u-rol" name="rol" value={form.rol} onChange={handleChange}>
              {campana?.cargo_secundario && <option value="aspirante">Usuario de un {cargoSecundario.toLowerCase()} (ve solo lo suyo)</option>}
              <option value="admin">Administrador (ve toda la campaña)</option>
            </Seleccion>
          </Campo>
        )}
        {admin && form.rol === "aspirante" && (
          <Campo
            etiqueta={cargoSecundario}
            id="u-asp"
            className="sm:col-span-2"
            ayuda={`Cada ${cargoSecundario.toLowerCase()} recibe un solo usuario; sus demás usuarios los crea él mismo.`}
          >
            <Seleccion id="u-asp" name="aspirante_id" value={form.aspirante_id} onChange={handleChange} required>
              <option value="">Seleccione…</option>
              {secundarios.map((a) => (
                <option key={a.id} value={a.id} disabled={a.total_usuarios > 0}>
                  {a.nombre_completo}{a.total_usuarios > 0 ? " · ya tiene usuario" : ""}
                </option>
              ))}
            </Seleccion>
          </Campo>
        )}
        <Campo etiqueta="Nombre" id="u-nombre" className="sm:col-span-2">
          <Entrada id="u-nombre" name="nombre" value={form.nombre} onChange={handleChange} required autoComplete="off" autoFocus />
        </Campo>
        <Campo etiqueta="Correo" id="u-correo" className="sm:col-span-2">
          <Entrada id="u-correo" name="correo" type="email" inputMode="email" value={form.correo} onChange={handleChange} required autoComplete="off" />
        </Campo>
        <div className="sm:col-span-2">
          <CampoPassword id="u-pass" etiqueta="Contraseña" value={form.password} onChange={(v) => setForm({ ...form, password: v })} />
        </div>
      </Rejilla>
      <div className="flex justify-end border-t border-filete pt-4">
        <Boton type="submit" cargando={guardando} className="max-sm:w-full max-sm:justify-center">Crear usuario</Boton>
      </div>
    </form>
  );
}

// Restablecer la contraseña de alguien que la perdió: el admin (o el aspirante, para su equipo)
// genera una temporal y se la entrega en persona.
function FormRestablecer({ usuarioObjetivo, onListo }) {
  const [password, setPassword] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  const guardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    const { ok, data } = await api(`/usuarios/${usuarioObjetivo.id}/password`, { method: "PUT", body: { password } });
    setGuardando(false);
    if (!ok) return setError(data?.error || "No se pudo restablecer la contraseña");
    onListo();
  };

  return (
    <form onSubmit={guardar} className="flex flex-col gap-5">
      {error && <p className="rounded-md bg-error-suave px-4 py-3 text-[15px] font-[560] text-error" role="alert">{error}</p>}
      <CampoPassword id="r-pass" value={password} onChange={setPassword} autoFocus />
      <p className="text-sm text-tinta-2">La contraseña anterior deja de funcionar de inmediato. Pídale que la cambie al entrar, desde su nombre en el menú.</p>
      <div className="flex justify-end border-t border-filete pt-4">
        <Boton type="submit" cargando={guardando} className="max-sm:w-full max-sm:justify-center">Restablecer</Boton>
      </div>
    </form>
  );
}

export default function UsuariosPage() {
  const { usuario } = useAuth();
  const admin = esAdmin(usuario);
  const campana = usuario?.campana;
  const confirmar = useConfirmar();

  const [usuarios, setUsuarios] = useState(null);
  const [aspirantes, setAspirantes] = useState([]);
  const [creando, setCreando] = useState(false);
  const [restableciendo, setRestableciendo] = useState(null); // usuario al que se le cambia la contraseña

  const cargar = () => {
    apiLista("/usuarios").then(setUsuarios);
    if (admin) apiLista("/aspirantes").then(setAspirantes);
  };

  useEffect(cargar, [campana?.id, admin]);

  const eliminar = async (u) => {
    const ok = await confirmar({
      titulo: `¿Quitar el acceso a ${u.nombre}?`,
      texto: "No podrá volver a entrar. Los votantes que registró se conservan.",
      accion: "Quitar acceso",
    });
    if (!ok) return;
    const res = await api(`/usuarios/${u.id}`, { method: "DELETE" });
    if (!res.ok) return toast.error(res.data?.error || "No se pudo eliminar el usuario");
    toast.success("Acceso retirado");
    cargar();
  };

  if (!usuarios) return <Cargando texto="Cargando usuarios…" />;

  return (
    <>
      <Encabezado
        titulo={admin ? "Usuarios" : "Mi equipo"}
        descripcion={
          admin
            ? "Quién entra a la campaña y qué ve cada uno."
            : `Usuarios de ${nombreCargo(usuario?.cargo_aspirante).toLowerCase()} ${usuario?.nombre_aspirante}. Todos ven lo mismo que usted.`
        }
      >
        <Boton icono="bi-person-plus" onClick={() => setCreando(true)}>Nuevo usuario</Boton>
      </Encabezado>

      {usuarios.length === 0 ? (
        <div className="rounded-lg bg-papel ring-1 ring-filete">
          <Vacio icono="bi-person-gear" titulo="Sin usuarios todavía" texto="Cree el primero para que su equipo pueda entrar." />
        </div>
      ) : (
        <Tabla>
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Tipo</th>
              {admin && <th>Aspirante</th>}
              <th className="w-[1%]"><span className="sr-only">Acciones</span></th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td className="max-sm:!block max-sm:!text-left max-sm:pb-2">
                  <p className="font-[680]">
                    {u.nombre}
                    {u.id === usuario.id && <span className="ml-2 align-middle"><Insignia>Usted</Insignia></span>}
                  </p>
                  <p className="text-[13px] text-tinta-3">{u.correo}</p>
                </td>
                <td data-etiqueta="Tipo"><Insignia tono={TONO_ROL[u.rol]}>{ROLES[u.rol] || u.rol}</Insignia></td>
                {admin && (
                  <td data-etiqueta="Aspirante">
                    {u.nombre_aspirante ? `${nombreCargo(u.cargo_aspirante)} ${u.nombre_aspirante}` : <span className="text-tinta-3">Toda la campaña</span>}
                  </td>
                )}
                <td className="max-sm:!justify-end">
                  {u.id !== usuario.id && u.rol !== "superadmin" && (
                    <div className="flex items-center justify-end">
                      <BotonIcono etiqueta={`Restablecer la contraseña de ${u.nombre}`} icono="bi-key" onClick={() => setRestableciendo(u)} />
                      <BotonIcono etiqueta={`Quitar acceso a ${u.nombre}`} icono="bi-person-x" variante="peligro-suave" className="ml-4" onClick={() => eliminar(u)} />
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Tabla>
      )}

      <Modal abierto={creando} alCerrar={() => setCreando(false)} titulo="Nuevo usuario">
        {creando && (
          <FormUsuario
            admin={admin}
            campana={campana}
            aspirantes={aspirantes}
            onCreado={() => { toast.success("Usuario creado"); setCreando(false); cargar(); }}
          />
        )}
      </Modal>

      <Modal
        abierto={!!restableciendo}
        alCerrar={() => setRestableciendo(null)}
        titulo="Restablecer contraseña"
        descripcion={restableciendo ? `${restableciendo.nombre} · ${restableciendo.correo}` : ""}
        ancho="sm:max-w-lg"
      >
        {restableciendo && (
          <FormRestablecer
            usuarioObjetivo={restableciendo}
            onListo={() => { toast.success("Contraseña restablecida. Entréguela en persona."); setRestableciendo(null); }}
          />
        )}
      </Modal>
    </>
  );
}
