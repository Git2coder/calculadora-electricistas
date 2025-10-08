// src/components/BotonRenovacion.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getFirestore, doc, getDoc, onSnapshot } from "firebase/firestore";

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
  const [configPlanes, setConfigPlanes] = useState(null);

  // leo configuración global (habilitaciones)
  useEffect(() => {
    const db = getFirestore();
    const refApp = doc(db, "config", "app");
    const refPlanes = doc(db, "config", "planes");

    const unsubApp = onSnapshot(refApp, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setSuscripcionHabilitada(data.suscripcionHabilitada ?? true);
      }
      setCargandoConfig(false); // 👈 agregado
    });

    const unsubPlanes = onSnapshot(refPlanes, (snap) => {
      if (snap.exists()) setConfigPlanes(snap.data());
      setCargandoConfig(false); // 👈 agregado
    });

    return () => {
      unsubApp();
      unsubPlanes();
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

  // 💡 Mostrar mensaje de descuento anticipado si faltan >0 días
  const descuento = configPlanes?.porcentajeDescuentoRenovacion ?? 10;

  const mensajeDescuento =
    diasRestantes > 0
      ? `🔥 Renová antes del vencimiento y obtené un ${descuento}% de descuento en el plan completo.`
      : "⏰ Tu suscripción ha vencido. Renovala para seguir usando la calculadora.";

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
        body: JSON.stringify({
          uid: usuario.uid,
          descuentoAnticipado: diasRestantes > 0, // 👈 envío info al backend
        }),
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

  // si llegamos aquí: faltan <=7 días (o vencido)
  return (
    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div className="text-sm text-blue-800">
        <strong>
          {diasRestantes > 0
            ? `🔔 Tu suscripción vence en ${diasRestantes} día${diasRestantes !== 1 ? "s" : ""}.`
            : "❌ Tu suscripción ha expirado."}
        </strong>
        <div className="text-gray-700 mt-1">{mensajeDescuento}</div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleIrPlanes}
          className="px-4 py-2 bg-white border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 transition"
        >
          Ver planes
        </button>

        <div className="relative inline-block">
          {/* Sticker de descuento si es anticipado */}
          {diasRestantes > 0 && (
            <span className="absolute -top-3 -right-3 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-md rotate-12 z-10">
              {descuento}% OFF
            </span>
          )}

          <button
            onClick={handleRenovar}
            disabled={loading}
            className={`px-4 py-2 font-semibold rounded-lg text-white transition ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500"
            }`}
          >
            {loading
              ? "Procesando..."
              : diasRestantes > 0
              ? "🎟️ Anticipada"
              : "💎 Renovar ahora"}
          </button>
        </div>
      </div>
    </div>
  );

}

export default BotonRenovacion;
