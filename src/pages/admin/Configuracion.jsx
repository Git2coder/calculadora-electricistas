import React, { useState, useEffect } from "react";
import { db } from "../../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function Configuracion() {
  const [loading, setLoading] = useState(true);

  // Campos de planes
  const [precioBasico, setPrecioBasico] = useState("");
  const [precioProfesional, setPrecioProfesional] = useState("");
  const [porcentajeDescuentoRenovacion, setPorcentajeDescuentoRenovacion] = useState("");
  const [basicoHabilitado, setBasicoHabilitado] = useState(false);
  const [profesionalHabilitado, setProfesionalHabilitado] = useState(false);
  const [gratisHabilitado, setGratisHabilitado] = useState(false);
  const [mostrarDescuentoRenovacion, setMostrarDescuentoRenovacion] = useState(false);
  const [configPlanes, setConfigPlanes] = useState(false);

  // Campos de app
  const [calculadoraHabilitada, setCalculadoraHabilitada] = useState(true);
  const [habilitado, setHabilitado] = useState(true);
  const [registroHabilitado, setRegistroHabilitado] = useState(true);
  const [fechaLanzamiento, setFechaLanzamiento] = useState("");
  const [mostrarAnuncioLanzamiento, setMostrarAnuncioLanzamiento] = useState(false);
const [diasPrueba, setDiasPrueba] = useState(7);
const [etapa, setEtapa] = useState("crecimiento");

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const planesRef = doc(db, "config", "planes");
        const planesSnap = await getDoc(planesRef);

        if (planesSnap.exists()) {
          const data = planesSnap.data();
          setPrecioBasico(data.precioBasico ?? "");
          setPrecioProfesional(data.precioProfesional ?? "");
          setPorcentajeDescuentoRenovacion(data.porcentajeDescuentoRenovacion ?? "");
          setBasicoHabilitado(data.basicoHabilitado ?? false);
          setProfesionalHabilitado(data.profesionalHabilitado ?? false);
          setGratisHabilitado(data.gratisHabilitado ?? false);
          setMostrarDescuentoRenovacion(data.mostrarDescuentoRenovacion ?? false);
        }

        const appRef = doc(db, "config", "app");
        const appSnap = await getDoc(appRef);
        if (appSnap.exists()) {
          const data = appSnap.data();
          setEtapa(data.etapa || "crecimiento");
          setCalculadoraHabilitada(data.calculadoraHabilitada ?? true);
          setHabilitado(data.habilitado ?? true);
          setRegistroHabilitado(data.registroHabilitado ?? true);
          setFechaLanzamiento(data.fechaLanzamiento ?? "");
          setMostrarAnuncioLanzamiento(data.mostrarAnuncioLanzamiento ?? false);
        }
      } catch (error) {
        console.error("❌ Error al cargar configuración:", error);
        alert("Error al cargar la configuración.");
      } finally {
        setLoading(false);
      }
      const trialRef = doc(db, "config", "trial");
