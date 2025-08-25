// pages/admin/Jornales.jsx
import React, { useState, useEffect } from "react";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { motion } from "framer-motion";

export function Jornales() {
  const [cbt, setCbt] = useState("");
  const [guardando, setGuardando] = useState(false);

  const db = getFirestore();
  const docRef = doc(db, "jornales", "valores");

  // Leer CBT actual al cargar
  useEffect(() => {
    const fetchData = async () => {
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setCbt(snap.data().cbt || "");
      }
    };
    fetchData();
  }, []);

  // Guardar CBT en Firestore
  const guardar = async () => {
    if (!cbt) return;
    setGuardando(true);
    await setDoc(docRef, { cbt: parseFloat(cbt) }, { merge: true });
    setGuardando(false);
    alert("CBT actualizada correctamente ✅");
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-xl font-bold mb-4 text-blue-800">
        Configuración de Jornales
      </h1>

      <label className="block text-sm font-medium mb-1">
        Ingresar CBT mensual (ARS)
      </label>
      <input
        type="number"
        value={cbt}
        onChange={(e) => setCbt(e.target.value)}
        className="w-full border rounded px-3 py-2 mb-4"
        placeholder="Ej: 1000"
      />

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={guardar}
        disabled={guardando}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {guardando ? "Guardando..." : "Guardar CBT"}
      </motion.button>
    </div>
  );
}
