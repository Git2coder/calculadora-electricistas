// src/components/calculadora/pdf/exportarPresupuesto.jsx
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { db } from "../../../firebaseConfig";
import { doc, updateDoc, increment, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { extrasDisponibles } from "../../../utils/extras";

import { calcularSubtotalTarea, calcularTotal } from "../../../utils/calculoTareas";

export const exportarPresupuestoPDF = async ({
  tareasSeleccionadas = [],
  tarifaHoraria = 0,
  ajustePorcentaje = 0,
  incluirVisita = false,
  costoVisita = 0,
  tareasPredefinidas = [],
  titulo = "Presupuesto Eléctrico",
  validezDias = 15,
  extrasGlobales = [],
  extrasSeleccionadosGlobal = [],
  tipoPDF = "completo",
  valorBoca = null,
}) => {
  // ✅ Calcular costo de visita dentro de la función, según el switch actual
  // Siempre convertir a número real
const costoVisitaFinal = incluirVisita ? Number(costoVisita) || 0 : 0;


  // 🔹 Fallback: si no hay tareas base, usar las seleccionadas
  if (!tareasPredefinidas || tareasPredefinidas.length === 0) {
    tareasPredefinidas = tareasSeleccionadas;
  }

  

  //Redondeo a favor del cliente
    function roundFavorCliente(valor) {
    // Multiplicamos por 100 para trabajar en centavos
    const centavos = valor * 100;
    // Math.floor siempre redondea para abajo
    return Math.floor(centavos) / 100;
  }

  function $fmt(valor) {
    return roundFavorCliente(valor).toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  // --- Obtener datos del emisor desde Firebase ---
  let datosEmisor = {
    nombre: "Usuario",
    telefono: "",
    email: "",
    matricula: "",
  };

  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, "usuarios", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        datosEmisor = { ...datosEmisor, ...userSnap.data() };
      }
    }
  } catch (error) {
    console.error("Error obteniendo datos del emisor:", error);
  }

  


  // ✅ Recibir valorBoca desde afuera, sin depender de la tarea "Boca"
  const valorBocaReal = valorBoca ?? null;


  

  // --- Armar PDF ---
  const docPDF = new jsPDF();

  // 💡 PDF para la suscripción BÁSICA
  if (tipoPDF === "basico") {
    const filas = [];
    let costoBasePDF = 0;

    tareasSeleccionadas.forEach((t) => {
      const sub = calcularSubtotalTarea(
  t,
  tarifaHoraria,
  valorBocaReal,
  datosEmisor?.jornalOficial ?? 0
);



      costoBasePDF += sub;
      filas.push([t.nombre || "Tarea sin nombre", $fmt(sub)]);
    });

    let acumuladoConExtras = costoBasePDF;
    extrasSeleccionadosGlobal.forEach((id) => {
      const extra = extrasGlobales.find((e) => e.id === id);
      if (extra) {
        const nuevoTotal = acumuladoConExtras * extra.multiplicador;
        const impacto = nuevoTotal - acumuladoConExtras;
        filas.push([`${extra.label}`, $fmt(impacto)]);
        acumuladoConExtras = nuevoTotal;
      }
    });

    if (ajustePorcentaje !== 0) {
      const montoAjuste = (acumuladoConExtras * ajustePorcentaje) / 100;
      filas.push([
        ajustePorcentaje > 0 ? "Herramientas/insumos" : "Descuento aplicado",
        $fmt(montoAjuste),
      ]);
      acumuladoConExtras += montoAjuste;
    }

    // --- VISITA / CONSULTA ---
if (incluirVisita) {
  filas.push(["Visita / Consulta", $fmt(costoVisitaFinal)]);
  acumuladoConExtras += costoVisitaFinal;
} else {
  filas.push(["Visita / Consulta", "BONIFICADA"]);
}

    // --- Encabezado ---
    docPDF.setFont("helvetica", "bold");
    docPDF.setFontSize(18);
    docPDF.text("Presupuesto", 14, 18);

    docPDF.setFont("helvetica", "normal");
    docPDF.setFontSize(10);
    docPDF.text(`Fecha: ${new Date().toLocaleDateString("es-AR")}`, 14, 25);

    docPDF.setDrawColor(180);
    docPDF.line(10, 28, 200, 28);

    // --- Tabla ---
    autoTable(docPDF, {
      head: [["Concepto", "Subtotal"]],
      body: filas,
      startY: 35,
      theme: "grid",
      styles: { fontSize: 9 },
      headStyles: { fillColor: [230, 230, 230], textColor: [0, 0, 0], fontStyle: "bold" },
      columnStyles: {
        0: { cellWidth: 120, halign: "left" },
        1: { cellWidth: 50, halign: "right" },
      },
      didParseCell: function (data) {
        const txt = String(data.cell.text).trim();
        if (txt === "BONIFICADA" || txt === "Bonificado") {
          data.cell.styles.textColor = [34, 139, 34];
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fillColor = [220, 255, 220];
        }
      },
    });

    // --- Total ---
    const { total: totalPDF } = calcularTotal({
  tareasSeleccionadas,
  tarifaHoraria,
  ajustePorcentaje,
  incluirVisita,
  costoVisita: costoVisitaFinal,
  extrasGlobales,
  extrasSeleccionadosGlobal,
  valorBocaReal,
});

    


    const finalY = docPDF.lastAutoTable?.finalY || 40;
    docPDF.setFont("helvetica", "bold");
    docPDF.setFontSize(12);
    docPDF.text(`TOTAL: ${$fmt(totalPDF)}`, 14, finalY + 10);

    // --- Pie con datos del profesional ---
    const pageHeight = docPDF.internal.pageSize.height;
    docPDF.setDrawColor(180);
    docPDF.line(10, pageHeight - 20, 200, pageHeight - 20);

    docPDF.setFont("helvetica", "normal");
    docPDF.setFontSize(9);
    docPDF.text(`Emitido por: ${datosEmisor.nombre || "Usuario"}`, 14, pageHeight - 15);
    if (datosEmisor.telefono)
      docPDF.text(`Tel: ${datosEmisor.telefono}`, 14, pageHeight - 10);
    if (datosEmisor.email)
      docPDF.text(`Email: ${datosEmisor.email}`, 80, pageHeight - 10);

    docPDF.save(`presupuesto-basico-${Date.now()}.pdf`);
    return;
  }
  
  // 💡 PDF para la suscripción GRATUITA (con condiciones de trabajo incluidas)
  if (tipoPDF === "gratuita") {
    const filas = [];
    let costoBasePDF = 0;

    // 1️⃣ Tareas principales
    tareasSeleccionadas.forEach((t) => {
      const sub = calcularSubtotalTarea(
  t,
  tarifaHoraria,
  valorBocaReal,
  datosEmisor?.jornalOficial ?? 0
);



      costoBasePDF += sub;
      filas.push([t.nombre || "Tarea sin nombre", $fmt(sub)]);
    });

    // 2️⃣ Extras globales (impacto incremental)
    let acumuladoConExtras = costoBasePDF;
    extrasSeleccionadosGlobal.forEach((id) => {
      const extra = extrasGlobales.find((e) => e.id === id);
      if (extra) {
        const nuevoTotal = acumuladoConExtras * extra.multiplicador;
        const impacto = nuevoTotal - acumuladoConExtras;
        filas.push([`${extra.label}`, $fmt(impacto)]);
        acumuladoConExtras = nuevoTotal;
      }
    });

    // 3️⃣ Ajuste global (riel)
    if (ajustePorcentaje !== 0) {
      const montoAjuste = (acumuladoConExtras * ajustePorcentaje) / 100;
      filas.push([
        ajustePorcentaje > 0 ? "Herramientas/insumos" : "Descuento aplicado",
        $fmt(montoAjuste),
      ]);
      acumuladoConExtras += montoAjuste;
    }

    // 4️⃣ Visita / Consulta
    // --- VISITA / CONSULTA ---
if (incluirVisita) {
  filas.push(["Visita / Consulta", $fmt(costoVisitaFinal)]);
  acumuladoConExtras += costoVisitaFinal;
} else {
  filas.push(["Visita / Consulta", "BONIFICADA"]);
}

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

    // --- Tabla con encabezado gris ---
    autoTable(docPDF, {
      head: [["Concepto", "Subtotal"]],
      body: filas,
      startY: 35,
      theme: "grid",
      styles: { fontSize: 9 },
      headStyles: { fillColor: [230, 230, 230], textColor: [0, 0, 0], fontStyle: "bold" },
      columnStyles: {
        0: { cellWidth: 120, halign: "left" },
        1: { cellWidth: 50, halign: "right" },
      },
      didParseCell: function (data) {
        const txt = String(data.cell.text).trim();
        if (txt === "BONIFICADA" || txt === "Bonificado") {
          data.cell.styles.textColor = [34, 139, 34];
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fillColor = [220, 255, 220];
        }
      },
    });

    // --- Total final ---
    const { total: totalPDF } = calcularTotal({
  tareasSeleccionadas,
  tarifaHoraria,
  ajustePorcentaje,
  incluirVisita,
  costoVisita: costoVisitaFinal,
  extrasGlobales,
  extrasSeleccionadosGlobal,
  valorBocaReal,
});

    


    const finalY = docPDF.lastAutoTable?.finalY || 40;
    docPDF.setFont("helvetica", "bold");
    docPDF.setFontSize(12);
    docPDF.text(`TOTAL: ${$fmt(totalPDF)}`, 14, finalY + 10);

    // --- Pie simple con leyenda promocional ---
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
    return;
  }

  // --- Encabezado ---
  docPDF.setFont("helvetica", "bold");
  docPDF.setFontSize(16);
  docPDF.text(titulo.toUpperCase(), 14, 20);

  const nroPresupuesto = `P-${Date.now()}`;
  docPDF.setFont("helvetica", "normal");
  docPDF.setFontSize(10);
  docPDF.text(`Presupuesto Nº: ${nroPresupuesto}`, 200 - 14, 15, { align: "right" });
  docPDF.text(`Fecha: ${new Date().toLocaleDateString("es-AR")}`, 200 - 14, 20, { align: "right" });

  // Línea separadora
  docPDF.setDrawColor(180);
  docPDF.line(10, 25, 200, 25);

  // --- Tabla de conceptos ---
  const filas = [];
  let costoBasePDF = 0;

  tareasSeleccionadas.forEach((t) => {
    // subtotal ya incluye extras dentro de calcularSubtotalTarea
    let sub = calcularSubtotalTarea(
      t,
      tarifaHoraria,
      valorBocaReal,
      datosEmisor?.jornalOficial ?? 0
    );

    costoBasePDF += sub;

    filas.push([t.nombre, t.cantidad || 1, $fmt(sub)]);
  });


  // 👉 Extras globales: método acumulativo
  let acumuladoConExtras = costoBasePDF;

  extrasSeleccionadosGlobal.forEach((id) => {
    const extra = extrasGlobales.find((e) => e.id === id);
    if (extra) {
      const nuevoTotal = acumuladoConExtras * extra.multiplicador;
      const impacto = nuevoTotal - acumuladoConExtras; // diferencia incremental
      filas.push([`${extra.label}`, "", $fmt(impacto)]);
      acumuladoConExtras = nuevoTotal; // actualizar base para el siguiente extra
    }
  });

  // --- Ajuste global (riel de ajuste) → al final de extras
  let filaAjuste = null;
  if (ajustePorcentaje !== 0) {
    const montoAjuste = (acumuladoConExtras * ajustePorcentaje) / 100;
    filaAjuste = [
      ajustePorcentaje > 0 ? "Herramientas/insumos" : "Descuento aplicado",
      "",
      $fmt(montoAjuste),
    ];
    acumuladoConExtras += montoAjuste;
  }

  if (filaAjuste) {
    filas.push(filaAjuste);
  }

  // --- VISITA / CONSULTA --- (versión final corregida)
