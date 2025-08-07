import { useState, useEffect } from "react";
import { toast } from "react-toastify";

export default function EditarAspiranteAlcaldiaForm({ aspirante, onAspiranteActualizado }) {
  const [form, setForm] = useState({ ...aspirante });

  useEffect(() => {
    setForm({ ...aspirante });
  }, [aspirante]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/alcaldia/${aspirante.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Error al actualizar");

      toast.success("✅ Aspirante actualizado correctamente");
      onAspiranteActualizado();
    } catch (error) {
      toast.error("❌ Error al actualizar el aspirante");
      console.error(error);
    }
  };

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
        <button type="submit" className="btn btn-success">
          Actualizar
        </button>
      </div>
    </form>
  );
}
