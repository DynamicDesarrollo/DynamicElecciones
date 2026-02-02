import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function EditarLiderForm({ lider, onLiderActualizado }) {
  const [municipios, setMunicipios] = useState([]);
  const [barrios, setBarrios] = useState([]);
  const [formData, setFormData] = useState({
    nombre_completo: "",
    cedula: "",
    direccion: "",
    municipio: "",
    barrio: "",
    telefono: "",
    fecha_nace: "",
    aspirante_id: "",
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
        aspirante_id: lider.aspirante_id || "",
      });
    }
  }, [lider]);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const [resAsp, resMun, resBar] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/aspirantes`, { headers }),
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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/lideres/${lider.id}`, {
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
          <select
            className="form-select"
            name="barrio"
            value={formData.barrio}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione un barrio</option>
            {barrios
              .filter((b) => b.nombre === "La Apartada")
              .map((b) => (
                <option key={b.id} value={b.id}>{b.nombre}</option>
              ))}
          </select>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label">Municipio</label>
          <select
            className="form-select"
            name="municipio"
            value={formData.municipio}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione un municipio</option>
            {municipios
              .filter((m) => m.nombre === "Buenavista (CORD)" || m.nombre === "Apartada (CORD)")
              .map((m) => (
                <option key={m.id} value={m.id}>{m.nombre}</option>
              ))}
          </select>
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
        <label className="form-label">Aspirante que apoya (opcional)</label>
        <select
          className="form-select"
          name="aspirante_id"
          value={formData.aspirante_id}
          onChange={handleChange}
        >
          <option value="">Seleccione uno</option>
          {aspirantes.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nombre}
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
