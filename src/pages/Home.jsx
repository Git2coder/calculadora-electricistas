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
import { scrollToSection } from "../utils/scrollToSection";
import SeccionEvolucion from "./home/SeccionEvolucion";

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
    const unsubApp = onSnapshot(doc(db, "config", "app"), (snap) => {
      if (snap.exists()) setConfig((prev) => ({ ...prev, ...snap.data() }));
    });

    const unsubPlanes = onSnapshot(doc(db, "config", "planes"), (snap) => {
      if (snap.exists()) setConfig((prev) => ({ ...prev, ...snap.data() }));
    });

    return () => {
      unsubApp();
      unsubPlanes();
    };
  }, [db]);
  
  useEffect(() => {
    const pendingScroll = sessionStorage.getItem("scrollToPlanes");
    if (pendingScroll) {
      sessionStorage.removeItem("scrollToPlanes");
      setTimeout(() => {
        document.getElementById("planes")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 500); // delay breve para que cargue el DOM
    }
  }, []);


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
  
  // Verificar etapa de lanzamiento
  const hoy = new Date();
  const fechaLanzamientoDate = config?.fechaLanzamiento
  ? new Date(`${config.fechaLanzamiento}T23:59:59`) // fuerza fin del día local
  : new Date("2025-11-01T23:59:59");
  const enPreLanzamiento = config?.mostrarAnuncioLanzamiento && hoy < fechaLanzamientoDate;
  const enModoSilencioso = !config?.mostrarAnuncioLanzamiento;


  return (
    <div className="space-y-0">
      <section className="relative w-full px-6 pt-28 pb-32 overflow-hidden">
        {/* === VIDEO DE FONDO === */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          src="/videos/video-azul.mp4"   /* <-- poné tu archivo de video aquí */
        />

        {/* === CAPA DE SUAVIZADO === */}
        <div className="absolute inset-0 bg-black/30"></div>

        {/* === GRADIENTES SUAVES (MUCHO MÁS SUTILES QUE ANTES) === */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/25 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent mix-blend-overlay"></div>
        </div>

        {/* === CONTENIDO DEL HERO === */}
        <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* A — HEADLINE */}
          <div className="lg:col-span-6 order-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="max-w-xl"
            >
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-white">
                El oficio evoluciona.<br />
                <span className="text-blue-400">Tu manera de presupuestar también.</span>
              </h1>

              <p className="mt-5 text-lg text-gray-200">
                <span className="text-yellow-300/80"><i><b>Presupuesto+</b></i></span> no repite precios, los calcula según tu realidad.
                Se ajusta en 4 simples pasos para que cada presupuesto tenga sentido.
              </p>

              {/* CTA */}
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/calculadora"
                  className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold px-6 py-3 rounded-full shadow-lg transition"
                >
                  Probar ahora (gratis)
                </Link>

                <button
                  onClick={() => setModalAbierto(true)}
                  className="inline-flex items-center gap-2 border border-white/40 hover:bg-white/10 text-white px-5 py-3 rounded-full transition"
                >
                  Iniciar sesión
                </button>
              </div>

              {/* Microventajas */}
              <div className="mt-6 flex flex-wrap gap-3 items-center text-sm text-gray-300">
                <span>✅ Es más que una referencia, es una herramienta pensada para adaptarse a vos.</span>
                <span className="hidden sm:inline">Tarifa, tiempo, complejidad y más...</span>
              </div>
            </motion.div>
          </div>

          {/* B — Columna derecha vacía para balance */}
          <div className="lg:col-span-6 order-2 relative hidden lg:block">

            {/* SEMICIRCUNFERENCIA PERFECTA + PASOS MEJORADOS */}
            <div className="absolute right-0 top-10 h-[380px] w-[280px] pointer-events-auto">

              {/* Fondo glow del arco */}
              <div className="absolute inset-0 bg-blue-500/5 blur-3xl rounded-full"></div>

              {/* Curva semicircular precisa (según tu centro y radio) */}
              <svg
                viewBox="-200 180 160 200"
                className="absolute right-0 top-0 w-full h-full"
              >
                <defs>
                  <filter id="glow">
                    <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#3b82f6" floodOpacity="0.4"/>
                  </filter>
                </defs>

                <path
                  d="M-90.219 145 
                    A230 120 15 0 0 450.219 500"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeDasharray="8 8"
                  opacity="0.35"
                />

              </svg>

              {/* Pasos alineados geométricamente */}
              {(() => {
                const radius = -225;
                const centerX = 265;
                const centerY = 175;

                // Ángulos de la semicircunferencia visible hacia la izquierda
                const angles = [ 60, 20, -20, -60 ];

                const labels = [
                  "Definí tu tarifa",
                  "Buscá la tarea",
                  "Ajustá cantidades",
                  "Descargá PDF"
                ];

                const icons = ["✏️", "🔍", "🔢", "📄"];

                return angles.map((deg, i) => {
                  const rad = (deg * Math.PI) / 180;

                  const x = centerX + radius * Math.cos(rad);
                  const y = centerY + radius * Math.sin(rad);

                  return (
                    <motion.div
                      key={i}
                      className="absolute flex items-center gap-3 cursor-pointer select-none"
                      style={{
                        left: x - 20,
                        top: y - 20
                      }}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.15, duration: 0.5 }}
                      whileHover={{
                        scale: 1.16,
                        x: -10,
                        transition: { type: "spring", stiffness: 180 }
                      }}
                    >
                      {/* Glow detrás del punto */}
                      <div className="absolute w-10 h-10 bg-blue-500/30 blur-xl rounded-full -z-10"></div>

                      {/* Punto + ícono */}
                      <div className="w-9 h-9 rounded-full bg-green-500/50 shadow-xl flex items-center justify-center text-lg text-white">
                        {icons[i]}
                      </div>

                      {/* Texto */}
                      <span className="text-white text-sm font-medium drop-shadow-lg whitespace-nowrap">
                        {labels[i]}
                      </span>

                    </motion.div>
                  );
                });
              })()}
            </div>
          </div>


        </div>
      </section>
  
      {/* =========================================================
      NUEVA SECCIÓN — "El camino del electricista moderno" (Premium)
      ========================================================= */}
      <section className="
        relative 
        bg-gradient-to-b from-white to-blue-50
        dark:bg-gradient-to-b dark:from-gray-900 dark:to-gray-800
        py-16 overflow-hidden
      ">

        {/* Fondo decorativo geométrico */}
        <div className="absolute inset-0 opacity-[0.18] pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M60 0H0V60" fill="none" stroke="#c8d7f0" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Contenido principal */}
        <div className="relative max-w-6xl mx-auto px-8 z-10">

          {/* Título */}
          <div className="text-center mb-20">
            <h2 className="text-4xl font-extrabold leading-tight text-slate-900 dark:text-white">
              Evolucionar no es cambiar lo que hacés<br />
              <span className="text-blue-700 dark:text-blue-400">
                es mejorar cómo lo resolvés.
              </span>
            </h2>
          </div>

          {/* ======================
              TIMELINE CENTRAL
            ====================== */}
          <div className="max-w-3xl mx-auto relative">
            
            {/* Línea vertical */}
            <div className="
              absolute left-1/2 -translate-x-1/2 h-full w-[3px] 
              bg-gradient-to-b from-green-200 to-green-100
              dark:from-green-800 dark:to-green-700
            "></div>

            {[
              {
                title: "De la intuición al criterio",
                text: "Precios basados en tu tiempo real y tu tarifa personal.",
                icon: (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2v20M2 12h20" stroke="#1d4ed8" strokeWidth="2" />
                  </svg>
                )
              },
              {
                title: "De la lista fija al cálculo inteligente",
                text: "Adaptado a vos. No a promedios generales.",
                icon: (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="#1d4ed8" strokeWidth="2"/>
                    <path d="M12 6v6l4 2" stroke="#1d4ed8" strokeWidth="2"/>
                  </svg>
                )
              },
              {
                title: "De la incertidumbre a la realidad",
                text: "Con resultados más consistentes, rentables y competitivos.",
                icon: (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                    <path d="M4 17l4-4 3 3 7-7" stroke="#1d4ed8" strokeWidth="2" />
                  </svg>
                )
              }
            ].map((step, i, arr) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: i * 0.15 }}
                viewport={{ once: true }}
                className={`relative flex items-start gap-10 ${
                  i === arr.length - 1 ? "mb-12" : "mb-28"
                }`}
              >
                {/* ============================================
                  ÍCONO FANTASMA EN ZIG-ZAG (FONDO)
                  ============================================ */}
                <div
                  className={`
                    absolute top-1/2 -translate-y-1/2 w-64 h-64 opacity-[0.15] 
                    pointer-events-none z-0
                    ${i % 2 === 0 ? "-left-[180px]" : "-right-[180px]"}
                  `}
                >
                  {/* Cambia el icono fantasma según el paso */}
                  {i === 0 && (
                    <svg fill="none" stroke="#1d4ed8" strokeWidth="1.2" className="dark:stroke-blue-300" viewBox="0 0 24 24">
                      <path d="M12 2v20M2 12h20"/>
                    </svg>
                  )}

                  {i === 1 && (
                    <svg fill="none" stroke="#1d4ed8" strokeWidth="1.2" className="dark:stroke-blue-300" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="9"/>
                      <path d="M12 6v6l4 2"/>
                    </svg>
                  )}

                  {i === 2 && (
                    <svg fill="none" stroke="#1d4ed8" strokeWidth="1.2" className="dark:stroke-blue-300" viewBox="0 0 24 24">
                      <path d="M4 17l4-4 3 3 7-7" />
                    </svg>
                  )}
                </div>

                {/* Punto circular */}
                <div className="absolute left-1/2 -translate-x-1/2 w-10 h-10 bg-blue-700 dark:bg-blue-500 rounded-full shadow-lg flex items-center justify-center text-white z-10">
                  {step.icon}
                </div>

                {/* Bloques intercalados */}
                <div
                  className={`w-1/2 ${
                    i % 2 === 0 ? "text-right pr-12 ml-auto" : "text-left pl-12 mr-auto"
                  }`}
                >
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-gray-200 mb-2">{step.title}</h3>
                    <p className="text-slate-600 dark:text-gray-400 text-lg">{step.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <SeccionEvolucion />

      <section className="bg-gray-100 dark:bg-gray-800 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-3xl text-center font-extrabold text-blue-700 dark:text-white leading-tight">Escala orientativa</h3>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} viewport={{ once: true }}>
            <EscalaRemuneracion />
          </motion.div>
        </div>
      </section>

      {/* Planes de suscripción */}
      {enModoSilencioso ? (
        // === BLOQUE DE MODO SILENCIOSO ===
        <section
          id="planes"
          className="flex flex-col items-center justify-center text-center mt-32 py-20 px-8 
                    bg-gradient-to-r from-blue-500 via-blue-400 to-green-300 
                    text-white rounded-3xl shadow-2xl mx-auto max-w-3xl"
        >
          <h2 className="text-4xl font-extrabold mb-4 drop-shadow-lg">
            🌱 Etapa de crecimiento 
          </h2>

          <p className="text-lg max-w-2xl mb-6 text-white/90 leading-relaxed">
            Estamos creciendo y queremos que formes parte.  
            En esta fase podés usar la herramienta sin compromiso, gratis y antes que nadie.
          </p>

          <button
              onClick={() => {
                setPlanSeleccionado("gratis");
                setOrigen("suscripcion");
                setModalAbierto(true);
              }}
              className="mt-4 bg-white text-blue-600 font-semibold px-10 py-3 rounded-xl shadow-lg 
               hover:bg-blue-50 hover:scale-105 transition-transform duration-300"
              >
                ¡Probar ahora! ⚡
            </button>
        </section>

      ) : enPreLanzamiento ? (
        // === BLOQUE DE PRE-LANZAMIENTO ===
        <section
          id="planes"
          className="flex flex-col items-center justify-center text-center mt-32 py-20 px-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl shadow-xl mx-auto max-w-3xl"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-extrabold mb-4">🚀 ¡Etapa de Pre-Lanzamiento!</h2>
            <p className="text-lg mb-6">
              Accedé <span className="font-semibold text-yellow-300">gratis</span> a las funciones de la calculadora
              durante esta etapa especial.
              <br />
              Disponible hasta el{" "}
              <span className="font-semibold underline decoration-yellow-400">
                {new Date(config.fechaLanzamiento + "T23:59:59").toLocaleDateString("es-AR")}
              </span>.
            </p>
            <button
              onClick={() => {
                setPlanSeleccionado("gratis");
                setOrigen("suscripcion");
                setModalAbierto(true);
              }}
              className="px-8 py-3 bg-yellow-400 text-blue-900 font-bold rounded-xl shadow-md hover:bg-yellow-300 transition"
            >
              🌟 Acceder ahora
            </button>
          </motion.div>
        </section>
      ) : (
        // === BLOQUE NORMAL DE PLANES ===
        <section id="planes" className="bg-white py-12 px-6 scroll-mt-20">
          <div className="max-w-6xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-blue-800">Elegí tu plan</h2>
            <p className="text-gray-600 mt-2">
              Accedé a la calculadora y recursos exclusivos según tu suscripción
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Plan Gratis */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className={`relative bg-white border rounded-2xl shadow p-8 flex flex-col hover:shadow-lg transition ${
                !config?.gratisHabilitado ? "opacity-60" : ""
              }`}
            >
              {/* Cinta de FOMO */}
              {!config?.gratisHabilitado && (
                <div className="absolute top-6 right-[-40px] rotate-[20deg] bg-red-600 text-white font-bold px-16 py-1 shadow-lg">
                  Próximamente
                </div>
              )}

              <h3 className="text-xl font-bold mb-4">Gratis</h3>
              <p className="text-gray-600 mb-6">Probá la herramienta sin costo durante 7 días.</p>

              {<ul className="space-y-3 flex-1 text-left">
                <li className="flex items-center gap-2"><FaCheck className="text-green-600" /> Calculadora limitada</li>
                <li className="flex items-center gap-2"><FaCheck className="text-green-600" /> 7 días de prueba</li>
                <li className="flex items-center gap-2"><FaCheck className="text-green-600" /> Escala de remuneraciones</li>
                <li className="flex items-center gap-2 text-gray-400"><FaTimes className="text-red-400" /> Noticias e índice</li>
                <li className="flex items-center gap-2 text-gray-400"><FaTimes className="text-red-400" /> Presupuestos PDF</li>
                <li className="flex items-center gap-2 text-gray-400"><FaTimes className="text-red-400" /> Votaciones o soporte</li>
              </ul>}

              <div className="mt-6">
                <span className="text-3xl font-bold text-gray-700">$0</span>
                <span className="text-sm text-gray-500"> / prueba</span>
              </div>

              <button
                disabled={!config?.gratisHabilitado}
                onClick={() => {
                  if (config?.gratisHabilitado) {
                    setPlanSeleccionado("gratis");
                    setOrigen("suscripcion");
                    setModalAbierto(true);
                  }
                }}
                className={`mt-6 block w-full py-3 rounded-xl font-semibold ${
                  config?.gratisHabilitado
                    ? "bg-green-600 hover:bg-green-500 text-white"
                    : "bg-gray-400 text-gray-200 cursor-not-allowed"
                }`}
              >
                {config?.gratisHabilitado ? "Empezar gratis" : "No disponible"}
              </button>
            </motion.div>

            {/* Plan Profesional (destacado) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className={`relative bg-white border-2 border-yellow-500 rounded-2xl shadow-xl p-10 flex flex-col transform scale-105 hover:shadow-2xl transition ${
                !config?.profesionalHabilitado ? "opacity-60" : ""
              }`}
            >
              {/* Cinta de FOMO */}
              {!config?.profesionalHabilitado && (
                <div className="absolute top-6 right-[-40px] rotate-[20deg] bg-red-600 text-white font-bold px-16 py-1 shadow-lg">
                  Próximamente
                </div>
              )}

              <div className="absolute -top-3 right-6 bg-black text-white text-xs px-3 py-1 rounded-full">
                ⚡ Profesional
              </div>

              <h3 className="text-xl font-bold mb-4">Completo</h3>
              <p className="text-gray-600 mb-6">
                Accedé al máximo potencial de la herramienta y todas sus funciones.
              </p>

              {<ul className="space-y-3 flex-1 text-left">
                <li className="flex items-center gap-2"><FaCheck className="text-green-600" /> Calculadora completa y actualizada</li>
                <li className="flex items-center gap-2"><FaCheck className="text-green-600" /> Noticias e índice</li>
                <li className="flex items-center gap-2"><FaCheck className="text-green-600" /> Presupuestos PDF ilimitados</li>
                <li className="flex items-center gap-2"><FaCheck className="text-green-600" /> Participación en votaciones</li>
                <li className="flex items-center gap-2"><FaCheck className="text-green-600" /> Sugerencia de precios al votar</li>
                <li className="flex items-center gap-2"><FaCheck className="text-green-600" /> Soporte a consultas</li>
                <li className="flex items-center gap-2"><FaCheck className="text-green-600" /> Acceso a futuras actualizaciones</li>
              </ul>}

              {/*Tarifa profesional*/}
              <div className="mt-6 flex items-baseline gap-2">
                {/* Precio anterior (solo si existe en Firestore) */}
                {config?.precioAnteriorProfesional && (
                  <span className="text-lg text-gray-400 line-through">
                    ${config.precioAnteriorProfesional.toLocaleString("es-AR")}
                  </span>
                )}

                {/* Precio actual */}
                <span className="text-3xl font-bold text-black-600">
                  ${config?.precioProfesional?.toLocaleString("es-AR")}
                </span>
                <span className="text-sm text-gray-500"> / mes</span>
              </div>

              <button
                disabled={!config?.profesionalHabilitado || loadingPago}
                onClick={() => {
                  if (config?.profesionalHabilitado) {
                    if (usuario) {
                      iniciarPago(usuario.uid, "profesional");
                    } else {
                      setPlanSeleccionado("profesional");
                      setOrigen("suscripcion");
                      setModalAbierto(true);
                    }
                  }
                }}
                className={`mt-6 block w-full py-3 rounded-xl font-semibold ${
                  config?.profesionalHabilitado
                    ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                    : "bg-gray-400 text-gray-200 cursor-not-allowed"
                }`}
              >
                {loadingPago
                  ? "Redirigiendo..."
                  : config?.profesionalHabilitado
                  ? "Suscribirme"
                  : "No disponible"}
              </button>
            </motion.div>


            {/* Plan Básico */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className={`relative bg-white border-2 border-blue-500 rounded-2xl shadow-lg p-8 flex flex-col hover:shadow-xl transition ${
                !config?.basicoHabilitado ? "opacity-60" : ""
              }`}
            >
              {/* Cinta de FOMO */}
              {!config?.basicoHabilitado && (
                <div className="absolute top-6 right-[-40px] rotate-[20deg] bg-red-600 text-white font-bold px-16 py-1 shadow-lg">
                  Próximamente
                </div>
              )}

              <h3 className="text-xl font-bold mb-4">Básico</h3>
              <p className="text-gray-600 mb-6">
                Ideal para quienes recién comienzan y quieren gestionar presupuestos.
              </p>

              {<ul className="space-y-3 flex-1 text-left">
                <li className="flex items-center gap-2"><FaCheck className="text-green-600" /> Calculadora parcial</li>
                <li className="flex items-center gap-2"><FaCheck className="text-green-600" /> Noticias e índice</li>
                <li className="flex items-center gap-2"><FaCheck className="text-green-600" /> Presupuestos PDF limitados</li>
                <li className="flex items-center gap-2"><FaCheck className="text-green-600" /> Escala de remuneraciones</li>
                <li className="flex items-center gap-2 text-gray-400"><FaTimes className="text-red-400" /> Votaciones de precios</li>
                
              </ul>}

              {/*Tarifa Basico*/}

              {/* Precio anterior (solo si existe en Firestore) */}
              <div className="mt-6 flex items-baseline gap-2">
                {config?.precioAnteriorBasico && (
                  <span className="text-lg text-gray-400 line-through">
                    ${config.precioAnteriorBasico.toLocaleString("es-AR")}
                  </span>
                )}

                {/* Precio actual */}
                <span className="text-3xl font-bold text-black-600">
                  ${config?.precioBasico?.toLocaleString("es-AR")}
                </span>
                <span className="text-sm text-gray-500"> / mes</span>
              </div>


              <button
                disabled={!config?.basicoHabilitado || loadingPago}
                onClick={() => {
                  if (config?.basicoHabilitado) {
                    if (usuario) {
                      iniciarPago(usuario.uid, "basico");
                    } else {
                      setPlanSeleccionado("basico");
                      setOrigen("suscripcion");
                      setModalAbierto(true);
                    }
                  }
                }}
                className={`mt-6 block w-full py-3 rounded-xl font-semibold ${
                  config?.basicoHabilitado
                    ? "bg-blue-600 hover:bg-blue-500 text-white"
                    : "bg-gray-400 text-gray-200 cursor-not-allowed"
                }`}
              >
                {loadingPago
                  ? "Redirigiendo..."
                  : config?.basicoHabilitado
                  ? "Suscribirme"
                  : "No disponible"}
              </button>
            </motion.div>
          </div>        
        </section>
      )}
      
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
