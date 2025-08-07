import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function EditarLiderForm({ lider, onLiderActualizado }) {
  const [formData, setFormData] = useState({
    nombre_completo: "",
    cedula: "",
    direccion: "",
    municipio: "",
    barrio: "",
    telefono: "",
    fecha_nace: "",
    aspirante_concejo_id: "",
  });

  const [aspirantes, setAspirantes] = useState([]);

  useEffect(() => {
    if (lider) {
      setFormData({
        nombre_completo: lider.nombre_completo || "",
        cedula: lider.cedula || "",
        direccion: lider.direccion || "",
        municipio: lider.municipio || "",
        barrio: lider.barrio || "",
        telefono: lider.telefono || "",
        fecha_nace: lider.fecha_nace ? lider.fecha_nace.substring(0, 10) : "",
        aspirante_concejo_id: lider.aspirante_concejo_id || "",
      });
    }
  }, [lider]);

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
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/lideres/${lider.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("✅ Líder actualizado correctamente");
        onLiderActualizado();
      } else {
        toast.error("❌ Error al actualizar líder");
      }
    } catch (err) {
      console.error(err);
      toast.error("❌ Error de red");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label className="form-label">Nombre completo</label>
        <input
          type="text"
          className="form-control"
          name="nombre_completo"
          value={formData.nombre_completo}
          onChange={handleChange}
          required
        />
      </div>

      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label">Cédula</label>
          <input
            type="text"
            className="form-control"
            name="cedula"
            value={formData.cedula}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">Teléfono</label>
          <input
            type="text"
            className="form-control"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label">Dirección</label>
          <input
            type="text"
            className="form-control"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">Barrio</label>
          <input
            type="text"
            className="form-control"
            name="barrio"
            value={formData.barrio}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label">Municipio</label>
          <input
            type="text"
            className="form-control"
            name="municipio"
            value={formData.municipio}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">Fecha de nacimiento</label>
          <input
            type="date"
            className="form-control"
            name="fecha_nace"
            value={formData.fecha_nace}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label">Aspirante al Concejo que Apoya</label>
        <select
          className="form-select"
          name="aspirante_concejo_id"
          value={formData.aspirante_concejo_id}
          onChange={handleChange}
        >
          <option value="">-- Seleccione --</option>
          {aspirantes.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nombre_completo}
            </option>
          ))}
        </select>
      </div>

      <div className="text-end">
        <button type="submit" className="btn btn-success">
          💾 Guardar Cambios
        </button>
      </div>
    </form>
  );
}
