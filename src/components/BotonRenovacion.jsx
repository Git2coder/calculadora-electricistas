// components/BotonRenovacion.jsx
import React from "react";
import { useAuth } from "../context/AuthContext";

export function BotonRenovacion() {
  const { usuario, fechaExpiracion } = useAuth();

  if (!usuario || !fechaExpiracion) return null;

  const hoy = new Date();
  const diasRestantes = Math.ceil((fechaExpiracion - hoy) / (1000 * 60 * 60 * 24));

  const handleRenovar = async () => {
    try {
      const res = await fetch("/api/createPreferenceRenovacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: usuario.uid }),
      });

      const data = await res.json();

      if (data.init_point) {
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

  // Mostrar el botón SOLO si faltan 7 días o menos
  if (diasRestantes > 7) {
    return (
      <p className="px-4 py-2 text-gray-500 text-sm">
        ✅ Suscripcion activada
      </p>
    );
  }

  return (
    <button
      onClick={handleRenovar}
      className="block w-full text-left px-4 py-2 text-blue-600 hover:bg-gray-100"
    >
      🔄 Renovar suscripción
    </button>
  );
}
