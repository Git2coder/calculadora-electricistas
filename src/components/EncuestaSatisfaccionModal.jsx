import { useState } from "react";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

export default function EncuestaSatisfaccionModal({ visible, onClose }) {
  const { usuario } = useAuth();
  const db = getFirestore();

  const [seleccion, setSeleccion] = useState(null);
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const opciones = [
    { valor: 1, emoji: "⛔", texto: "Los precios no me convencen", color: "bg-red-50 border-red-200 text-red-700 hover:bg-red-100" },
    { valor: 2, emoji: "🧩", texto: "Dificil de usar / Le falta algo", color: "bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100" },
    { valor: 3, emoji: "⏱️", texto: "Ahorra mucho tiempo", color: "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100" },
    { valor: 4, emoji: "👍", texto: "¡Gran herramienta!", color: "bg-green-50 border-green-200 text-green-700 hover:bg-green-100" },
  ];

  const enviar = async () => {
    if (!usuario || !seleccion) return;

    // 🔸 Si el voto es negativo, el comentario es obligatorio
    if ((seleccion.valor === 1 || seleccion.valor === 2) && comentario.trim().length < 5) {
      alert("Por favor, contanos brevemente por qué diste esta calificación.");
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
      localStorage.setItem("encuestaSatisfaccionVotada", "true");
      localStorage.setItem("encuestaSatisfaccionUltimo", new Date().toISOString());
      setEnviado(true);
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      console.error("Error enviando satisfacción:", err);
    } finally {
      setEnviando(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-[90%] max-w-md text-center relative animate-fadeIn">
        <button
          onClick={() => {
            localStorage.setItem("encuestaSatisfaccionUltimo", new Date().toISOString());
            onClose();
          }}
          className="absolute top-2 right-3 text-gray-400 hover:text-gray-600 text-xl"
        >
          ✖
        </button>

        {!enviado ? (
          <>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              ¿Qué te está pareciendo la calculadora?
            </h2>

            <div className="flex justify-center flex-wrap gap-4 mb-3">
              {opciones.map((op) => (
                <button
                  key={op.valor}
                  onClick={() => setSeleccion(op)}
                  className={`flex flex-col items-center justify-center h-20 w-20 rounded-xl border border-gray-200 text-3xl transition-all duration-200 ${op.color} ${
                    seleccion?.valor === op.valor
                      ? "ring-2 ring-blue-400 scale-110 bg-white"
                      : "hover:scale-105"
                  }`}
                >
                  <span>{op.emoji}</span>
                  <span className="text-[10px] mt-1 text-gray-700 leading-tight">
                    {op.texto}
                  </span>
                </button>
              ))}
            </div>

            {/* Mostrar textarea si el voto es 1 o 2 */}
            {(seleccion?.valor === 1 || seleccion?.valor === 2) && (
              <textarea
                placeholder="Contanos brevemente lo que no te convencio..."
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none mb-3"
                rows={3}
              />
            )}

            <button
              onClick={enviar}
              disabled={!seleccion || enviando}
              className="bg-blue-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-blue-500 transition disabled:opacity-60"
            >
              {enviando ? "Enviando..." : "Enviar opinión"}
            </button>
          </>
        ) : (
          <p className="text-green-600 font-medium py-6">✅ ¡Gracias por tu opinión!</p>
        )}
      </div>
    </div>
  );
}
