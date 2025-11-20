// src/components/calculadora/pdf/pdfCompleto.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { $fmt, subtotalDeTarea } from "./helpersPDF";
import { extrasDisponibles } from "../../CalculadoraCompleta";

export async function generarPDFCompleto(params, datosEmisor, tareasActualizadas) {
  const {
    tareasSeleccionadas,
    tarifaHoraria,
    ajustePorcentaje,
    incluirVisita,
    costoVisita,
    extrasGlobales,
    extrasSeleccionadosGlobal,
    titulo,
    validezDias,
  } = params;

  const docPDF = new jsPDF();
  const filas = [];
  let costoBasePDF = 0;

  // ✅ “Boca” actualizada
  const tareaBoca =
    tareasSeleccionadas.find((t) => t.nombre === "Boca") ||
    tareasActualizadas.find((t) => t.nombre === "Boca");

  const valorBoca =
    tareaBoca != null
      ? (tareaBoca.tiempo / 60) * tarifaHoraria * (tareaBoca.multiplicador ?? 1)
      : null;

  // --- Encabezado ---
  docPDF.setFont("helvetica", "bold");
  docPDF.setFontSize(16);
  docPDF.text(titulo.toUpperCase(), 14, 20);

  const nroPresupuesto = `P-${Date.now()}`;
  docPDF.setFont("helvetica", "normal");
  docPDF.setFontSize(10);
  docPDF.text(`Presupuesto Nº: ${nroPresupuesto}`, 200 - 14, 15, { align: "right" });
  docPDF.text(`Fecha: ${new Date().toLocaleDateString("es-AR")}`, 200 - 14, 20, { align: "right" });

  docPDF.setDrawColor(180);
  docPDF.line(10, 25, 200, 25);

  // --- Cuerpo de tareas ---
  tareasSeleccionadas.forEach((t) => {
    let sub = subtotalDeTarea(t, valorBoca, tarifaHoraria, tareasActualizadas);
    if (t.extras?.length) {
      t.extras.forEach((idExtra) => {
        const extra = extrasDisponibles.find((e) => e.id === idExtra);
        if (extra) sub *= extra.multiplicador;
      });
    }
    costoBasePDF += sub;
    filas.push([t.nombre, t.cantidad || 1, $fmt(sub)]);
  });

  // --- Extras globales ---
  let acumuladoConExtras = costoBasePDF;
  extrasSeleccionadosGlobal.forEach((id) => {
    const extra = extrasGlobales.find((e) => e.id === id);
    if (extra) {
      const nuevoTotal = acumuladoConExtras * extra.multiplicador;
      const impacto = nuevoTotal - acumuladoConExtras;
      filas.push([extra.label, "", $fmt(impacto)]);
      acumuladoConExtras = nuevoTotal;
    }
  });

  // --- Ajuste global ---
  if (ajustePorcentaje) {
    const monto = (acumuladoConExtras * ajustePorcentaje) / 100;
    filas.push([
      ajustePorcentaje > 0 ? "Herramientas/insumos" : "Descuento aplicado",
      "",
      $fmt(monto),
    ]);
    acumuladoConExtras += monto;
  }

  // --- Visita / consulta ---
  if (!incluirVisita) filas.push(["Visita / Consulta", "", "BONIFICADA"]);
  else if (costoVisita > 0) {
    filas.push(["Visita / Consulta", "", $fmt(costoVisita)]);
    acumuladoConExtras += costoVisita;
  }

  // --- Tabla ---
  autoTable(docPDF, {
    head: [["Concepto", "Cantidad", { content: "Subtotal", styles: { halign: "right" } }]],
    body: filas,
    startY: 35,
    theme: "striped",
    styles: { fontSize: 10 },
    columnStyles: {
      0: { cellWidth: 100, halign: "left" },
      1: { cellWidth: 30, halign: "center" },
      2: { cellWidth: 50, halign: "right" },
    },
    didParseCell: (data) => {
      if (String(data.cell.text).trim() === "BONIFICADA") {
        data.cell.styles.textColor = [34, 139, 34];
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.fillColor = [220, 255, 220];
      }
    },
    margin: { bottom: 40 },
    didDrawPage: () => {
      const pageH = docPDF.internal.pageSize.height;
      docPDF.setDrawColor(180);
      docPDF.line(10, pageH - 20, 200, pageH - 20);
      docPDF.setFontSize(8);
      docPDF.text(`Emitido por: ${datosEmisor.nombre || "Usuario"}`, 14, pageH - 15);
      if (datosEmisor.email) docPDF.text(`Email: ${datosEmisor.email}`, 80, pageH - 10);
    },
  });

  // --- Total y condiciones ---
  const finalY = docPDF.lastAutoTable?.finalY || 40;
  const pageHeight = docPDF.internal.pageSize.height;
  let totalPDF = acumuladoConExtras;

  const condiciones = [
    `Este presupuesto está expresado en pesos argentinos y mantiene su validez por ${validezDias} días a partir de la fecha de emisión.`,
    "Si durante ese período surgieran cambios económicos importantes (impuestos, cargos o medidas que afecten materiales o servicios), el monto podrá ser ajustado en caso de que el trabajo no haya sido abonado en su totalidad.",
    "El precio final puede variar si durante la ejecución se realizan cambios de diseño, ampliaciones o surgen imprevistos. Cualquier modificación será informada previamente al cliente.",
    "Los impuestos y tasas aplicables se calcularán según la normativa vigente al momento de la facturación.",
  ];

  if (finalY + 60 > pageHeight - 40) {
    docPDF.addPage();
  }

  docPDF.setFont("helvetica", "bold");
  docPDF.text(`TOTAL: ${$fmt(totalPDF)}`, 14, finalY + 10);
  docPDF.text(`Validez: ${validezDias} días`, 200 - 14, finalY + 10, { align: "right" });

  docPDF.line(10, finalY + 15, 200, finalY + 15);
  docPDF.setFont("helvetica", "bold");
  docPDF.text("CONDICIONES GENERALES", 14, finalY + 25);

  docPDF.setFont("times", "italic");
  let yCond = finalY + 35;
  condiciones.forEach((linea) => {
    const split = docPDF.splitTextToSize(`• ${linea}`, 180);
    docPDF.text(split, 14, yCond);
    yCond += split.length * 6;
  });

  // --- Guardar ---
  docPDF.save(`presupuesto-completo-${Date.now()}.pdf`);
}
