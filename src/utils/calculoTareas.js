// src/utils/calculoTareas.js

import { extrasDisponibles } from "../utils/extras";


// --------- CALCULAR SUBTOTAL INDIVIDUAL ---------

export function calcularSubtotalTarea(
  tarea,
  tarifaHoraria,
  valorBocaReal = null,
  jornalOficial = 0
) {

 // --- 1) TAREAS QUE DEPENDEN DE BOCA ---
if (tarea.dependeDe === "Boca") {
  const base = valorBocaReal ?? (20 / 60) * tarifaHoraria;

  let factor = tarea.factorBoca ?? 1;

  if (tarea.variante && tarea.opciones?.[tarea.variante]) {
    factor = tarea.opciones[tarea.variante].factorBoca ?? factor;
  }

  let subtotal = base * factor * (tarea.cantidad || 1);

  // 🔹 Aplicar EXTRAS
  if (Array.isArray(tarea.extras) && tarea.extras.length > 0) {
    tarea.extras.forEach((extraId) => {
      const extra = extrasDisponibles.find((e) => e.id === extraId);
      if (extra) subtotal *= extra.multiplicador;
    });
  }

  return subtotal;
}

  // --- 2) ADMINISTRATIVAS ---
  if (tarea.tipo === "administrativa") {
    return (tarea.valor || 0) * (tarea.cantidad || 1);
  }

  // --- 3) CALCULADAS (% sobre valorUnidad) ---
  if (tarea.tipo === "calculada") {
    const cantidad = tarea.cantidad || 1;
    const valorUnidad = tarea.valorUnidad || 0;
    const porcentaje = tarea.porcentaje || 0;
    return ((valorUnidad * porcentaje) / 100) * cantidad;
  }

  // --- 4) TAREAS BASE, INSTALACIÓN, REEMPLAZO ---
  let tiempo = tarea.tiempo ?? 0;
  let multiplicador = tarea.multiplicador ?? 1;

  // Normalizar función auxiliar (arriba del archivo si querés reutilizar)
function normalizeKey(k) {
  if (k == null) return "";
  return String(k)
    .normalize("NFD")           // separa acentos
    .replace(/[\u0300-\u036f]/g, "") // quita acentos
    .replace(/\s+/g, "")        // quita espacios
    .toLowerCase();
}

// Reemplazar la detección de variante por:
if (tarea.variante && tarea.opciones) {
  // intentar detección directa primero
  let cfg = tarea.opciones[tarea.variante];

  if (!cfg) {
    // intentar encontrar una clave coincidente de forma tolerante
    const wanted = normalizeKey(tarea.variante);
    const keyFound = Object.keys(tarea.opciones).find((k) => normalizeKey(k) === wanted);
    if (keyFound) cfg = tarea.opciones[keyFound];
  }

  // último fallback: si no encontró, intentar extraer la opción 'default' o la primera
  if (!cfg) {
    cfg = tarea.opciones.default || tarea.opciones[Object.keys(tarea.opciones)[0]];
  }

  if (cfg) {
    tiempo = cfg.tiempo ?? tiempo;
    multiplicador = cfg.multiplicador ?? multiplicador;
  }
}


  let subtotal =
    (tiempo / 60) * tarifaHoraria * (tarea.cantidad || 1) * (multiplicador ?? 1);

  // --- 5) EXTRAS POR TAREA ---
  if (tarea.extras?.length > 0) {
    tarea.extras.forEach((idExtra) => {
      const extra = extrasDisponibles.find((x) => x.id === idExtra);
      if (extra) subtotal *= extra.multiplicador;
    });
  }

  return subtotal;
}

// --------- CALCULAR TOTAL GENERAL ---------

export function calcularTotal({
  tareasSeleccionadas,
  tarifaHoraria,
  ajustePorcentaje,
  incluirVisita,
  costoVisita,
  extrasGlobales,
  extrasSeleccionadosGlobal,
  valorBocaReal,
  jornalOficial
}) {
  let costoBase = tareasSeleccionadas.reduce(
    (acc, t) =>
      acc +
      calcularSubtotalTarea(t, tarifaHoraria, valorBocaReal, jornalOficial),
    0
  );

  let total = costoBase;

  // Extras globales (multiplican)
  extrasSeleccionadosGlobal.forEach((id) => {
    const extra = extrasGlobales.find((e) => e.id === id);
    if (extra) total *= extra.multiplicador;
  });

  // Ajuste %
  if (ajustePorcentaje !== 0) {
    total += (total * ajustePorcentaje) / 100;
  }

  // Visita / consulta
  if (incluirVisita) total += costoVisita;

  return { costoBase, total };
}
