// Home.jsx adaptado para electricistas con animación progresiva y fondo en Hero
import { useEffect, useState } from "react";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaCalculator, FaBook, FaNewspaper } from "react-icons/fa";
import { FaUserCircle, FaClock, FaClipboardCheck, FaChartLine, FaBolt } from "react-icons/fa";
import { BotonSuscripcion } from "../components/BotonSuscripcion";
import EscalaRemuneracion from "../components/EscalaRemuneracion";


export function Home() {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const db = getFirestore();
        const ref = doc(db, "config", "app");
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setConfig(snap.data());
        }
      } catch (e) {
        console.error("Error cargando config:", e);
      }
    };
    fetchConfig();
  }, []);
  if (!config) {
    return <p className="text-center mt-10 text-gray-600">Cargando configuración...</p>;
  }

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
                className="bg-green-600 hover:bg-green-500 px-5 py-3 rounded-xl text-white font-semibold"
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
            <h3 className="text-xl font-semibold mb-2">Indice</h3>
            <p className="text-gray-600">
              Los reglamentos son muchos, fijate y ubica el que podias estar necesitando.
            </p>
          </Link>
        </div>        
      </section>
      
      <section className="bg-white py-16 space-y-24">
        <div className="space-y-8">
                  {/* Bloque 1 */}
                  <motion.div
            className="relative grid md:grid-cols-2 items-center max-w-6xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="hidden md:block">
              <div
                className="bg-cover bg-center clip-diagonal-left"
                style={{ backgroundImage: "url('/beneficio-tiempo.webp')" }}
              />
            </div>
            <div className="p-8 md:pl-16">
              <h3 className="text-3xl font-bold text-green-700 mb-4">⏱️ Ganá tiempo</h3>
              <p className="text-gray-700 text-lg">
                Con esta herramienta en minutos lo tenés resuelto. Más tiempo para trabajar y menos para calcular.
              </p>
            </div>
          </motion.div>


                  {/* Bloque 2 (invertido) */}
                  <motion.div
            className="relative grid md:grid-cols-2 items-center max-w-6xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="p-8 md:pr-16 order-2 md:order-1">
              <h3 className="text-3xl font-bold text-blue-700 mb-4">💸 Aumentá tus ingresos</h3>
              <p className="text-gray-700 text-lg">
                Cotizar con criterio es ganar dinero con cada proyecto. No más precios al azar, ahora sabés lo que vale tu tiempo.
              </p>
            </div>
            <div className="hidden md:block order-1 md:order-2">
              <div
                className="bg-cover bg-center clip-diagonal-right"
                style={{ backgroundImage: "url('/beneficio-ganancia.webp')" }}
              />
            </div>
          </motion.div>

                  {/* Bloque 3 */}
                  <motion.div
            className="relative grid md:grid-cols-2 items-center max-w-6xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <div className="hidden md:block">
              <div
                className="bg-cover clip-diagonal-left"
                style={{
                  backgroundImage: "url('/beneficio-clientes.webp')",
                  backgroundPosition: "top"
                }}
              />
            </div>
            <div className="p-8 md:pl-16">
              <h3 className="text-3xl font-bold text-yellow-500 mb-4">📈 Más oportunidades</h3>
              <p className="text-gray-700 text-lg">
                Respondé más rápido a nuevos pedidos. Cotizando más y mejor vas a lograr cerrar más trabajos.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

            {/* TESTIMONIOS HORIZONTALES */}
      <section className="bg-gray py-8 px-3">
        <h2 className="text-2xl font-bold text-center text-blue-800 mb-12">
          Lo que dicen los profesionales
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
              "...."
            </p>
            <p className="mt-2 text-sm font-medium text-gray-600">N1</p>
            <p className="text-xs text-gray-500"></p>
            </motion.div>

          {/* Testimonio 2 */}
          <motion.div
            className="bg-blue-50 p-6 rounded-xl shadow text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            viewport={{ once: true }}
          >
            <FaUserCircle className="text-4xl text-orange-400 mx-auto mb-2" />
            <p className="text-gray-700 italic text-sm">
              "...."
            </p>
            <p className="mt-2 text-sm font-medium text-gray-600">N2</p>
            <p className="text-xs text-gray-500"></p>
          </motion.div>

          {/* Testimonio 3 */}
          <motion.div
            className="bg-blue-50 p-6 rounded-xl shadow text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7 }}
            viewport={{ once: true }}
