import React, { useState, useEffect, useRef } from "react";
import Fuse from "fuse.js";
import { normalizarTexto, reemplazarSinonimos } from "../utils/normalizarTexto";
import { useAuth } from "../context/AuthContext";
import { getFirestore, collection, addDoc, serverTimestamp, getDocs } from "firebase/firestore";

/**
 * Asistente.jsx (UNIFICADO)
 * - Mantiene ColaboraBot (buscador de tareas).
 * - Agrega dos secciones de mensajería unificada:
 *    💬 sugerencia  -> guarda en mensajesUsuarios tipo: 'sugerencia'
 *    🆘 soporte     -> guarda en mensajesUsuarios tipo: 'soporte'
 * - Solo usuarios autenticados pueden enviar mensajes (incluye email y uid).
 * - Exposes window.openAsistente(mode, origin) to open the panel externally.
 */

export default function Asistente({ agregarTarea } = {}) {
  const { usuario } = useAuth();
  const db = getFirestore();

  const [tareas, setTareas] = useState([]);

  useEffect(() => {
    const fetchTareas = async () => {
      const snap = await getDocs(collection(db, "tareas"));
      const data = snap.docs.map((d) => d.data());
      setTareas(data);
    };
    fetchTareas();
  }, []);

  const fuse = new Fuse(tareas, {
    keys: ["nombre"],
    threshold: 0.35,
  });

  // UI / modos: "bot" | "sugerencia" | "soporte"
  const [abierto, setAbierto] = useState(false);
  const [modo, setModo] = useState("bot");
  const [origen, setOrigen] = useState("asistente"); // de dónde se abrió
  const [consulta, setConsulta] = useState("");
  const [respuesta, setRespuesta] = useState(null);
  const [seleccionadas, setSeleccionadas] = useState([]);
  const [faqAbierta, setFaqAbierta] = useState(null);
  const [enviando, setEnviando] = useState(false);

  // Mensajería
  const [mensajeText, setMensajeText] = useState("");
  const [confirmacion, setConfirmacion] = useState(null);

  // FAQs (mantener)
  const faqs = [
    {
      q: "¿Qué hago si no encuentro una tarea?",
      a: "Podés describir tu caso en el asistente para recibir sugerencias, o usar la opción 'añadir personalizada' ubicada dentro del botón 'ver listado' (con esta alternativa el precio lo fijas vos)."
    },
    {
      q: "¿Van a añadir nuevas tareas a la lista?",
      a: "Si, es la idea mantenerla actulizada para ustedes. Por eso dejamos a disposicion la caja de sugerencias para que se puedan comunicar."
    },
    {
      q: "¿Los valores son definitivos?",
      a: "No. Los valores son de referencia para ayudarte a cotizar. El precio final lo definís vos aplicando los ajustes según tu criterio y condiciones del trabajo."
    },
    {
      q: "¿Qué diferencia hay entre el buscador y el asistente?",
      a: "El buscador sirve para localizar una tarea específica. El asistente es mas flexible sugiriendo opciones relacionadas."
    },
    {
      q: "¿Puedo modificar los valores de las tareas?",
      a: "No de manera individual, salvo algunas excepciones (marcadas con el simbolo de un lapiz). La 2 maneras en que podes readecuar los precios son: modificando tu tarifa horaria o haciendo uso del riel de ajuste."
    },
    {
      q: "¿Qué significa cuando una tarea aparece con candado 🔒?",
      a: "Indica que tu suscripción actual no habilita esa tarea. Podés ver dentro de que plan esta incluida accediendo en el listado completo."
    },
    // ... mantené tus preguntas actuales
  ];

  // --- Handlers ColaboraBot (sin cambios funcionales importantes) ---
  const enviarConsulta = () => {
    let texto = normalizarTexto(consulta || "");
    texto = reemplazarSinonimos(texto);
    const keywords = texto.split(/\s+/).filter((p) => p.length > 3);

    let resultados = [];
    keywords.forEach((kw) => {
      resultados = resultados.concat(fuse.search(kw).map((r) => r.item));
    });

    const unicos = Array.from(new Map(resultados.map((t) => [t.id, t])).values());
    if (unicos.length > 0) {
      setRespuesta({ mensaje: "Podrías considerar estas tareas:", tareas: unicos.slice(0, 8) });
    } else {
      setRespuesta({ mensaje: "No se encontraron coincidencias." });
    }
  };

  const limpiarConsulta = () => {
    setConsulta(""); setRespuesta(null); setSeleccionadas([]);
  };

  const toggleSeleccion = (id) => {
    setSeleccionadas((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const agregarSeleccionadas = () => {
    const tareas = respuesta?.tareas?.filter((t) => seleccionadas.includes(t.id));
    if (tareas && tareas.length > 0) {
      tareas.forEach((t) => agregarTarea && agregarTarea(t));
      limpiarConsulta();
      alert("Tareas agregadas a la calculadora ✅");
    }
  };

  // --- Mensajería: guardar en mensajesUsuarios ---
  const enviarMensaje = async (tipo) => {
    if (!usuario || !usuario.uid) {
      alert("Iniciá sesión para enviar mensajes. Solo usuarios registrados pueden enviar consultas.");
      return;
    }
    if (!mensajeText.trim()) {
      alert("Ingresá tu mensaje antes de enviar.");
      return;
    }

    setEnviando(true);
    try {
      const docRef = await addDoc(collection(db, "mensajesUsuarios"), {
        tipo, // "sugerencia" | "soporte"
        origen: origen || "asistente",
        usuarioId: usuario.uid,
        email: usuario.email || null,
        mensaje: mensajeText.trim(),
        fecha: serverTimestamp(),
        estado: "pendiente",
      });
      setConfirmacion({ tipo, id: docRef.id });
      setMensajeText("");
      // feedback amigable sin recargar
      setTimeout(() => setConfirmacion(null), 4000);
    } catch (err) {
      console.error("Error guardando mensaje:", err);
      alert("No se pudo enviar el mensaje. Revisá la consola.");
    } finally {
      setEnviando(false);
    }
  };

  // --- Global opener (opcion A) ---
  useEffect(() => {
    // Handler escucha CustomEvent
    const handler = (e) => {
      const detail = e?.detail || {};
      const modoInicial = detail.modo || "bot";
      const origenInicial = detail.origen || "externo";
      setModo(modoInicial);
      setOrigen(origenInicial);
      setAbierto(true);
    };

    // Exponer helper simple en window
    window.openAsistente = (modoInicial = "bot", origenInicial = "externo") => {
      const ev = new CustomEvent("abrir-asistente", { detail: { modo: modoInicial, origen: origenInicial } });
      document.dispatchEvent(ev);
    };

    document.addEventListener("abrir-asistente", handler);
    return () => {
      document.removeEventListener("abrir-asistente", handler);
      // cleanup window helper (opcional)
      // delete window.openAsistente;
    };
  }, []);

  // --- Small helpers UI ---
  const abrirEnModo = (m) => { setModo(m); setOrigen("asistente"); setAbierto(true); };

  // --- Render ---
  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => abrirEnModo("bot")}
        className="fixed bottom-6 right-6 bg-indigo-400 text-white rounded-full p-4 shadow-lg z-50 transition-transform duration-200 hover:scale-110"
        title="Abrir Asistente"
      >
        🤖
      </button>

      {/* Overlay + Panel */}
      <div className={`fixed inset-0 z-50 transition-opacity duration-200 ${abierto ? "visible opacity-100" : "invisible opacity-0"}`}>
        <div
          className="absolute inset-0 bg-black bg-opacity-40 dark:bg-opacity-60"
          onClick={() => setAbierto(false)}
        />
        <aside
          className={`absolute top-0 right-0 w-full sm:w-96 h-full 
          bg-white dark:bg-gray-900 
          shadow-2xl transform transition-transform duration-300 
          ${abierto ? "translate-x-0" : "translate-x-full"}`}
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-300 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Asistente interno</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">Origen: {origen}</span>
              <button onClick={() => setAbierto(false)} className="text-gray-600 dark:text-gray-300">✖</button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex text-sm">
            <button
              onClick={() => setModo("bot")}
              className={`flex-1 py-2 
                ${modo === "bot" ? "bg-gray-100 dark:bg-gray-700 font-semibold" : "bg-white dark:bg-gray-800"} 
                text-gray-800 dark:text-gray-200`}
            >
              🤖 ColaboraBot
            </button>

            <button
              onClick={() => setModo("sugerencia")}
              className={`flex-1 py-2 
                ${modo === "sugerencia" ? "bg-blue-50 dark:bg-blue-900 font-semibold" : "bg-white dark:bg-gray-800"}
                text-gray-800 dark:text-gray-200`}
            >
              💬 Opinión / Sugerencia
            </button>

            <button
              onClick={() => setModo("soporte")}
              className={`flex-1 py-2 
                ${modo === "soporte" ? "bg-red-50 dark:bg-red-900 font-semibold" : "bg-white dark:bg-gray-800"}
                text-gray-800 dark:text-gray-200`}
            >
              🆘 Soporte / Problemas
            </button>
          </div>

          {/* Content */}
          <div className="p-4 overflow-y-auto h-[calc(100%-112px)] space-y-4">
            
            {/* ColaboraBot */}
            {modo === "bot" && (
              <>
                <div className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-2 rounded">
                  🦻 El <b>ColaboraBot</b> sugiere tareas relacionadas según tu descripción.
                </div>

                <textarea
                  className="w-full p-2 border mb-2 rounded 
                  bg-gray-50 dark:bg-gray-800 
                  text-gray-800 dark:text-gray-200 
                  border-gray-300 dark:border-gray-600"
                  rows={3}
                  value={consulta}
                  onChange={(e) => setConsulta(e.target.value)}
                  placeholder="Describí el trabajo que vas a realizar..."
                />

                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded">Consultar</button>
                  <button className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded">Limpiar</button>
                </div>

                {respuesta && (
                  <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded">
                    <p className="font-medium text-gray-800 dark:text-gray-100">{respuesta.mensaje}</p>

                    {respuesta.tareas && (
                      <form onSubmit={(e) => { e.preventDefault(); agregarSeleccionadas(); }}>
                        <ul className="mt-2 text-sm space-y-1">
                          {respuesta.tareas.map((t) => {
                            const habilitado = t.nivel <= (usuario?.nivelMaximo || 1);
                            return (
                              <li key={t.id} className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  disabled={!habilitado}
                                  checked={seleccionadas.includes(t.id)}
                                  onChange={() => toggleSeleccion(t.id)}
                                />
                                <label className={!habilitado 
                                  ? "text-gray-400 dark:text-gray-600" 
                                  : "text-gray-800 dark:text-gray-200"}>
                                  {t.nombre} {!habilitado && "🔒"}
                                </label>
                              </li>
                            );
                          })}
                        </ul>
                        <button
                          type="submit"
                          className="mt-3 px-4 py-2 bg-green-600 text-white rounded disabled:bg-gray-400 dark:disabled:bg-gray-700"
                          disabled={seleccionadas.length === 0}
                        >
                          Agregar seleccionadas
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Sugerencia */}
            {modo === "sugerencia" && (
              <>
                {!usuario ? (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900 border border-gray-300 dark:border-gray-700 rounded text-sm text-gray-700 dark:text-gray-200">
                    Iniciá sesión para enviar una sugerencia. 📥
                  </div>
                ) : (
                  <>
                    <div className="text-sm text-gray-600 dark:text-gray-300 bg-blue-50 dark:bg-blue-900 border border-gray-300 dark:border-gray-700 p-2 rounded">
                      💬 Enviá una sugerencia u opinión. Te contactaremos por email si necesitamos más info.
                    </div>

                    <textarea
                      rows={4}
                      value={mensajeText}
                      onChange={(e) => setMensajeText(e.target.value)}
                      placeholder="Contanos qué mejorarías o qué te gustó (opcional)"
                      className="w-full p-2 border rounded 
                      bg-gray-50 dark:bg-gray-800 
                      text-gray-800 dark:text-gray-200 
                      border-gray-300 dark:border-gray-600"
                    />

                    <div className="flex gap-2">
                      <button
                        onClick={() => enviarMensaje("sugerencia")}
                        disabled={enviando}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400 dark:disabled:bg-gray-700"
                      >
                        {enviando ? "Enviando..." : "Enviar sugerencia"}
                      </button>
                      <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded">
                        Limpiar
                      </button>
                    </div>

                    {confirmacion && confirmacion.tipo === "sugerencia" && (
                      <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                        ✅ Sugerencia enviada (id: {confirmacion.id})
                      </p>
                    )}
                  </>
                )}
              </>
            )}

            {/* Soporte */}
            {modo === "soporte" && (
              <>
                {!usuario ? (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900 border border-gray-300 dark:border-gray-700 rounded text-sm text-gray-700 dark:text-gray-200">
                    Iniciá sesión para reportar un problema. 🆘
                  </div>
                ) : (
                  <>
                    <div className="text-sm text-gray-600 dark:text-gray-300 bg-red-50 dark:bg-red-900 border border-gray-300 dark:border-gray-700 p-2 rounded">
                      🆘 Reportá un problema, describí paso a paso lo que sucede.
                    </div>

                    <textarea
                      rows={5}
                      value={mensajeText}
                      onChange={(e) => setMensajeText(e.target.value)}
                      placeholder="Contanos cuál es tu inconveniente..."
                      className="w-full p-2 border rounded 
                      bg-gray-50 dark:bg-gray-800 
                      text-gray-800 dark:text-gray-200 
                      border-gray-300 dark:border-gray-600"
                    />

                    <div className="flex gap-2">
                      <button
                        onClick={() => enviarMensaje("soporte")}
                        disabled={enviando}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded disabled:bg-gray-400 dark:disabled:bg-gray-700"
                      >
                        {enviando ? "Enviando..." : "Enviar a soporte"}
                      </button>
                      <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded">
                        Limpiar
                      </button>
                    </div>

                    {confirmacion && confirmacion.tipo === "soporte" && (
                      <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                        ✅ Mensaje enviado a soporte (id: {confirmacion.id})
                      </p>
                    )}
                  </>
                )}
              </>
            )}

            {/* FAQ */}
            <div className="mt-2">
              <h4 className="text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200">❓ Preguntas frecuentes</h4>
              <ul className="space-y-2">
                {faqs.map((f, idx) => (
                  <li key={idx} className="border border-gray-300 dark:border-gray-700 rounded p-2 bg-white dark:bg-gray-800">
                    <button
                      className="w-full text-left font-medium text-blue-700 dark:text-blue-400"
                      onClick={() => setFaqAbierta(faqAbierta === idx ? null : idx)}
                    >
                      {f.q}
                    </button>
                    {faqAbierta === idx && (
                      <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{f.a}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="p-3 border-t border-gray-300 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
            ⚠️ Las sugerencias son orientativas para la carga de la calculadora.
            El usuario es responsable de las decisiones tomadas.
          </div>
        </aside>
      </div>
    </>
  );
}
