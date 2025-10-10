import { useState } from "react";
import { db } from "../../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function EncuestaRapida() {
  const [seleccion, setSeleccion] = useState(null);
  const [comentario, setComentario] = useState("");
  const [enviada, setEnviada] = useState(false);

  const opciones = [
    { valor: 1, emoji: "😕", texto: "No me resultó útil" },
    { valor: 2, emoji: "🙂", texto: "Me sirve en algunos casos" },
    { valor: 3, emoji: "😃", texto: "Me ayuda mucho en mis trabajos" },
    { valor: 4, emoji: "⚡", texto: "¡Me simplifica el trabajo totalmente!" },
  ];

  const enviar = async () => {
    if (!seleccion) return alert("Seleccioná una opción antes de enviar.");
    try {
      await addDoc(collection(db, "encuestas"), {
        nivelValor: seleccion.valor,
        nivelTexto: seleccion.texto,
        comentario: comentario.trim() || null,
        timestamp: serverTimestamp(),
      });
      setEnviada(true);
    } catch (error) {
      console.error("❌ Error al guardar encuesta:", error);
      alert("Hubo un error al enviar tu respuesta. Intentá nuevamente.");
    }
  };

  if (enviada)
    return (
      <div className="text-center">
        <p className="text-green-600 font-semibold text-lg mb-2">
          ✅ ¡Gracias por tu respuesta!
        </p>
        <p className="text-gray-600 text-sm">
          Tus aportes nos ayudan a mejorar la experiencia de todos ⚡
        </p>
      </div>
    );

  return (
    <div className="space-y-5 text-center">
      <p className="font-semibold text-gray-700 text-lg">
        ¿Qué tan útil te resulta la calculadora?
      </p>

      <div className="flex justify-center gap-4">
        {opciones.map((op) => (
          <button
            key={op.valor}
            onClick={() => setSeleccion(op)}
            className={`flex flex-col items-center justify-center rounded-xl px-3 py-2 text-2xl transition 
              ${
                seleccion?.valor === op.valor
                  ? "bg-blue-100 ring-2 ring-blue-400"
                  : "hover:bg-gray-100"
              }`}
          >
            <span>{op.emoji}</span>
            <span className="text-xs mt-1 text-gray-600">{op.texto}</span>
          </button>
        ))}
      </div>

      {seleccion && (
        <div className="mt-4 space-y-3 animate-fadeIn">
          <textarea
            placeholder="Contanos qué mejorarías o qué te gustó (opcional)"
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
          <button
            onClick={enviar}
            className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-500 transition"
          >
            Enviar
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
