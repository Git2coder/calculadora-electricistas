import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Ayuda() {
  const [abierto, setAbierto] = useState(null);

  const faqs = [
    
    {
      pregunta: "¿Cómo accedo a la calculadora?",
      respuesta: "Debés registrarte o iniciar sesión con tu cuenta. Una vez dentro, podrás usar la calculadora según tu tipo de acceso (gratuito o suscripción activa).",
    },
    {
      pregunta: "¿Puedo usar la herramienta gratis?",
      respuesta:
        "Sí. Dependiendo de la etapa del proyecto, tendrás un periodo gratuito. Si tu prueba finaliza, podrás suscribirte para continuar usándola.",
    },
    {
      pregunta: "¿Por qué me dice que mi prueba terminó?",
      respuesta: "Cada usuario tiene un período de prueba determinado según la etapa del proyecto. Si tu cuenta superó ese plazo, podrás seguir usando la plataforma al activar una suscripción.",
    },
    
    {
      pregunta: "¿Qué son las encuestas o votaciones?",
      respuesta: "Son pequeñas consultas que nos ayudan a mejorar la herramienta. Cada usuario puede participar una sola vez por campaña activa.",
    },
    {
      pregunta: "¿Qué pasa con mis datos personales?",
      respuesta: "Tus datos se usan únicamente para gestionar tu acceso y personalizar tu experiencia.",
    },
    {
      pregunta: "¿Cómo contacto soporte?",
      respuesta: "Podés enviar un mensaje desde el Asistente (ícono de chat) para que nos llegue tu mensaje y ponernos en contacto.",
    },

    {
      pregunta: "¿Qué son las condiciones de globales?",
      respuesta: "Son factores que ajustan el valor del presupuesto aplicandose sobre el conjunto de tareas seleccionadas. Permiten ajustar los precios al contexto real de la obra considerando las dificultades de instalación: altura, dificil acceso, etc."
    },
    {
      pregunta: "¿Qué diferencia hay entre instalación y reemplazo?",
      respuesta: "La instalación calcula la tarea como nueva y desde cero. Reemplazo considera solo el cambio de componentes existentes."
    },
    {
      pregunta: "¿Cómo puedo exportar el presupuesto?",
      respuesta: "Desde la Calculadora, hacé clic en 'Descargar PDF' para generar un documento en formato PDF listo para compartir o imprimir."
    },
    
    {
      pregunta: "¿Por qué no puedo enviar mi voto en la encuesta?",
      respuesta:
        "Cada usuario puede participar una sola vez por campaña. Cuando haya una nueva encuesta disponible, recibirás un aviso.",
    },
    
  ];

  const pasos = [
    "Accedé a la calculadora desde el menú principal.",
    "Establece los valores de tarifa horaria y visita.",
    "Busca y selecciona las tareas que vas a realizar",
    "Determiná: cantidades, valores y ajustá las condiciones de trabajo, según corresponda.",
    "Descargá tu presupuesto en PDF para compartirlo o imprimirlo y ¡LISTO!",
  ];

  return (
    <section className="max-w-5xl mx-auto px-6 py-10">
      <h2 className="text-3xl font-bold text-blue-800 mb-8 text-center">
        ❓ Centro de ayuda y soporte
      </h2>

      {/* Bloque de FAQ */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-10 border border-gray-200">
        <h3 className="text-xl font-semibold text-blue-700 mb-4">
          📘 Preguntas frecuentes
        </h3>
        <ul className="space-y-3">
          {faqs.map((faq, i) => (
            <li key={i} className="border-b border-gray-200 pb-3">
              <button
                onClick={() => setAbierto(abierto === i ? null : i)}
                className="flex justify-between items-center w-full text-left text-gray-800 font-medium hover:text-blue-700 transition"
              >
                <span>{faq.pregunta}</span>
                <span>{abierto === i ? "▲" : "▼"}</span>
              </button>

              <AnimatePresence>
                {abierto === i && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="text-gray-600 mt-2 text-sm leading-relaxed"
                  >
                    {faq.respuesta}
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          ))}
        </ul>
      </div>

      {/* Bloque de Guía rápida */}
      <div className="bg-blue-50 rounded-2xl shadow-inner p-6 mb-10 border border-blue-200">
        <h3 className="text-xl font-semibold text-blue-800 mb-4">
          ⚡ Guía rápida de uso
        </h3>
        <ol className="space-y-3 text-gray-700 list-decimal list-inside text-sm">
          {pasos.map((paso, i) => (
            <li key={i}>{paso}</li>
          ))}
        </ol>
        <p className="mt-4 text-sm text-gray-600">
          Tip: Si vas a seleccionar las condiciones de trabajo sobre una tarea de manera individual no lo vuelvas aplicar en el global, ya que podrias estar sobredimensionando el presupuesto final.
        </p>
      </div>

      {/* Bloque de contacto / asistente */}
      <div className="bg-white rounded-2xl shadow-md p-6 text-center border border-gray-200">
        <h3 className="text-xl font-semibold text-blue-700 mb-2">
          💬 ¿Necesitás más ayuda?
        </h3>
        <p className="text-gray-600 mb-4 text-sm">
          Si algo no funciona o querés sugerir una mejora, podés contactarnos directamente
          desde el asistente integrado.
        </p>
        <button
          onClick={() => window.openAsistente("ayuda", "pagina-ayuda")}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-500 transition"
        >
          Abrir asistente
        </button>
      </div>
    </section>
  );
}
