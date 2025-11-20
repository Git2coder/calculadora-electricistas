/* ============================================
   BLOQUE: Comparativa Premium Semi-Realista
   Estilo 2: Gráficos tipo tablero, sombras profundas
   -----------------------------------------------
   Pegar en Home.jsx
   Requiere: framer-motion
   ============================================ */

import { motion } from "framer-motion";

export default function EvolucionPremium() {
  return (
    <section className="relative pt-14 pb-8 bg-gradient-to-b from-white to-blue-50 overflow-hidden">

      <div className="max-w-6xl mx-auto px-6">

        {/* ------- TITULO ------- */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl font-extrabold text-slate-900 leading-tight">
            No reemplaza tu criterio profesional<br />
            <span className="text-blue-700"> lo potencia.</span>
          </h2>
        
        </motion.div>

        {/* ========================================
           BLOQUE 1: COMPARATIVA VISUAL (Barras 3D)
           ======================================== */}
        <div className="grid lg:grid-cols-2 gap-16 mb-12">

          {/* Gráfico visual */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-white rounded-3xl shadow-xl p-10 border"
          >
            <h3 className="text-2xl font-bold text-slate-900 mb-8">
              Precisión estimada por método
            </h3>

            {/* ---- BARRAS 3D ---- */}
            <div className="space-y-12">
              
              {/* Método tradicional */}
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-2">
                  Método tradicional — 65%
                </p>

                <div className="relative h-10 rounded-xl bg-gray-200 shadow-inner">
                  {/* barra 3D */}
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "60%" }}
                    transition={{ duration: 1 }}
                    className="h-full rounded-xl bg-gradient-to-r 
                    from-gray-600 to-gray-400 shadow-[0_4px_10px_rgba(128,128,128,0.4)] 
                    border border-gray-300"
                  />
                </div>
              </div>

              {/* Presupuesto+ */}
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-2">
                  Presupuesto+ — 96%
                </p>

                <div className="relative h-10 rounded-xl bg-gray-200 shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "96%" }}
                    transition={{ duration: 1.2 }}
                    className="h-full rounded-xl bg-gradient-to-r 
                    from-blue-600 via-blue-400 to-green-400 shadow-[0_4px_12px_rgba(0,112,255,0.45)] 
                    border border-blue-300"
                  />
                </div>
              </div>

            </div>
          </motion.div>

          {/* DERECHA — BENEFICIOS RESUMIDOS */}
          <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="flex flex-col justify-center"
          >
              <h3 className="text-3xl font-bold text-slate-900 leading-snug mb-6">
              La diferencia se nota en los resultados:
              </h3>

              <ul className="space-y-4 text-lg text-slate-700">
              <li>✔ Más consistencia entre presupuesto y realidad</li>
              <li>✔ Menos pérdidas en trabajos pequeños</li>
              <li>✔ Más competitividad sin bajar tus precios</li>
              <li>✔ Respuestas rápidas que generan confianza</li>
              <li>✔ Una base sólida para crecer con tu marca personal</li>
              </ul>
          </motion.div>
        </div>

      </div>
    </section>
  );
}

/* ============================================
   Componente Gauge semi-realista
   ============================================ */
function Gauge({ value, label, color }) {
  const angle = (value / 100) * 180;

  return (
    <div className="relative w-40 h-24">
      <svg viewBox="0 0 100 50" className="w-full">
        <defs>
          <linearGradient id="gaugeGrad" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#e5e7eb" />
            <stop offset="100%" stopColor="#f3f4f6" />
          </linearGradient>
        </defs>

        {/* semicirculo base */}
        <path
          d="M10 50 A40 40 0 0 1 90 50"
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth="10"
        />

        {/* progreso */}
        <motion.path
          d="M10 50 A40 40 0 0 1 90 50"
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: value / 100 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        />
      </svg>

      {/* Valor */}
      <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold" style={{ color }}>
        {label}
      </div>
    </div>
  );
}
