// Exportación a PDF y Excel. Las librerías se cargan solo al exportar,
// para que la app abra rápido en celulares de gama media.

export async function exportarPDF({ titulo, subtitulo, columnas, filas, archivo, orientacion = "portrait" }) {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  const doc = new jsPDF({ orientation: orientacion, unit: "pt", format: "a4" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(titulo, 40, 48);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(95, 100, 108);
  doc.text(subtitulo || `Generado el ${new Date().toLocaleString("es-CO")}`, 40, 66);
  autoTable(doc, {
    startY: 82,
    head: [columnas],
    body: filas,
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 5, textColor: [18, 20, 23], lineColor: [222, 220, 214], lineWidth: { bottom: 0.5 } },
    headStyles: { fontStyle: "bold", textColor: [95, 100, 108], lineWidth: { bottom: 1 }, lineColor: [185, 182, 174] },
  });
  doc.save(archivo);
}

export async function exportarExcel({ hoja, filas, archivo }) {
  const XLSX = await import("xlsx");
  const ws = XLSX.utils.json_to_sheet(filas);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, hoja);
  XLSX.writeFile(wb, archivo);
}

// Descarga un archivo binario que arma el backend (p. ej. el Excel de votantes)
export async function descargarArchivo(ruta, archivo) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api${ruta}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("No se pudo descargar el archivo");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), { href: url, download: archivo });
  a.click();
  URL.revokeObjectURL(url);
}
