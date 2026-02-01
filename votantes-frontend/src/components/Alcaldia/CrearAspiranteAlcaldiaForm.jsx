import { useState } from "react";
import { toast } from "react-toastify";

export default function CrearAspiranteAlcaldiaForm({ onAspiranteCreado }) {
  const [form, setForm] = useState({
    nombre_completo: "",
    cedula: "",
    partido: "",
    municipio: "",
    telefono: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/alcaldia`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Error al guardar");

      toast.success("\u2705 Aspirante guardado correctamente");
      onAspiranteCreado();
    } catch (error) {
      toast.error("\u274c Error al guardar el aspirante");
      console.error(error);
    }
  };

  // Example: Add array validation before .map usage if rendering aspirantes elsewhere
  // {Array.isArray(aspirantes) ? aspirantes.map(...) : null}

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label>Nombre completo</label>
        <input
          type="text"
          className="form-control"
          name="nombre_completo"
          value={form.nombre_completo}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mb-3">
        <label>Cédula</label>
        <input
          type="text"
          className="form-control"
          name="cedula"
          value={form.cedula}
          onChange={handleChange}
        />
      </div>

      <div className="mb-3">
        <label>Partido</label>
        <input
          type="text"
          className="form-control"
          name="partido"
          value={form.partido}
          onChange={handleChange}
        />
      </div>

      <div className="mb-3">
        <label>Municipio</label>
        <input
          type="text"
          className="form-control"
          name="municipio"
          value={form.municipio}
          onChange={handleChange}
        />
      </div>

      <div className="mb-3">
        <label>Teléfono</label>
        <input
          type="text"
          className="form-control"
          name="telefono"
          value={form.telefono}
          onChange={handleChange}
        />
      </div>

      <div className="text-end">
        <button type="submit" className="btn btn-primary">
          Guardar
        </button>
      </div>
    </form>
  );
}
