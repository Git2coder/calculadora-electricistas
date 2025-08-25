// components/BotonRenovacion.jsx
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export function BotonRenovacion() {
  const { usuario, fechaExpiracion } = useAuth();
  const [loading, setLoading] = useState(false);

  if (!usuario || !fechaExpiracion) return null;

  const hoy = new Date();
  const diasRestantes = Math.ceil(
    (fechaExpiracion - hoy) / (1000 * 60 * 60 * 24)
  );

  const handleRenovar = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  // Mostrar un aviso si la suscripción sigue activa
  if (diasRestantes > 7) {
    return (
      <p className="px-4 py-2 text-gray-500 text-sm text-center">
        ✅ Suscripción activa (vence en {diasRestantes} días)
      </p>
    );
  }

  // Mostrar botón de renovación
  return (
    <div className="flex flex-col items-center gap-1 mt-1">
      
      <button
        onClick={handleRenovar}
        disabled={loading}
        className={`px-2 py-2 font-semibold text-white rounded-xl transition ${
          loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-green-600"
        }`}
      >
        {loading ? "Procesando..." : "🔄 Renovar suscripción"}
      </button>
    </div>
  );
}
