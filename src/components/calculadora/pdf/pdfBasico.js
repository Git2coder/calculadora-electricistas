// src/components/calculadora/pdf/pdfBasico.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { $fmt, subtotalDeTarea } from "./helpersPDF";

export async function generarPDFBasico(params, datosEmisor, tareasActualizadas) {
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

  const tareaBoca =
    tareasSeleccionadas.find((t) => t.nombre === "Boca") ||
    tareasActualizadas.find((t) => t.nombre === "Boca");

  const valorBoca =
    tareaBoca != null
      ? (tareaBoca.tiempo / 60) * tarifaHoraria * (tareaBoca.multiplicador ?? 1)
      : null;

  tareasSeleccionadas.forEach((t) => {
    const sub = subtotalDeTarea(t, valorBoca, tarifaHoraria, tareasActualizadas);
    costoBasePDF += sub;
    filas.push([t.nombre || "Tarea", $fmt(sub)]);
  });

  // extras
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

  if (ajustePorcentaje) {
    const monto = (acumuladoConExtras * ajustePorcentaje) / 100;
    filas.push([
      ajustePorcentaje > 0 ? "Herramientas/insumos" : "Descuento aplicado",
      $fmt(monto),
    ]);
    acumuladoConExtras += monto;
  }

  if (!incluirVisita) filas.push(["Visita / Consulta", "BONIFICADA"]);
  else if (costoVisita > 0) filas.push(["Visita / Consulta", $fmt(costoVisita)]);

  autoTable(docPDF, {
    head: [["Concepto", "Subtotal"]],
    body: filas,
    startY: 30,
    styles: { fontSize: 9 },
  });

  const totalY = docPDF.lastAutoTable.finalY + 10;
  docPDF.setFont("helvetica", "bold");
  docPDF.text(`TOTAL: ${$fmt(acumuladoConExtras)}`, 14, totalY);

  docPDF.save(`presupuesto-basico-${Date.now()}.pdf`);
}
