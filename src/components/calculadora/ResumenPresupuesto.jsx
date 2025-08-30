import React from "react";
import ContadorAnimado from "../ContadorAnimado";

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
  return (
    <div className="bg-blue-50 p-6 rounded-xl shadow space-y-4 relative">
      <h2 className="text-xl font-semibold text-blue-800">💰 Resumen del Presupuesto</h2>

      {tareasSeleccionadas.length >= 1 && tiempoTotal > 20 && (
        <p className="text-lg">
          ⏱️ Tiempo Estimado: {horasMargen}h {minutosMargen}min{" "}
          <i className="text-xs text-gray-500">(no incluye tiempo de tareas administrativas.)</i>
        </p>
      )}

      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <label className="flex-1">
          Ajuste de Precio{" "}
          <i className="text-xs text-gray-500">
            (% sobre las tareas sin incluir la visita)
          </i>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={ajustePorcentaje}
            onChange={(e) => setAjustePorcentaje(parseFloat(e.target.value))}
            className="w-full"
          />
          <span className="block text-center mt-1">{ajustePorcentaje}%</span>
        </label>

        {/* Botón adaptativo dentro del resumen */}
        <div className="flex justify-end mt-4 sm:mt-0 sm:absolute sm:top-6 sm:right-6 sm:z-10">
          <button
            onClick={() => {
              setIncluirVisita((prev) => !prev);
              sonidoMonedas.current.currentTime = 0;
              sonidoMonedas.current.play();
            }}
            className={`px-3 py-2 sm:px-5 sm:py-2 rounded-full font-semibold shadow-md 
                        transition-all duration-300 ease-in-out hover:scale-105
                        text-sm sm:text-base
                        ${incluirVisita ? "bg-red-600 text-white" : "bg-green-600 text-white"}`}
          >
            {incluirVisita ? "Cobrando visita" : "Visita bonificada"}
          </button>
        </div>

        <ContadorAnimado valor={costoFinal} />
      </div>
    </div>
  );
};

export default ResumenPresupuesto;
