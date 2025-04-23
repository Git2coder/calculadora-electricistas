import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export function ProtectedRoute({ children }) {
  const { usuario } = useAuth();
  const [datosUsuario, setDatosUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const traerDatos = async () => {
      if (usuario) {
        const ref = doc(db, "usuarios", usuario.uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setDatosUsuario(snap.data());
        }
      }
      setCargando(false);
    };

    traerDatos();

    const intervalo = setInterval(() => {
      traerDatos();
    }, 15000); // vuelve a consultar cada 15s

    return () => clearInterval(intervalo);
  }, [usuario]);

  // 🔹 No logueado o cargando
  if (!usuario || cargando || !datosUsuario) {
    return (
      <div className="max-w-xl mx-auto mt-20 p-8 bg-white rounded-xl shadow text-center border border-blue-200">
        <h2 className="text-2xl font-bold text-blue-800 mb-4">🔒 Acceso exclusivo para usuarios registrados</h2>
        <p className="text-gray-700 mb-6">
          Para acceder a esta herramienta necesitás crear una cuenta o iniciar sesión.<br />
          El registro es gratuito y te permite probarla durante 7 días.
        </p>
  
        {/* Botón de acceso */}
        <a
          href="#"
          onClick={() => window.dispatchEvent(new CustomEvent("abrirModalAcceso"))}
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-full transition"
        >
          🔑 Crear cuenta o Iniciar sesión
        </a>
      </div>
    );
  }
  

  const ahora = new Date();
  const fechaCreacion = datosUsuario.creadoEn?.toDate?.() || datosUsuario.creadoEn;
  const fechaExpiracion = datosUsuario.fechaExpiracion?.toDate?.() || datosUsuario.fechaExpiracion;
  const estado = datosUsuario.estado;
  const tuvoSuscripcion = !!fechaExpiracion;

  // ⛔ Usuario suspendido
  if (estado !== "activo") {
    return (
      <div className="max-w-xl mx-auto mt-20 p-8 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded-xl shadow text-center">
        <h2 className="text-2xl font-bold mb-4">⚠️ Acceso restringido</h2>
        <p>Tu cuenta fue suspendida. Contactanos si creés que esto es un error.</p>
        <a
          href="https://wa.me/5491123456789"
          className="inline-block mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          target="_blank"
          rel="noopener noreferrer"
        >
          💬 Contactar por WhatsApp
        </a>
      </div>
    );
  }

  // ✅ Acceso por suscripción activa
  if (fechaExpiracion && new Date(fechaExpiracion) > ahora) {
    return children;
  }

  // ✅ Acceso por período de prueba (solo si nunca tuvo suscripción)
  const diasDesdeCreacion = fechaCreacion
    ? Math.floor((ahora - new Date(fechaCreacion)) / (1000 * 60 * 60 * 24))
    : Infinity;

  if (!tuvoSuscripcion && diasDesdeCreacion <= 7) {
    return children;
  }

  // ❌ Fin del acceso
  return (
    <div className="max-w-xl mx-auto mt-20 p-8 bg-red-100 border border-red-400 text-red-800 rounded-xl shadow text-center">
      <h2 className="text-2xl font-bold mb-4">⏳ Tu acceso ha finalizado</h2>
      <p>
        El período de prueba o suscripción ha vencido. Contactanos para renovarlo y seguir usando la herramienta.
      </p>
      <a
        href="https://wa.me/5491123456789"
        className="inline-block mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        target="_blank"
        rel="noopener noreferrer"
      >
        💬 Contactar por WhatsApp
      </a>
    </div>
  );
}
