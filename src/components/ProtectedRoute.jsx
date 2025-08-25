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

  // Mostrar loader mientras verifica
 

  if (cargando) {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

if (!usuario || !datosUsuario) {
  return (
    <div className="max-w-xl mx-auto mt-20 p-8 bg-white rounded-xl shadow text-center border border-blue-200">
      <h2 className="text-2xl font-bold text-blue-800 mb-4">🔒 Acceso exclusivo para usuarios registrados</h2>
      <p className="text-gray-700 mb-6">
        Para acceder a esta herramienta necesitás crear una cuenta o iniciar sesión.<br />
        El registro es gratuito y te permite probarla durante 7 días.
      </p>
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

  // 🔒 Usuario suspendido
  if (estado !== "activo") {
    return (
      <div className="max-w-xl mx-auto mt-10 p-6 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded shadow text-center">
        <p className="text-lg font-semibold mb-2">⚠️ Acceso restringido</p>
        <p>Tu cuenta está suspendida. Contactanos para más información.</p>
        
      </div>
    );
  }

  // ✅ Suscripción válida
  if (fechaExpiracion && new Date(fechaExpiracion) > ahora) {
    return children;
  }

  // ✅ Período de prueba (7 días desde creado)
  const diasDesdeCreacion = fechaCreacion
    ? Math.floor((ahora - new Date(fechaCreacion)) / (1000 * 60 * 60 * 24))
    : Infinity;

  if (diasDesdeCreacion <= 7) {
    return children;
  }

  // ⛔ Fin del acceso
  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-red-100 border border-red-400 text-red-800 rounded shadow text-center">
      <p className="text-lg font-semibold mb-2">⏳ Tu período de acceso ha finalizado.</p>
      <p>Para seguir usando la herramienta tienes que activar la suscripcion.</p>
      
    </div>
  );
}
