import React from "react";
import { useAuth } from "../context/AuthContext";

const AdminRoute = ({ children }) => {
  const { usuario } = useAuth();

  if (!usuario) {
    return <p>Debes iniciar sesión para acceder.</p>;
  }

  if (usuario.rol === "admin") {
    return children;
  }

  return <p>Acceso restringido. No tienes permisos de administrador.</p>;
};

export default AdminRoute;
