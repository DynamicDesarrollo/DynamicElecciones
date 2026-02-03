import { useState, useEffect } from "react";
import { toast } from "react-toastify";

export default function CrearAspiranteForm({ onAspiranteCreado, onCancel }) {
  const [formulario, setFormulario] = useState({
    nombre_completo: "",
    cedula: "",
    telefono: "",
    direccion: "",
    barrio: "",
    fecha_nace: "",
    municipio_id: "",
    partido_id: "",
    alcaldia_id: "",
  });

  const [municipios, setMunicipios] = useState([]);
  const [partidos, setPartidos] = useState([]);
  const [alcaldias, setAlcaldias] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    const fetchData = async () => {
      try {
        const [resMun, resPar, resAlc] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/municipios`, { headers }),
          fetch(`${import.meta.env.VITE_API_URL}/api/partidos`, { headers }),
          fetch(`${import.meta.env.VITE_API_URL}/api/alcaldia`, { headers }),
        ]);

        const munData = await resMun.json();
        const parData = await resPar.json();
        const alcData = await resAlc.json();

        setMunicipios(Array.isArray(munData) ? munData : []);
        setPartidos(Array.isArray(parData) ? parData : []);
        setAlcaldias(Array.isArray(alcData) ? alcData : []);
      } catch (error) {
        toast.error("Error al cargar datos de selección");
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormulario((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/concejo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formulario),
      });

      if (!res.ok) throw new Error("Error al crear aspirante");

      toast.success("✅ Aspirante creado exitosamente");
      setFormulario({
        nombre_completo: "",
        cedula: "",
        telefono: "",
        direccion: "",
        barrio: "",
        fecha_nace: "",
        municipio_id: "",
        partido_id: "",
        alcaldia_id: "",
      });

      if (onAspiranteCreado) onAspiranteCreado();
    } catch (err) {
      console.error(err);
      toast.error("❌ Error al crear aspirante");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow p-4">
      <h4 className="mb-4">🧑‍💼 Crear Aspirante al Concejo</h4>

      <form onSubmit={handleSubmit}>
        <div className="row mb-3">
          <div className="col-md-6">
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
          <div className="col-md-6">
            <label className="form-label">Cédula</label>
            <input
              type="text"
              name="cedula"
              value={formulario.cedula}
              onChange={handleChange}
              className="form-control"
            />
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label">Teléfono</label>
            <input
              type="text"
              name="telefono"
              value={formulario.telefono}
              onChange={handleChange}
              className="form-control"
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Dirección</label>
            <input
              type="text"
              name="direccion"
              value={formulario.direccion}
              onChange={handleChange}
              className="form-control"
            />
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label">Barrio</label>
            <input
              type="text"
              name="barrio"
              value={formulario.barrio}
              onChange={handleChange}
              className="form-control"
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Fecha de nacimiento</label>
            <input
              type="date"
              name="fecha_nace"
              value={formulario.fecha_nace}
              onChange={handleChange}
              className="form-control"
            />
          </div>
        </div>

        <div className="row mb-3">
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

          <div className="col-md-4">
            <label className="form-label">Partido</label>
            <select
              name="partido_id"
              value={formulario.partido_id}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">-- Seleccione --</option>
              {partidos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label">Aspirante Alcaldía</label>
            <select
              name="alcaldia_id"
              value={formulario.alcaldia_id}
              onChange={handleChange}
              className="form-select"
            >
              <option value="">-- Opcional --</option>
              {alcaldias.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nombre_completo}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button className="btn btn-primary me-2" type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Guardar Aspirante"}
        </button>
        <button className="btn btn-secondary" type="button" onClick={onCancel}>
          Cancelar
        </button>
      </form>
    </div>
  );
}