>
            <FaUserCircle className="text-4xl text-green-500 mx-auto mb-2" />
            <p className="text-gray-700 italic text-sm">
              "...."
            </p>
            <p className="mt-2 text-sm font-medium text-gray-600">N3</p>
            <p className="text-xs text-gray-500"></p>
            </motion.div>                   
        </div>
      </section>

      <section className="bg-gray-100 py-8 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-blue-800 mb-8">
              Escala orientativa de remuneración
            </h2>
            <motion.div           
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
            >
            <EscalaRemuneracion />
             </motion.div>
          </div>       
        </section>
        
   
      {config?.suscripcionHabilitada ? (
        // ✅ Suscripción habilitada → venta normal
        <section className="bg-white py-6 px-4">
          <div className="max-w-4xl mx-auto text-center bg-blue-50 p-8 rounded-2xl shadow-lg border border-blue-200 relative overflow-hidden">
            <div className="absolute -top-4 -right-4 rotate-12 bg-green-500 text-white font-bold px-6 py-1 rounded-bl-lg shadow-md">
              💎 Suscripción 
            </div>
            <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md animate-pulse">
              🔥 50% OFF oferta de lanzamiento
            </div>

            <h2 className="text-3xl font-bold text-blue-800 mb-4">Suscripción Profesional</h2>
            <p className="text-lg text-gray-700 mb-6">Accedé al máximo potencial de tu trabajo</p>

            <ul className="text-left max-w-md mx-auto text-gray-700 mb-6 space-y-4">
              <li className="flex items-start gap-3">
                <FaClock className="text-green-600 mt-1" />
                <span>Ahorrás <strong>tiempo valioso</strong> al presupuestar</span>
              </li>
              <li className="flex items-start gap-3">
                <FaClipboardCheck className="text-green-600 mt-1" />
                <span>Cotizás con <strong>criterio técnico y económico</strong></span>
              </li>
              <li className="flex items-start gap-3">
                <FaChartLine className="text-green-600 mt-1" />
                <span>Aumentás tus <strong>posibilidades de cerrar trabajos</strong></span>
              </li>
              <li className="flex items-start gap-3">
                <FaBolt className="text-green-600 mt-1" />
                <span>Sistema especializado <strong>100% en electricistas</strong></span>
              </li>
            </ul>

            <div className="text-4xl font-extrabold text-green-600 mb-4">
              ${config?.suscripcionPrecio?.toLocaleString("es-AR")} 
              <span className="text-lg text-gray-600 font-normal">/mes</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              <strong>1 presupuesto te llevaba ≈30 min</strong>. Podés hacer 5 veces o más en el mismo tiempo.
            </p>

            <div className="flex justify-center items-center mt-6">
              <BotonSuscripcion precio={config?.suscripcionPrecio} />
            </div>

            <p className="text-xs text-gray-500 mt-2">
              ¡Con menos de 1 trabajo extra al mes, <strong>ya recuperás la inversión</strong>!
            </p>
          </div>
        </section>
      ) : (
        // ❌ Suscripción deshabilitada → mostrar como AGOTADA
        <section className="bg-white py-6 px-4">
          <div className="max-w-4xl mx-auto text-center bg-gray-100 p-8 rounded-2xl shadow-lg border border-gray-300 relative overflow-hidden opacity-80">
            <h2 className="text-3xl font-bold text-gray-500 mb-4">Suscripción Profesional</h2>
            <p className="text-lg text-gray-500 mb-6">Actualmente no disponible</p>

            {/* Cinta diagonal */}
            <div className="absolute top-10 -right-16 w-64 bg-red-600 text-white text-center font-bold transform rotate-45 shadow-lg">
              ¡PROXIMAMENTE!
            </div>

            <ul className="text-left max-w-md mx-auto text-gray-500 mb-6 space-y-4">
              <li className="flex items-start gap-3">
                <FaClock className="text-gray-400 mt-1" />
                <span>Ahorrás tiempo al presupuestar</span>
              </li>
              <li className="flex items-start gap-3">
                <FaClipboardCheck className="text-gray-400 mt-1" />
                <span>Cotizás con criterio técnico</span>
              </li>
              <li className="flex items-start gap-3">
                <FaChartLine className="text-gray-400 mt-1" />
                <span>Aumentás tus posibilidades de cerrar trabajos</span>
              </li>
              <li className="flex items-start gap-3">
                <FaBolt className="text-gray-400 mt-1" />
                <span>Sistema especializado en electricistas</span>
              </li>
            </ul>

            <div className="text-4xl font-extrabold text-green-600 mb-4">
              ${config?.suscripcionPrecio?.toLocaleString("es-AR")} 
              <span className="text-lg text-gray-600 font-normal">/mes</span>
            </div>

            <p className="text-sm text-gray-400 mb-4">
              La suscripción no está disponible en este momento.
            </p>
          </div>
        </section>
      )}


     </div>
    
  );
}
