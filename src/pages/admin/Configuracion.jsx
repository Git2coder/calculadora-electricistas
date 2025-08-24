// pages/admin/Configuracion.jsx
import React, { useState, useEffect } from "react";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

export function Configuracion() {
  const [config, setConfig] = useState({
    habilitado: true,
    calculadoraHabilitada: true,
    jornalesHabilitados: true,
  });
  const [cargando, setCargando] = useState(true);
  const db = getFirestore();
  const docRef = doc(db, "config", "app");

  // Cargar config actual
  useEffect(() => {
    const fetchConfig = async () => {
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setConfig(snap.data());
      }
      setCargando(false);
    };
    fetchConfig();
  }, []);

  // Guardar cambios
  const actualizarConfig = async (nuevaConfig) => {
    setConfig(nuevaConfig);
    await setDoc(docRef, nuevaConfig, { merge: true });
  };

  if (cargando) return <p className="text-center">Cargando configuración...</p>;

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-xl font-bold mb-4 text-blue-800">Configuración de la app</h1>

      {[
        { key: "habilitado", label: "Sitio habilitado" },
        { key: "calculadoraHabilitada", label: "Sección Calculadora" },
        { key: "jornalesHabilitados", label: "Sección Jornales" },
      ].map((item) => (
        <div key={item.key} className="flex items-center justify-between mb-4">
          <span>{item.label}</span>
          <input
            type="checkbox"
            checked={config[item.key]}
            onChange={(e) =>
              actualizarConfig({ ...config, [item.key]: e.target.checked })
            }
            className="w-5 h-5"
          />
        </div>
      ))}
    </div>
  );
}
