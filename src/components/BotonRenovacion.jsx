// components/BotonRenovacion.jsx
import React from "react";
import { useAuth } from "../context/AuthContext";

export function BotonRenovacion() {
  const { usuario } = useAuth();

  const handleRenovar = async () => {
    try {
      const res = await fetch("/api/createPreferenceRenovacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: usuario.uid }), // enviamos el UID al backend
      });

      const data = await res.json();

      if (data.init_point) {
        // Redirigir al checkout de Mercado Pago
        window.location.href = data.init_point;
      } else {
        alert("No se pudo iniciar la renovación.");
        console.error("Respuesta inesperada:", data);
      }
    } catch (error) {
      console.error("❌ Error iniciando renovación:", error);
      alert("Hubo un problema al iniciar la renovación.");
    }
  };

  return (
    <button
      onClick={handleRenovar}
      className="block w-full text-left px-4 py-2 text-blue-600 hover:bg-gray-100"
    >
      🔄 Renovar suscripción
    </button>
  );
}
