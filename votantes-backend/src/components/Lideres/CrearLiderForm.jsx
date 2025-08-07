// src/components/Lideres/CrearLiderForm.jsx
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

export default function CrearLiderForm({ onLiderCreado }) {
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
    const cargarAspirantes = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${import.meta.env.VITE_API_URL}/concejo`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setAspirantes(data);
      } catch (err) {
        toast.error("❌ Error al cargar aspirantes");
      }
    };
    cargarAspirantes();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/lideres`, {
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
          <input
            type="text"
            name="municipio"
            className="form-control"
            value={formData.municipio}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Barrio</label>
          <input
            type="text"
            name="barrio"
            className="form-control"
            value={formData.barrio}
            onChange={handleChange}
          />
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
