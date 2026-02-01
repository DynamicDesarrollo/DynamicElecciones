import { useState, useEffect } from "react";

export default function EditarVotanteForm({ votante, onVotanteActualizado }) {
  const [formulario, setFormulario] = useState({
    nombre_completo: "",
    cedula: "",
    telefono: "",
    direccion: "",
    barrio_id: "",
    municipio_id: "",
    lider_id: "",
    zona: "",
    lugar_id: "",
    mesa_id: "",
    sexo: "",
    activo: true,
  });

  const [municipios, setMunicipios] = useState([]);
  const [barrios, setBarrios] = useState([]);
  const [lideres, setLideres] = useState([]);
  const [lugares, setLugares] = useState([]);
  const [mesas, setMesas] = useState([]);

  const [mensaje, setMensaje] = useState(null);
  const [loading, setLoading] = useState(false);

  // Cargar datos base: municipios, barrios, lideres, lugares
  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    const cargarDatos = async () => {
      try {
        const [munRes, barRes, lidRes, lugaresRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/municipios`, { headers }),
          fetch(`${import.meta.env.VITE_API_URL}/api/barrios`, { headers }),
          fetch(`${import.meta.env.VITE_API_URL}/api/lideres`, { headers }),
          fetch(`${import.meta.env.VITE_API_URL}/api/lugares`, { headers }),
        ]);

        setMunicipios(await munRes.json());
        setBarrios(await barRes.json());
        setLideres(await lidRes.json());
        setLugares(await lugaresRes.json());
      } catch (err) {
        console.error("Error cargando datos base:", err);
      }
    };

    cargarDatos();
  }, []);

  // Al cambiar el lugar, traer las mesas de ese lugar
  useEffect(() => {
    const cargarMesasDelLugar = async () => {
      if (!formulario.lugar_id) {
        setMesas([]);
        return;
      }
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/mesas?lugar_id=${formulario.lugar_id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        setMesas(data);

        // Si el mesa_id actual no está en las nuevas mesas, limpiarlo
        if (formulario.mesa_id) {
          const existe = data.some((m) => m.id === formulario.mesa_id);
          if (!existe) {
            setFormulario((prev) => ({ ...prev, mesa_id: "" }));
          }
        }
      } catch (err) {
        console.error("Error cargando mesas del lugar:", err);
        setMesas([]);
      }
    };

    cargarMesasDelLugar();
  }, [formulario.lugar_id]);

  // Cargar votante en el formulario cuando cambia (solo una vez por cambio de votante)
  useEffect(() => {
    if (votante) {
      setFormulario({
        nombre_completo: votante.nombre_completo || "",
        cedula: votante.cedula || "",
        telefono: votante.telefono || "",
        direccion: votante.direccion || "",
        barrio_id: votante.barrio_id || "",
        municipio_id: votante.municipio_id || "",
        lider_id: votante.lider_id || "",
        zona: votante.zona || "",
        lugar_id: votante.lugar_id || "",
        mesa_id: votante.mesa_id || "",
        sexo: votante.sexo || "",
        activo: votante.activo ?? true,
      });
    }
  }, [votante]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormulario((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/votantes/${votante.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formulario),
        }
      );

      if (!res.ok) throw new Error("Error al actualizar votante");

      setMensaje("✅ Votante actualizado correctamente.");
      if (onVotanteActualizado) onVotanteActualizado(true);
    } catch (err) {
      console.error(err);
      setMensaje("❌ Error al actualizar votante.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow p-4">
      <h4 className="mb-4">✏️ Editar Votante</h4>

      {mensaje && <div className="alert alert-info">{mensaje}</div>}

      <form onSubmit={handleSubmit}>
        {/* Primera fila: nombre, cédula, teléfono */}
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

        {/* Segunda fila: dirección, zona, municipio */}
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
              {municipios.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tercera fila: barrio, lugar, mesa */}
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
              {barrios.map((b) => (
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
              {lugares.map((l) => (
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
              {mesas.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.numero}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Cuarta fila: líder y activo */}
        <div className="row mb-3">
          <div className="col-md-6">
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
          <div className="col-md-6">
              <label className="form-label">Sexo</label>
              <select
                name="sexo"
                value={formulario.sexo}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="">-- Seleccione --</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
          </div>
          <div className="col-md-6 d-flex align-items-end">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="activo"
                name="activo"
                checked={formulario.activo}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="activo">
                Activo
              </label>
            </div>
          </div>
        </div>

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Actualizando..." : "Actualizar Votante"}
        </button>
      </form>
    </div>
  );
}
