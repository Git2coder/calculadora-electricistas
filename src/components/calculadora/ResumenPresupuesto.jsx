import React, { useState, useRef } from "react"; // 👈 importamos useState
import ContadorAnimado from "../ContadorAnimado";
import { exportarPresupuestoPDF } from "./pdf/exportarPresupuesto";
import { FaTicketAlt, FaFilePdf } from "react-icons/fa";
import { FaRegCalendarAlt, FaEdit } from "react-icons/fa";
import { RiLineHeight } from "react-icons/ri";
import { useAuth } from "../../context/AuthContext"; 
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";

const ResumenPresupuesto = ({
  tareasSeleccionadas,
  tareasActualizadas, // 👈 nuevo
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
  setExtrasSeleccionadosGlobal,
  costoVisita
}) => {
  // 👇 nuevo estado para validez en días
  const { usuario } = useAuth();
  const [validezDias, setValidezDias] = useState(usuario?.validezDias || 15);

  // 👇 estado para mostrar/ocultar edición
  const [editandoValidez, setEditandoValidez] = useState(false);

   // 🎵 sonido para switches
  const sonidoSwitch = useRef(new Audio("/sounds/switch.mp3"));

  const puedeDescargarCompleto = usuario?.suscripcion === "completa";
  const puedeDescargarBasico = usuario?.suscripcion === "basica";
  const puedeDescargarGratuito = usuario?.suscripcion === "gratuita";

  const handleDescargarPDF = () => {
  if (!window.confirm("¿Seguro que deseas descargar este presupuesto en PDF?")) return;

  const tipoPDF =
    usuario.suscripcion === "gratuita"
      ? "gratuita"
      : usuario.suscripcion === "basica"
      ? "basico"
      : "completo";

  const tareasSincronizadas = tareasSeleccionadas;



  // 🔹 Calcular valor base de “Boca” (aunque no esté seleccionada)
  const baseBoca =
    tareasActualizadas.find((t) => t.nombre === "Boca") ||
    tareasPredefinidas.find((t) => t.nombre === "Boca") || { tiempo: 20, multiplicador: 1 };

  const valorBocaReal = (baseBoca.tiempo / 60) * tarifaHoraria * (baseBoca.multiplicador ?? 1);

  console.log("DEBUG costoVisita:", costoVisita);
  console.log("DEBUG incluirVisita:", incluirVisita);
  console.log("DEBUG tipo:", typeof costoVisita);


  exportarPresupuestoPDF({
    tipoPDF,
    tareasSeleccionadas: tareasSincronizadas,
    tarifaHoraria,
    ajustePorcentaje,
    incluirVisita,
    costoVisita,
    tareasPredefinidas,
    titulo: "Presupuesto Eléctrico",
    validezDias,
    extrasGlobales,
    extrasSeleccionadosGlobal,
    valorBoca: valorBocaReal,
  });
};



  const handleValidezChange = async (e) => {
    const nuevoValor = Number(e.target.value);
    setValidezDias(nuevoValor);

    if (usuario?.uid) {
        const ref = doc(db, "usuarios", usuario.uid);
        await updateDoc(ref, { validezDias: nuevoValor });
      }
    };

  return (
  <div className="bg-blue-50 dark:bg-gray-800 p-6 rounded-xl shadow space-y-6 transition-colors">
    {/* Título */}
    <h2 className="text-2xl font-bold text-blue-800 dark:text-blue-300 text-center">
      💰 Cierre del Presupuesto
    </h2>

    {/* Bloque principal en grid */}
    <div className="grid md:grid-cols-2 gap-6">

      {/* Columna izquierda */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm transition-colors">
        <h3 className="font-semibold mb-4 text-black dark:text-gray-100">
          ⚙️ Condiciones Globales
        </h3>

        <div className="space-y-3">
          {extrasGlobales.map((extra) => {
            const checked = extrasSeleccionadosGlobal.includes(extra.id);
            return (
              <div key={extra.id} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <span className="text-blue-600 dark:text-blue-400 text-lg">{extra.icon}</span>
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
                    sonidoSwitch.current.currentTime = 0;
                    sonidoSwitch.current.play();
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                    ${checked ? "bg-green-600" : "bg-gray-300 dark:bg-gray-600"}
                  `}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-gray-200 transition-transform
                      ${checked ? "translate-x-6" : "translate-x-1"}
                    `}
                  />
                </button>
              </div>
            );
          })}

          {/* Switch visita */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <FaTicketAlt className="text-blue-600 dark:text-blue-400 text-lg" />
              <span>
                {incluirVisita ? "Cobrando visita" : "Visita bonificada"}
              </span>
            </div>

            <button
              onClick={() => {
                setIncluirVisita((prev) => !prev);
                sonidoSwitch.current.currentTime = 0;
                sonidoSwitch.current.play();
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${incluirVisita ? "bg-green-600" : "bg-gray-300 dark:bg-gray-600"}
              `}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-gray-200 transition-transform 
                  ${incluirVisita ? "translate-x-6" : "translate-x-1"}
                `}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Columna derecha */}
      <div className="space-y-4">

        {/* Validez */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4 flex flex-col justify-center transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <FaRegCalendarAlt className="text-blue-600 dark:text-blue-400" />
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Validez del presupuesto:
            </span>
          </div>

          {editandoValidez ? (
            <input
              type="number"
              min="1"
              value={validezDias}
              onChange={handleValidezChange}
              onBlur={() => setEditandoValidez(false)}
              className="w-24 text-center border border-gray-300 dark:border-gray-600 rounded-md p-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              autoFocus
            />
          ) : (
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setEditandoValidez(true)}
            >
              <span className="font-semibold text-gray-800 dark:text-gray-100">
                {validezDias} días
              </span>
              <FaEdit className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" />
            </div>
          )}
        </div>

        {/* Ajuste de precio */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm transition-colors">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Ajuste de Precio (%)
          </label>

          {/* Riel del slider */}
          <div className="relative w-full">
            <input
              type="range"
              min="-50"
              max="50"
              step="1"
              value={ajustePorcentaje}
              onChange={(e) => setAjustePorcentaje(parseFloat(e.target.value))}
              className="w-full appearance-none bg-transparent cursor-pointer"
              style={{ zIndex: 10, position: "relative" }}
            />

            <div className="absolute top-1/2 left-0 w-full h-2 bg-gray-200 dark:bg-gray-700 rounded -translate-y-1/2 overflow-hidden">
              <div
                className={`absolute top-0 h-2 transition-all duration-300
                    ${
                      ajustePorcentaje < 0
                        ? "bg-green-500 dark:bg-green-400"
                        : ajustePorcentaje > 0
                        ? "bg-red-500 dark:bg-red-400"
                        : "bg-gray-400 dark:bg-gray-500"
                    }
                  `}
                style={{
                  left: "50%",
                  width: `${Math.abs(ajustePorcentaje)}%`,
                  transform:
                    ajustePorcentaje < 0
                      ? "translateX(-100%)"
                      : "translateX(0)",
                }}
              />
            </div>
          </div>

          <p className="text-center mt-2 font-semibold text-gray-800 dark:text-gray-100">
            {ajustePorcentaje > 0
              ? `+${ajustePorcentaje}% (Herramientas/Insumos)`
              : ajustePorcentaje < 0
              ? `${ajustePorcentaje}% (descuento)`
              : "0% (sin ajuste)"}
          </p>

          {/* Botones */}
          <div className="flex justify-center gap-3 mt-3">
            <button
              onClick={() => setAjustePorcentaje((prev) => Math.max(prev - 1, -50))}
              className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              ➖
            </button>
            <button
              onClick={() => setAjustePorcentaje(0)}
              className="px-3 py-1 bg-blue-400 dark:bg-blue-600 text-white rounded hover:bg-blue-600 dark:hover:bg-blue-700 transition"
            >
              🔄
            </button>
            <button
              onClick={() => setAjustePorcentaje((prev) => Math.min(prev + 1, 50))}
              className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              ➕
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* Línea inferior */}
    <div className="border-t border-gray-300 dark:border-gray-700 pt-4 flex flex-col md:flex-row items-center justify-between gap-4">

      {/* Tiempo estimado */}
      <div className="flex gap-3">
        {tareasSeleccionadas.length >= 1 && tiempoTotal > 20 && (
          <p className="text-center text-lg text-gray-900 dark:text-gray-100">
            ⏱️ Min. Estimado: {horasMargen}h {minutosMargen}min{" "}
            <i className="text-xs text-gray-500 dark:text-gray-400 block">
              (no incluye tiempo de tareas administrativas)
            </i>
          </p>
        )}
      </div>

      {/* Total */}
      <div className="text-right text-gray-800 dark:text-gray-100">
        <ContadorAnimado valor={costoFinal} />
      </div>

      {/* Botón PDF */}
      <button
        onClick={() => {
          if (puedeDescargarCompleto) handleDescargarPDF("completo");
          else if (puedeDescargarBasico) handleDescargarPDF("basico");
          else if (puedeDescargarGratuito) handleDescargarPDF("gratuita");
          else alert("Iniciá sesión para generar tu presupuesto.");
        }}
        className={`px-4 py-2 rounded text-white font-semibold transition 
          ${
            puedeDescargarCompleto
              ? "bg-red-600 hover:bg-red-700"
              : puedeDescargarBasico
              ? "bg-blue-600 hover:bg-blue-700"
              : puedeDescargarGratuito
              ? "bg-green-600 hover:bg-green-700"
              : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-300 cursor-not-allowed"
          }
        `}
      >
        <FaFilePdf className="inline mr-2" />
        Descargar PDF
      </button>
    </div>
  </div>
);

};

export default ResumenPresupuesto;
