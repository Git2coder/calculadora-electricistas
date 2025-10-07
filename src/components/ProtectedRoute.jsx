import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ModalAcceso from "./ModalAcceso";
import CalculadoraPreview from "./calculadora/CalculadoraPreview";
import { scrollToSection } from "../utils/scrollToSection";

export default function ProtectedRoute({ children }) {
  const { usuario, cargando } = useAuth();
  const location = useLocation();
  const [mostrarModal, setMostrarModal] = useState(false);

  useEffect(() => {
    let timer;
    // Mostrar modal solo para visitantes (no logueados o sin acceso)
    if (!usuario?.puedeAcceder && !usuario && location.pathname === "/calculadora") {
      timer = setTimeout(() => setMostrarModal(true), 5000);
    }
    return () => clearTimeout(timer);
  }, [usuario, location.pathname]);

  if (cargando) return null;

  // 🧩 1️⃣ Caso: usuario logueado pero sin acceso
  if (usuario && !usuario.puedeAcceder) {
    // Suscripción vencida → mostrar mensaje con botón hacia #planes
    if (usuario.estadoAcceso === "vencido") {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Tu suscripción ha expirado
          </h2>
          <p className="text-gray-600 mb-6 text-center max-w-md">
            Para seguir utilizando la calculadora y acceder a todas las funciones,
            renová tu plan o activá una nueva suscripción.
          </p>
          <button
            onClick={() => {
              // Si el usuario ya está en home
              if (window.location.pathname === "/") {
                scrollToSection("planes");
              } else {
                // Si está en otra ruta, lo redirige y aplica el scroll al cargar
                sessionStorage.setItem("scrollToPlanes", "true");
                window.location.href = "/";
              }
            }}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-xl shadow-md"
          >
            Ver planes disponibles
          </button>
          <p className="text-sm text-gray-500 mt-6">
            Si creés que esto es un error, comunicate con soporte.
          </p>
        </div>
      );
    }

    // Otros casos (por ejemplo, suspendido o sin plan)
    return (
      <div className="relative min-h-screen bg-gray-50">
        <CalculadoraPreview />
        {mostrarModal && (
          <ModalAcceso
            isOpen={mostrarModal}
            onClose={() => setMostrarModal(false)}
          />
        )}
      </div>
    );
  }

  // 🧩 2️⃣ Caso: visitante (no logueado)
  if (!usuario && location.pathname === "/calculadora") {
    return (
      <div className="relative min-h-screen bg-gray-50">
        <CalculadoraPreview />
        {mostrarModal && (
          <ModalAcceso
            isOpen={mostrarModal}
            onClose={() => setMostrarModal(false)}
          />
        )}
      </div>
    );
  }

  // 🧩 3️⃣ Caso: acceso permitido
  if (usuario?.puedeAcceder) return children;

  // 🧩 4️⃣ Fallback genérico
  return <p>Acceso restringido. Iniciá sesión para continuar.</p>;
}
