import { useState, useEffect, useRef } from "react";
import { doc, setDoc, getDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { db, auth } from "../../firebaseConfig";

export default function EncuestaRapida() {
  const [seleccion, setSeleccion] = useState(null);
  const [comentario, setComentario] = useState("");
  const [yaRespondida, setYaRespondida] = useState(null);
  const [encuestaId, setEncuestaId] = useState(null);
  const [encuestaActiva, setEncuestaActiva] = useState(false);
  const [cargando, setCargando] = useState(true);
  const cfgUnsubRef = useRef(null);

  // 🔹 Nueva definición con textos actualizados y emojis coherentes
  const opciones = [
    {
      valor: 1,
      emoji: "😣",
      texto: "No me resultó fácil de usar",
      color: "bg-red-50 border-red-200 text-red-700 hover:bg-red-100",
    },
    {
      valor: 2,
      emoji: "😐",
      texto: "Los precios no me convencen",
      color: "bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100",
    },
    {
      valor: 3,
      emoji: "⏱️",
      texto: "Ahorra mucho tiempo",
      color: "bg-green-50 border-green-200 text-green-700 hover:bg-green-100",
    },
    {
      valor: 4,
      emoji: "⚡",
      texto: "¡Excelente herramienta!",
      color: "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100",
    },
  ];

  const getUserId = () => {
    const uid = auth?.currentUser?.uid;
    if (uid) return uid;
    let anon = localStorage.getItem("anonId");
    if (!anon) {
      anon = `anon_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      localStorage.setItem("anonId", anon);
    }
    return anon;
  };

  useEffect(() => {
    const cfgRef = doc(db, "config", "encuestaActual");
    const unsub = onSnapshot(
      cfgRef,
      (snap) => {
        const data = snap.exists() ? snap.data() : null;
        const id = data?.id || null;
        const activa = !!data?.activa;
        const version = data?.version || 1;
        setEncuestaId(id);
        setEncuestaActiva(activa);
        setCargando(false);
        localStorage.setItem("encuestaVersion", String(version));
      },
      (err) => {
        console.error("Error onSnapshot config:", err);
        setCargando(false);
      }
    );
    cfgUnsubRef.current = unsub;
    return () => unsub();
  }, []);

  useEffect(() => {
    let mounted = true;
    const verificar = async () => {
      if (!encuestaId) {
        if (mounted) setYaRespondida(false);
        return;
      }
      const version = localStorage.getItem("encuestaVersion") || "1";
      const voteKey = `voto_${encuestaId}_v${version}`;
      if (localStorage.getItem(voteKey)) {
        if (mounted) setYaRespondida(true);
        return;
      }

      const userId = getUserId();
      try {
        const votoRef = doc(db, "encuestas", encuestaId, "respuestas", userId);
        const votoSnap = await getDoc(votoRef);
        if (votoSnap.exists()) {
          localStorage.setItem(voteKey, "true");
          if (mounted) setYaRespondida(true);
        } else {
          if (mounted) setYaRespondida(false);
        }
      } catch {
        if (mounted) setYaRespondida(false);
      }
    };
    verificar();
    return () => (mounted = false);
  }, [encuestaId]);

  const enviar = async () => {
    if (!seleccion) return alert("Seleccioná una opción antes de enviar.");
    if (!encuestaId || !encuestaActiva)
      return alert("No hay encuesta activa para responder.");

    const userId = getUserId();
    const version = localStorage.getItem("encuestaVersion") || "1";
    const voteKey = `voto_${encuestaId}_v${version}`;
    if (localStorage.getItem(voteKey)) {
      setYaRespondida(true);
      return;
    }

    try {
      const ref = doc(db, "encuestas", encuestaId, "respuestas", userId);
      await setDoc(ref, {
        nivelValor: seleccion.valor,
        nivelTexto: seleccion.texto,
        comentario: comentario.trim() || null,
        timestamp: serverTimestamp(),
        encuestaVersion: Number(version),
      });
      localStorage.setItem(voteKey, "true");
      setYaRespondida(true);
    } catch (err) {
      console.error("Error al enviar voto:", err);
      alert("Hubo un error registrando tu voto. Intentá de nuevo.");
    }
  };

  if (cargando || yaRespondida === null)
    return <div className="text-center py-6 text-gray-500 text-sm">Cargando encuesta...</div>;

  if (!encuestaActiva || !encuestaId)
    return (
      <div className="text-center py-6">
        <p className="text-gray-600">Actualmente no hay una encuesta activa. Vuelve pronto.</p>
      </div>
    );

  if (yaRespondida)
    return (
      <div className="text-center py-6">
        <p className="text-green-600 font-semibold text-lg mb-2">✅ Voto registrado</p>
        <p className="text-gray-600 text-sm">
          Gracias por participar. Tu aporte nos ayuda a mejorar — podrás votar en la próxima campaña.
        </p>
      </div>
    );

  return (
    <div className="space-y-5 text-center">
      <p className="font-semibold text-gray-700 text-lg">
        ¿Qué tan útil te resulta la calculadora?
      </p>

      {/* 🔸 Alineación perfecta de los 4 botones */}
      <div className="flex justify-center flex-wrap gap-4">
        {opciones.map((op) => (
          <button
            key={op.valor}
            onClick={() => setSeleccion(op)}
            className={`flex flex-col items-center justify-center h-24 w-24 rounded-xl border text-3xl font-medium transition-all duration-200
              ${op.color}
              ${
                seleccion?.valor === op.valor
                  ? "ring-2 ring-blue-400 scale-105 bg-white"
                  : "hover:scale-105"
              }`}
            aria-pressed={seleccion?.valor === op.valor}
          >
            <span>{op.emoji}</span>
            <span className="text-xs mt-2 text-gray-700 leading-tight">{op.texto}</span>
          </button>
        ))}
      </div>

      {seleccion && (
        <div className="mt-4 space-y-3 animate-fadeIn">
          <textarea
            placeholder="Contanos qué mejorarías o qué te gustó (opcional)"
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none"
            rows={3}
          />
          <button
            onClick={enviar}
            className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-500 transition"
          >
            Enviar voto
          </button>
        </div>
      )}
    </div>
  );
}
