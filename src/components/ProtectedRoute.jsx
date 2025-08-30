import React from "react";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { usuario } = useAuth();

  if (!usuario) {
    return <p>Debes iniciar sesión para acceder.</p>;
  }

  if (usuario.puedeAcceder) {
    return children;
  }

  // 🔑 Mostrar mensajes según estadoAcceso
  switch (usuario.estadoAcceso) {
    case "suspendido":
      return <p>Tu cuenta está suspendida. Contacta con soporte.</p>;
    case "vencido":
      return <p>Tu período de prueba ha finalizado. Suscríbete para continuar.</p>;
    case "sin-usuario":
      return <p>No tienes acceso. Por favor, regístrate.</p>;
    default:
      return <p>No tienes acceso.</p>;
  }
};

export default ProtectedRoute;
