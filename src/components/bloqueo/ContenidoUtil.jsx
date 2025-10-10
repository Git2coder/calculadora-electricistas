import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ContenidoUtil() {
  const [activo, setActivo] = useState(null);

  const recursos = [
    {
      titulo: "Tips de seguridad eléctrica",
      contenido: (
        <ul className="list-disc pl-5 text-gray-700 text-sm space-y-1">
          <li>Verificá la correcta conexión a tierra.</li>
          <li>Usá guantes y herramientas aisladas.</li>
          <li>Desenergizá antes de intervenir un circuito.</li>
          <li>Comprobá el funcionamiento del diferencial.</li>
        </ul>
      ),
    },
    {
      titulo: "5 Regla de oro",
      contenido: (
        <ol className="list-disc pl-5 text-gray-700 text-sm space-y-1">
          <li>Desconexión de fuentes de alimentación.</li>
          <li>Bloqueo para evitar reconexiones.</li>
          <li>Verificar la ausencia de tensión.</li>
          <li>Puesta a tierra y cortocircuito.</li>
          <li>Protección y señalización de la zona de trabajo.</li>
        </ol>        
      ),
    },
    {
      titulo: "Envejecimiento y obsolencia",
      contenido: (
        <p className="text-gray-700 text-sm leading-relaxed">
          La instalación envejece, y cuando se supera su vida útil se hace obsoleta, pudiendo ser peligrosa. Aparecen corrientes de fuga por la perdida de aislacion, sobretemperaturas por bornes flojos y contactos gastados. Solo la correcta intervencion y buen asesoramiento de un profesional capacitado permitirá recuperar la instalación.
        </p>
      ),
    },
  ];

  return (
    <div className="space-y-4 text-left">
      {recursos.map((r, i) => (
        <div key={i} className="bg-yellow-50 border border-yellow-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setActivo(activo === i ? null : i)}
            className="w-full text-left px-4 py-3 font-semibold text-gray-800 flex justify-between items-center hover:bg-yellow-100 transition"
          >
            {r.titulo}
            <span className="text-yellow-600 text-xl">{activo === i ? "−" : "+"}</span>
          </button>

          <AnimatePresence initial={false}>
            {activo === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="px-4 pb-3"
              >
                {r.contenido}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}

      <p className="text-sm text-gray-500 mt-4 italic text-center">
        "El aprendizaje te hace ser siempre joven." ¡Gracias por tu paciencia y buena energía!
      </p>
    </div>
  );
}