const trialSnap = await getDoc(trialRef);
if (trialSnap.exists()) {
  const data = trialSnap.data();
  setDiasPrueba(data.diasPrueba ?? 7);
}
    };
    cargarDatos();
  }, []);

  const handleGuardarCambios = async () => {
    try {
      const planesRef = doc(db, "config", "planes");
      await setDoc(
        planesRef,
        {
          precioBasico: Number(precioBasico),
          precioProfesional: Number(precioProfesional),
          porcentajeDescuentoRenovacion: Number(porcentajeDescuentoRenovacion),
          mostrarDescuentoRenovacion, // 👈 nuevo
          basicoHabilitado,
          profesionalHabilitado,
          gratisHabilitado,
        },
        { merge: true }
      );

      const appRef = doc(db, "config", "app");
      await setDoc(
        appRef,
        {
          calculadoraHabilitada,
          habilitado,
          registroHabilitado,
          fechaLanzamiento,
          mostrarAnuncioLanzamiento,
          etapa,
        },
        { merge: true }
      );

      alert("✅ Configuración guardada correctamente.");
    } catch (error) {
      console.error("❌ Error al guardar configuración:", error);
      alert("Error al guardar los cambios.");
    }
    const trialRef = doc(db, "config", "trial");
await setDoc(trialRef, { diasPrueba: Number(diasPrueba) }, { merge: true });
  };

  if (loading) return <p className="text-center text-gray-500">Cargando configuración...</p>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
      <h2 className="text-4xl font-extrabold text-blue-800 text-center mb-10 tracking-tight">
        ⚙️ Panel de Control General
      </h2>

      {/* === BLOQUE 1: ESTADO GENERAL === */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition transform hover:-translate-y-1">
          <h3 className="text-2xl font-semibold mb-4 flex items-center gap-3">
            🌐 Estado del sitio
          </h3>
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={habilitado}
                onChange={(e) => setHabilitado(e.target.checked)}
                className="h-5 w-5 accent-yellow-300"
              />
              <span className="font-medium">Sitio habilitado</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={registroHabilitado}
                onChange={(e) => setRegistroHabilitado(e.target.checked)}
                className="h-5 w-5 accent-yellow-300"
              />
              <span className="font-medium">Registro de nuevos usuarios</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={calculadoraHabilitada}
                onChange={(e) => setCalculadoraHabilitada(e.target.checked)}
                className="h-5 w-5 accent-yellow-300"
              />
              <span className="font-medium">Calculadora activa</span>
            </label>
          </div>
        </div>

        {/* === BLOQUE 2: LANZAMIENTO === */}
        <div className="bg-white p-8 rounded-2xl border border-yellow-300 shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
          <h3 className="text-2xl font-semibold text-yellow-700 mb-4 flex items-center gap-2">
            🚀 Etapa de lanzamiento
          </h3>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de finalización
              </label>
              <input
                type="date"
                value={fechaLanzamiento || ""}
                onChange={(e) => setFechaLanzamiento(e.target.value)}
                className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            <label className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 p-3 rounded-lg hover:bg-yellow-100 transition">
              <input
                type="checkbox"
                checked={mostrarAnuncioLanzamiento}
                onChange={(e) => setMostrarAnuncioLanzamiento(e.target.checked)}
                className="h-5 w-5 accent-yellow-500"
              />
              <span className="text-yellow-800 font-medium">
                Mostrar anuncio público de pre-lanzamiento
              </span>
            </label>
          </div>
          <div className="mt-6">
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Etapa actual del proyecto
  </label>
  <select
    value={etapa}
    onChange={(e) => setEtapa(e.target.value)}
    className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-yellow-400"
  >
    <option value="crecimiento">🌱 Etapa de crecimiento (gratis indefinido)</option>
    <option value="prelanzamiento">🚀 Pre-lanzamiento (gratis hasta fecha)</option>
    <option value="lanzamiento">💼 Lanzamiento (días de prueba limitados)</option>
  </select>
</div>

        </div>
      </div>

      {/* === BLOQUE 3: PLANES Y TARIFAS === */}
      <div className="relative bg-gradient-to-r from-blue-100 via-red-50 to-yellow-100 rounded-3xl shadow-lg p-10 border border-green-200 hover:shadow-2xl transition-all duration-300">
        <h3 className="text-3xl font-extrabold text-emerald-700 mb-8 text-center flex items-center justify-center gap-2">
          💰 Planes y tarifas
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* === PLAN GRATIS === */}
          <div
            className={`relative bg-white p-6 rounded-2xl shadow-md border-2 ${
              gratisHabilitado ? "border-emerald-400" : "border-gray-300 opacity-70"
            } transition-all hover:shadow-xl`}
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <span className="text-4xl">🍬</span>
              <h4 className="text-xl font-bold text-gray-800">Plan Gratis</h4>
              <p className="text-sm text-gray-600 mb-3">
                Ideal para nuevos usuarios y pruebas.
              </p>

              <button
                onClick={() => setGratisHabilitado(!gratisHabilitado)}
                className={`px-4 py-2 rounded-full font-semibold transition-all ${
                  gratisHabilitado
                    ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-600"
                }`}
              >
                {gratisHabilitado ? "Activo" : "Inactivo"}
              </button>

              {!gratisHabilitado && (
                <span className="absolute top-4 right-4 bg-yellow-400 text-xs font-bold text-yellow-900 px-2 py-1 rounded-md shadow">
                  Próximamente
                </span>
              )}
            </div>
          </div>

          {/* === PLAN BÁSICO === */}
          <div
            className={`relative bg-white p-6 rounded-2xl shadow-md border-2 ${
              basicoHabilitado ? "border-blue-400" : "border-gray-300 opacity-70"
            } transition-all hover:shadow-xl`}
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <span className="text-4xl">🍮</span>
              <h4 className="text-xl font-bold text-gray-800">Plan Básico</h4>
              <p className="text-sm text-gray-600">Para usuarios frecuentes.</p>

              <input
                type="number"
                value={precioBasico}
                onChange={(e) => setPrecioBasico(e.target.value)}
                className="w-24 text-center border border-gray-300 rounded-lg p-1 mt-3 font-semibold focus:ring-2 focus:ring-blue-300"
                placeholder="$"
              />

              <button
                onClick={() => setBasicoHabilitado(!basicoHabilitado)}
                className={`px-4 py-2 rounded-full font-semibold transition-all ${
                  basicoHabilitado
                    ? "bg-blue-500 hover:bg-blue-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-600"
                }`}
              >
                {basicoHabilitado ? "Activo" : "Inactivo"}
              </button>

              {!basicoHabilitado && (
                <span className="absolute top-4 right-4 bg-yellow-400 text-xs font-bold text-yellow-900 px-2 py-1 rounded-md shadow">
                  Próximamente
                </span>
              )}
            </div>
          </div>

          {/* === PLAN PROFESIONAL === */}
          <div
            className={`relative bg-white p-6 rounded-2xl shadow-md border-2 ${
              profesionalHabilitado ? "border-purple-400" : "border-gray-300 opacity-70"
            } transition-all hover:shadow-xl`}
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <span className="text-4xl">🍺</span>
              <h4 className="text-xl font-bold text-gray-800">Plan Profesional</h4>
              <p className="text-sm text-gray-600">Funciones avanzadas y soporte prioritario.</p>

              <input
                type="number"
                value={precioProfesional}
                onChange={(e) => setPrecioProfesional(e.target.value)}
                className="w-24 text-center border border-gray-300 rounded-lg p-1 mt-3 font-semibold focus:ring-2 focus:ring-purple-300"
                placeholder="$"
              />

              <button
                onClick={() => setProfesionalHabilitado(!profesionalHabilitado)}
                className={`px-4 py-2 rounded-full font-semibold transition-all ${
                  profesionalHabilitado
                    ? "bg-purple-500 hover:bg-purple-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-600"
                }`}
              >
                {profesionalHabilitado ? "Activo" : "Inactivo"}
              </button>

              {!profesionalHabilitado && (
                <span className="absolute top-4 right-4 bg-yellow-400 text-xs font-bold text-yellow-900 px-2 py-1 rounded-md shadow">
                  Próximamente
                </span>
              )}
            </div>
          </div>
        </div>

        {/* === DESCUENTO RENOVACIÓN === */}
        <div className="mt-10 relative bg-gradient-to-r from-yellow-100 to-orange-50 rounded-2xl shadow-md border border-yellow-300 p-6 hover:shadow-xl transition-all">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-yellow-700 flex items-center gap-2">
                🎁 Descuento de renovación
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Activá esta opción para ofrecer un descuento promocional por tiempo limitado.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Campo porcentaje */}
              <div className="flex items-center bg-white border border-yellow-200 rounded-lg px-3 py-2 shadow-sm">
                <label className="font-medium text-gray-700 mr-3 whitespace-nowrap">Porcentaje</label>
                <input
                  type="number"
                  value={porcentajeDescuentoRenovacion}
                  onChange={(e) => setPorcentajeDescuentoRenovacion(e.target.value)}
                  className="w-20 text-center border border-gray-300 rounded-md p-1 font-semibold focus:ring-2 focus:ring-yellow-400"
                  placeholder="%"
                />
                <span className="ml-2 text-gray-600 font-medium">%</span>
              </div>

              {/* Botón toggle */}
              <button
                onClick={() => setMostrarDescuentoRenovacion(!mostrarDescuentoRenovacion)}
                className={`px-5 py-2 rounded-full font-semibold shadow-md transition-all ${
                  mostrarDescuentoRenovacion
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }`}
              >
                {mostrarDescuentoRenovacion ? "Activo" : "Inactivo"}
              </button>
            </div>
          </div>

          {!mostrarDescuentoRenovacion && (
            <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-md shadow-sm">
              Descuento deshabilitado
            </div>
          )}
        </div>

      </div>

      {/* === BLOQUE 4: PERIODO DE PRUEBA === */}
<div className="bg-white border border-blue-300 rounded-2xl shadow-md p-8 mt-10 hover:shadow-xl transition-all">
  <h3 className="text-2xl font-semibold text-blue-700 mb-4 flex items-center gap-2">
    🕒 Periodo de prueba gratuita
  </h3>
  <p className="text-sm text-gray-600 mb-4">
    Determina la cantidad de días que cada nuevo usuario podrá usar la calculadora sin suscripción.
  </p>
  <div className="flex items-center gap-3">
    <input
      type="number"
      min="1"
      value={diasPrueba}
      onChange={(e) => setDiasPrueba(e.target.value)}
      className="w-24 border border-gray-300 rounded-lg p-2 text-center font-semibold focus:ring-2 focus:ring-blue-400"
    />
    <span className="text-gray-700 font-medium">día(s)</span>
  </div>
</div>


      {/* === BOTÓN GUARDAR === */}
      <div className="flex justify-center pt-4">
        <button
          onClick={handleGuardarCambios}
          className="relative group px-10 py-4 rounded-2xl font-bold text-lg text-white 
                     bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 
                     shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1"
        >
          💾 Guardar cambios
          <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 opacity-0 group-hover:opacity-20 transition"></span>
        </button>
      </div>
    </div>
  );
}
