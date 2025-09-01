// src/utils/fechas.js
export const formatearFechaLocal = (fechaISO) => {
  if (!fechaISO) return "-";
  return new Date(fechaISO).toLocaleString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    dateStyle: "short",
    timeStyle: "short",
  });
};
