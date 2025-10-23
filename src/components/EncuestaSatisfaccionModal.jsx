import { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

export default function EncuestaSatisfaccionModal({ visible, onClose, version }) {
  const { usuario } = useAuth();
  const db = getFirestore();

  const [seleccion, setSeleccion] = useState(null);
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [yaRespondida, setYaRespondida] = useState(false);

  // Generar ID anónimo si el usuario no está logueado
  const getUserId = () => {
    if (usuario?.uid) return usuario.uid;
    let anon = localStorage.getItem("anonId");
    if (!anon) {
      anon = `anon_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      localStorage.setItem("anonId", anon);
    }
    return anon;
  };
  const userId = getUserId();

  // Chequear si ya respondió esta versión
  useEffect(() => {
    if (!version) return;
    const key = `encuesta_v${version}_votada`;
    if (localStorage.getItem(key) === "true") {
      setYaRespondida(true);
      return;
    }

    (async () => {
      try {
        const respRef = doc(db, "encuestas", `v${version}`, "respuestas", userId);
        const snap = await getDoc(respRef);
        if (snap.exists()) {
          localStorage.setItem(key, "true");
          setYaRespondida(true);
        }
      } catch (err) {
        console.warn("No se pudo verificar respuesta previa:", err);
      }
    })();
  }, [version, db, userId]);

  const opciones = [
    { valor: 1, emoji: "⛔", texto: "Los precios no me convencen", color: "bg-red-50 border-red-200 text-red-700 hover:bg-red-100" },
    { valor: 2, emoji: "🧩", texto: "Difícil de usar / Le falta algo", color: "bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100" },
    { valor: 3, emoji: "⏱️", texto: "Ahorra mucho tiempo", color: "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100" },
    { valor: 4, emoji: "👍", texto: "¡Gran herramienta!", color: "bg-green-50 border-green-200 text-green-700 hover:bg-green-100" },
  ];

  const enviar = async () => {
    if (!seleccion) return alert("Seleccioná una opción antes de enviar.");
    if ((seleccion.valor === 1 || seleccion.valor === 2) && comentario.trim().length < 5)
      return alert("Por favor, contanos brevemente por qué diste esta calificación.");

    setEnviando(true);
    try {
      // Guardar en mensajesUsuarios (registro general)
      await addDoc(collection(db, "mensajesUsuarios"), {
        tipo: "satisfaccion",
        origen: "calculadora",
        usuarioId: userId,
        email: usuario?.email || null,
        nivelValor: seleccion.valor,
        nivelTexto: seleccion.texto,
        comentario: comentario.trim() || null,
        fecha: serverTimestamp(),
        estado: "pendiente",
        encuestaVersion: version,
      });

      // Guardar en encuestas/vX/respuestas/userId
      const respRef = doc(db, "encuestas", `v${version}`, "respuestas", userId);
      await setDoc(respRef, {
        nivelValor: seleccion.valor,
        nivelTexto: seleccion.texto,
        comentario: comentario.trim() || null,
        timestamp: serverTimestamp(),
      });

      // Guardar flag local
      localStorage.setItem(`encuesta_v${version}_votada`, "true");

      setEnviado(true);
      setTimeout(() => onClose && onClose(), 1200);
    } catch (err) {
      console.error("Error enviando satisfacción:", err);
      alert("Error al enviar tu opinión. Revisá la consola.");
    } finally {
      setEnviando(false);
    }
  };

  if (!visible || yaRespondida || !version) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-[90%] max-w-md text-center relative animate-fadeIn">
        <button onClick={onClose} className="absolute top-2 right-3 text-gray-400 hover:text-gray-600 text-xl">✖</button>

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
                  className={`flex flex-col items-center justify-center h-20 w-20 rounded-xl border text-3xl transition-all duration-200 ${op.color} ${seleccion?.valor === op.valor ? "ring-2 ring-blue-400 scale-110 bg-white" : "hover:scale-105"}`}
                >
                  <span>{op.emoji}</span>
                  <span className="text-[10px] mt-1 text-gray-700 leading-tight">{op.texto}</span>
                </button>
              ))}
            </div>

            {(seleccion?.valor === 1 || seleccion?.valor === 2) && (
              <textarea
                placeholder="Contanos brevemente por qué esta calificación..."
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
