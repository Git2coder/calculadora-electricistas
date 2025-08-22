// components/BotonRenovacion.jsx
import React from "react";
import { useAuth } from "../context/AuthContext"; // 👈 para obtener el usuario actual

export function BotonRenovacion() {
  const { usuario } = useAuth(); // usuario.uid viene de Firebase

  const handleRenovar = async () => {
    try {
      const res = await fetch("/api/createPreferenceRenovacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: usuario.uid }), // 👈 enviamos el UID al backend
      });

      const data = await res.json();

      if (data.id) {
        // Redirigimos al checkout de MP
        window.location.href = `https://www.mercadopago.com.ar/checkout/v1/redirect?preference-id=${data.id}`;
      } else {
        alert("No se pudo iniciar la renovación.");
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
