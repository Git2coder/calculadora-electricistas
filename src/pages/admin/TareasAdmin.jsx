// src/pages/admin/TareasAdmin.jsx
import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig"; // ajustá si tu path es distinto
import { subirTareasAFirebase } from "../../utils/subirTareas";


export function TareasAdmin() {
  const [tareas, setTareas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const obtenerTareas = async () => {
      try {
        const snapshot = await getDocs(collection(db, "tareas"));
        const lista = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTareas(lista);
      } catch (error) {
        console.error("Error al cargar tareas:", error);
      } finally {
        setCargando(false);
      }
    };

    obtenerTareas();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-end mb-4">
        <button
          onClick={subirTareasAFirebase}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Subir tareas a Firestore
        </button>
      </div>

      <h2 className="text-2xl font-bold mb-4">Gestión de Tareas</h2>
      {cargando ? (
        <p>Cargando tareas...</p>
      ) : (
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2">Nombre</th>
              <th className="p-2">Tiempo</th>
              <th className="p-2">Multiplicador</th>
              <th className="p-2">Unidad</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tareas.map((tarea) => (
              <tr key={tarea.id} className="border-t">
                <td className="p-2">{tarea.nombre}</td>
                <td className="p-2">{tarea.tiempo ?? "-"}</td>
                <td className="p-2">{tarea.multiplicador ?? "-"}</td>
                <td className="p-2">{tarea.unidad ?? "-"}</td>
                <td className="p-2">
                  <button className="text-blue-600 hover:underline">Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
