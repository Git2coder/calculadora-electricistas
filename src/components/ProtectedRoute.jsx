// ProtectedRoute.jsx
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ModalAcceso from "./ModalAcceso";
import CalculadoraPreview from "./calculadora/CalculadoraPreview";

export default function ProtectedRoute({ children }) {
  const { usuario, cargando } = useAuth();
  const location = useLocation();
  const [mostrarModal, setMostrarModal] = useState(false);

  useEffect(() => {
    let timer;
    if (!usuario?.puedeAcceder && location.pathname === "/calculadora") {
      timer = setTimeout(() => setMostrarModal(true), 4000);
    }
    return () => clearTimeout(timer);
  }, [usuario, location.pathname]);

  if (cargando) return null; // opcional: spinner

  // 🔒 Usuario no logueado ni con acceso
  if (!usuario?.puedeAcceder && location.pathname.startsWith("/calculadora")) {
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

  // Usuario no logueado (fuera de calculadora)
  if (!usuario) return <p>Debes iniciar sesión para acceder.</p>;

  // ✅ Acceso permitido
  return children;
}
