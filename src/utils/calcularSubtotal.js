export function subtotalDeTarea(tarea, tarifaHoraria, valorBoca, jornalOficial) {
  let base = 0;

  // Administrativa
  if (tarea.tipo === "administrativa") {
    return (tarea.valor || 0) * (tarea.cantidad || 1);
  }

  // Calculada
  if (tarea.tipo === "calculada") {
    return ((tarea.valorUnidad || 0) * (tarea.porcentaje || 0) / 100) * (tarea.cantidad || 1);
  }

  // Boca
  if (tarea.nombre === "Boca" && valorBoca !== null) {
    return valorBoca * (tarea.cantidad || 1);
  }

  // Depende de Boca
  if (tarea.dependeDe === "Boca" && valorBoca !== null) {
    let factor = tarea.factorBoca ?? 1;
    if (tarea.variante && tarea.opciones?.[tarea.variante]) {
      factor = tarea.opciones[tarea.variante].factorBoca ?? factor;
    }
    return valorBoca * factor * (tarea.cantidad || 1);
  }

  // Tareas normales
  const varianteConfig = tarea.variante && tarea.opciones?.[tarea.variante]
    ? tarea.opciones[tarea.variante]
    : null;

  const tiempo = varianteConfig?.tiempo ?? tarea.tiempo ?? 0;
  const multiplicador = varianteConfig?.multiplicador ?? tarea.multiplicador ?? 1;

  base = (tiempo / 60) * tarifaHoraria * multiplicador * (tarea.cantidad || 1);

  // Aplicar extras
  const extraFactor = (tarea.extras || []).reduce((acc, eId) => {
    const ed = tarea.extrasDisponibles?.find((x) => x.id === eId);
    return acc * (ed?.multiplicador ?? 1);
  }, 1);

  return base * extraFactor;
}
