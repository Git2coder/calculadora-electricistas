import React from "react";
import ContadorAnimado from "../ContadorAnimado";
import { exportarPresupuestoPDF } from "./pdf/exportarPresupuesto";
import { FaTicketAlt, FaFilePdf } from "react-icons/fa";

const ResumenPresupuesto = ({
  tareasSeleccionadas,
  tiempoTotal,
  horasMargen,
  minutosMargen,
  ajustePorcentaje,
  setAjustePorcentaje,
  incluirVisita,
  setIncluirVisita,
  sonidoMonedas,
  costoFinal,
}) => {
  // 📝 Manejar descarga con confirmación
  const handleDescargarPDF = () => {
    const confirmacion = window.confirm(
      "¿Seguro que deseas descargar este presupuesto en PDF?"
    );
    if (confirmacion) {
      exportarPresupuestoPDF(tareasSeleccionadas, costoFinal);
    }
  };

  return (
    <div className="bg-blue-50 p-6 rounded-xl shadow space-y-6">
      {/* Título */}
      <h2 className="text-2xl font-bold text-blue-800 text-center">
        💰 Resumen del Presupuesto
      </h2>

      {/* Tiempo estimado */}
      {tareasSeleccionadas.length >= 1 && tiempoTotal > 20 && (
        <p className="text-center text-lg">
          ⏱️ Tiempo Estimado: {horasMargen}h {minutosMargen}min{" "}
          <i className="text-xs text-gray-500 block">
            (no incluye tiempo de tareas administrativas)
          </i>
        </p>
      )}

      {/* Ajuste de precio */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
          Ajuste de Precio (% sobre las tareas sin incluir la visita)
        </label>
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={ajustePorcentaje}
          onChange={(e) => setAjustePorcentaje(parseFloat(e.target.value))}
          className="w-full"
        />
        <p className="text-center mt-1 font-semibold">{ajustePorcentaje}%</p>
      </div>

      {/* Acciones y total */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Botones */}
        <div className="flex gap-3">
          <button
            onClick={() => {
              setIncluirVisita((prev) => !prev);
              sonidoMonedas.current.currentTime = 0;
              sonidoMonedas.current.play();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold shadow-md transition 
              ${incluirVisita ? "bg-red-600 text-white" : "bg-green-600 text-white"}`}
          >
            <FaTicketAlt />
            {incluirVisita ? "Cobrando visita" : "Visita bonificada"}
          </button>

          <button
            onClick={handleDescargarPDF}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition shadow"
          >
            <FaFilePdf />
            Descargar PDF
          </button>
        </div>

        {/* Contador destacado */}
        <div className="flex-1 md:flex-none">
          <ContadorAnimado valor={costoFinal} />
        </div>
      </div>
    </div>
  );
};

export default ResumenPresupuesto;
