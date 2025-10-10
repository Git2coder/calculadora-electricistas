// EncuestaRapida.jsx
import { useState } from "react";
import { db } from "../../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function EncuestaRapida() {
  const [respuesta, setRespuesta] = useState("");
  const [enviada, setEnviada] = useState(false);

  const enviar = async () => {
    if (!respuesta) return alert("Seleccioná una opción");
    await addDoc(collection(db, "encuestas"), {
      respuesta,
      timestamp: serverTimestamp(),
    });
    setEnviada(true);
  };

  if (enviada)
    return <p className="text-green-600 font-semibold">✅ ¡Gracias por tu opinión!</p>;

  return (
    <div className="space-y-4">
      <p className="font-semibold text-gray-700">
        ¿Qué te gustaría que mejoremos en la calculadora?
      </p>
      {["Velocidad de carga", "Diseño visual", "Opciones de tareas", "Otro"].map((op) => (
        <label key={op} className="flex items-center gap-2 justify-center">
          <input
            type="radio"
            name="encuesta"
            value={op}
            checked={respuesta === op}
            onChange={(e) => setRespuesta(e.target.value)}
          />
          <span>{op}</span>
        </label>
      ))}
      <button
        onClick={enviar}
        className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-lg"
      >
        Enviar respuesta
      </button>
    </div>
  );
}
