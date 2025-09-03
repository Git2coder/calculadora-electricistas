import React, { useState } from "react"; // 👈 importamos useState
import ContadorAnimado from "../ContadorAnimado";
import { exportarPresupuestoPDF } from "./pdf/exportarPresupuesto";
import { FaTicketAlt, FaFilePdf } from "react-icons/fa";
import { FaRegCalendarAlt, FaEdit } from "react-icons/fa";

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
  tarifaHoraria,
  visitaSegura,
  tareasPredefinidas,
}) => {
  // 👇 nuevo estado para validez en días
  const [validezDias, setValidezDias] = useState(15);
  // 👇 estado para mostrar/ocultar edición
  const [editandoValidez, setEditandoValidez] = useState(false);

  const handleDescargarPDF = () => {
    const confirmacion = window.confirm("¿Seguro que deseas descargar este presupuesto en PDF?");
    if (!confirmacion) return;

    exportarPresupuestoPDF({
      tareasSeleccionadas,
      tarifaHoraria,
      ajustePorcentaje,
      incluirVisita,
      costoVisita: visitaSegura,
      tareasPredefinidas,
      titulo: "Presupuesto Eléctrico",
      validezDias, // 👈 ahora se pasa al PDF
    });
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

      {/* Nuevo campo: Validez en días */}
      <div className="bg-white border rounded-lg shadow-sm p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FaRegCalendarAlt className="text-blue-600" />
          <span className="font-medium text-gray-700">Validez del presupuesto:</span>
        </div>
        {editandoValidez ? (
          <input
            type="number"
            min="1"
            value={validezDias}
            onChange={(e) => setValidezDias(e.target.value)}
            onBlur={() => setEditandoValidez(false)} // al salir, cierra edición
            className="w-20 text-center border rounded-md p-1"
            autoFocus
          />
        ) : (
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setEditandoValidez(true)}
          >
            <span className="font-semibold">{validezDias} días</span>
            <FaEdit className="text-gray-500 hover:text-gray-700" />
          </div>
        )}
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
              ${incluirVisita ? "bg-green-600 text-white" : "bg-blue-600 text-white"}`}
          >
            <FaTicketAlt />
            {incluirVisita ? "Cobrando visita" : "Visita bonificada"}
          </button>

          <button
            onClick={handleDescargarPDF}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition shadow"
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
