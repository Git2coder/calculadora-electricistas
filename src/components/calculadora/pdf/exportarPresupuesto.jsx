// src/components/calculadora/pdf/exportarPresupuesto.jsx
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { db } from "../../../firebaseConfig";
import { doc, updateDoc, increment, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { extrasDisponibles } from "../../CalculadoraCompleta";

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

}) => {
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

  // --- helpers ---
  const calcularTareaConSubtareas = (subTarea) => {
    const base = tareasPredefinidas.find((t) => t.id === subTarea.id);
    if (!base) return 0;

    const variante = subTarea.variante || base.variante;
    const baseConfig =
      variante && base.opciones?.[variante] ? base.opciones[variante] : base;

    const tiempo = baseConfig.tiempo || 0;
    const multiplicador = baseConfig.multiplicador ?? 1;
    const cantidad = subTarea.cantidad || 1;

    const valorPropio = (tiempo / 60) * tarifaHoraria * multiplicador * cantidad;

    const incluye = baseConfig.incluye || [];
    const valorSubtareas = incluye.reduce(
      (acc, sub) => acc + calcularTareaConSubtareas(sub),
      0
    );

    return valorPropio + valorSubtareas;
  };

  const baseBoca = tareasPredefinidas.find((t) => t.nombre === "Boca");
  const valorBoca =
    baseBoca != null
      ? (baseBoca.tiempo / 60) * tarifaHoraria * (baseBoca.multiplicador ?? 1)
      : null;

  const subtotalDeTarea = (tarea) => {
    if (tarea.dependeDe === "Boca" && valorBoca !== null) {
      let factor = tarea.factorBoca ?? 1;
      if (tarea.variante && tarea.opciones?.[tarea.variante]) {
        factor = tarea.opciones[tarea.variante].factorBoca ?? factor;
      }
      return valorBoca * factor * (tarea.cantidad || 1);
    }

    if (tarea.tipo === "administrativa") {
      return (tarea.valor || 0) * (tarea.cantidad || 1);
    }

    if (tarea.tipo === "paquete") {
      const totalInterno = (tarea.originalIncluye || tarea.incluye || []).reduce(
        (acc, sub) => acc + calcularTareaConSubtareas(sub),
        0
      );
      return totalInterno * (tarea.cantidad || 1);
    }

    if (tarea.tipo === "composicion") {
      const tiempoPorPolo = 10;
      const multArmado = 2.7;
      const multDiseno = 3.2;
      const horas = ((tarea.cantidad || 1) * tiempoPorPolo) / 60;

      const costoTotal =
        horas *
        tarifaHoraria *
        ((tarea.opciones?.["Diseño + armado"]?.porcentajeDiseno || 0) *
          multDiseno +
          (tarea.opciones?.["Diseño + armado"]?.porcentajeArmado || 0) *
            multArmado);

      const variante = tarea.opciones?.[tarea.variante] || {};
      const pDiseno = variante.porcentajeDiseno ?? 0;
      const pArmado = variante.porcentajeArmado ?? 0;

      return costoTotal * (pDiseno + pArmado);
    }

    if (
      tarea.tipo === "calculada" &&
      tarea.valorUnidad !== undefined &&
      tarea.porcentaje !== undefined
    ) {
      const cantidad = tarea.cantidad || 1;
      const valorUnidad = tarea.valorUnidad || 0;
      const porcentaje = tarea.porcentaje || 25;
      return ((valorUnidad * porcentaje) / 100) * cantidad;
    }

    const factor = tarea.multiplicador ?? 1;
    return (tarea.tiempo / 60) * tarifaHoraria * (tarea.cantidad || 1) * factor;
  };

  // --- Armar PDF ---
  const docPDF = new jsPDF();

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
    // subtotal base de la tarea
    let sub = subtotalDeTarea(t);

    // aplicar extras individuales (array de IDs en t.extras)
    if (t.extras && t.extras.length > 0) {
      t.extras.forEach((idExtra) => {
        const extra = extrasDisponibles.find((e) => e.id === idExtra);
        if (extra) {
          sub = sub * extra.multiplicador;
        }
      });
    }

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

  // --- Visita / Consulta ---
  const conceptoVisita = "Visita / Consulta";
  let subtotalVisita;

  if (!incluirVisita) {
    subtotalVisita = "BONIFICADA"; // 👈 palabra cuando está desactivado
  } else if (costoVisita > 0) {
    subtotalVisita = $fmt(costoVisita);
    acumuladoConExtras += costoVisita;
  } else {
    subtotalVisita = "Bonificado";
  }

  filas.push([conceptoVisita, "", subtotalVisita]);
  
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
  let totalPDF = costoBasePDF;
  if (ajustePorcentaje !== 0) {
    totalPDF += (totalPDF * ajustePorcentaje) / 100;
  }
  extrasSeleccionadosGlobal.forEach((id) => {
    const extra = extrasGlobales.find((e) => e.id === id);
    if (extra) {
      totalPDF *= extra.multiplicador;
    }
  });
  if (incluirVisita && costoVisita > 0) {
    totalPDF += costoVisita;
  }

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

    // --- Guardar PDF ---
    docPDF.save(`presupuesto-${Date.now()}.pdf`);

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
