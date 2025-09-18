// CalculadoraPreview.jsx
import React from "react";
import CalculadoraCompleta from "../CalculadoraCompleta";

export default function CalculadoraPreview() {
  return (
    <div className="relative">
      {/* Calculadora real, pero deshabilitada */}
      <div className="pointer-events-none select-none opacity-90">
        <CalculadoraCompleta modoPreview={true} />
      </div>

      {/* Overlay de aviso */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-black/60 text-white px-6 py-4 rounded-lg shadow-lg">
          👀 Vista previa (solo lectura)
        </div>
      </div>
    </div>
  );
}
