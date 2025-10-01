// Home.jsx adaptado para electricistas con animación progresiva y fondo en Hero
import { useEffect, useState, useRef } from "react";
import { getFirestore, doc, getDoc, onSnapshot } from "firebase/firestore";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaCalculator, FaBook, FaNewspaper, FaCheck, FaTimes } from "react-icons/fa";
import { FaUserCircle } from "react-icons/fa";
import EscalaRemuneracion from "../components/EscalaRemuneracion";
import ModalAcceso from "../components/ModalAcceso";
import { useAuth } from "../context/AuthContext";

export function Home() {
  const db = getFirestore();
  const [config, setConfig] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [planSeleccionado, setPlanSeleccionado] = useState(null);
  const [origen, setOrigen] = useState(null);
  const [loadingPago, setLoadingPago] = useState(false);

  const { usuario } = useAuth();

  const planesRef = useRef(null);

  // Suscripción en tiempo real a Firestore
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "config", "app"), (snap) => {
      if (snap.exists()) {
        setConfig(snap.data());
      }
    });
    return () => unsub();
  }, [db]);

  if (!config) {
    return <p className="text-center mt-10 text-gray-600">Cargando configuración...</p>;
  }

  // Función para crear preferencia y redirigir (usada cuando el usuario ya está logueado)
  const iniciarPago = async (uid, plan) => {
    try {
      setLoadingPago(true);
      const resp = await fetch("/api/createPreference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, plan }),
      });

      if (!resp.ok) {
        const errBody = await resp.json().catch(() => ({}));
        console.error("Error iniciando preferencia:", errBody);
        alert("No se pudo iniciar el pago. Intentá nuevamente.");
        return;
      }

      const data = await resp.json();
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        console.error("init_point no recibido:", data);
        alert("No se pudo obtener la url de pago. Intentá nuevamente.");
      }
    } catch (err) {
      console.error("Error iniciarPago:", err);
      alert("Hubo un problema al iniciar el pago. Intentá nuevamente.");
    } finally {
      setLoadingPago(false);
    }
  };

  return (
    <div className="space-y-0">
      {/* Hero */}
      <section
        className="bg-cover bg-center text-white py-28 px-6 relative"
        style={{ backgroundImage: "url('/fondo-electricistas.webp')" }}
      >
        <div className="relative max-w-4xl mx-auto text-center z-10">
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-xl -z-10" />
          <div className="relative p-8 md:p-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">La calculadora de presupuestos</h1>
            <p className="text-lg mb-6">
              Una herramienta esencial si queres ganar tiempo y presupuestar con criterio.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() =>
                  document.getElementById("planes")?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  })
                }
                className="bg-green-600 hover:bg-green-500 px-5 py-3 rounded-xl text-white font-semibold"
              >
                ¡Empezá ahora!
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Paso a paso en horizontal con animación al hacer scroll */}
      <section className="bg-gradient-to-r from-blue-50 to-blue-100 py-20 px-6">
        <div className="max-w-6xl mx-auto text-center mb-12">
          <h2 className="text-4xl font-extrabold text-blue-900">
            ⚡ Tu presupuesto en 4 pasos
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 text-center relative">
          {/* Línea de conexión */}
          <div className="hidden md:block absolute top-16 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-green-400 via-yellow-400 to-red-400"></div>

          {[
            { num: 1, color: "text-blue-600", icon: "✏️", titulo: "Definí tu base", texto: "Establecé tu tarifa horaria. Podés calcularla o ajustarla a mano." },
            { num: 2, color: "text-green-600", icon: "🔍", titulo: "Buscá tareas", texto: "Encontrá la tarea con el buscador o explorá la lista." },
            { num: 3, color: "text-yellow-500", icon: "🔢", titulo: "Ajustá las cantidades", texto: "Configuralas y aplicá extras, según sea la situación." },
            { num: 4, color: "text-red-600", icon: "💸", titulo: "Mirá los resultados", texto: "Colocá tiempo de validez y descargá el presupuesto." },
          ].map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }} // 👈 arranca al 30% visible
              transition={{ delay: i * 0.4, duration: 0.9, ease: "easeOut" }}
              className="relative"
            >
              <div className="flex flex-col items-center">
                {/* Número con efecto bounce */}
                <motion.div
                  initial={{ scale: 0.5 }}
                  whileInView={{ scale: [1, 1.2, 1] }}
                  transition={{ delay: i * 0.4 + 0.6, duration: 0.6, ease: "easeOut" }}
                  className={`text-6xl font-extrabold ${step.color} mb-2`}
                >
                  {step.num}
                </motion.div>

                <div className="text-5xl">{step.icon}</div>
                <h4 className="text-lg font-bold mt-3">{step.titulo}</h4>
                <p className="text-gray-600 mt-2 text-sm">{step.texto}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Secciones progresivas con scroll */}
      {/*<section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-blue-800 mb-12">Secciones destacadas</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/noticias" className="bg-white shadow hover:shadow-md transition rounded-xl p-6 flex flex-col items-center text-center hover:bg-blue-50">
            <FaNewspaper className="text-4xl text-orange-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Noticias</h3>
            <p className="text-gray-600">Actualizate con las novedades del rubro eléctrico y tendencias del sector.</p>
          </Link>

          <Link to="/calculadora" className="bg-white shadow hover:shadow-md transition rounded-xl p-6 flex flex-col items-center text-center hover:bg-blue-50">
            <FaCalculator className="text-4xl text-green-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Calculadora</h3>
            <p className="text-gray-600">Cotizá tus trabajos con criterio, claridad y control total.</p>
          </Link>

          <Link to="/reglamentacion" className="bg-white shadow hover:shadow-md transition rounded-xl p-6 flex flex-col items-center text-center hover:bg-blue-50">
            <FaBook className="text-4xl text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Indice</h3>
            <p className="text-gray-600">Los reglamentos son muchos, fijate y ubica el que podias estar necesitando.</p>
          </Link>
        </div>
      </section>*/}

      <section className="bg-white py-16 space-y-24">
        <div className="max-w-6xl mx-auto text-center mb-12">
          <h2 className="text-4xl font-extrabold text-blue-900">
            3 motivos para usar esta herramienta 👌
          </h2>
        </div>

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
              <div className="bg-cover bg-center clip-diagonal-left" style={{ backgroundImage: "url('/beneficio-tiempo.webp')" }} />
            </div>
            <div className="p-8 md:pl-16">
              <h3 className="text-3xl font-bold text-green-700 mb-4">⏱️ Ganá tiempo</h3>
              <p className="text-gray-700 text-lg">Con esta herramienta en minutos lo tenés resuelto. Más tiempo para trabajar y menos para calcular.</p>
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
              <p className="text-gray-700 text-lg">Cotizar con criterio es ganar dinero con cada proyecto. No más precios al azar, ahora sabés lo que vale tu tiempo.</p>
            </div>
            <div className="hidden md:block order-1 md:order-2">
              <div className="bg-cover bg-center clip-diagonal-right" style={{ backgroundImage: "url('/beneficio-ganancia.webp')" }} />
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
                  backgroundPosition: "top",
                }}
              />
            </div>
            <div className="p-8 md:pl-16">
              <h3 className="text-3xl font-bold text-yellow-500 mb-4">📈 Generá mas oportunidades</h3>
              <p className="text-gray-700 text-lg">Respondé más rápido a nuevos pedidos. Cotizando más y mejor vas a lograr cerrar más trabajos.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* TESTIMONIOS HORIZONTALES */}
      <section className="bg-gray py-8 px-3">
        <h2 className="text-2xl font-bold text-center text-blue-800 mb-12">Lo que dicen los profesionales</h2>

        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-6">
          {/* Testimonio 1 */}
          <motion.div
            className="bg-blue-50 p-6 rounded-xl shadow text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <FaUserCircle className="text-4xl text-blue-500 mx-auto mb-2" />
            <p className="text-gray-700 italic text-sm">"...."</p>
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
            <p className="text-gray-700 italic text-sm">"...."</p>
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
            <p className="text-gray-700 italic text-sm">"...."</p>
            <p className="mt-2 text-sm font-medium text-gray-600">N3</p>
            <p className="text-xs text-gray-500"></p>
          </motion.div>
        </div>
      </section>

      <section className="bg-gray-100 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-blue-800 mb-8">Escala orientativa de remuneración</h2>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} viewport={{ once: true }}>
            <EscalaRemuneracion />
          </motion.div>
        </div>
      </section>

      {/* Planes de suscripción */}
      <section id="planes" className="bg-white py-8 px-6 scroll-mt-8">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold text-blue-800">Acceso Beta Gratuito</h2>
          <p className="text-gray-600 mt-2">
            Usá la calculadora y explorá la plataforma sin costo hasta el{" "}
            <span className="font-semibold text-blue-700">15 de noviembre de 2025</span>.
          </p>
        </div>

        {/* Plan Gratis */}
        <div className="max-w-md mx-auto">
          <div className="relative bg-white border-2 border-green-500 rounded-2xl shadow-xl p-10 flex flex-col items-center hover:shadow-2xl transition">
            
            <h3 className="text-xl font-bold mb-2">Plan Gratis (Beta)</h3>
            <p className="text-gray-500 mb-6 text-center">
              Durante esta etapa de prueba podrás acceder a las funciones principales.
            </p>

            {/* Características */}
            <ul className="space-y-3 text-left w-full">
              <li className="flex items-center gap-2">
                <FaCheck className="text-green-600" /> Acceso a la calculadora
              </li>
              <li className="flex items-center gap-2">
                <FaCheck className="text-green-600" /> Escala de remuneraciones
              </li>
              <li className="flex items-center gap-2">
                <FaCheck className="text-green-600" /> Noticias e índice
              </li>
              <li className="flex items-center gap-2">
                <FaCheck className="text-green-600" /> Votaciones y soporte
              </li>                            
            </ul>

            {/* Botón */}
            <button
              onClick={() => {
                setPlanSeleccionado("gratis");
                setOrigen("suscripcion");
                setModalAbierto(true);
              }}
              className="mt-8 block w-full py-3 rounded-xl font-semibold bg-green-600 hover:bg-green-500 text-white"
            >
              Empezar ahora
            </button>
          </div>
        </div>

        {/* Próximamente */}
        <div className="max-w-2xl mx-auto text-center mt-10 text-gray-500">
          <p>
            Próximamente estarán disponibles los planes con beneficios exclusivos.
          </p>
        </div>
      </section>


        {/* Modal acceso */}
        {modalAbierto && (
          <ModalAcceso 
          isOpen={modalAbierto} 
          plan={planSeleccionado} 
          origen={origen} 
          onClose={() => setModalAbierto(false)} />
        )}      
    </div>
  );
}
