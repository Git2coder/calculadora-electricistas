import { Link } from "react-router-dom";

export function Acerca() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-10 items-center">
  <div>
    <h2 className="text-3xl font-bold text-blue-800 mb-4">"¿Cuánto cobro por este trabajo?"</h2>
    <div className="text-gray-700 leading-relaxed space-y-5">

  <p><strong className="text-blue-800"></strong>  
  Es una de las preguntas más comunes entre colegas.</p>

  <p>Esta calculadora busca adaptarse a vos ofreciendote un método alternativo para ayudarte a responderla de forma <strong>rápida y con criterio.</strong></p>

  <p><strong>¿Por qué es diferente?</strong></p>
  <ul className="list-disc pl-6 space-y-2">
    <li>📌 Porque considera que <strong>el valor de una tarea no es igual para todos en todas partes</strong>.</li>
    <li>🕒 Porque te permite definir tu <strong>tarifa horaria</strong> o calcularla en base a tus <strong>gastos fijos y variables</strong>.</li>
    <li>🧮 Porque podés <strong> añadir tareas particulares</strong>, poner cuántas veces las hacés y cuánto tiempo te lleva cada una.</li>
    <li>🎯 Porque te da un estimado final que <strong>podés ajustar por riesgo, dificultad, habilidad o zona de trabajo</strong>.</li>
  </ul>

  <p className="text-green-700 font-semibold text-lg">
    ✅ Ideal para quienes estan empezando puedan presupuestar y obtener un valor de forma clara.
  </p>

</div>

  </div>
  <div>
    <img src="/finanzas.jpg" alt="Vista previa de la calculadora" className="rounded-xl shadow" />
  </div>

      <Link
        to="/Calculadora"
        className="inline-block mt-4 bg-blue-700 text-white px-6 py-3 rounded-xl shadow hover:bg-blue-600 transition"
      >
        Ir a la Calculadora
      </Link>
    </section>
  );
}
