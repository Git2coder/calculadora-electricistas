// ProtectedRoute.jsx
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // ajustá la ruta si tu contexto está en otro lugar
import ModalAcceso from "./ModalAcceso"; // ajustá ruta si hace falta
import CalculadoraPreview from "./calculadora/CalculadoraPreview"; // ajustá ruta si la guardaste en otra carpeta

export default function ProtectedRoute({ children }) {
  const { usuario } = useAuth(); // tu hook/context para saber si hay usuario
  const location = useLocation();
  const [mostrarModal, setMostrarModal] = useState(false);

  useEffect(() => {
    let timer;
    // Solo mostramos preview automático cuando el usuario visita la calculadora
    if (!usuario && location.pathname === "/calculadora") {
      // Espera 5s antes de mostrar modal
      timer = setTimeout(() => setMostrarModal(true), 5000);
    }
    return () => clearTimeout(timer);
  }, [usuario, location.pathname]);

  // Si no hay usuario y estamos en la calculadora -> desplegar preview bloqueado + modal
  if (!usuario && location.pathname.startsWith("/calculadora")) {
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


  // Si no hay usuario y NO estamos en /calculadora mostramos el mensaje clásico
  if (!usuario) {
    return <p>Debes iniciar sesión para acceder.</p>;
  }

  // Si hay usuario, renderizamos normalmente
  return children;
}
