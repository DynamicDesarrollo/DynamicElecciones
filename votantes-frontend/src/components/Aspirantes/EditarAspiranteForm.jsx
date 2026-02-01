import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

export default function EditarAspiranteForm({ aspirante, onAspiranteActualizado }) {
      const [partidos, setPartidos] = useState([]);
      const [municipios, setMunicipios] = useState([]);
      const [alcaldias, setAlcaldias] = useState([]);

      useEffect(() => {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const fetchData = async () => {
          try {
            const [resPar, resMun, resAlc] = await Promise.all([
              fetch(`${import.meta.env.VITE_API_URL}/api/partidos`, { headers }),
              fetch(`${import.meta.env.VITE_API_URL}/api/municipios`, { headers }),
              fetch(`${import.meta.env.VITE_API_URL}/api/alcaldia`, { headers }),
            ]);
            setPartidos(Array.isArray(await resPar.json()) ? await resPar.json() : []);
            setMunicipios(Array.isArray(await resMun.json()) ? await resMun.json() : []);
            setAlcaldias(Array.isArray(await resAlc.json()) ? await resAlc.json() : []);
          } catch (error) {
            // Puedes mostrar un toast si quieres
          }
        };
        fetchData();
      }, []);
    console.log('EditarAspiranteForm recibe aspirante:', aspirante);
  const [form, setForm] = useState({
    nombre_completo: "",
    cedula: "",
    partido_id: "",
    municipio_id: "",
    alcaldia_id: "",
    direccion: "",
    telefono: "",
    barrio: "",
    fecha_nace: "",
  });

  useEffect(() => {
    if (aspirante) {
      setForm({
        nombre_completo: aspirante.nombre_completo || "",
        cedula: aspirante.cedula || "",
        partido_id: aspirante.partido_id || "",
        municipio_id: aspirante.municipio_id || "",
        alcaldia_id: aspirante.alcaldia_id || "",
        direccion: aspirante.direccion || "",
        telefono: aspirante.telefono || "",
        barrio: aspirante.barrio || "",
        fecha_nace: aspirante.fecha_nace ? aspirante.fecha_nace.slice(0, 10) : "",
      });
    }
  }, [aspirante]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/concejo/${aspirante.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast.success("✅ Aspirante actualizado correctamente");
        onAspiranteActualizado();
      } else {
        toast.error("❌ Error al actualizar aspirante");
      }
    } catch (err) {
      toast.error("❌ Error de conexión");
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label className="form-label">Nombre completo</label>
        <input
          name="nombre_completo"
          value={form.nombre_completo}
          onChange={handleChange}
          type="text"
          className="form-control"
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Cédula</label>
        <input
          name="cedula"
          value={form.cedula}
          onChange={handleChange}
          type="text"
          className="form-control"
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Dirección</label>
        <input
          name="direccion"
          value={form.direccion}
          onChange={handleChange}
          type="text"
          className="form-control"
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Teléfono</label>
        <input
          name="telefono"
          value={form.telefono}
          onChange={handleChange}
          type="text"
          className="form-control"
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Barrio</label>
        <input
          name="barrio"
          value={form.barrio}
          onChange={handleChange}
          type="text"
          className="form-control"
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Fecha de nacimiento</label>
        <input
          name="fecha_nace"
          value={form.fecha_nace}
          onChange={handleChange}
          type="date"
          className="form-control"
        />
      </div>

      {/* Estos campos los puedes convertir a select si ya tienes los datos de partidos, municipios, etc. */}
      <div className="mb-3">
        <label className="form-label">Partido</label>
        <select
          name="partido_id"
          value={form.partido_id}
          onChange={handleChange}
          className="form-control"
        >
          <option value="">Seleccione un partido</option>
          {partidos.map((p) => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">Municipio</label>
        <select
          name="municipio_id"
          value={form.municipio_id}
          onChange={handleChange}
          className="form-control"
        >
          <option value="">Seleccione un municipio</option>
          {municipios.map((m) => (
            <option key={m.id} value={m.id}>{m.nombre}</option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">Alcaldía</label>
        <select
          name="alcaldia_id"
          value={form.alcaldia_id}
          onChange={handleChange}
          className="form-control"
        >
          <option value="">Seleccione una alcaldía</option>
          {alcaldias.map((a) => (
            <option key={a.id} value={a.id}>{a.nombre_completo || a.nombre}</option>
          ))}
        </select>
      </div>

      <button className="btn btn-primary" type="submit">
        💾 Guardar Cambios
      </button>
    </form>
  );
}
