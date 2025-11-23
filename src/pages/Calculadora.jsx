import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import CalculadoraCompleta from "../components/CalculadoraCompleta";
import Loader from "../components/Loader";


export function Calculadora() {
  const [darkMode, setDarkMode] = useState(false);
  const { usuario } = useAuth();
  const [configApp, setConfigApp] = useState(null);
  const [configTrial, setConfigTrial] = useState(7);
  const [diasRestantes, setDiasRestantes] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // 🔹 Cargar configuración global
  useEffect(() => {
    const cargarConfig = async () => {
      const appSnap = await getDoc(doc(db, "config", "app"));
      const trialSnap = await getDoc(doc(db, "config", "trial"));
      const appData = appSnap.exists() ? appSnap.data() : {};
      const trialData = trialSnap.exists() ? trialSnap.data() : {};
      setConfigApp(appData);
      setConfigTrial(trialData.diasPrueba || 7);
    };
    cargarConfig();
  }, []);

  // 🔹 Calcular días restantes solo si aplica
  useEffect(() => {
  if (!usuario || !configApp) return;

  const ahora = new Date();
  const etapa = configApp.etapa || "crecimiento";
  const fechaLanzamiento = configApp.fechaLanzamiento
    ? new Date(configApp.fechaLanzamiento)
    : null;

  // ✅ 1. Si el usuario está suspendido
  if (usuario.estado === "suspendido") {
    setDiasRestantes(-999); // valor especial para bloqueo total
    return;
  }

  // ✅ 2. Si tiene suscripción activa con fecha de expiración futura
  const fechaExp = usuario.fechaExpiracion?.toDate?.()
    ? usuario.fechaExpiracion.toDate()
    : usuario.fechaExpiracion
    ? new Date(usuario.fechaExpiracion)
    : null;

  if (usuario.suscripcionActiva && fechaExp && fechaExp > ahora) {
    const dias = Math.ceil((fechaExp - ahora) / (1000 * 60 * 60 * 24));
    setDiasRestantes(dias);
    return; // 🔹 importante: no seguir calculando el trial
  }

  // 🔹 3. Etapa de crecimiento
  if (etapa === "crecimiento") {
    setDiasRestantes(null);
    return;
  }

  // 🔹 4. Etapa de pre-lanzamiento
  if (etapa === "prelanzamiento" && fechaLanzamiento) {
    const dias = Math.ceil((fechaLanzamiento - ahora) / (1000 * 60 * 60 * 24));
    setDiasRestantes(dias > 0 ? dias : 0);
    return;
  }

  // 🔹 5. Etapa de lanzamiento (trial)
  if (etapa === "lanzamiento") {
    const fechaCreacion =
      usuario.creadoEn?.toDate?.() || new Date(usuario.creadoEn);
    const dias = configTrial - Math.floor((ahora - fechaCreacion) / (1000 * 60 * 60 * 24));
    setDiasRestantes(dias);
    return;
  }
}, [usuario, configApp, configTrial]);

  if (loading) {
    return (
      <div className="flex justify-center py-40 min-h-screen 
                      bg-gray-100 dark:bg-gray-900 transition-colors">
        <Loader />
      </div>
    );
  }

  if (!usuario) return null;
  if (!configApp) return <p className="text-center mt-20 text-gray-500">Cargando configuración...</p>;

  const etapa = configApp.etapa || "crecimiento";

  // 🔴 Si el usuario ya no tiene acceso
  if (etapa === "lanzamiento" && diasRestantes !== null && diasRestantes < 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 
                      text-gray-800 dark:text-gray-100
                      bg-white dark:bg-gray-900 transition-colors">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          Tu período de prueba ha finalizado
        </h2>
        <p className="mb-6 text-gray-700">
          Para seguir usando la calculadora debes activar una suscripción.
        </p>
      </div>
    );
  }
  
// 🔴 Si el usuario está suspendido
if (diasRestantes === -999) {
  return (
    <div className="max-w-2xl mx-auto text-center py-20
                    text-gray-800 dark:text-gray-100
                    bg-white dark:bg-gray-900 transition-colors">
      <h2 className="text-2xl font-bold text-red-600 mb-4">
        Tu cuenta está suspendida temporalmente
      </h2>
      <p className="mb-6 text-gray-700">
        Comunicate con soporte para más información.
      </p>
    </div>
  );
}

// 🔹 Si el usuario tiene suscripción activa → acceso pleno
if (usuario.suscripcionActiva && diasRestantes > 0) {
  return (
    <div className="max-w-6xl mx-auto py-6 px-4
                bg-white dark:bg-gray-900 
                text-gray-800 dark:text-gray-100
                transition-colors">
      <div className="bg-green-50 text-green-800 border-l-4 border-green-700 px-4 py-3 rounded mb-6 text-sm shadow">
        💼 Tenés una <strong>suscripción activa</strong>. Te quedan {diasRestantes} día(s).
      </div>
      <CalculadoraCompleta />
    </div>
  );
}

  // ✅ Mostrar calculadora según etapa - CAPA/PLANO 2 
  return (
    <div className="max-w-6xl mx-auto py-6 px-4
                    bg-white dark:bg-gray-900 
                    text-gray-800 dark:text-gray-100 rounded-xl
                    transition-colors">

      {/* Etapa de crecimiento */}
      {etapa === "crecimiento" && (
        <div className="
          bg-blue-50 dark:bg-blue-900 
          text-blue-800 dark:text-blue-100 
          border-l-4 border-blue-700 dark:border-blue-300 
          px-4 py-3 rounded mb-6 text-sm shadow
          transition-colors
        ">
          🌱 Estás usando la <strong>Etapa de crecimiento</strong>: acceso gratuito ilimitado mientras ajustamos los detalles finales.
        </div>
      )}

      {/* Etapa de pre-lanzamiento */}
      {etapa === "prelanzamiento" && diasRestantes !== null && (
        <div className="
          bg-indigo-50 dark:bg-indigo-900 
          text-indigo-800 dark:text-indigo-100 
          border-l-4 border-indigo-700 dark:border-indigo-300
          px-4 py-3 rounded mb-6 text-sm shadow
          transition-colors
        ">
          🚀 <strong>Pre-lanzamiento:</strong> acceso gratuito disponible durante {diasRestantes} día(s).
        </div>
      )}

      {/* Etapa de lanzamiento */}
      {etapa === "lanzamiento" && diasRestantes !== null && diasRestantes >= 0 && (
        <div className="
          bg-green-100 dark:bg-green-900 
          text-green-800 dark:text-green-100 
          border-l-4 border-green-800 dark:border-green-500
          px-4 py-3 rounded mb-6 text-sm shadow
          transition-colors
        ">
          ⏳ Te quedan <strong>{diasRestantes} día(s)</strong> de prueba gratuita.
        </div>
      )}

      <CalculadoraCompleta />
    </div>
  );

}
