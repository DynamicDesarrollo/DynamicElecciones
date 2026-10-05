// Formulario único para crear y editar líderes.
// El admin elige a qué aspirante pertenece el líder; el equipo de un aspirante no elige:
// el líder queda con su aspirante automáticamente.
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { api, apiLista } from "../../lib/api";
import { esAdmin, nombreCargo } from "../../lib/campana";
import { Boton } from "../../ui/Boton";
import { Campo, Entrada, Rejilla, Seleccion } from "../../ui/Campo";

const vacio = {
  nombre_completo: "",
  cedula: "",
  direccion: "",
  municipio: "",
  telefono: "",
  barrio_nombre: "",
  fecha_nace: "",
  aspirante_id: "",
};

export default function LiderForm({ lider, onGuardado }) {
  const { usuario } = useAuth();
  const admin = esAdmin(usuario);
  const [formData, setFormData] = useState(vacio);
  const [municipios, setMunicipios] = useState([]);
  const [barrios, setBarrios] = useState([]);
  const [aspirantes, setAspirantes] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiLista("/municipios").then(setMunicipios);
    apiLista("/barrios").then(setBarrios);
    if (admin) apiLista("/aspirantes").then(setAspirantes);
  }, [admin]);

  useEffect(() => {
    setFormData(
      lider
        ? {
            nombre_completo: lider.nombre_completo || "",
            cedula: lider.cedula || "",
            direccion: lider.direccion || "",
            municipio: lider.municipio || "",
            telefono: lider.telefono || "",
            barrio_nombre: lider.barrio_nombre || "",
            fecha_nace: lider.fecha_nace ? lider.fecha_nace.slice(0, 10) : "",
            aspirante_id: lider.aspirante_id || "",
          }
        : vacio
    );
  }, [lider]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Al cambiar de municipio, el barrio elegido deja de ser válido
    setFormData((prev) => ({ ...prev, [name]: value, ...(name === "municipio" ? { barrio_nombre: "" } : {}) }));
  };

  const barriosDelMunicipio = barrios.filter((b) => !formData.municipio || b.municipio_id === formData.municipio);

  // Si la campaña tiene un solo municipio, se preselecciona
  useEffect(() => {
    if (!lider && municipios.length === 1) {
      setFormData((prev) => (prev.municipio ? prev : { ...prev, municipio: municipios[0].id }));
    }
  }, [municipios, lider]);
  const principal = aspirantes.find((a) => a.es_principal);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    const { ok, data } = await api(lider ? `/lideres/${lider.id}` : "/lideres", {
      method: lider ? "PUT" : "POST",
      body: formData,
    });
    setGuardando(false);
    if (!ok) return setError(data?.error || "No se pudo guardar el líder. Revise los datos e intente de nuevo.");
    toast.success(lider ? "Líder actualizado" : "Líder registrado");
    onGuardado?.();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && <p className="rounded-md bg-error-suave px-4 py-3 text-cuerpo font-[560] text-error" role="alert">{error}</p>}

      <Rejilla columnas={2}>
        <Campo etiqueta="Nombre completo" id="l-nombre">
          <Entrada id="l-nombre" name="nombre_completo" value={formData.nombre_completo} onChange={handleChange} autoComplete="off" required autoFocus />
        </Campo>
        <Campo etiqueta="Cédula" id="l-cedula">
          <Entrada id="l-cedula" name="cedula" value={formData.cedula} onChange={handleChange} inputMode="numeric" autoComplete="off" />
        </Campo>
        <Campo etiqueta="Teléfono" id="l-tel">
          <Entrada id="l-tel" name="telefono" type="tel" inputMode="tel" value={formData.telefono} onChange={handleChange} />
        </Campo>
        <Campo etiqueta="A quién pertenece" id="l-dir" ayuda="Persona o grupo al que responde este líder.">
          <Entrada id="l-dir" name="direccion" value={formData.direccion} onChange={handleChange} />
        </Campo>
        <Campo etiqueta="Municipio" id="l-muni">
          <Seleccion id="l-muni" name="municipio" value={formData.municipio} onChange={handleChange}>
            <option value="">Seleccione…</option>
            {municipios.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
          </Seleccion>
        </Campo>
        <Campo etiqueta="Barrio o vereda" id="l-barrio" ayuda="Escríbalo; si ya existe, elíjalo de la lista.">
          <Entrada
            id="l-barrio"
            name="barrio_nombre"
            list="l-barrios"
            value={formData.barrio_nombre}
            onChange={handleChange}
            autoComplete="off"
            disabled={!formData.municipio}
            placeholder={formData.municipio ? "" : "Elija el municipio"}
          />
          <datalist id="l-barrios">
            {barriosDelMunicipio.map((b) => <option key={b.id} value={b.nombre} />)}
          </datalist>
        </Campo>
        <Campo etiqueta="Fecha de registro" id="l-fecha">
          <Entrada id="l-fecha" name="fecha_nace" type="date" value={formData.fecha_nace} onChange={handleChange} />
        </Campo>
        {admin ? (
          <Campo etiqueta="Aspirante al que apoya" id="l-asp" ayuda="Sus votantes quedarán con este aspirante.">
            <Seleccion
              id="l-asp"
              name="aspirante_id"
              value={formData.aspirante_id === principal?.id ? "" : formData.aspirante_id}
              onChange={handleChange}
            >
              <option value="">{nombreCargo(usuario?.campana?.cargo_principal)} principal{principal ? ` · ${principal.nombre_completo}` : ""}</option>
              {aspirantes.filter((a) => !a.es_principal).map((a) => (
                <option key={a.id} value={a.id}>{a.cargo_nombre} · {a.nombre_completo}</option>
              ))}
            </Seleccion>
          </Campo>
        ) : (
          usuario?.nombre_aspirante && (
            <div className="flex items-end">
              <p className="rounded-md bg-fondo px-4 py-3 text-sm text-tinta-2">
                Queda con {nombreCargo(usuario.cargo_aspirante).toLowerCase()} <strong className="text-tinta">{usuario.nombre_aspirante}</strong>.
              </p>
            </div>
          )
        )}
      </Rejilla>

      <div className="flex justify-end border-t border-filete pt-4">
        <Boton type="submit" cargando={guardando} className="max-sm:w-full max-sm:justify-center">
          {lider ? "Guardar cambios" : "Registrar líder"}
        </Boton>
      </div>
    </form>
  );
}
