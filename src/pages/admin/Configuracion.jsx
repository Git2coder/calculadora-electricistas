import React, { useState, useEffect } from "react";
import { db } from "../../firebaseConfig";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";

export default function Configuracion() {
  const [loading, setLoading] = useState(true);
  const [precioBasico, setPrecioBasico] = useState("");
  const [precioProfesional, setPrecioProfesional] = useState("");
  const [porcentajeDescuentoRenovacion, setPorcentajeDescuentoRenovacion] = useState("");
  const [calculadoraHabilitada, setCalculadoraHabilitada] = useState(true);
  const [habilitado, setHabilitado] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const docRef = doc(db, "config", "planes");
        const snap = await getDoc(docRef);

        if (snap.exists()) {
          const data = snap.data();
          setPrecioBasico(data.precioBasico ?? "");
          setPrecioProfesional(data.precioProfesional ?? "");
          setPorcentajeDescuentoRenovacion(data.porcentajeDescuentoRenovacion ?? "");
          setCalculadoraHabilitada(data.calculadoraHabilitada ?? true);
          setHabilitado(data.habilitado ?? true);
        } else {
          console.warn("El documento config/planes no existe. Creando uno nuevo...");
          await setDoc(docRef, {
            precioBasico: 0,
            precioProfesional: 0,
            porcentajeDescuentoRenovacion: 0,
            calculadoraHabilitada: true,
            habilitado: true,
          });
        }
      } catch (error) {
        console.error("Error al cargar configuración:", error);
        alert("❌ No se pudieron cargar los datos de configuración.");
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  const handleGuardarCambios = async () => {
    try {
      if (!precioBasico || !precioProfesional) {
        alert("Por favor, completá los precios antes de guardar.");
        return;
      }

      const docRef = doc(db, "config", "planes");
      await updateDoc(docRef, {
        precioBasico: Number(precioBasico),
        precioProfesional: Number(precioProfesional),
        porcentajeDescuentoRenovacion: Number(porcentajeDescuentoRenovacion) || 0,
        calculadoraHabilitada,
        habilitado,
      });

      alert("✅ Los cambios se guardaron correctamente.");
    } catch (error) {
      console.error("Error al guardar configuración:", error);
      alert("❌ Hubo un error al guardar los cambios. Intentalo de nuevo.");
    }
  };

  if (loading) {
    return <p className="text-center text-gray-500">Cargando configuración...</p>;
  }

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-2xl p-8 space-y-6 border border-gray-200">
      <h2 className="text-2xl font-bold text-blue-700 text-center mb-6">
        ⚙️ Configuración General
      </h2>

      {/* --- PRECIOS DE PLANES --- */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">💰 Precios de planes</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plan Básico ($)
            </label>
            <input
              type="number"
              value={precioBasico}
              onChange={(e) => setPrecioBasico(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2"
              placeholder="Ej: 55"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plan Completo ($)
            </label>
            <input
              type="number"
              value={precioProfesional}
              onChange={(e) => setPrecioProfesional(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2"
              placeholder="Ej: 70"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descuento Renovación (%)
            </label>
            <input
              type="number"
              value={porcentajeDescuentoRenovacion}
              onChange={(e) => setPorcentajeDescuentoRenovacion(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2"
              placeholder="Ej: 10"
            />
          </div>
        </div>
      </div>

      {/* --- HABILITACIONES GENERALES --- */}
      <div className="space-y-4 mt-8">
        <h3 className="text-lg font-semibold text-gray-800">🔒 Habilitaciones del sitio</h3>

        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={calculadoraHabilitada}
              onChange={(e) => setCalculadoraHabilitada(e.target.checked)}
              className="h-5 w-5"
            />
            <span className="text-gray-700">Habilitar calculadora</span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={habilitado}
              onChange={(e) => setHabilitado(e.target.checked)}
              className="h-5 w-5"
            />
            <span className="text-gray-700">Habilitar sitio completo</span>
          </label>
        </div>
      </div>

      {/* --- BOTÓN GUARDAR --- */}
      <div className="text-center mt-8">
        <button
          onClick={handleGuardarCambios}
          className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 transition"
        >
          💾 Guardar cambios
        </button>
      </div>
    </div>
  );
}
