// src/components/calculadora/pdf/exportarPresupuesto.jsx
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { db } from "../../../firebaseConfig";
import { doc, updateDoc, increment } from "firebase/firestore";
import { getAuth } from "firebase/auth";

/**
 * Genera y descarga un PDF con las tareas seleccionadas y el total.
 * También actualiza Firestore para llevar estadísticas por usuario.
 *
 * @param {Array} tareasSeleccionadas - Lista de tareas [{nombre, cantidad, valor}]
 * @param {number} costoFinal - Total del presupuesto
 */
export const exportarPresupuestoPDF = async (tareasSeleccionadas, costoFinal) => {
  const docPDF = new jsPDF();

  // 📌 Encabezado
  docPDF.setFontSize(18);
  docPDF.text("Presupuesto Eléctrico", 14, 22);
  docPDF.setFontSize(12);
  docPDF.text(`Fecha: ${new Date().toLocaleDateString("es-AR")}`, 14, 32);

  // 📌 Tabla de tareas
  const filas = tareasSeleccionadas.map((t) => [
    t.nombre,
    t.cantidad,
    `$${(t.cantidad * (t.valor || 0)).toLocaleString("es-AR")}`,
  ]);

  autoTable(docPDF, {
    head: [["Tarea", "Cantidad", "Subtotal"]],
    body: filas,
    startY: 40,
  });

  // 📌 Total
  const finalY = docPDF.lastAutoTable?.finalY || 40;
  docPDF.setFontSize(14);
  docPDF.text(
    `TOTAL: $${costoFinal.toLocaleString("es-AR", {
      minimumFractionDigits: 2,
    })}`,
    14,
    finalY + 10
  );

  // 📌 Descargar PDF
  docPDF.save(`presupuesto-${Date.now()}.pdf`);

  // 📌 Actualizar estadísticas del usuario en Firestore
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, "usuarios", user.uid);
      await updateDoc(userRef, {
        presupuestosGenerados: increment(1), // contador
        ultimaGeneracion: new Date(),       // fecha de última descarga
      });
    }
  } catch (error) {
    console.error("Error actualizando estadísticas de usuario:", error);
  }
};
