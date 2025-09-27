import { useState } from "react";
import Fuse from "fuse.js";
import { tareasPredefinidas } from "../utils/tareas";
import { normalizarTexto, reemplazarSinonimos } from "../utils/normalizarTexto";
import { useAuth } from "../context/AuthContext";
import { getFirestore, collection, addDoc } from "firebase/firestore";

export default function Asistente({ agregarTarea }) {
  const { usuario } = useAuth();
  const db = getFirestore();

  const [consulta, setConsulta] = useState("");
  const [respuesta, setRespuesta] = useState(null);
  const [abierto, setAbierto] = useState(false);
  const [seleccionadas, setSeleccionadas] = useState([]);
  const [modo, setModo] = useState("sugerencias");
  const [feedback, setFeedback] = useState("");
  const [sugerencia, setSugerencia] = useState("");
  const [faqAbierta, setFaqAbierta] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const faqs = [
    {
      q: "¿Cómo se usa la calculadora?",
      a: "En el buscador elegí las tareas que correspondan a tu trabajo, y la calculadora irá sumando sus valores para mostrarte un presupuesto estimado."
    },
    {
      q: "¿Qué hago si no encuentro una tarea?",
      a: "Podés describir tu caso en el asistente para recibir sugerencias, o usar la opción 'añadir personalizada' ubicada dentro del botón 'ver listado'."
    },
    {
      q: "¿Los valores son definitivos?",
      a: "No. Los valores son de referencia para ayudarte a cotizar. El precio final lo definís vos según tu criterio y condiciones del trabajo."
    },
    {
      q: "¿Qué diferencia hay entre el buscador y el asistente?",
      a: "El buscador sirve para localizar una tarea específica. El asistente es mas flexible sugiriendo opciones relacionadas."
    },
    {
      q: "¿Puedo modificar los valores de las tareas?",
      a: "No de manera individual, salvo algunas excepciones. La 2 maneras en que podes readecuar los precios son: reajustando tu tarifa horaria o haciendo uso del riel de ajuste."
    },
    {
      q: "¿Qué significa cuando una tarea aparece con candado 🔒?",
      a: "Indica que tu suscripción actual no habilita esa tarea. Podés ver dentro de que plan esta incluida accediendo en el listado completo."
    },
    {
      q: "¿Qué pasa con los reclamos o sugerencias que envío?",
      a: "El equipo los revisa y, si corresponde, se implementan mejoras en futuras actualizaciones. En el caso de los reclamos buscará solucionarlo lo antes posible."
    }
  ];

  const fuse = new Fuse(tareasPredefinidas, {
    keys: ["nombre"],
    threshold: 0.35
  });

  const enviarConsulta = () => {
    let texto = normalizarTexto(consulta);
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
      tareas.forEach((t) => agregarTarea(t));
      limpiarConsulta();
      alert("Tareas agregadas a la calculadora ✅");
    }
  };

  const enviarFeedback = async (e) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    try {
      setEnviando(true);
      await addDoc(collection(db, "soporte"), {
        usuarioId: usuario?.uid || "anonimo",
        email: usuario?.email || "desconocido",
        mensaje: feedback,
        fecha: new Date()
      });
      alert("Tu consulta fue enviada al soporte ✅");
      setFeedback("");
    } catch (err) {
      console.error("Error enviando soporte:", err);
      alert("Hubo un error al enviar el mensaje.");
    } finally {
      setEnviando(false);
    }
  };

  const enviarSugerencia = async (e) => {
    e.preventDefault();
    if (!sugerencia.trim()) return;
    try {
      setEnviando(true);
      await addDoc(collection(db, "sugerencias"), {
        usuarioId: usuario?.uid || "anonimo",
        email: usuario?.email || "desconocido",
        sugerencia,
        fecha: new Date()
      });
      alert("¡Gracias por tu sugerencia!");
      setSugerencia("");
    } catch (err) {
      console.error("Error enviando sugerencia:", err);
      alert("Hubo un error al enviar la sugerencia.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setAbierto(true)}
        className="fixed bottom-6 right-6 bg-indigo-500 text-white rounded-full p-4 shadow-lg z-50 
                   transition-transform duration-200 hover:scale-110"
      >
        🤖
      </button>

      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-40 z-50 transition-opacity duration-300 ${
          abierto ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        {/* Panel lateral */}
        <div
          className={`absolute top-0 right-0 w-96 h-full bg-white shadow-xl flex flex-col transform transition-transform duration-300 ${
            abierto ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-lg font-semibold">Asistente interno</h2>
            <button onClick={() => setAbierto(false)}>✖</button>
          </div>

          {/* Tabs */}
          <div className="flex border-b">
            <button
              className={`flex-1 p-2 ${modo === "sugerencias" ? "bg-blue-100 font-semibold" : "bg-gray-100"}`}
              onClick={() => setModo("sugerencias")}
            >
              🤖 ColaboraBot
            </button>
            <button
              className={`flex-1 p-2 ${modo === "soporte" ? "bg-blue-100 font-semibold" : "bg-gray-100"}`}
              onClick={() => setModo("soporte")}
            >
              🆘 Soporte
            </button>
          </div>

          {/* Contenido */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {modo === "sugerencias" && (
              <>
                <div className="text-sm text-gray-600 bg-gray-50 border p-2 rounded">
                  🦻 El <b>asistente</b> te mostrará opciones que podrian estar
                  relacionadas para armar tu presupuesto. Cabe aclarar que no cuenta con IA.
                </div>

                <textarea
                  className="w-full p-2 border rounded mb-2"
                  rows={3}
                  value={consulta}
                  onChange={(e) => setConsulta(e.target.value)}
                  placeholder="Describí el trabajo que vas a realizar..."
                />
                <div className="flex gap-2">
                  <button
                    onClick={enviarConsulta}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded"
                  >
                    Consultar
                  </button>
                  <button
                    onClick={limpiarConsulta}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded"
                  >
                    Limpiar
                  </button>
                </div>

                {respuesta && (
                  <div className="mt-2 p-2 bg-gray-50 border rounded">
                    <p className="font-medium">{respuesta.mensaje}</p>
                    {respuesta.tareas && (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          agregarSeleccionadas();
                        }}
                      >
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
                                <label className={!habilitado ? "text-gray-400" : ""}>
                                  {t.nombre} {!habilitado && "🔒"}
                                </label>
                              </li>
                            );
                          })}
                        </ul>
                        <button
                          type="submit"
                          className="mt-3 px-4 py-2 bg-green-600 text-white rounded disabled:bg-gray-400"
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

            {modo === "soporte" && (
              <>
                {/* FAQ */}
                <div>
                  <h3 className="text-md font-semibold mb-2">❓ Preguntas frecuentes</h3>
                  <ul className="space-y-2">
                    {faqs.map((item, idx) => (
                      <li key={idx} className="border rounded p-2">
                        <button
                          type="button"
                          className="w-full text-left font-medium text-blue-700"
                          onClick={() => setFaqAbierta(faqAbierta === idx ? null : idx)}
                        >
                          {item.q}
                        </button>
                        {faqAbierta === idx && (
                          <p className="mt-1 text-sm text-gray-700">{item.a}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Dejar sugerencia */}
                <div>
                  <h3 className="text-md font-semibold mb-2">💡 Consulta o sugerencia</h3>
                  <form onSubmit={enviarSugerencia} className="space-y-2">
                    <textarea
                      className="w-full p-2 border rounded"
                      rows={2}
                      value={sugerencia}
                      onChange={(e) => setSugerencia(e.target.value)}
                      placeholder="¿Tenes alguna duda?¿Queres comentarnos que mejorarías en esta herramienta?"
                    />
                    <button
                      type="submit"
                      disabled={enviando}
                      className="px-4 py-2 bg-indigo-600 text-white rounded disabled:bg-gray-400"
                    >
                      {enviando ? "Enviando..." : "Enviar sugerencia"}
                    </button>
                  </form>
                </div>

                {/* Reportar problema */}
                <div>
                  <h3 className="text-md font-semibold mb-2">🆘 Reportar un problema</h3>
                  <form onSubmit={enviarFeedback} className="space-y-2">
                    <textarea
                      className="w-full p-2 border rounded"
                      rows={3}
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Contanos cual es tu inconveniente..."
                    />
                    <button
                      type="submit"
                      disabled={enviando}
                      className="px-4 py-2 bg-red-600 text-white rounded disabled:bg-gray-400"
                    >
                      {enviando ? "Enviando..." : "Enviar a soporte"}
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>

          {/* Disclaimer */}
          <div className="p-3 border-t text-xs text-gray-500">
            ⚠️ Las sugerencias son orientativas para la carga de la calculadora.
            El usuario es responsable de las decisiones tomadas.
          </div>
        </div>
      </div>
    </>
  );
}
