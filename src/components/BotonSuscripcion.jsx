import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export function BotonSuscripcion() {
  const { usuario } = useAuth(); // Obtenemos el UID del usuario desde el contexto
  const [loading, setLoading] = useState(false);

  const handleSuscripcion = async () => {
    if (!usuario) {
      alert("¡Necesitas iniciar sesión primero!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/createPreference", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: usuario.uid, // Usamos el UID del usuario autenticado
        }),
      });

      const data = await response.json();

      if (data.init_point) {
        // Redirigimos al usuario a Mercado Pago
        window.location.href = data.init_point;
      } else {
        alert("Hubo un problema al crear la preferencia de pago.");
      }
    } catch (error) {
      console.error("Error al procesar el pago:", error);
      alert("Hubo un error al procesar el pago. Intentalo nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSuscripcion}
      className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl transition"
      disabled={loading}
    >
      {loading ? "Redirigiendo..." : "🚀 Quiero suscribirme"}
    </button>
  );
}
