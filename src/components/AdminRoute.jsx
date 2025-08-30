import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const { usuario, cargando } = useAuth();

  // Mientras carga el usuario, mostramos un loading o mensaje
  if (cargando) {
    return <div className="text-center mt-10">Cargando...</div>;
  }

  // Verificación en consola de lo que recibe AdminRoute
  console.log("Usuario en AdminRoute:", usuario);

  // Si no hay usuario o el rol no es admin, redirige
  if (!usuario || usuario.rol !== "admin") {
    return <Navigate to="/" replace />;
  }

  // Si es admin, muestra el contenido
  return children;
}
