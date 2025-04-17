// Home.jsx adaptado para electricistas con animación progresiva y fondo en Hero
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaCalculator, FaBook, FaNewspaper } from "react-icons/fa";
import { FaUserCircle } from "react-icons/fa";


export function Home() {
  return (
    <div className="space-y-0">

      {/* Hero con fondo para profesionales */}
      <section
        className="bg-cover bg-center text-white py-28 px-6 relative"
        style={{ backgroundImage: "url('/fondo-electricistas.webp')" }}
      >
        <div className="relative max-w-4xl mx-auto text-center z-10">
          {/* Fondo oscuro solo en el contenido */}
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-xl -z-10" />

          <div className="relative p-8 md:p-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              La calculadora de presupuestos
            </h1>
            <p className="text-lg mb-6">
              Una herramienta esencial si queres ganar tiempo y presupuestar con criterio.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/calculadora"
                className="bg-green-500 hover:bg-green-400 px-5 py-3 rounded-xl text-white font-semibold"
              >
                ¡Empeza ahora!
              </Link>
              
            </div>
          </div>
        </div>
      </section>

      {/* Secciones progresivas con scroll */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-blue-800 mb-12">
          Herramientas destacadas
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tarjeta Noticias */}
          <Link to="/noticias" className="bg-white shadow hover:shadow-md transition rounded-xl p-6 flex flex-col items-center text-center hover:bg-blue-50">
            <FaNewspaper className="text-4xl text-orange-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Noticias</h3>
            <p className="text-gray-600">
              Actualizate con las novedades del rubro eléctrico y tendencias del sector.
            </p>
          </Link>

          {/* Tarjeta Calculadora */}
          <Link to="/calculadora" className="bg-white shadow hover:shadow-md transition rounded-xl p-6 flex flex-col items-center text-center hover:bg-blue-50">
            <FaCalculator className="text-4xl text-green-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Calculadora</h3>
            <p className="text-gray-600">
              Cotizá tus trabajos con criterio, claridad y control total.
            </p>
          </Link>

          {/* Tarjeta Reglamentación */}
          <Link to="/reglamentacion" className="bg-white shadow hover:shadow-md transition rounded-xl p-6 flex flex-col items-center text-center hover:bg-blue-50">
            <FaBook className="text-4xl text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Reglamentación</h3>
            <p className="text-gray-600">
              Buscala por tema y ubica aquella que podias estar necesitando.
            </p>
          </Link>
        </div>        
      </section>
      
            {/* TESTIMONIOS HORIZONTALES */}
      <section className="bg-white py-16 px-3">
        <h2 className="text-2xl font-bold text-center text-blue-800 mb-12">
          Lo que dicen otros profesionales
        </h2>

        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-6">
          {/* Testimonio 1 */}
          <motion.div
            className="bg-blue-50 p-6 rounded-xl shadow text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            viewport={{ once: true }}
>            <FaUserCircle className="text-4xl text-blue-500 mx-auto mb-2" />
            <p className="text-gray-700 italic text-sm">
              "Me ayudó a orientarme para cotizar un trabajo."
            </p>
            <p className="mt-2 text-sm font-medium text-gray-600">Diego</p>
            <p className="text-xs text-gray-500"></p>
            </motion.div>

          {/* Testimonio 2 */}
          <motion.div
            className="bg-blue-50 p-6 rounded-xl shadow text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7 }}
            viewport={{ once: true }}
          >
            <FaUserCircle className="text-4xl text-orange-400 mx-auto mb-2" />
            <p className="text-gray-700 italic text-sm">
              "Muy útil para los que recién empiezan."
            </p>
            <p className="mt-2 text-sm font-medium text-gray-600">Jorge</p>
            <p className="text-xs text-gray-500"></p>
          </motion.div>

          {/* Testimonio 3 */}
          <motion.div
            className="bg-blue-50 p-6 rounded-xl shadow text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            viewport={{ once: true }}
>
            <FaUserCircle className="text-4xl text-green-500 mx-auto mb-2" />
            <p className="text-gray-700 italic text-sm">
              "Me parecio una pagina interesante."
            </p>
            <p className="mt-2 text-sm font-medium text-gray-600">Sebastian</p>
            <p className="text-xs text-gray-500"></p>
            </motion.div>

                    
        </div>
      </section>

     </div>
    
  );
}
