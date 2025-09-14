import React, { useEffect, useState } from "react";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";


export default function Configuracion() {
  const db = getFirestore();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const cargarConfig = async () => {
      try {
        const configRef = doc(db, "config", "app");
        const snap = await getDoc(configRef);
        if (snap.exists()) {
          setConfig(snap.data());
        } else {
          // Inicializamos con valores por defecto
          const defaults = {
            habilitado: true,
            calculadoraHabilitada: true,
            jornalesHabilitado: true,

            // Precios
            precioProfesional: 0,
            precioBasico: 0,

            // Habilitación de planes
            gratisHabilitado: true,
            basicoHabilitado: true,
            profesionalHabilitado: true,
          };
          await setDoc(configRef, defaults);
          setConfig(defaults);
        }
      } catch (err) {
        console.error("Error cargando config:", err);
      } finally {
        setLoading(false);
      }
    };
    cargarConfig();
  }, [db]);

  const actualizarConfig = async (nuevaConfig) => {
    setGuardando(true);
    try {
      const configRef = doc(db, "config", "app");
      await setDoc(configRef, nuevaConfig);
      setConfig(nuevaConfig);
      setMensaje("✅ Configuración guardada correctamente");
      setTimeout(() => setMensaje(""), 3000);
    } catch (err) {
      console.error("Error guardando config:", err);
      setMensaje("❌ Error al guardar la configuración");
    } finally {
      setGuardando(false);
    }
  };

  if (loading) return <p className="p-4">Cargando configuración...</p>;
  if (!config) return <p className="p-4 text-red-600">Error cargando configuración</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">⚙️ Configuración general</h1>

      {/* Switches generales */}
      {[
        { key: "habilitado", label: "Sitio habilitado" },
        { key: "calculadoraHabilitada", label: "Calculadora habilitada" },
        { key: "jornalesHabilitado", label: "Jornales habilitados" },
      ].map((item) => (
        <div key={item.key} className="flex items-center justify-between mb-4">
          <span>{item.label}</span>
          <input
            type="checkbox"
            checked={config[item.key] ?? true}
            onChange={(e) =>
              actualizarConfig({ ...config, [item.key]: e.target.checked })
            }
            className="w-5 h-5"
          />
        </div>
      ))}

      <hr className="my-6" />

      <h2 className="text-xl font-semibold mb-4 text-gray-700">💳 Planes de suscripción</h2>

      {/* Switches planes */}
      {[
        { key: "gratisHabilitado", label: "Plan Gratis" },
        { key: "basicoHabilitado", label: "Plan Básico" },
        { key: "profesionalHabilitado", label: "Plan Profesional" },
      ].map((item) => (
        <div key={item.key} className="flex items-center justify-between mb-4">
          <span>{item.label}</span>
          <input
            type="checkbox"
            checked={config[item.key] ?? true}
            onChange={(e) =>
              actualizarConfig({ ...config, [item.key]: e.target.checked })
            }
            className="w-5 h-5"
          />
        </div>
      ))}

      {/* Precios */}
      <div className="mt-6 space-y-4">
        <label className="block font-medium">💎 Precio Profesional (ARS)</label>
        <input
          type="number"
          value={config.precioProfesional || ""}
          onChange={(e) =>
            actualizarConfig({
              ...config,
              precioProfesional: Number(e.target.value),
            })
          }
          className="w-full border rounded px-3 py-2"
        />

        <label className="block font-medium">📘 Precio Básico (ARS)</label>
        <input
          type="number"
          value={config.precioBasico || ""}
          onChange={(e) =>
            actualizarConfig({
              ...config,
              precioBasico: Number(e.target.value),
            })
          }
          className="w-full border rounded px-3 py-2"
        />
      </div>

      {guardando && <p className="mt-4 text-blue-600">Guardando cambios...</p>}
      {mensaje && <p className="mt-4">{mensaje}</p>}
    </div>
  );
}
