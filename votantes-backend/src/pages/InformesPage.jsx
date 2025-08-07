import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function InformesPage() {
  const { usuario } = useAuth();
  const [vista, setVista] = useState("votantes");
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(false);

  const [paginaActual, setPaginaActual] = useState(1);
  const resultadosPorPagina = 10;

  const fetchDatos = async () => {
    setLoading(true);
    try {
      const endpoint =
        vista === "votantes"
          ? "/informes/votantes-duplicados"
          : "/informes/asistencias-duplicadas";

      const res = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${usuario.token}` },
      });

      if (!res.ok) throw new Error("Error al obtener datos del informe");
      const data = await res.json();
      setDatos(data);
      setPaginaActual(1);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudieron cargar los datos del informe", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (usuario?.token) fetchDatos();
  }, [vista]);

  const exportarExcel = () => {
    const hoja = XLSX.utils.json_to_sheet(datos);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Informe");
    XLSX.writeFile(libro, `informe_${vista}.xlsx`);
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    const columnas = Object.keys(datos[0] || {}).map((key) => key.toUpperCase());
    const filas = datos.map((item) =>
      Object.values(item).map((val) => Array.isArray(val) ? val.join(", ") : val)
    );

    doc.text(`Informe de ${vista === "votantes" ? "Votantes Duplicados" : "Asistencias Duplicadas"}`, 14, 15);
    autoTable(doc, { startY: 20, head: [columnas], body: filas });
    doc.save(`informe_${vista}.pdf`);
  };

  const totalPaginas = Math.ceil(datos.length / resultadosPorPagina);
  const datosPaginados = datos.slice(
    (paginaActual - 1) * resultadosPorPagina,
    paginaActual * resultadosPorPagina
  );

  return (
    <div className="container mt-4">
      <h2>📊 Informes</h2>

      <div className="btn-group mt-3 mb-3">
        <button className={`btn ${vista === "votantes" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setVista("votantes")}>Votantes Duplicados</button>
        <button className={`btn ${vista === "asistencias" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setVista("asistencias")}>Asistencias Duplicadas</button>
      </div>

      <div className="mb-3">
        <button className="btn btn-outline-success me-2" onClick={exportarExcel}><i className="bi bi-file-earmark-excel"></i> Exportar Excel</button>
        <button className="btn btn-outline-danger" onClick={exportarPDF}><i className="bi bi-file-earmark-pdf"></i> Exportar PDF</button>
      </div>

      <div className="table-responsive">
        {loading ? (
          <p>Cargando...</p>
        ) : datos.length === 0 ? (
          <p>No hay resultados para mostrar.</p>
        ) : (
          <>
            <table className="table table-striped table-bordered">
              <thead>
                <tr>
                  {Object.keys(datos[0]).map((key) => (
                    <th key={key}>{key.replace(/_/g, " ").toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {datosPaginados.map((item, idx) => (
                  <tr key={idx}>
                    {Object.values(item).map((val, i) => (
                      <td key={i}>{Array.isArray(val) ? val.join(", ") : val || "—"}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="d-flex justify-content-between align-items-center">
              <span>Mostrando página {paginaActual} de {totalPaginas}</span>
              <div>
                <button className="btn btn-sm btn-outline-secondary me-2" disabled={paginaActual === 1} onClick={() => setPaginaActual(paginaActual - 1)}>Anterior</button>
                <button className="btn btn-sm btn-outline-secondary" disabled={paginaActual === totalPaginas} onClick={() => setPaginaActual(paginaActual + 1)}>Siguiente</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
