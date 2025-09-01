import React from "react";
import { formatearFechaLocal } from "../utils/fechas";

const ModalTerminos = ({ onAceptar, onVerTerminos, usuario }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-lg w-full text-center">
        <h2 className="text-2xl font-bold mb-4 text-blue-700">
          Actualización de Términos y Condiciones
        </h2>

        <p className="mb-4 text-gray-700">
          Hemos actualizado nuestros{" "}
          <button
            onClick={onVerTerminos}
            className="text-blue-600 underline hover:text-blue-800"
          >
            Términos y Condiciones
          </button>
          . Debes aceptarlos para continuar utilizando la aplicación.
        </p>

        {/* Mostrar fecha si existe */}
        {usuario?.terminos?.aceptadoEn && (
          <p className="text-sm text-gray-500 mb-4">
            Última aceptación: {formatearFechaLocal(usuario.terminos.aceptadoEn)}
          </p>
        )}

        <button
          onClick={onAceptar}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Aceptar
        </button>
      </div>
    </div>
  );
};

export default ModalTerminos;
