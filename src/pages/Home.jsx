// Home.jsx adaptado para electricistas con animación progresiva y fondo en Hero
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export function Home() {
  return (
    <div className="space-y-20">

      {/* Hero con fondo para profesionales */}
      <section
        className="bg-cover bg-center text-white py-28 px-6 relative"
        style={{ backgroundImage: "url('/fondo-electricistas.jpg')" }}
      >
        <div className="relative max-w-4xl mx-auto text-center z-10">
          {/* Fondo oscuro solo en el contenido */}
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-xl -z-10" />

          <div className="relative p-8 md:p-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Recursos y Herramientas para Electricistas
            </h1>
            <p className="text-lg mb-6">
              Todo lo que necesitás para trabajar con más claridad, criterio técnico y respaldo profesional.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/calculadora"
                className="bg-yellow-500 hover:bg-yellow-400 px-5 py-3 rounded-xl text-white font-semibold"
              >
                Calculadora
              </Link>
              <Link
                to="/reglamentacion"
                className="bg-white text-blue-900 px-5 py-3 rounded-xl font-semibold hover:bg-gray-100"
              >
                Reglamentación
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Secciones progresivas con scroll */}
      <section className="max-w-5xl mx-auto px-4 space-y-16">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white p-6 rounded-xl shadow"
        >
          <h2 className="text-2xl font-bold text-blue-800 mb-2">📰 Noticias del Sector</h2>
          <p className="text-gray-700 mb-3">
            Enterate de cambios normativos, nuevas tecnologías y otros eventos que afectan nuestro rubro.
          </p>
          <Link to="/noticias" className="text-blue-600 font-medium hover:underline">Ver</Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white p-6 rounded-xl shadow"
        >
          <h2 className="text-2xl font-bold text-blue-800 mb-2">🧮 Calculadora de Presupuestos</h2>
          <p className="text-gray-700 mb-3">
            Herramienta creada para ayudarte a cotizar tareas eléctricas según el valor de tu tiempo. Alli podrás obtener un valor estimado y ajustarlo.
          </p>
          <Link to="/calculadora" className="text-blue-600 font-medium hover:underline">Cotizar</Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white p-6 rounded-xl shadow"
        >
          <h2 className="text-2xl font-bold text-blue-800 mb-2">📚 Índice de Reglamentaciones</h2>
          <p className="text-gray-700 mb-3">
            Encuentra fácilmente la reglamentacion AEA que buscas. Solo debes escribir el tema dentro del buscador integrado y podrás ubicarla.
          </p>
          <Link to="/reglamentacion" className="text-blue-600 font-medium hover:underline">Buscar</Link>
        </motion.div>
      </section>
    </div>
  );
}
