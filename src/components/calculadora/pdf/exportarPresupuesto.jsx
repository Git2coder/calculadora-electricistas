// src/components/calculadora/pdf/exportarPresupuesto.jsx
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { db } from "../../../firebaseConfig";
import { doc, updateDoc, increment } from "firebase/firestore";
import { getAuth } from "firebase/auth";

/**
 * Genera y descarga el PDF recalculando cada fila con la MISMA lógica
 * que usás en la calculadora, e incluye Visita y Ajuste % como renglones.
 *
 * Uso:
 * exportarPresupuestoPDF({
 *   tareasSeleccionadas, tarifaHoraria, ajustePorcentaje,
 *   incluirVisita, costoVisita, tareasPredefinidas, titulo
 * })
 */
export const exportarPresupuestoPDF = async ({
  tareasSeleccionadas = [],
  tarifaHoraria = 0,
  ajustePorcentaje = 0,
  incluirVisita = false,
  costoVisita = 0,
  tareasPredefinidas = [],
  titulo = "Presupuesto Eléctrico",
}) => {
  const $fmt = (n) =>
    `$${Number(n || 0).toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  // --- helpers (mismas reglas que en la calculadora) ---
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

  // Valor de "Boca" si existe en definiciones
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
      return (valorBoca * factor) * (tarea.cantidad || 1);
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
        ((tarea.opciones?.["Diseño + armado"]?.porcentajeDiseno || 0) * multDiseno +
          (tarea.opciones?.["Diseño + armado"]?.porcentajeArmado || 0) * multArmado);

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
  docPDF.setFontSize(18);
  docPDF.text(titulo, 14, 22);
  docPDF.setFontSize(12);
  docPDF.text(`Fecha: ${new Date().toLocaleDateString("es-AR")}`, 14, 32);

  const filas = [];
  let costoBasePDF = 0;

  tareasSeleccionadas.forEach((t) => {
    const sub = subtotalDeTarea(t);
    costoBasePDF += sub;
    filas.push([t.nombre, t.cantidad || 1, $fmt(sub)]);
  });

  const montoAjuste = (costoBasePDF * (ajustePorcentaje || 0)) / 100;
  if (ajustePorcentaje > 0) {
    filas.push([`Ajuste ${ajustePorcentaje}%`, "", $fmt(montoAjuste)]);
  }

  if (incluirVisita && costoVisita > 0) {
    filas.push(["Visita / Consulta", "", $fmt(costoVisita)]);
  }

  autoTable(docPDF, {
    head: [["Concepto", "Cantidad", "Subtotal"]],
    body: filas,
    startY: 40,
  });

  const finalY = docPDF.lastAutoTable?.finalY || 40;
  const totalPDF = costoBasePDF + montoAjuste + (incluirVisita ? (costoVisita || 0) : 0);

  docPDF.setFontSize(14);
  docPDF.text(`TOTAL: ${$fmt(totalPDF)}`, 14, finalY + 10);

  docPDF.save(`presupuesto-${Date.now()}.pdf`);

  // Estadísticas del usuario (opcional)
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
    console.error("Error actualizando estadísticas de usuario:", error);
  }
};
