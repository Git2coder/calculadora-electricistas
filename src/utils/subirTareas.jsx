// src/utils/subirTareas.jsx
import { collection, setDoc, doc } from "firebase/firestore";
import { db } from "../firebaseConfig"; // Tu configuración correcta
import { tareasPredefinidas } from "../utils/tareas";

// Extraemos las tareas desde el componente (necesitamos adaptarlo)
import React from "react";

export const subirTareasAFirebase = async () => {
  try {
    
    const tareas = tareasPredefinidas;


    if (!Array.isArray(tareas) || tareas.length === 0) {
      console.error("No se encontraron tareas en tareasPredefinidas.");
      return;
    }
console.log("🔍 Tareas para subir:", tareasPredefinidas);

    for (const tarea of tareas) {
      await setDoc(doc(collection(db, "tareas"), tarea.id.toString()), tarea);
    }

    console.log("✅ Tareas subidas correctamente.");
  } catch (error) {
    console.error("❌ Error al subir tareas:", error);
  }
};
