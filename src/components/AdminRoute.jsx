import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function AdminRoute({ children }) {
  const { usuario } = useAuth();

  if (!usuario) return <Navigate to="/login" />;

  // Cambiá este correo por el tuyo
  const correoAdmin = "admindeprueba@gmail.com";

  if (usuario.email !== correoAdmin) {
    return (
      <div className="max-w-md mx-auto mt-10 bg-red-100 p-6 border border-red-400 text-red-700 rounded text-center">
        <h2 className="text-xl font-semibold mb-2">Acceso restringido</h2>
        <p>Solo el administrador puede acceder a esta sección.</p>
      </div>
    );
  }

  return children;
}
