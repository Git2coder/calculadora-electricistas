import React, { useState } from "react"; // 👈 importamos useState
import ContadorAnimado from "../ContadorAnimado";
import { exportarPresupuestoPDF } from "./pdf/exportarPresupuesto";
import { FaTicketAlt, FaFilePdf } from "react-icons/fa";
import { FaRegCalendarAlt, FaEdit } from "react-icons/fa";
import { RiLineHeight } from "react-icons/ri";

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
  extrasGlobales,
  extrasSeleccionadosGlobal,
  setExtrasSeleccionadosGlobal
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
      💰 Cierre del Presupuesto
    </h2>
    
    {/* Bloque principal en grid */}
    <div className="grid md:grid-cols-2 gap-6">

     {/* Columna izquierda: Condiciones generales */}
      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <h3 className="font-semibold mb-4 text-black">⚙️ Condiciones generales</h3>

        <div className="space-y-3">
          {extrasGlobales.map((extra) => {
            const checked = extrasSeleccionadosGlobal.includes(extra.id);
            return (
              <div key={extra.id} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="text-blue-600 text-lg">{extra.icon}</span>
                  <span>{extra.label}</span>
                </div>
                <button
                  onClick={() => {
                    if (checked) {
                      setExtrasSeleccionadosGlobal(
                        extrasSeleccionadosGlobal.filter((id) => id !== extra.id)
                      );
                    } else {
                      setExtrasSeleccionadosGlobal([...extrasSeleccionadosGlobal, extra.id]);
                    }
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    checked ? "bg-green-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      checked ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            );
          })}

          {/* Switch para visita */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-gray-700">
              < FaTicketAlt className="text-blue-600 text-lg" />
              <span>{incluirVisita ? "Cobrando visita" : "Visita bonificada"}</span>
            </div>
            <button
              onClick={() => {
                setIncluirVisita((prev) => !prev);
                sonidoMonedas.current.currentTime = 0;
                sonidoMonedas.current.play();
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                incluirVisita ? "bg-green-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  incluirVisita ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Columna derecha: Validez y ajuste de precio */}
      <div className="space-y-4">
      
      {/* Dias de validez */}       
      <div className="bg-white border rounded-lg shadow-sm p-4 flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-2">
          <FaRegCalendarAlt className="text-blue-600" />
          <span className="font-medium text-gray-700">Validez del presupuesto:</span>
          
        </div>
        {editandoValidez ? (
          <input
            type="number"
            min="1"
            value={validezDias}
            onChange={(e) => setValidezDias(e.target.value)}
            onBlur={() => setEditandoValidez(false)}
            className="w-24 text-center border rounded-md p-1"
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
     
      {/* Ajuste de precio */}
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ajuste de Precio (%)
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
      </div>  
    </div>

    {/* Linea separadora */}
    <div className="border-t pt-4 flex flex-col md:flex-row items-center justify-between gap-4">
    
    {/* Tiempo estimado */}
      <div className="flex gap-3">         
        {tareasSeleccionadas.length >= 1 && tiempoTotal > 20 && (
          <p className="text-center text-lg">
            ⏱️ Min. Estimado: {horasMargen}h {minutosMargen}min{" "}
            <i className="text-xs text-gray-500 block">
              (no incluye tiempo de tareas administrativas)
            </i>
          </p>
        )}       
      
      </div>
     
      {/* Contador destacado */}
      <div className="text-right">
        <ContadorAnimado valor={costoFinal} />
      </div>   
       <button
          onClick={handleDescargarPDF}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition shadow"
        >
          <FaFilePdf />
          Descargar PDF
        </button>
    </div>
  </div>
);

};

export default ResumenPresupuesto;
