// src/pages/AsistenciaPage.jsx
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useAuth } from "../context/AuthContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function AsistenciaPage() {
  const { usuario } = useAuth();
  const [cedula, setCedula] = useState("");
  const [votante, setVotante] = useState(null);
  const [loadingVotante, setLoadingVotante] = useState(false);
  const [puestoControl, setPuestoControl] = useState("");
  const [confirmando, setConfirmando] = useState(false);
  const [lastAsistencia, setLastAsistencia] = useState(null);

  const [resumenAsistencia, setResumenAsistencia] = useState({
    total_votantes: 0,
    total_asistencias: 0,
  });

  // Traer resumen de asistencias y total votantes
  const fetchResumen = async () => {
    try {
      const headers = { Authorization: `Bearer ${usuario.token}` };

      const [vtRes, asRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/votantes/total`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL}/api/asistencia/resumen`, { headers }),
      ]);

      if (vtRes.ok) {
        const vtData = await vtRes.json();
        setResumenAsistencia((prev) => ({ ...prev, total_votantes: vtData.total || 0 }));
      }

      if (asRes.ok) {
        const asData = await asRes.json();
        setResumenAsistencia((prev) => ({ ...prev, total_asistencias: asData.total_asistencias || 0 }));
      }
    } catch (err) {
      console.error("Error cargando resumen de asistencia:", err);
    }
  };

  useEffect(() => {
    if (!usuario?.token) return;

    fetchResumen(); // primera vez

    const intervalo = setInterval(() => {
      fetchResumen(); // cada 15 segundos
    }, 15000);

    return () => clearInterval(intervalo); // limpiar al desmontar
  }, [usuario]);


  const buscarVotante = async () => {
    if (!cedula.trim()) {
      Swal.fire("Atención", "Ingresa una cédula válida", "warning");
      return;
    }
    setLoadingVotante(true);
    setVotante(null);
    setLastAsistencia(null);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/asistencia?cedula=${encodeURIComponent(cedula)}`,
        {
          headers: { Authorization: `Bearer ${usuario.token}` },
        }
      );
      if (res.status === 404) {
        Swal.fire("No encontrado", "No se encontró ningún votante con esa cédula", "info");
        return;
      }
      if (!res.ok) throw new Error("Error al buscar votante");
      const data = await res.json();
      setVotante(data);

      // Si la respuesta trae asistencia previa embedded, la asignamos
      if (data.puesto_control || data.fecha_asistencia) {
        setLastAsistencia({
          puesto_control: data.puesto_control,
          lugar: data.lugar_nombre || "—",
          mesa: data.mesa_numero || "—",
          fecha: data.fecha_asistencia || null,
        });
      }
    } catch (err) {
      console.error("Error buscando votante:", err);
      Swal.fire("Error", "Ocurrió un error al buscar el votante", "error");
    } finally {
      setLoadingVotante(false);
    }
  };

  const confirmarAsistencia = async () => {
    if (!votante) {
      Swal.fire("Atención", "Primero busca un votante válido", "warning");
      return;
    }
    if (!puestoControl.trim()) {
      Swal.fire("Atención", "Ingresa el puesto de control", "warning");
      return;
    }

    setConfirmando(true);
    console.log("Enviando:", {
      votante_uuid: votante?.id,
      puesto_control: puestoControl,
    });
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/asistencia`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${usuario.token}`,
        },
        body: JSON.stringify({
          votante_uuid: votante.id || votante.votante_uuid || votante.uuid, // según cómo venga
          puesto_control: puestoControl,
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || "Error al registrar asistencia");
      }

      Swal.fire("Listo", "Asistencia registrada correctamente", "success");
      setLastAsistencia({
        puesto_control: puestoControl,
        lugar: votante.lugar_nombre || "—",
        mesa: votante.mesa_numero || "—",
      });
      setPuestoControl("");
      // refrescar resumen
      await fetchResumen();
    } catch (err) {
      console.error("Error creando asistencia:", err);
      Swal.fire("Error", err.message || "No se pudo registrar asistencia", "error");
    } finally {
      setConfirmando(false);
    }
  };

  const faltanPorAsistir =
    Math.max(0, resumenAsistencia.total_votantes - resumenAsistencia.total_asistencias);

  const exportarResumenPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Resumen de Asistencias", 14, 16);

    doc.setFontSize(12);
    doc.text(`Total votantes: ${resumenAsistencia.total_votantes}`, 14, 26);
    doc.text(`Total asistencias: ${resumenAsistencia.total_asistencias}`, 14, 32);
    doc.text(`Faltan por asistir: ${faltanPorAsistir}`, 14, 38);

    if (votante) {
      doc.text(" ", 14, 44);
      doc.setFontSize(14);
      doc.text("Votante buscado", 14, 50);
      doc.setFontSize(12);
      const votanteRows = [
        ["Nombre", votante.nombre_completo || "—"],
        ["Cédula", votante.cedula || "—"],
        ["Teléfono", votante.telefono || "—"],
        ["Barrio", votante.barrio_nombre || "—"],
        ["Municipio", votante.municipio_nombre || "—"],
        ["Zona", votante.zona || "—"],
      ];
      autoTable(doc, {
        startY: 55,
        theme: "grid",
        head: [["Campo", "Valor"]],
        body: votanteRows,
        styles: { fontSize: 10 },
      });

      if (lastAsistencia) {
        const startY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 6 : 100;
        doc.setFontSize(14);
        doc.text("Última asistencia", 14, startY);
        const asistenciaRows = [
          ["Puesto control", lastAsistencia.puesto_control || "—"],
          ["Lugar", lastAsistencia.lugar || "—"],
          ["Mesa", lastAsistencia.mesa || "—"],
          ["Fecha", lastAsistencia.fecha || "—"],
        ];
        autoTable(doc,{
          startY: startY + 5,
          theme: "grid",
          head: [["Campo", "Valor"]],
          body: asistenciaRows,
          styles: { fontSize: 10 },
        });
      }
    }

    doc.save("resumen_asistencias.pdf");
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-start mb-2">
        <div>
          <h2>📋 Control de Asistencias</h2>
        </div>
        <div>
          <button className="btn btn-outline-primary" onClick={exportarResumenPDF}>
            🖨️ Exportar resumen a PDF
          </button>
        </div>
      </div>

      {/* Resumen general */}
      <div className="row mb-4">
        <div className="col-md-4 mb-2">
          <div className="card shadow border-0 text-white bg-primary h-100">
            <div className="card-body d-flex align-items-center">
              <div className="me-3">
                <i className="bi bi-people-fill display-4"></i>
              </div>
              <div>
                <h6 className="card-title mb-1">Total Votantes</h6>
                <p className="card-text fs-4 mb-0">{resumenAsistencia.total_votantes}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-2">
          <div className="card shadow border-0 text-white bg-success h-100">
            <div className="card-body d-flex align-items-center">
              <div className="me-3">
                <i className="bi bi-check2-circle display-4"></i>
              </div>
              <div>
                <h6 className="card-title mb-1">Asistencias</h6>
                <p className="card-text fs-4 mb-0">{resumenAsistencia.total_asistencias}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-2">
          <div className="card shadow border-0 text-white bg-warning h-100">
            <div className="card-body d-flex align-items-center">
              <div className="me-3">
                <i className="bi bi-exclamation-circle display-4"></i>
              </div>
              <div>
                <h6 className="card-title mb-1">Faltan por asistir</h6>
                <p className="card-text fs-4 mb-0">{faltanPorAsistir}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Buscador + puesto */}
      <div className="card shadow p-4 mb-4">
        <div className="row g-3">
          <div className="col-md-3">
            <label className="form-label">Cédula del votante</label>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Ej: 12345678"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    buscarVotante();
                  }
                }}
              />
              <button
                className="btn btn-primary"
                onClick={buscarVotante}
                disabled={loadingVotante}
              >
                {loadingVotante ? "Buscando..." : "Buscar"}
              </button>
            </div>
          </div>

          <div className="col-md-3">
            <label className="form-label">Puesto de control</label>
            <input
              type="text"
              className="form-control"
              placeholder="Ej: Puesto A / Entrada"
              value={puestoControl}
              onChange={(e) => setPuestoControl(e.target.value)}
            />
          </div>

          <div className="col-md-3 d-flex align-items-end">
            <button
              className="btn btn-success w-100"
              onClick={confirmarAsistencia}
              disabled={!votante || confirmando}
            >
              {confirmando ? "Confirmando..." : "Confirmar asistencia"}
            </button>
          </div>
        </div>
      </div>

      {/* Info del votante y última asistencia */}
      {votante && (
        <div className="card shadow mb-4">
          <div className="card-body">
            <h5 className="card-title">🧍 Datos del Votante</h5>
            <div className="row">
              <div className="col-md-4">
                <p>
                  <strong>Nombre:</strong> {votante.nombre_completo}
                </p>
                <p>
                  <strong>Cédula:</strong> {votante.cedula}
                </p>
              </div>
              <div className="col-md-4">
                <p>
                  <strong>Teléfono:</strong> {votante.telefono || "—"}
                </p>
                <p>
                  <strong>Barrio:</strong> {votante.barrio_nombre || "—"}
                </p>
              </div>
              <div className="col-md-4">
                <p>
                  <strong>Municipio:</strong> {votante.municipio_nombre || "—"}
                </p>
                <p>
                  <strong>Zona:</strong> {votante.zona || "—"}
                </p>
              </div>
            </div>
            {lastAsistencia && (
              <div className="row mt-3">
                <div className="col-md-3">
                  <p>
                    <strong>Puesto de control:</strong> {lastAsistencia.puesto_control}
                  </p>
                </div>
                <div className="col-md-3">
                  <p>
                    <strong>Lugar:</strong> {lastAsistencia.lugar}
                  </p>
                </div>
                <div className="col-md-3">
                  <p>
                    <strong>Mesa:</strong> {lastAsistencia.mesa}
                  </p>
                </div>
                {lastAsistencia.fecha && (
                  <div className="col-md-3">
                    <p>
                      <strong>Fecha:</strong> {new Date(lastAsistencia.fecha).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
