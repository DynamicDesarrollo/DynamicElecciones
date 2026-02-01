// src/components/Lideres/CrearLiderForm.jsx
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

export default function CrearLiderForm({ onLiderCreado }) {
    const [municipios, setMunicipios] = useState([]);
    const [barrios, setBarrios] = useState([]);
  const [formData, setFormData] = useState({
    nombre_completo: "",
    cedula: "",
    direccion: "",
    municipio: "",
    telefono: "",
    barrio: "",
    fecha_nace: "",
    aspirante_concejo_id: "",
  });

  const [aspirantes, setAspirantes] = useState([]);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const [resAsp, resMun, resBar] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/concejo`, { headers }),
          fetch(`${import.meta.env.VITE_API_URL}/api/municipios`, { headers }),
          fetch(`${import.meta.env.VITE_API_URL}/api/barrios`, { headers }),
        ]);
        const aspData = await resAsp.json();
        const munData = await resMun.json();
        const barData = await resBar.json();
        setAspirantes(Array.isArray(aspData) ? aspData : []);
        setMunicipios(Array.isArray(munData) ? munData : []);
        setBarrios(Array.isArray(barData) ? barData : []);
      } catch (err) {
        toast.error("❌ Error al cargar datos de selección");
      }
    };
    cargarDatos();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/lideres`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("✅ Líder creado exitosamente");
        onLiderCreado();
      } else {
        toast.error("❌ Error al crear líder");
      }
    } catch (err) {
      toast.error("❌ Error de red al crear líder");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label">Nombre completo</label>
          <input
            type="text"
            name="nombre_completo"
            className="form-control"
            value={formData.nombre_completo}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Cédula</label>
          <input
            type="text"
            name="cedula"
            className="form-control"
            value={formData.cedula}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Teléfono</label>
          <input
            type="text"
            name="telefono"
            className="form-control"
            value={formData.telefono}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Dirección</label>
          <input
            type="text"
            name="direccion"
            className="form-control"
            value={formData.direccion}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Municipio</label>
          <select
            name="municipio"
            className="form-select"
            value={formData.municipio}
            onChange={handleChange}
          >
            <option value="">Seleccione un municipio</option>
            {municipios.map((m) => (
              <option key={m.id} value={m.id}>{m.nombre}</option>
            ))}
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label">Barrio</label>
          <select
            name="barrio"
            className="form-select"
            value={formData.barrio}
            onChange={handleChange}
          >
            <option value="">Seleccione un barrio</option>
            {barrios.map((b) => (
              <option key={b.id} value={b.id}>{b.nombre}</option>
            ))}
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label">Fecha de nacimiento</label>
          <input
            type="date"
            name="fecha_nace"
            className="form-control"
            value={formData.fecha_nace}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Aspirante que apoya</label>
          <select
            className="form-select"
            name="aspirante_concejo_id"
            value={formData.aspirante_concejo_id}
            onChange={handleChange}
          >
            <option value="">Seleccione uno</option>
            {aspirantes.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nombre_completo}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 text-end">
        <button className="btn btn-primary" type="submit">
          Guardar Líder
        </button>
      </div>
    </form>
  );
}
