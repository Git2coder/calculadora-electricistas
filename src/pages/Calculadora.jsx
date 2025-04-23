import CalculadoraCompleta from "../components/CalculadoraCompleta";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";

export function Calculadora() {
  const { usuario, fechaCreacion, fechaExpiracion } = useAuth();
  const [diasRestantes, setDiasRestantes] = useState(null);

  useEffect(() => {
    if (fechaExpiracion) {
      const ahora = new Date();
      const dias = Math.ceil((new Date(fechaExpiracion) - ahora) / (1000 * 60 * 60 * 24));
      setDiasRestantes(dias);
    } else if (fechaCreacion) {
      const ahora = new Date();
      const dias = 7 - Math.floor((ahora - fechaCreacion) / (1000 * 60 * 60 * 24));
      setDiasRestantes(dias);
    }
  }, [fechaExpiracion, fechaCreacion]);

  if (!usuario) return null;

  if (diasRestantes !== null && diasRestantes < 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          Tu período de prueba ha finalizado
        </h2>
        <p className="mb-6 text-gray-700">
          Para seguir usando la calculadora, podés ponerte en contacto con nosotros para activar una suscripción.
        </p>
        <a
          href="https://wa.me/5491123456789"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full shadow inline-block"
        >
          Contactar por WhatsApp
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-1 px-4">
      {diasRestantes !== null && diasRestantes <= 7 && (
        <div className="bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500 px-4 py-3 rounded mb-6 text-sm shadow">
          <strong>¡Estás usando el período de prueba!</strong> Te quedan <b>{diasRestantes}</b> día(s) para seguir usando la calculadora de forma gratuita.
        </div>
      )}
      <CalculadoraCompleta />
    </div>
  );
}
