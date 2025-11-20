// src/components/calculadora/pdf/pdfGratuito.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { $fmt, subtotalDeTarea } from "./helpersPDF";

export async function generarPDFGratuito(params, datosEmisor, tareasActualizadas) {
  const {
    tareasSeleccionadas,
    tarifaHoraria,
    ajustePorcentaje,
    incluirVisita,
    costoVisita,
    extrasGlobales,
    extrasSeleccionadosGlobal,
  } = params;

  const docPDF = new jsPDF();
  const filas = [];
  let costoBasePDF = 0;

  // ✅ obtener valor actual de Boca
  const tareaBoca =
    tareasSeleccionadas.find((t) => t.nombre === "Boca") ||
    tareasActualizadas.find((t) => t.nombre === "Boca");

  const valorBoca =
    tareaBoca != null
      ? (tareaBoca.tiempo / 60) * tarifaHoraria * (tareaBoca.multiplicador ?? 1)
      : null;

  // 1️⃣ Tareas principales
  tareasSeleccionadas.forEach((t) => {
    const sub = subtotalDeTarea(t, valorBoca, tarifaHoraria, tareasActualizadas);
    costoBasePDF += sub;
    filas.push([t.nombre || "Tarea sin nombre", $fmt(sub)]);
  });

  // 2️⃣ Extras globales
  let acumuladoConExtras = costoBasePDF;
  extrasSeleccionadosGlobal.forEach((id) => {
    const extra = extrasGlobales.find((e) => e.id === id);
    if (extra) {
      const nuevoTotal = acumuladoConExtras * extra.multiplicador;
      const impacto = nuevoTotal - acumuladoConExtras;
      filas.push([extra.label, $fmt(impacto)]);
      acumuladoConExtras = nuevoTotal;
    }
  });

  // 3️⃣ Ajuste global
  if (ajustePorcentaje !== 0) {
    const monto = (acumuladoConExtras * ajustePorcentaje) / 100;
    filas.push([
      ajustePorcentaje > 0 ? "Herramientas/insumos" : "Descuento aplicado",
      $fmt(monto),
    ]);
    acumuladoConExtras += monto;
  }

  // 4️⃣ Visita / consulta
  if (!incluirVisita) filas.push(["Visita / Consulta", "BONIFICADA"]);
  else if (costoVisita > 0) {
    filas.push(["Visita / Consulta", $fmt(costoVisita)]);
    acumuladoConExtras += costoVisita;
  } else filas.push(["Visita / Consulta", "Bonificado"]);

  // --- Encabezado ---
  docPDF.setFont("helvetica", "bold");
  docPDF.setFontSize(18);
  docPDF.text("Presupuesto", 14, 18);

  docPDF.setFont("helvetica", "normal");
  docPDF.setFontSize(10);
  docPDF.text(`Fecha: ${new Date().toLocaleDateString("es-AR")}`, 14, 25);
  docPDF.text(`Versión gratuita`, 200 - 14, 25, { align: "right" });

  docPDF.setDrawColor(180);
  docPDF.line(10, 28, 200, 28);

  // --- Tabla ---
  autoTable(docPDF, {
    head: [["Concepto", "Subtotal"]],
    body: filas,
    startY: 35,
    theme: "grid",
    styles: { fontSize: 9 },
    headStyles: {
      fillColor: [230, 230, 230],
      textColor: [0, 0, 0],
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 120, halign: "left" },
      1: { cellWidth: 50, halign: "right" },
    },
    didParseCell: (data) => {
      const txt = String(data.cell.text).trim();
      if (txt === "BONIFICADA" || txt === "Bonificado") {
        data.cell.styles.textColor = [34, 139, 34];
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.fillColor = [220, 255, 220];
      }
    },
  });

  // --- Total ---
  const finalY = docPDF.lastAutoTable?.finalY || 40;
  docPDF.setFont("helvetica", "bold");
  docPDF.setFontSize(12);
  docPDF.text(`TOTAL: ${$fmt(acumuladoConExtras)}`, 14, finalY + 10);

  // --- Pie ---
  const pageHeight = docPDF.internal.pageSize.height;
  docPDF.setDrawColor(180);
  docPDF.line(10, pageHeight - 20, 200, pageHeight - 20);

  docPDF.setFont("helvetica", "italic");
  docPDF.setFontSize(9);
  docPDF.text(
    "Versión gratuita del presupuesto. Actualizá tu plan para acceder al detalle completo y formato profesional.",
    14,
    pageHeight - 12,
    { maxWidth: 180 }
  );

  docPDF.save(`presupuesto-gratuito-${Date.now()}.pdf`);
}
