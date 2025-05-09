// components/ModalTarifa.jsx

import { useState } from "react";
import { motion } from "framer-motion";

export default function ModalTarifa({ setTarifaHoraria, onClose }) {
  const [gastosFijos, setGastosFijos] = useState(0);
  const [gastosVariables, setGastosVariables] = useState(0);
  const horasTrabajadas = 96;
  const ganancia = 1.67;

  const calcularTarifa = () => {
    const total = (parseFloat(gastosFijos) + parseFloat(gastosVariables)) / horasTrabajadas;
    const sugerido = total * ganancia;
    setTarifaHoraria(Math.round(sugerido));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="bg-white p-6 rounded shadow-lg max-w-sm w-full relative"
      >
        <h2 className="text-xl font-bold mb-4 text-center text-blue-700">📊 Calcular Tarifa Horaria</h2>

        <label className="block mb-3">
          Gastos Fijos Mensuales ($):
          <input
            type="number"
            className="w-full p-2 border rounded mt-1"
            value={gastosFijos}
            onChange={(e) => setGastosFijos(e.target.value)}
          />
          <p className="text-sm text-gray-500 mt-1">Ej: alquiler, seguros, herramientas</p>
        </label>

        <label className="block mb-3">
          Gastos Variables Mensuales ($):
          <input
            type="number"
            className="w-full p-2 border rounded mt-1"
            value={gastosVariables}
            onChange={(e) => setGastosVariables(e.target.value)}
          />
          <p className="text-sm text-gray-500 mt-1">Ej: combustible, viáticos, impresiones</p>
        </label>

        <div className="flex justify-between mt-6">
          <button
            onClick={calcularTarifa}
            className="bg-green-600 text-white px-4 py-2 rounded shadow"
          >
            Calcular
          </button>
          <button
            onClick={onClose}
            className="bg-gray-400 text-white px-4 py-2 rounded shadow"
          >
            Cancelar
          </button>
        </div>
      </motion.div>
    </div>
  );
}
