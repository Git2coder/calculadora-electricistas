// src/components/calculadora/ConfiguracionTarifas.jsx
import React, { useState } from "react";
import { FaCalculator, FaMoneyBillWave, FaEdit } from "react-icons/fa";
import { IoTime } from "react-icons/io5";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";
import ModalTarifa from "../ModalTarifa";

const ConfiguracionTarifas = ({
  tarifaHoraria,
  setTarifaHoraria,
  costoConsulta,
  setCostoConsulta,
}) => {
  const [mostrarModalTarifa, setMostrarModalTarifa] = useState(false);

  // Estados para "modo edición"
  const [editTarifa, setEditTarifa] = useState(false);
  const [editVisita, setEditVisita] = useState(false);

  const actualizarFirestore = async (campo, valor) => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      const ref = doc(db, "usuarios", user.uid);
      await updateDoc(ref, { [campo]: valor });
    } catch (error) {
      console.error("Error actualizando Firestore:", error);
    }
  };

  const handleConfirmTarifa = (valor) => {
    setTarifaHoraria(valor);
    actualizarFirestore("tarifaHoraria", valor);
    setEditTarifa(false);
  };

  const handleConfirmVisita = (valor) => {
    setCostoConsulta(valor);
    actualizarFirestore("costoConsulta", valor);
    setEditVisita(false);
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
      {/* Tarifa horaria */}
      <div className="flex items-center gap-3">
        <IoTime className="text-indigo-600" />
        <span className="font-semibold">Tarifa Horaria:</span>
        {editTarifa ? (
          <input
            type="number"
            className="w-24 p-1 border rounded ml-2"
            defaultValue={tarifaHoraria}
            autoFocus
            onBlur={(e) => handleConfirmTarifa(parseFloat(e.target.value) || 0)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleConfirmTarifa(parseFloat(e.target.value) || 0);
              }
            }}
          />
        ) : (
          <span className="ml-2 font-mono text-blue-700">
            ${tarifaHoraria.toLocaleString("es-AR")}
          </span>
        )}
        <button
          className="ml-2 px-2 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300 flex items-center gap-1"
          onClick={() => setEditTarifa(true)}
        >
          <FaEdit /> Editar
        </button>
        <button
          className="flex items-center gap-1 px-3 py-1 text-sm sm:text bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          onClick={() => setMostrarModalTarifa(true)}
        >
          <FaCalculator />
          <span>Calcular</span>
        </button>
      </div>

      {/* Valor de la visita */}
      <div className="flex items-center gap-3">
        <FaMoneyBillWave className="text-green-600" />
        <span className="font-semibold">Visita:</span>
        {editVisita ? (
          <input
            type="number"
            className="w-24 p-1 border rounded ml-2"
            defaultValue={costoConsulta}
            autoFocus
            onBlur={(e) => handleConfirmVisita(parseFloat(e.target.value) || 0)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleConfirmVisita(parseFloat(e.target.value) || 0);
              }
            }}
          />
        ) : (
          <span className="ml-2 font-mono text-green-700">
            ${costoConsulta.toLocaleString("es-AR")}
          </span>
        )}
        <button
          className="ml-2 px-2 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300 flex items-center gap-1"
          onClick={() => setEditVisita(true)}
        >
          <FaEdit /> Editar
        </button>
      </div>

      {/* Modal de ayuda para calcular tarifa */}
      {mostrarModalTarifa && (
        <ModalTarifa
          tarifaHoraria={tarifaHoraria}
          setTarifaHoraria={(val) => handleConfirmTarifa(val)}
          costoConsulta={costoConsulta}
          setCostoConsulta={(val) => handleConfirmVisita(val)}
          onClose={() => setMostrarModalTarifa(false)}
        />
      )}
    </div>
  );
};

export default ConfiguracionTarifas;
