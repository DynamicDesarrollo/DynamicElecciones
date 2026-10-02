// Formulario único para crear y editar prospectos votantes.
// No se elige aspirante: el votante queda con el aspirante de su líder, o con el del usuario
// que lo registra, o con el aspirante principal.
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { api, apiLista } from "../../lib/api";
import { esAdmin, nombreCargo } from "../../lib/campana";
import { Boton } from "../../ui/Boton";
import { Campo, Casilla, Entrada, Rejilla, Seleccion } from "../../ui/Campo";

const vacio = {
  nombre_completo: "",
  cedula: "",
  telefono: "",
  direccion: "",
  barrio_nombre: "",
  municipio_id: "",
  lider_id: "",
  zona: "",
  mesa_id: "",
  lugar_id: "",
  sexo: "",
  activo: true,
  mesa_numero: "",
};

function Seccion({ titulo, children }) {
  return (
    <fieldset className="border-t border-filete pt-5 first:border-t-0 first:pt-0">
      <legend className="rotulo float-left mb-4 w-full text-tinta-3">{titulo}</legend>
      <div className="clear-both">{children}</div>
    </fieldset>
  );
}

export default function VotanteForm({ votante, onGuardado }) {
  const { usuario } = useAuth();
  const [formulario, setFormulario] = useState(vacio);
  const [municipios, setMunicipios] = useState([]);
  const [barrios, setBarrios] = useState([]);
  const [lideres, setLideres] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [lugares, setLugares] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const [cedulaInfo, setCedulaInfo] = useState(null); // respuesta de validar-cedula

  useEffect(() => {
    apiLista("/municipios").then(setMunicipios);
    apiLista("/barrios").then(setBarrios);
    apiLista("/lideres").then(setLideres);
    apiLista("/mesas").then(setMesas);
    apiLista("/lugares").then(setLugares);
  }, []);

  useEffect(() => {
    setCedulaInfo(null);
    setError(null);
    setFormulario(
      votante
        ? Object.fromEntries(Object.keys(vacio).map((k) => [k, votante[k] ?? vacio[k]]))
        : vacio
    );
  }, [votante]);

  const barriosDelMunicipio = barrios.filter((b) => !formulario.municipio_id || b.municipio_id === formulario.municipio_id);
  const mesasDelLugar = mesas.filter((m) => m.lugar_id === formulario.lugar_id);
  // Puestos del municipio elegido (los puestos antiguos sin municipio se muestran siempre)
  const lugaresDelMunicipio = lugares.filter((l) => !l.municipio_id || l.municipio_id === formulario.municipio_id);
  const lugarElegido = lugares.find((l) => l.id === formulario.lugar_id);

  // Si la campaña tiene un solo municipio, se preselecciona
  useEffect(() => {
    if (!votante && municipios.length === 1) {
      setFormulario((prev) => (prev.municipio_id ? prev : { ...prev, municipio_id: municipios[0].id }));
    }
  }, [municipios, votante]);

  // Al cambiar municipio o lugar, se limpian el barrio o la mesa que ya no corresponden
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormulario((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "municipio_id" ? { barrio_nombre: "", lugar_id: "", mesa_id: "", mesa_numero: "" } : {}),
      ...(name === "lugar_id" ? { mesa_id: "", mesa_numero: "" } : {}),
    }));
  };

  // Valida la cédula contra el aspirante al que iría el votante (depende del líder)
  const validarCedula = async (cedula, lider_id) => {
    setCedulaInfo(null);
    const sinCambios = votante && cedula === votante.cedula && lider_id === (votante.lider_id || "");
    if (!cedula || cedula.trim().length < 5 || sinCambios) return;
    const query = lider_id ? `?lider_id=${encodeURIComponent(lider_id)}` : "";
    const { ok, data } = await api(`/votantes/validar-cedula/${encodeURIComponent(cedula.trim())}${query}`);
    if (ok && data.existe && !(votante && data.id === votante.id)) setCedulaInfo(data);
  };

  useEffect(() => {
    validarCedula(formulario.cedula, formulario.lider_id);
    // Solo cuando cambia el líder: la cédula se valida al salir del campo
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formulario.lider_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    const { ok, status, data } = await api(votante ? `/votantes/${votante.id}` : "/votantes", {
      method: votante ? "PUT" : "POST",
      body: formulario,
    });
    setGuardando(false);
    if (!ok) {
      if (status === 409 && data?.existe) {
        setCedulaInfo({ ...data, bloquea: true });
      } else {
        setError(data?.error || "No se pudo guardar el votante. Revise los datos e intente de nuevo.");
      }
      return;
    }
    onGuardado?.();
  };

  // A quién queda asignado el votante si no se elige líder
  const destinoSinLider = !esAdmin(usuario) && usuario?.nombre_aspirante
    ? `${nombreCargo(usuario.cargo_aspirante).toLowerCase()} ${usuario.nombre_aspirante}`
    : `el ${nombreCargo(usuario?.campana?.cargo_principal).toLowerCase() || "aspirante"} principal`;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error && <p className="rounded-md bg-error-suave px-4 py-3 text-[15px] font-[560] text-error" role="alert">{error}</p>}

      <Seccion titulo="Persona">
        <Rejilla columnas={3}>
          <Campo
            etiqueta="Cédula"
            id="v-cedula"
            error={cedulaInfo?.bloquea ? `Ya registrada: ${cedulaInfo.votante_nombre}${cedulaInfo.lider_nombre ? ` · líder ${cedulaInfo.lider_nombre}` : ""}` : null}
          >
            <Entrada
              id="v-cedula"
              name="cedula"
              value={formulario.cedula}
              onChange={handleChange}
              onBlur={() => validarCedula(formulario.cedula, formulario.lider_id)}
              aria-invalid={!!cedulaInfo?.bloquea}
              inputMode="numeric"
              autoComplete="off"
              autoFocus={!votante}
              required
            />
          </Campo>
          <Campo etiqueta="Nombre completo" id="v-nombre" className="lg:col-span-2">
            <Entrada id="v-nombre" name="nombre_completo" value={formulario.nombre_completo} onChange={handleChange} autoComplete="off" required />
          </Campo>
          <Campo etiqueta="Teléfono" id="v-tel">
            <Entrada id="v-tel" name="telefono" type="tel" inputMode="tel" value={formulario.telefono} onChange={handleChange} />
          </Campo>
          <Campo etiqueta="Sexo" id="v-sexo">
            <Seleccion id="v-sexo" name="sexo" value={formulario.sexo} onChange={handleChange} required>
              <option value="">Seleccione…</option>
              <option value="Hombre">Hombre</option>
              <option value="Mujer">Mujer</option>
            </Seleccion>
          </Campo>
          <Campo etiqueta="Zona" id="v-zona">
            <Seleccion id="v-zona" name="zona" value={formulario.zona} onChange={handleChange} required>
              <option value="">Seleccione…</option>
              <option value="Urbano">Urbana</option>
              <option value="Rural">Rural</option>
            </Seleccion>
          </Campo>
        </Rejilla>
        {cedulaInfo && !cedulaInfo.bloquea && (
          <p className="mt-4 rounded-md bg-alerta-suave px-4 py-3 text-sm text-alerta" role="status">
            <i className="bi bi-info-circle mr-1.5" aria-hidden="true" />
            Esta cédula ya está con <strong>{cedulaInfo.aspirante_nombre}</strong>
            {cedulaInfo.lider_nombre && <> (líder {cedulaInfo.lider_nombre})</>}. Puede registrarla también aquí; quedará en el informe de duplicados.
          </p>
        )}
      </Seccion>

      <Seccion titulo="Ubicación">
        <Rejilla columnas={3}>
          <Campo etiqueta="Municipio" id="v-muni">
            <Seleccion id="v-muni" name="municipio_id" value={formulario.municipio_id} onChange={handleChange} required>
              <option value="">Seleccione…</option>
              {municipios.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
            </Seleccion>
          </Campo>
          <Campo etiqueta="Barrio o vereda" id="v-barrio" ayuda="Escríbalo; si ya existe, elíjalo de la lista.">
            <Entrada
              id="v-barrio"
              name="barrio_nombre"
              list="v-barrios"
              value={formulario.barrio_nombre}
              onChange={handleChange}
              autoComplete="off"
              disabled={!formulario.municipio_id}
              placeholder={formulario.municipio_id ? "" : "Elija el municipio"}
            />
            <datalist id="v-barrios">
              {barriosDelMunicipio.map((b) => <option key={b.id} value={b.nombre} />)}
            </datalist>
          </Campo>
          <Campo etiqueta="Dirección" id="v-dir">
            <Entrada id="v-dir" name="direccion" value={formulario.direccion} onChange={handleChange} />
          </Campo>
          <Campo
            etiqueta="Puesto de votación"
            id="v-lugar"
            className="lg:col-span-2"
            ayuda={lugarElegido?.direccion || (!formulario.municipio_id && lugares.length ? "Elija primero el municipio." : null)}
          >
            <Seleccion id="v-lugar" name="lugar_id" value={formulario.lugar_id} onChange={handleChange} required>
              <option value="">{lugaresDelMunicipio.length ? "Seleccione…" : "Sin puestos para este municipio"}</option>
              {lugaresDelMunicipio.map((l) => <option key={l.id} value={l.id}>{l.nombre}</option>)}
            </Seleccion>
          </Campo>
          {formulario.lugar_id && mesasDelLugar.length === 0 ? (
            // La Registraduría no publica las mesas de todos los puestos: se escribe el número
            <Campo etiqueta="Mesa" id="v-mesa-num" ayuda="Escriba el número de mesa.">
              <Entrada id="v-mesa-num" name="mesa_numero" value={formulario.mesa_numero} onChange={handleChange} inputMode="numeric" required />
            </Campo>
          ) : (
            <Campo etiqueta="Mesa" id="v-mesa">
              <Seleccion id="v-mesa" name="mesa_id" value={formulario.mesa_id} onChange={handleChange} required disabled={!formulario.lugar_id}>
                <option value="">{formulario.lugar_id ? "Seleccione…" : "Elija el puesto"}</option>
                {mesasDelLugar.map((m) => <option key={m.id} value={m.id}>{m.numero}</option>)}
              </Seleccion>
            </Campo>
          )}
        </Rejilla>
      </Seccion>

      <Seccion titulo="Campaña">
        <Rejilla columnas={2}>
          <Campo
            etiqueta="Líder"
            id="v-lider"
            ayuda={formulario.lider_id ? "El votante queda con el aspirante de este líder." : `Sin líder, el votante queda con ${destinoSinLider}.`}
          >
            <Seleccion id="v-lider" name="lider_id" value={formulario.lider_id} onChange={handleChange}>
              <option value="">Sin líder</option>
              {lideres.map((l) => <option key={l.id} value={l.id}>{l.nombre_completo}</option>)}
            </Seleccion>
          </Campo>
          <div className="flex items-end">
            <Casilla id="v-activo" name="activo" etiqueta="Votante activo" checked={formulario.activo} onChange={handleChange} />
          </div>
        </Rejilla>
      </Seccion>

      <div className="sticky -bottom-5 -mx-5 -mb-5 flex justify-end border-t border-filete bg-papel/95 px-5 py-4 backdrop-blur-sm sm:-mx-6 sm:px-6">
        <Boton type="submit" cargando={guardando} disabled={cedulaInfo?.bloquea} className="max-sm:w-full max-sm:justify-center">
          {votante ? "Guardar cambios" : "Registrar votante"}
        </Boton>
      </div>
    </form>
  );
}
