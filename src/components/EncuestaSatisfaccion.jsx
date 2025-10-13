import { useState } from "react";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

export default function EncuestaSatisfaccion() {
  const { usuario } = useAuth();
  const db = getFirestore();

  const [seleccion, setSeleccion] = useState(null);
  const [comentario, setComentario] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  // 🔹 Definición de opciones con texto actualizado y colores suaves
  const opciones = [
    { valor: 1, emoji: "😣", texto: "No me resultó fácil de usar", color: "bg-red-50 border-red-200 text-red-700 hover:bg-red-100" },
    { valor: 2, emoji: "😐", texto: "Los precios no me convencen", color: "bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100" },
    { valor: 3, emoji: "⏱️", texto: "Ahorra mucho tiempo", color: "bg-green-50 border-green-200 text-green-700 hover:bg-green-100" },
    { valor: 4, emoji: "⚡", texto: "¡Excelente herramienta!", color: "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100" },
  ];

  const enviar = async () => {
    if (!usuario) {
      alert("Iniciá sesión para dejar tu opinión.");
      return;
    }
    if (!seleccion) {
      alert("Seleccioná una opción para enviar tu voto.");
      return;
    }

    setEnviando(true);
    try {
      await addDoc(collection(db, "mensajesUsuarios"), {
        tipo: "satisfaccion",
        origen: "calculadora",
        usuarioId: usuario.uid,
        email: usuario.email || null,
        nivelValor: seleccion.valor,
        nivelTexto: seleccion.texto,
        comentario: comentario.trim() || null,
        fecha: serverTimestamp(),
        estado: "pendiente",
      });
      setEnviado(true);
      setSeleccion(null);
      setComentario("");
    } catch (err) {
      console.error("Error enviando satisfacción:", err);
      alert("Hubo un error al enviar tu opinión. Intentá nuevamente.");
    } finally {
      setEnviando(false);
    }
  };

  if (enviado) {
    return (
      <div className="text-center py-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-green-700 font-semibold">✅ ¡Gracias por tu opinión!</p>
        <p className="text-sm text-gray-600">Tu aporte nos ayuda a mejorar continuamente.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-center bg-white border rounded-xl p-4 shadow-sm">
      <p className="font-semibold text-gray-800">¿Qué tan útil te resulta la calculadora?</p>

      <div className="flex justify-center flex-wrap gap-4">
        {opciones.map((op) => (
          <button
            key={op.valor}
            onClick={() => setSeleccion(op)}
            className={`flex flex-col items-center justify-center h-24 w-24 rounded-xl border text-3xl font-medium transition-all duration-200
              ${op.color}
              ${seleccion?.valor === op.valor ? "ring-2 ring-blue-400 scale-105 bg-white" : "hover:scale-105"}`}
          >
            <span>{op.emoji}</span>
            <span className="text-xs mt-2 text-gray-700 leading-tight">{op.texto}</span>
          </button>
        ))}
      </div>

      {seleccion && (
        <div className="space-y-3 animate-fadeIn">
          <textarea
            placeholder="Contanos qué mejorarías o qué te gustó (opcional)"
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none"
            rows={3}
          />
          <button
            onClick={enviar}
            disabled={enviando}
            className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-500 transition disabled:opacity-60"
          >
            {enviando ? "Enviando..." : "Enviar opinión"}
          </button>
        </div>
      )}
    </div>
  );
}