if (incluirVisita) {
  filas.push(["Visita / Consulta", "", $fmt(costoVisitaFinal)]);
  acumuladoConExtras += costoVisitaFinal;
} else {
  filas.push(["Visita / Consulta", "", "BONIFICADA"]);
}

    autoTable(docPDF, {
      head: [["Concepto", "Cantidad", { content: "Subtotal", styles: { halign: "right" } }]],
      body: filas,
      didParseCell: function (data) {
        if (
          data.section === "body" &&
          data.row.cells[2].text[0] === "BONIFICADA"
        ) {
          data.cell.styles.textColor = [34, 139, 34];
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fillColor = [220, 255, 220];
        }
      },
      startY: 35,
      theme: "striped",
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 100, halign: "left" },
        1: { cellWidth: 30, halign: "center" },
        2: { cellWidth: 50, halign: "right" },
      },
      pageBreak: "auto",
      margin: { bottom: 40 }, // 👈 siempre deja espacio para pie
      didDrawPage: () => {
        const pageSize = docPDF.internal.pageSize;
        const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();

        // Línea separadora arriba del pie
        docPDF.setDrawColor(180);
        docPDF.line(10, pageHeight - 20, 200, pageHeight - 20);

        // Datos de emisor
        docPDF.setFontSize(8);
        docPDF.setFont("helvetica", "normal");
        docPDF.text(`Emitido por: ${datosEmisor.nombre || "Usuario"}`, 14, pageHeight - 15);
        if (datosEmisor.telefono)
          docPDF.text(`Tel: ${datosEmisor.telefono}`, 14, pageHeight - 10);
        if (datosEmisor.email)
          docPDF.text(`Email: ${datosEmisor.email}`, 80, pageHeight - 10);

        // Numeración simple
        const pageCurrent = docPDF.internal.getCurrentPageInfo().pageNumber;
        docPDF.text(`Página ${pageCurrent}`, 200 - 20, pageHeight - 10);
      },
    });

      let finalY = docPDF.lastAutoTable?.finalY || 40;
  const pageHeight = docPDF.internal.pageSize.height;

  // --- Calcular el total ---
  const { total: totalPDF } = calcularTotal({
    tareasSeleccionadas,
    tarifaHoraria,
    ajustePorcentaje,
    incluirVisita,
    costoVisita: costoVisitaFinal,
    extrasGlobales,
    extrasSeleccionadosGlobal,
    valorBocaReal,
    jornalOficial: datosEmisor?.jornalOficial ?? 0
  });

  // --- Condiciones generales ---
  const condiciones = [
    `Este presupuesto está expresado en pesos argentinos y mantiene su validez por ${validezDias} días a partir de la fecha de emisión.`,
    "Si durante ese período surgieran cambios económicos importantes (impuestos, cargos o medidas que afecten materiales o servicios), el monto podrá ser ajustado en caso de que el trabajo no haya sido abonado en su totalidad.",
    "El precio final puede variar si durante la ejecución se realizan cambios de diseño, ampliaciones o surgen imprevistos. Cualquier modificación será informada previamente al cliente.",
    "Los impuestos y tasas aplicables se calcularán según la normativa vigente al momento de la facturación.",
  ];

  // 👉 Estimar altura necesaria para TOTAL + condiciones
  let espacioNecesario = 60; // espacio fijo aproximado
  condiciones.forEach((linea) => {
    const splitText = docPDF.splitTextToSize(`• ${linea}`, 180);
    espacioNecesario += splitText.length * 6;
  });

  // Si no entra todo el bloque en la hoja actual → salto de página
  if (finalY + espacioNecesario > pageHeight - 40) {
    docPDF.addPage();
    finalY = 30;
  }

  // --- Total ---
  docPDF.setFont("helvetica", "bold");
  docPDF.setFontSize(13);
  docPDF.text(`TOTAL: ${$fmt(totalPDF)}`, 14, finalY + 10);

  docPDF.setFont("helvetica", "italic");
  docPDF.setFontSize(10);
  docPDF.text(`Validez: ${validezDias} días`, 200 - 14, finalY + 10, { align: "right" });

  docPDF.setDrawColor(180);
  docPDF.line(10, finalY + 15, 200, finalY + 15);

  // --- Condiciones generales ---
  docPDF.setFont("helvetica", "bold");
  docPDF.setFontSize(12);
  docPDF.text("CONDICIONES GENERALES", 14, finalY + 25);

  docPDF.setFont("times", "italic");
  docPDF.setFontSize(10);

  let yCondiciones = finalY + 35;
  condiciones.forEach((linea) => {
    const splitText = docPDF.splitTextToSize(`• ${linea}`, 180);
    docPDF.text(splitText, 14, yCondiciones);
    yCondiciones += splitText.length * 6;
  });

    // --- Numeración "Página X de Y" ---
    const totalPages = docPDF.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      docPDF.setPage(i);
      const pageSize = docPDF.internal.pageSize;
      const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
      docPDF.setFontSize(8);
      docPDF.setFont("helvetica", "normal");
      docPDF.text(`Página ${i} de ${totalPages}`, 200 - 20, pageHeight - 10);
    }

    // Al final, antes de guardar:
      if (tipoPDF === "basico") {
        // 👇 versión simplificada del PDF
        docPDF.setFont("helvetica", "italic");
        docPDF.setFontSize(10);
        docPDF.text(
          "Versión básica del presupuesto. Actualizá tu plan para acceder al PDF completo.",
          14,
          280
        );
      }

    // --- Guardar PDF ---
    docPDF.save(
      tipoPDF === "basico"
        ? `presupuesto-basico-${Date.now()}.pdf`
        : `presupuesto-completo-${Date.now()}.pdf`
    );

    // --- Actualizar estadísticas ---
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "usuarios", user.uid);
        await updateDoc(userRef, {
          presupuestosGenerados: increment(1),
          ultimaGeneracion: new Date(),
        });
      }
    } catch (error) {
      console.error("Error actualizando estadísticas:", error);
    }
};
