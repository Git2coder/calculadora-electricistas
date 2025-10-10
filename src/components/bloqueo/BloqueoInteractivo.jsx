// BloqueoInteractivo.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import ContenidoUtil from "./ContenidoUtil";
import EncuestaRapida from "./EncuestaRapida";
import MiniQuiz from "./MiniQuiz";

export default function BloqueoInteractivo() {
  const [seccion, setSeccion] = useState("contenido");

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-gradient-to-b from-blue-50 to-blue-100 text-center px-6 py-10">
      <div className="bg-white shadow-xl border border-yellow-300 rounded-2xl p-8 max-w-2xl w-full">
        <h2 className="text-3xl font-extrabold text-blue-700 mb-6">
          ⚡ ¡Mientras calibramos la calculadora, aprovechá esto!
        </h2>

        {/* Selector de secciones */}
        <div className="flex justify-center gap-3 mb-6">
          {[
            ["contenido", "📘 Datos útiles"],
            ["encuesta", "🗳️ Encuesta"],
            ["quiz", "🎯 Mini Quiz"],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setSeccion(id)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                seccion === id
                  ? "bg-yellow-400 text-blue-800"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Contenido dinámico */}
        <motion.div
          key={seccion}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {seccion === "contenido" && <ContenidoUtil />}
          {seccion === "encuesta" && <EncuestaRapida />}
          {seccion === "quiz" && <MiniQuiz />}
        </motion.div>
      </div>
    </div>
  );
}
