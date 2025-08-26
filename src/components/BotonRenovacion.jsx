// components/BotonRenovacion.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getFirestore, doc, getDoc } from "firebase/firestore";

export function BotonRenovacion() {
  const { usuario, fechaExpiracion } = useAuth();
  const [loading, setLoading] = useState(false);
  const [suscripcionHabilitada, setSuscripcionHabilitada] = useState(true);
  const [cargandoConfig, setCargandoConfig] = useState(true);

  // 🔎 Leer configuración desde Firestore
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const db = getFirestore();
        const ref = doc(db, "config", "app");
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setSuscripcionHabilitada(snap.data().suscripcionHabilitada);
        }
      } catch (err) {
        console.error("❌ Error leyendo config:", err);
      } finally {
        setCargandoConfig(false);
      }
    };
    fetchConfig();
  }, []);

  if (!usuario || !fechaExpiracion) return null;
  if (cargandoConfig) return <p className="text-gray-500 text-sm">⏳ Cargando...</p>;

  // Si la suscripción está bloqueada globalmente desde admin
  if (!suscripcionHabilitada) {
    return (
      <p className="px-4 py-2 text-red-600 font-bold text-sm text-center border rounded-lg">
        🚫 Renovación
      </p>
    );
  }

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
        ✅ Suscripción activa
      </p>
    );
  }

  // Mostrar botón de renovación
  return (
    <div className="flex flex-col items-center gap-2 mt-2">
      
      <button
        onClick={handleRenovar}
        disabled={loading}
        className={`px-4 py-2 font-semibold text-white rounded-xl transition ${
          loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-green-600"
        }`}
      >
        {loading ? "Procesando..." : "💎 Renovar suscripción"}
      </button>
    </div>
  );
}
