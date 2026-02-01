import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
  LabelList,
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";

// Paleta de colores
const colores = [
  "#0d6efd",
  "#198754",
  "#dc3545",
  "#ffc107",
  "#6610f2",
  "#20c997",
  "#fd7e14",
  "#6f42c1",
  "#0dcaf0",
  "#adb5bd",
];

export default function DashboardPage() {
  const { usuario } = useAuth();

  const [resumen, setResumen] = useState({
    total_votantes: 0,
    total_lideres: 0,
    total_barrios: 0,
  });

  const [datosGrafico, setDatosGrafico] = useState([]);

  const chartRef = useRef(null);

  useEffect(() => {
    if (!usuario?.token) return;


    const fetchResumen = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reportes/dashboard`, {
          headers: { Authorization: `Bearer ${usuario.token}` },
        });

        if (!res.ok) throw new Error("Error al obtener resumen");
        const data = await res.json();
        setResumen(data);
      } catch (err) {
        console.error("Error al cargar datos del dashboard:", err);
      }
    };

    const fetchGrafico = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reportes/votantesporpartido`, {
          headers: { Authorization: `Bearer ${usuario.token}` },
        });

        if (!res.ok) throw new Error("Error al obtener datos del gráfico");

        const data = await res.json();
        setDatosGrafico(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error al cargar gráfica:", err);
      }
    };

    fetchResumen();
    fetchGrafico();
  }, [usuario]);

  const exportarResumenPDF = async () => {
    const doc = new jsPDF("landscape", "pt", "a4");
    const padding = 40;
    const usableWidth = doc.internal.pageSize.getWidth() - padding * 2;
    let cursorY = 60;

    doc.setFontSize(22);
    doc.text("Resumen del Dashboard", 40, cursorY);
    cursorY += 25;

    doc.setFontSize(12);
    doc.text(`Fecha: ${new Date().toLocaleString()}`, padding, cursorY);
    cursorY += 15;
    if (usuario?.nombre) {
      doc.text(`Generado por: ${usuario.nombre} (${usuario.rol})`, padding, cursorY);
    } else if (usuario?.email) {
      doc.text(`Generado por: ${usuario.email} (${usuario.rol})`, padding, cursorY);
    }
    cursorY += 30;

    // Tarjetas resumen
    doc.setFontSize(14);
    const cardWidth = (usableWidth - 20) / 3;
    const cardHeight = 70;
    const gap = 20;
    const startX = 40;

    const tarjetas = [
      { title: "Total Votantes", value: resumen.total_votantes, color: "#0d6efd", icon: "" },
      { title: "Total Líderes", value: resumen.total_lideres, color: "#198754", icon: "" },
      { title: "Total Barrios", value: resumen.total_barrios, color: "#ffc107", icon: "" },
    ];

    tarjetas.forEach((t, i) => {
      const x = startX + i * (cardWidth + gap);
      doc.setFillColor(t.color);
      doc.roundedRect(x, cursorY, cardWidth, cardHeight, 6, 6, "F");
      doc.setTextColor("#ffffff");
      doc.setFontSize(10);
      doc.text(t.icon, x + 8, cursorY + 18);
      doc.setFontSize(12);
      doc.text(t.title, x + 30, cursorY + 18);
      doc.setFontSize(16);
      doc.text(String(t.value), x + 30, cursorY + 38);
    });

    cursorY += cardHeight + 30;
    doc.setTextColor("#000000");

    // Gráfica: capturar con html2canvas
    if (chartRef.current) {
      try {
        const canvas = await html2canvas(chartRef.current, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const imgWidth = doc.internal.pageSize.getWidth() - padding * 2;
        const aspect = canvas.height / canvas.width;
        const imgHeight = imgWidth * aspect;
        doc.setFontSize(14);
        doc.text("Votantes por Partido", padding, cursorY);
        cursorY += 10;
        doc.addImage(imgData, "PNG", padding, cursorY, imgWidth, imgHeight);
        cursorY += imgHeight + 30;
      } catch (err) {
        console.warn("No se pudo capturar la gráfica:", err);
        doc.setFontSize(12);
        doc.text("La gráfica no pudo ser renderizada.", padding, cursorY);
        cursorY += 30;
      }
    }

    // Tabla con datos del gráfico
    if (datosGrafico.length) {
      doc.setFontSize(14);
      doc.text("Detalle por Partido", padding, cursorY);
      cursorY += 10;

      const tableData = datosGrafico.map((d) => [d.partido, d.total]);
      autoTable(doc, {
        head: [["Partido", "Total"]],
        body: tableData,
        startY: cursorY,
        theme: "striped",
        styles: { fontSize: 10 },
        headStyles: { fillColor: "#0d6efd", textColor: "#fff" },
        columnStyles: {
          1: { halign: "right" },
        },
      });
    }

    doc.save("resumen_dashboard.pdf");
  };

  if (!usuario) {
    return <div className="text-danger">❌ Usuario no autenticado</div>;
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2>📊 Resumen del Dashboard</h2>
        </div>
        <div>
          <button className="btn btn-outline-primary" onClick={exportarResumenPDF}>
            🖨️ Exportar resumen a PDF
          </button>
        </div>
      </div>

      <div className="row">
        {/* Tarjetas */}
        <div className="col-md-4 mb-3">
          <div className="card shadow border-0 text-white bg-primary h-100">
            <div className="card-body d-flex align-items-center">
              <div className="me-3">
                <i className="bi bi-person-lines-fill display-4"></i>
              </div>
              <div>
                <h5 className="card-title">Total Votantes</h5>
                <p className="card-text fs-3 mb-0">{resumen.total_votantes}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card shadow border-0 text-white bg-success h-100">
            <div className="card-body d-flex align-items-center">
              <div className="me-3">
                <i className="bi bi-person-badge-fill display-4"></i>
              </div>
              <div>
                <h5 className="card-title">Total Líderes</h5>
                <p className="card-text fs-3 mb-0">{resumen.total_lideres}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card shadow border-0 text-white bg-warning h-100">
            <div className="card-body d-flex align-items-center">
              <div className="me-3">
                <i className="bi bi-house-door-fill display-4"></i>
              </div>
              <div>
                <h5 className="card-title">Total Barrios</h5>
                <p className="card-text fs-3 mb-0">{resumen.total_barrios}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Gráfica de votantes por partido */}
        <div className="col-12 mt-4">
          <h4 className="text-center mb-4">🗳️ Votantes por Partido</h4>
          <div style={{ width: "100%", height: 300 }} ref={chartRef}>
            <ResponsiveContainer>
              <BarChart data={datosGrafico}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="partido" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" isAnimationActive={false}>
                  {datosGrafico.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colores[index % colores.length]} />
                  ))}
                  <LabelList dataKey="total" position="top" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
}
