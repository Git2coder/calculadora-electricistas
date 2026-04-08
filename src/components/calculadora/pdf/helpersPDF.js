// src/components/calculadora/pdf/helpersPDF.js
import { db } from "../../../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

/**
 * 🔹 Redondeo a favor del cliente
 */
export function roundFavorCliente(valor) {
  const centavos = valor * 100;
  return Math.floor(centavos) / 100;
}

/**
 * 🔹 Formatea valores a moneda ARS
 */
export function $fmt(valor) {
  return roundFavorCliente(valor).toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * 🔹 Carga tareas actualizadas desde Firestore (respaldo)
 */
export async function obtenerTareasActualizadas() {
  let tareasActualizadas = [];

  try {
    const snap = await getDoc(doc(db, "config", "tareasCache"));
    if (snap.exists()) {
      const data = snap.data();
      if (data.tareas && Array.isArray(data.tareas)) {
        tareasActualizadas = data.tareas;
      }
    }
  } catch (error) {
    console.warn("⚠️ No se pudieron cargar tareas actualizadas:", error);
  }

  return tareasActualizadas;
}

/**
 * 🔹 Cálculo recursivo para tareas con subtareas ("paquetes")
 */
export function calcularTareaConSubtareas(subTarea, tareasBase, tarifaHoraria) {
  const base = tareasBase.find((t) => t.id === subTarea.id);
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
    (acc, sub) => acc + calcularTareaConSubtareas(sub, tareasBase, tarifaHoraria),
    0
  );

  return valorPropio + valorSubtareas;
}

/**
 * 🔹 Cálculo principal del subtotal de cada tarea
 */
export function subtotalDeTarea(tarea, valorBoca, tarifaHoraria, tareasBase) {
  // 🟢 Tareas que dependen de "Boca"
  if (tarea.dependeDe === "Boca" && valorBoca !== null) {
    let factor = tarea.factorBoca ?? 1;
    if (tarea.variante && tarea.opciones?.[tarea.variante]) {
      factor = tarea.opciones[tarea.variante].factorBoca ?? factor;
    }
    return valorBoca * factor * (tarea.cantidad || 1);
  }

  // 🟢 Tareas administrativas
  if (tarea.tipo === "administrativa") {
    return (tarea.valor || 0) * (tarea.cantidad || 1);
  }

  // 🟢 Calculadas (basadas en valorUnidad y porcentaje)
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

  // 🟢 Caso general
  const factor = tarea.multiplicador ?? 1;
  return (tarea.tiempo / 60) * tarifaHoraria * (tarea.cantidad || 1) * factor;
}
