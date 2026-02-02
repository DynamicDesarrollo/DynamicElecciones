import { useState, useEffect } from "react";

export default function CrearVotanteForm({ onVotanteCreado }) {
  const [formulario, setFormulario] = useState({
    nombre_completo: "",
    cedula: "",
    telefono: "",
    direccion: "",
    barrio_id: "",
    municipio_id: "",
    lider_id: "",
    zona: "",
    mesa_id: "",
    lugar_id: "",
    sexo: "",
    activo: true,
  });

  const [municipios, setMunicipios] = useState([]);
  const [barrios, setBarrios] = useState([]);
  const [lideres, setLideres] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [lugares, setLugares] = useState([]);

  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  // Mesas filtradas según el lugar seleccionado
  const filteredMesas = lugar_id => {
    if (!lugar_id) return [];
    return mesas.filter((m) => m.lugar_id === lugar_id);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    const cargarDatos = async () => {
      const [munRes, barRes, lidRes, mesasRes, lugaresRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/municipios`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL}/api/barrios`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL}/api/lideres`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL}/api/mesas`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL}/api/lugares`, { headers }),
      ]);

      const munData = await munRes.json();
      const barData = await barRes.json();
      const lidData = await lidRes.json();
      const mesasData = await mesasRes.json();
      const lugaresData = await lugaresRes.json();

      setMunicipios(Array.isArray(munData) ? munData : []);
      setBarrios(Array.isArray(barData) ? barData : []);
      setLideres(Array.isArray(lidData) ? lidData : []);
      setMesas(Array.isArray(mesasData) ? mesasData : []);
      setLugares(Array.isArray(lugaresData) ? lugaresData : []);
    };

    cargarDatos();
  }, []);

  // Cuando cambia el lugar, si la mesa actual no pertenece, se limpia
  useEffect(() => {
    if (formulario.lugar_id) {
      const valid = filteredMesas(formulario.lugar_id).some(
        (m) => m.id === formulario.mesa_id
      );
      if (!valid) {
        setFormulario((prev) => ({ ...prev, mesa_id: "" }));
      }
    } else {
      // si no hay lugar seleccionado, limpiar mesa
      setFormulario((prev) => ({ ...prev, mesa_id: "" }));
    }
  }, [formulario.lugar_id, mesas]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormulario((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje(null);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/votantes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formulario),
      });

      if (!res.ok) throw new Error("Error al guardar el votante");

      setMensaje("✅ Votante creado exitosamente.");
      setFormulario({
        nombre_completo: "",
        cedula: "",
        telefono: "",
        direccion: "",
        barrio_id: "",
        municipio_id: "",
        lider_id: "",
        zona: "",
        mesa_id: "",
        lugar_id: "",
        sexo: "",
        activo: true,
      });

      if (onVotanteCreado) onVotanteCreado(true);
    } catch (err) {
      setMensaje("❌ Error al crear votante.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow p-4">
      <h4 className="mb-4">🧾 Crear Nuevo Votante</h4>

      {mensaje && <div className="alert alert-info">{mensaje}</div>}

      <form onSubmit={handleSubmit}>
        <div className="row mb-3">
          <div className="col-md-4">
            <label className="form-label">Nombre completo</label>
            <input
              type="text"
              name="nombre_completo"
              value={formulario.nombre_completo}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Cédula</label>
            <input
              type="text"
              name="cedula"
              value={formulario.cedula}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
          
          <div className="col-md-4">
            <label className="form-label">Teléfono</label>
            <input
              type="text"
              name="telefono"
              value={formulario.telefono}
              onChange={handleChange}
              className="form-control"
            />
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-4">
            <label className="form-label">Dirección</label>
            <input
              type="text"
              name="direccion"
              value={formulario.direccion}
              onChange={handleChange}
              className="form-control"
            />
          </div>
          
          <div className="col-md-4">
            <label className="form-label">Zona</label>
            <select
              name="zona"
              value={formulario.zona}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">-- Seleccione --</option>
              <option value="Rural">Rural</option>
              <option value="Urbano">Urbano</option>
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">Municipio</label>
            <select
              name="municipio_id"
              value={formulario.municipio_id}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">-- Seleccione --</option>
              {municipios
                .filter((m) => m.nombre === "Buenavista (CORD)" || m.nombre === "Apartada (CORD)")
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-4">
            <label className="form-label">Barrio</label>
            <select
              name="barrio_id"
              value={formulario.barrio_id}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">-- Seleccione --</option>
              {barrios
                .filter((b) => b.nombre === "La Apartada")
                .map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.nombre}
                  </option>
                ))}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">Lugar de votación</label>
            <select
              name="lugar_id"
              value={formulario.lugar_id}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">-- Seleccione --</option>
              {[...new Map(lugares.map(l => [l.nombre, l])).values()]
                .filter(l => l.municipio === "LA APARTADA (FRON)")
                .map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.nombre}
                  </option>
                ))}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">Mesa</label>
            <select
              name="mesa_id"
              value={formulario.mesa_id}
              onChange={handleChange}
              className="form-select"
              required
              disabled={!formulario.lugar_id}
            >
              <option value="">-- Seleccione --</option>
              {filteredMesas(formulario.lugar_id).map((m) => (
                <option key={m.id} value={m.id}>
                  {m.numero}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-4">
            <label className="form-label">Líder</label>
            <select
              name="lider_id"
              value={formulario.lider_id}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">-- Seleccione --</option>
              {lideres.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.nombre_completo}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">Sexo Votante</label>
            <select
              name="sexo"
              value={formulario.sexo}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">-- Seleccione --</option>
              <option value="Hombre">Hombre</option>
              <option value="Mujer">Mujer</option>
            </select>
          </div>
          <div className="col-md-4 d-flex align-items-end">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="activo"
                name="activo"
                checked={formulario.activo}
                onChange={(e) =>
                  setFormulario((prev) => ({
                    ...prev,
                    activo: e.target.checked,
                  }))
                }
              />
              <label className="form-check-label" htmlFor="activo">
                Activo
              </label>
            </div>
          </div>
        </div>

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Guardar Votante"}
        </button>
      </form>
    </div>
  );
}
