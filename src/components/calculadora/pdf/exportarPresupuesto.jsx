// src/components/calculadora/pdf/exportarPresupuesto.jsx
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Genera y descarga un PDF con las tareas seleccionadas y el total.
 * @param {Array} tareasSeleccionadas - Lista de tareas [{nombre, cantidad, valor}]
 * @param {number} costoFinal - Total del presupuesto
 */
export const exportarPresupuestoPDF = (tareasSeleccionadas, costoFinal) => {
  const doc = new jsPDF();

  // Encabezado
  doc.setFontSize(18);
  doc.text("Presupuesto Eléctrico", 14, 22);
  doc.setFontSize(12);
  doc.text(`Fecha: ${new Date().toLocaleDateString("es-AR")}`, 14, 32);

  // Tabla de tareas
  const filas = tareasSeleccionadas.map((t) => [
    t.nombre,
    t.cantidad,
    `$${(t.cantidad * (t.valor || 0)).toLocaleString("es-AR")}`,
  ]);

  autoTable(doc, {
    head: [["Tarea", "Cantidad", "Subtotal"]],
    body: filas,
    startY: 40,
  });

  // Total
  const finalY = doc.lastAutoTable?.finalY || 40;
  doc.setFontSize(14);
  doc.text(
    `TOTAL: $${costoFinal.toLocaleString("es-AR", {
      minimumFractionDigits: 2,
    })}`,
    14,
    finalY + 10
  );

  // Descargar PDF
  doc.save(`presupuesto-${Date.now()}.pdf`);
};
