// Home.jsx adaptado para electricistas con animación progresiva y fondo en Hero
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaCalculator, FaBook, FaNewspaper } from "react-icons/fa";


export function Home() {
  return (
    <div className="space-y-0">

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
      <section className="max-w-6xl mx-auto px-4 py-16">
  <h2 className="text-3xl font-bold text-center text-blue-800 mb-12">
    Herramientas destacadas
  </h2>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {/* Tarjeta Noticias */}
    <Link to="/noticias" className="bg-white shadow hover:shadow-md transition rounded-xl p-6 flex flex-col items-center text-center hover:bg-blue-50">
      <FaNewspaper className="text-4xl text-blue-600 mb-4" />
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
        Cotizá tus trabajos con criterio técnico, claridad y control total.
      </p>
    </Link>

    {/* Tarjeta Reglamentación */}
    <Link to="/reglamentacion" className="bg-white shadow hover:shadow-md transition rounded-xl p-6 flex flex-col items-center text-center hover:bg-blue-50">
      <FaBook className="text-4xl text-yellow-600 mb-4" />
      <h3 className="text-xl font-semibold mb-2">Reglamentación</h3>
      <p className="text-gray-600">
        Accedé a documentos técnicos y normas vigentes para trabajar respaldado.
      </p>
    </Link>
  </div>
</section>
    </div>
  );
}
