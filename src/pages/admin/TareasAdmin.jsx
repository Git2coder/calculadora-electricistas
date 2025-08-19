import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, setDoc, doc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { FaEdit, FaTrash, FaPause, FaPlay } from "react-icons/fa";
import { tareasPredefinidas } from "../../utils/tareas";

export function TareasAdmin() {
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [formData, setFormData] = useState({});
  const [selectedVariante, setSelectedVariante] = useState("");

  // Campos que no quiero mostrar en el modal
  const HIDDEN_KEYS = ["id", "idOriginal", "pausada", "dependeDe", "variante", "opciones", "tipo"];

  // Orden fijo de campos según el tipo de tarea
  const FIELD_ORDER = ["nombre", "tiempo", "multiplicador", "factorBoca", "valor", "tipo", "unidad", "porcentaje", "descripcion"];

  // Nombres lindos para mostrar en el label
  const LABELS = {
    nombre: "Nombre",
    tiempo: "Tiempo (min)",
    multiplicador: "Multiplicador",
    factorBoca: "Factor Boca",
    valor: "Valor ($)",
    tipo: "Tipo",
    unidad: "Unidad",
    descripcion: "Descripción",
  };

  const cargarTareas = async () => {
    try {
      const ref = collection(db, "tareas");
      const snapshot = await getDocs(ref);
      const existentes = snapshot.docs.map((d) => d.data());

      for (const tarea of tareasPredefinidas) {
        // buscamos por id o nombre
        const yaExiste = existentes.some((t) => t.id === tarea.id);

        if (!yaExiste) {
          // usamos el id de tareas.js como ID en Firestore para evitar duplicados
          await setDoc(doc(db, "tareas", String(tarea.id)), tarea);
          console.log("✅ Tarea agregada:", tarea.nombre);
        } else {
          console.log("⏭ Ya existe, no se agrega:", tarea.nombre);
        }
      }

      alert("Carga completada ✅");
    } catch (error) {
      console.error("❌ Error cargando tareas:", error);
    }
  };

  // Cargar tareas desde Firestore
  const fetchTareas = async () => {
    setLoading(true);
    const querySnapshot = await getDocs(collection(db, "tareas"));
    const data = querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    setTareas(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTareas();
  }, []);

  const abrirModal = (tarea = null) => {
  if (tarea) {
    console.log("🟢 Abriendo modal para:", tarea);

    // Si la tarea viene expandida (con idOriginal)
    if (tarea.idOriginal) {
      const original = tareas.find((x) => x.id === tarea.idOriginal) || tarea;
      setFormData(original);
      setEditando(original.id); // 👈 este SIEMPRE es el id de Firestore
      setSelectedVariante(tarea.variante || "");
    } else {
      // tarea normal (ejemplo Boca)
      const original = tareas.find((x) => x.id === tarea.id) || tarea;
      setFormData(original);
      setEditando(original.id); // 👈 aseguramos que quede seteado
      setSelectedVariante("");
    }
  } else {
    // Nueva tarea
    setFormData({
      nombre: "",
      tiempo: 0,
      multiplicador: 1,
      factorBoca: 1,
      pausada: false,
    });
    setEditando(null);
    setSelectedVariante("");
  }

  setModalOpen(true);
};


  const cerrarModal = () => {
    setModalOpen(false);
    setFormData({});
    setEditando(null);
    setSelectedVariante("");
  };

  // Normaliza nombre global: toma la parte antes del primer " - "
  const nombreBase = (nombre) => {
    if (!nombre && nombre !== "") return nombre;
    return String(nombre).split(" - ")[0];
  };

  const guardarTarea = async () => {
  try {
    const idString = String(editando); // 👈 convierte incluso 0 en "0"
      console.log("💾 Guardar tarea:", { editando, idString, formData });

      if (!idString || idString === "undefined" || idString === "null") {
        alert("⚠️ No se pudo detectar un ID válido de la tarea.");
        return;
      }


    let dataToSave = { ...formData };
    delete dataToSave.id;
    delete dataToSave.idOriginal;

    const ref = doc(db, "tareas", idString);
    await updateDoc(ref, dataToSave);

    cerrarModal();
    await fetchTareas();
    console.log("✅ Guardado exitoso:", idString, dataToSave);
  } catch (error) {
    console.error("❌ Error guardando tarea:", error);
  }
};


  const eliminarTarea = async (id) => {
    if (!confirm("¿Seguro que deseas eliminar esta tarea?")) return;
    try {
      const idString = String(id);
      const ref = doc(db, "tareas", idString);
      await deleteDoc(ref);
      await fetchTareas();
      console.log("✅ Eliminada correctamente:", idString);
    } catch (error) {
      console.error("❌ Error eliminando tarea:", error);
    }
  };

  const togglePausa = async (id, estadoActual) => {
    try {
      const ref = doc(db, "tareas", String(id));
      await updateDoc(ref, { pausada: !estadoActual });
      setTareas((prev) => prev.map((t) => (t.id === id ? { ...t, pausada: !estadoActual } : t)));
    } catch (error) {
      console.error("Error al alternar pausa:", error);
    }
  };

  if (loading) return <p className="p-4">Cargando tareas...</p>;

  const totalTareas = tareas.length;
  const totalActivas = tareas.filter((t) => !t.pausada).length;

  // Expandir variantes como filas independientes (para la tabla) y guardar la 'variante'
  const tareasExpandida = tareas.flatMap((t) => {
    if (t.opciones) {
      return Object.entries(t.opciones).map(([variante, datos]) => ({
        ...t,
        idOriginal: t.id,
        variante,
        nombre: `${t.nombre} - ${variante}`,
        tiempo: datos.tiempo ?? t.tiempo,
        factorBoca: datos.factorBoca ?? t.factorBoca,
      }));
    }
    return { ...t, idOriginal: t.id };
  });

  const tareasFiltradas = tareasExpandida.filter((t) =>
    t.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
        <h1 className="text-2xl font-bold">Administrador de Tareas</h1>
        <button 
          onClick={cargarTareas}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
        >
          Cargar tareas
        </button>

      </div>

      {/* Contadores */}
      <div className="mb-4 text-sm text-gray-700">
        <p>Total de tareas: <strong>{totalTareas}</strong></p>
        <p>Tareas activas: <strong>{totalActivas}</strong></p>
      </div>

      {/* Buscador */}
      <input
        type="text"
        placeholder="Buscar tarea..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="mb-4 w-full border px-3 py-2 rounded"
      />

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">Nombre</th>
              <th className="border px-2 py-1">Tiempo (min)</th>
              <th className="border px-2 py-1">% Boca</th>
              <th className="border px-2 py-1">Tipo</th>
              <th className="border px-2 py-1">Estado</th>
              <th className="border px-2 py-1">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tareasFiltradas.map((tarea) => (
              <tr 
                key={tarea.id + tarea.nombre}
                className={`transition-colors ${tarea.pausada ? "opacity-50" : ""} hover:bg-green-200`}
              >
                <td className="border px-2 py-1">{tarea.nombre}</td>
                <td className="border px-2 py-1">{tarea.tiempo}</td>
                <td className="border px-2 py-1">{tarea.factorBoca}</td>
                <td className="border px-2 py-1">{tarea.tipo}</td>
                <td className="border px-2 py-1">{tarea.pausada ? "En pausa" : "Activa"}</td>
                <td className="border px-2 py-1 flex justify-center gap-2">
                  <button onClick={() => abrirModal(tarea)} className="text-blue-600 hover:text-blue-400">
                    <FaEdit />
                  </button>
                  <button onClick={() => eliminarTarea(tarea.idOriginal)} className="text-red-600 hover:text-red-400">
                    <FaTrash />
                  </button>
                  <button onClick={() => togglePausa(tarea.id, tarea.pausada)} className={`text-green-700 hover:text-yellow-400 ${tarea.pausada ? "opacity-50" : ""}`} title={tarea.pausada ? "Reactivar" : "Pausar"}>
                    {tarea.pausada ? <FaPlay /> : <FaPause />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96 relative">
            <button onClick={cerrarModal} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800">✕</button>
            <h2 className="text-xl font-semibold mb-4">{editando ? "Editar tarea" : "Nueva tarea"}</h2>
      
            {/* Mostrar nombre global solo como referencia */}
            {formData.nombre && (
              <div className="mb-4">
                <label className="block font-semibold">Tarea:</label>
                <p className="p-2 bg-gray-100 rounded">{formData.nombre}</p>
              </div>
            )}

            {/* Selector de variante si hay opciones */}
            {formData.opciones && (
              <select value={selectedVariante} onChange={(e) => setSelectedVariante(e.target.value)} className="w-full border px-3 py-2 rounded mb-3">
                {Object.keys(formData.opciones).map((key) => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </select>
            )}

            <div className="space-y-3">
              {(selectedVariante && formData.opciones ? formData.opciones[selectedVariante] : formData) &&
                FIELD_ORDER.filter((key) =>
                  (selectedVariante && formData.opciones
                    ? formData.opciones[selectedVariante][key] !== undefined
                    : formData[key] !== undefined) &&
                  !HIDDEN_KEYS.includes(key)
                ).map((key) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700">{LABELS[key] || key}</label>

                    <input
                      type={typeof (selectedVariante && formData.opciones ? formData.opciones[selectedVariante][key] : formData[key]) === "number" ? "number" : "text"}
                      value={selectedVariante && formData.opciones ? (formData.opciones[selectedVariante][key] ?? "") : (formData[key] ?? "")}
                      onChange={(e) => {
                        if (selectedVariante && formData.opciones) {
                          setFormData({
                            ...formData,
                            opciones: {
                              ...formData.opciones,
                              [selectedVariante]: {
                                ...formData.opciones[selectedVariante],
                                [key]: typeof formData.opciones[selectedVariante][key] === "number" ? Number(e.target.value) : e.target.value,
                              },
                            },
                          });
                        } else {
                          setFormData({
                            ...formData,
                            [key]: typeof formData[key] === "number" ? Number(e.target.value) : e.target.value,
                          });
                        }
                      }}
                      className="w-full border px-3 py-2 rounded"
                    />
                  </div>
                ))}
            </div>

            <button onClick={guardarTarea} className="mt-4 bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 w-full">Guardar</button>
          </div>
        </div>
      )}
    </div>
  );
}
