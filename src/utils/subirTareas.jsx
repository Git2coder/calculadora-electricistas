import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { tareasPredefinidas } from "./tareas";

export default function SubirTareas() {
  const handleSubir = async () => {
    try {
      const colRef = collection(db, "tareas");

      for (const tarea of tareasPredefinidas) {
        // 🔑 Subimos el objeto entero, no sólo campos seleccionados
        const docRef = doc(colRef, tarea.id.toString());
        await setDoc(docRef, tarea, { merge: true });
      }

      alert("✅ Tareas subidas correctamente con todos los campos (incluido nivel)");
    } catch (error) {
      console.error("❌ Error al subir tareas:", error);
      alert("Error al subir tareas");
    }
  };

  return (
    <button
      onClick={handleSubir}
      className="px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700"
    >
      Cargar tareas
    </button>
  );
}
