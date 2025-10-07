// src/components/BotonRenovacion.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getFirestore, doc, getDoc } from "firebase/firestore";

/**
 * BotonRenovacion
 * - compact: versión reducida para menú (solo texto y link a planes)
 *
 * Mantiene:
 * - lectura de config.app.suscripcionHabilitada
 * - cálculo de días restantes (soporta Firestore Timestamp)
 * - botón "Ver planes" (redirige a / y setea sessionStorage para scroll)
 * - botón "Renovar ahora" que llama a /api/createPreferenceRenovacion
 *
 * IMPORTANTE: todos los hooks se definen siempre (no condicionales) para evitar errores de reglas de hooks.
 */
export function BotonRenovacion({ compact = false }) {
  const { usuario } = useAuth();

  // hooks (siempre declarados)
  const [loading, setLoading] = useState(false);
  const [suscripcionHabilitada, setSuscripcionHabilitada] = useState(true);
  const [cargandoConfig, setCargandoConfig] = useState(true);
  const [diasRestantes, setDiasRestantes] = useState(null);

  // 1) leo configuración global (si la admin deshabilitó renovaciones)
  useEffect(() => {
    let mounted = true;
    const fetchConfig = async () => {
      try {
        const db = getFirestore();
        const ref = doc(db, "config", "app");
        const snap = await getDoc(ref);
        if (snap.exists() && mounted) {
          const data = snap.data();
          setSuscripcionHabilitada(data.suscripcionHabilitada ?? true);
        }
      } catch (err) {
        console.error("Error leyendo config:", err);
      } finally {
        if (mounted) setCargandoConfig(false);
      }
    };
    fetchConfig();
    return () => {
      mounted = false;
    };
  }, []);

  // 2) calcular días restantes cada vez que cambie usuario.fechaExpiracion
  useEffect(() => {
    if (!usuario) {
      setDiasRestantes(null);
      return;
    }

    const rawExp = usuario.fechaExpiracion;
    if (!rawExp) {
      setDiasRestantes(null);
      return;
    }

    let fechaExp;
    try {
      fechaExp = typeof rawExp?.toDate === "function" ? rawExp.toDate() : new Date(rawExp);
      if (isNaN(fechaExp.getTime())) throw new Error("fecha inválida");
    } catch (e) {
      console.error("No se pudo parsear fechaExpiracion:", e);
      setDiasRestantes(null);
      return;
    }

    const hoy = new Date();
    const diff = Math.ceil((fechaExp - hoy) / (1000 * 60 * 60 * 24));
    setDiasRestantes(diff);
  }, [usuario?.fechaExpiracion, usuario]);

  // Handlers (siempre definidos)
  const handleIrPlanes = () => {
    sessionStorage.setItem("scrollToPlanes", "true");
    // Si ya estamos en home, hacemos scroll inmediato
    if (window.location.pathname === "/") {
      const el = document.getElementById("planes");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }
    // Si no, redirigimos a home y el Home leerá sessionStorage para scrollear
    window.location.href = "/";
  };

  const handleRenovar = async () => {
    if (!usuario?.uid) {
      alert("Necesitás iniciar sesión para renovar.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/createPreferenceRenovacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: usuario.uid }),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => null);
        console.error("Respuesta no OK createPreferenceRenovacion:", res.status, txt);
        alert("No se pudo iniciar la renovación. Intentá nuevamente.");
        setLoading(false);
        return;
      }

      const data = await res.json().catch(() => ({}));
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        console.error("createPreferenceRenovacion: init_point no recibido", data);
        alert("No se pudo iniciar la renovación. Intentá nuevamente.");
      }
    } catch (err) {
      console.error("Error en handleRenovar:", err);
      alert("Hubo un problema al iniciar la renovación.");
    } finally {
      setLoading(false);
    }
  };

  // RENDER: todas las condiciones se aplican después de definir hooks
  // mostramos nada mientras carga config o si no hay usuario
  if (!usuario) return null;
  if (cargandoConfig) return null;

  // si la renovación está deshabilitada globalmente
  if (!suscripcionHabilitada) {
    return (
      <p className="px-4 py-2 text-red-600 font-bold text-sm text-center border rounded-lg">
        🚫 Renovación deshabilitada por el administrador
      </p>
    );
  }

  // si no hay fecha de expiración -> no mostramos
  if (diasRestantes == null) return null;

  // compact (menú): solo link a planes
  if (compact) {
    return (
      <button
        onClick={handleIrPlanes}
        className="block w-full text-left px-4 py-2 text-blue-700 hover:bg-blue-100 font-semibold"
      >
        💎 Renovar suscripción
      </button>
    );
  }

  // si faltan más de 7 días
  if (diasRestantes > 7) {
    return (
      <p className="px-4 py-2 text-gray-500 text-sm text-center">
        ✅ Suscripción activa
      </p>
    );
  }

  // si llegamos aquí: faltan <=7 días (o 0 días)
  return (
    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div className="text-sm text-blue-800">
        <strong>🔔 Tu suscripción vence en {diasRestantes} día{diasRestantes !== 1 && "s"}.</strong>
        <div className="text-gray-700 mt-1">
          Renová para mantener acceso continuo a la calculadora y tus presupuestos.
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleIrPlanes}
          className="px-4 py-2 bg-white border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 transition"
        >
          Ver planes disponibles
        </button>

        <button
          onClick={handleRenovar}
          disabled={loading}
          className={`px-4 py-2 font-semibold rounded-lg text-white transition ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500"
          }`}
        >
          {loading ? "Procesando..." : "💎 Renovar ahora"}
        </button>
      </div>
    </div>
  );
}

export default BotonRenovacion;
