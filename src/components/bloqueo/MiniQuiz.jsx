// MiniQuiz.jsx
import { useState } from "react";

const preguntas = [
  {
    pregunta: "¿Qué mide un amperímetro?",
    opciones: ["Voltaje", "Corriente", "Resistencia"],
    correcta: "Corriente",
  },
  {
    pregunta: "¿Qué ley relaciona tensión, corriente y resistencia?",
    opciones: ["Ley de Faraday", "Ley de Ohm", "Ley de Ampere"],
    correcta: "Ley de Ohm",
  },
  {
    pregunta: "¿Qué valor tiene un kiloohmio en ohmios?",
    opciones: ["100", "1000", "10000"],
    correcta: "1000",
  },
];

export default function MiniQuiz() {
  const [index, setIndex] = useState(0);
  const [puntuacion, setPuntuacion] = useState(0);
  const [finalizado, setFinalizado] = useState(false);

  const pregunta = preguntas[index];

  const responder = (op) => {
    if (op === pregunta.correcta) setPuntuacion((p) => p + 1);
    if (index + 1 < preguntas.length) setIndex(index + 1);
    else setFinalizado(true);
  };

  if (finalizado) {
    const bien = puntuacion >= 2;
    return (
      <div className="space-y-3">
        <p className="text-xl font-bold">
          {bien ? "⚡ ¡Excelente!" : "🔌 Podés mejorar!"}
        </p>
        <p className="text-gray-700">
          Tu puntuación: {puntuacion}/{preguntas.length}
        </p>
        {bien && (
          <p className="text-yellow-600 font-semibold">
            🎁 Cupón: <span className="underline">ELECTRICISTA10</span>
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="font-semibold text-gray-700">{pregunta.pregunta}</p>
      {pregunta.opciones.map((op) => (
        <button
          key={op}
          onClick={() => responder(op)}
          className="block w-full bg-yellow-100 hover:bg-yellow-200 text-black-800 py-2 rounded-lg transition"
        >
          {op}
        </button>
      ))}
    </div>
  );
}
