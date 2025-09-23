import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { FaEdit, FaTrash, FaPause, FaPlay } from "react-icons/fa";
import { tareasPredefinidas } from "../../utils/tareas";
import { getAuth } from "firebase/auth";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export function TareasAdmin() {
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [formData, setFormData] = useState({});
  const [selectedVariante, setSelectedVariante] = useState("");
  const [tab, setTab] = useState("todas"); // "administrativas", "calculadas", "todas"
  const [tarifaHoraria, setTarifaHoraria] = useState(0);
  const [votables, setVotables] = useState([]);
  const [selected, setSelected] = useState([]);

  // Campos que no quiero mostrar en el modal
  const HIDDEN_KEYS = [
    "id",
    "idOriginal",
    "pausada",
    "dependeDe",
    "variante",
    "opciones",
    "tipo",
  ];

  // Orden fijo de campos según el tipo de tarea
  const FIELD_ORDER = [
    "nombre",
    "tiempo",
    "multiplicador",
    "factorBoca",
    "valor",
    "tipo",
    "unidad",
    "porcentaje",
    "descripcion",
  ];

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

  // =======================
  // Utils
  // =======================

  const fmtPesos = (n) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(n || 0));

  const sortTareas = (arr) => {
    if (!sortConfig.key) return arr;
    return [...arr].sort((a, b) => {
      const x = a[sortConfig.key] ?? 0;
      const y = b[sortConfig.key] ?? 0;
      // for strings we want locale compare
      if (typeof x === "string" && typeof y === "string") {
        return sortConfig.direction === "asc"
          ? x.localeCompare(y)
          : y.localeCompare(x);
      }
      return sortConfig.direction === "asc" ? x - y : y - x;
    });
  };

  const exportarExcel = () => {
    const workbook = XLSX.utils.book_new();

    // función auxiliar para generar cada hoja
    const crearHoja = (tareasFiltradas, nombreHoja) => {
      const data = tareasFiltradas.map((t) => ({
        Nombre: t.nombre,
        Tiempo: t.tiempo ?? "-",
        "Factor Boca": t.factorBoca ?? "-",
        Precio: fmtPesos(
          t.tipo === "administrativa"
            ? t.valor || 0
            : t.tipo === "calculada"
            ? ((t.valorUnidad || 0) * (t.porcentaje || 0)) / 100
            : t.dependeDe === "Boca"
            ? (() => {
                const baseBoca = tareas.find(
                  (x) =>
                    x.nombre === "Boca" ||
                    x.id === "Boca" ||
                    x.idOriginal === "Boca"
                );
                const valorBoca =
                  baseBoca && baseBoca.tiempo
                    ? (baseBoca.tiempo / 60) *
                      (baseBoca.multiplicador ?? 1) *
                      tarifaHoraria
                    : 0;
                return valorBoca * (t.factorBoca || 1);
              })()
            : ((t.tiempo || 0) / 60) * (t.multiplicador ?? 1) * tarifaHoraria
        ),
        Estado: t.pausada ? "En pausa" : "Activa",
        Actualización: t.updatedAt
          ? new Date(t.updatedAt).toLocaleDateString()
          : "-",
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(workbook, worksheet, nombreHoja);
    };

    // Dependientes
    crearHoja(
      tareasExpandida.filter(
        (t) => t.tipo !== "administrativa" && t.tipo !== "calculada"
      ),
      "Dependientes"
    );

    // Administrativas
    crearHoja(
      tareasExpandida.filter((t) => t.tipo === "administrativa"),
      "Administrativas"
    );

    // Calculadas
    crearHoja(
      tareasExpandida.filter((t) => t.tipo === "calculada"),
      "Calculadas"
    );

    // Descargar
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), "tareas.xlsx");
  };

  // =======================
  // Cargar tareas + votables
  // =======================
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

    const [snapTareas, snapVotables] = await Promise.all([
      getDocs(collection(db, "tareas")),
      getDocs(collection(db, "tareas_votables")),
    ]);

    // guardamos los IDs de tareas en votación
    const votables = snapVotables.docs
      .filter((d) => d.data().activa)
      .map((d) => {
        const v = d.data();
        return `${String(v.tareaId)}_${v.opcion || "default"}`;
      });

    // solo los datos de tareas, sin marcar enVotacion todavía
    const data = snapTareas.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    setTareas(data);
    // 👉 guardá votables en estado para usar después en tareasExpandida
    setVotables(votables);

    setLoading(false);
  };


  useEffect(() => {
    fetchTareas();
  }, []);

  useEffect(() => {
    const fetchTarifa = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) return;

        const userRef = doc(db, "usuarios", user.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();
          if (data.tarifaHoraria) setTarifaHoraria(data.tarifaHoraria);
        }
      } catch (err) {
        console.error("Error cargando tarifaHoraria:", err);
      }
    };

    fetchTarifa();
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
      await updateDoc(ref, { ...dataToSave, updatedAt: new Date().toISOString() });

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

  // ✅ Habilitar tarea en votación
  const habilitarVotacion = async (tarea, variante = null) => {
    try {
      const idDoc = `${tarea.id}_${variante || "default"}`;
      const ahora = new Date();
      const hasta = new Date();
      hasta.setDate(ahora.getDate() + 7);

      await setDoc(doc(db, "tareas_votables", idDoc), {
        tareaId: tarea.id,
        opcion: variante,
        activa: true,
        desde: ahora.toISOString(),
        hasta: hasta.toISOString(),
      });

      await fetchTareas();
    } catch (e) {
      console.error("Error habilitando tarea:", e);
    }
  };

  // ✅ Quitar tarea de votación
  const quitarDeVotacion = async (tarea, variante = null) => {
    try {
      const idDoc = `${tarea.id}_${variante || "default"}`;
      await deleteDoc(doc(db, "tareas_votables", idDoc));
      await fetchTareas();
    } catch (e) {
      console.error("Error quitando tarea:", e);
    }
  };


  // ✅ Checkbox de selección
  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    // 🔹 Generar TODOS los ids (una por cada variante si existen)
    const allIds = tareas.flatMap((t) => {
      if (t.opciones) {
        return Object.keys(t.opciones).map((variante) => `${t.id}_${variante}`);
      } else {
        return [`${t.id}_default`];
      }
    });

    // 🔹 Si ya están todos seleccionados → limpiar
    if (selected.length === allIds.length) {
      setSelected([]);
    } else {
      setSelected(allIds);
    }
  };

  // ✅ Acciones masivas
  const ejecutarAccionMasiva = async (accion) => {
    const promises = selected.map(async (key) => {
      const [id, variante] = key.split("_");
      const tarea = tareas.find((t) => String(t.id) === id);
      if (!tarea) return;

      if (accion === "votar") {
        return habilitarVotacion(tarea, variante === "default" ? null : variante);
      }
      if (accion === "quitar") {
        return quitarDeVotacion(tarea, variante === "default" ? null : variante);
      }
      if (accion === "eliminar") {
        return eliminarTarea(tarea.idOriginal || tarea.id);
      }
      if (accion === "pausar") {
        return togglePausa(tarea.id, tarea.pausada);
      }
    });

    await Promise.all(promises); // 👈 ejecuta todo en paralelo
    await fetchTareas(); // 👈 refresca solo 1 vez
    setSelected([]);
  };
  
  if (loading) return <p className="p-4">Cargando tareas...</p>;

  const totalTareas = tareas.length;
  const totalActivas = tareas.filter((t) => !t.pausada).length;

  // Expandir variantes como filas independientes (para la tabla) y guardar la 'variante'
  const tareasExpandida = tareas.flatMap((t) => {
  if (t.opciones) {
    return Object.entries(t.opciones).map(([variante, datos]) => {
      const docId = `${t.id}_${variante}`;
      const enVotacion = votables.includes(docId);
      return {
        ...t,
        idOriginal: t.id,
        variante,
        nombre: `${t.nombre} - ${variante}`,
        tiempo: datos.tiempo ?? t.tiempo,
        factorBoca: datos.factorBoca ?? t.factorBoca,
        valor: datos.valor ?? t.valor,
        porcentaje: datos.porcentaje ?? t.porcentaje,
        dependeDe: datos.dependeDe ?? t.dependeDe,
        enVotacion,
      };
    });
  }
  const docId = `${t.id}_default`;
  const enVotacion = votables.includes(docId);
  return { ...t, idOriginal: t.id, enVotacion };
});


  const tareasFiltradas = tareasExpandida
    .filter((t) => t.nombre.toLowerCase().includes(busqueda.toLowerCase()))
    .filter((t) => {
      if (tab === "administrativas") return t.tipo === "administrativa";
      if (tab === "calculadas") return t.tipo === "calculada";
      if (tab === "todas") return t.tipo !== "administrativa" && t.tipo !== "calculada";
      return true;
    });

  // Ahora sí ordenamos las tareas filtradas
  const sortedTareas = sortTareas(tareasFiltradas);

  const handleSortHeader = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

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
      <p>
        Total de tareas: <strong>{totalTareas}</strong>
      </p>
      <p>
        Tareas activas: <strong>{totalActivas}</strong>
      </p>
    </div>

    {/* Buscador */}
    <input
      type="text"
      placeholder="Buscar tarea..."
      value={busqueda}
      onChange={(e) => setBusqueda(e.target.value)}
      className="mb-4 w-full border px-3 py-2 rounded"
    />

    {/* Tabs */}
    <div className="flex gap-4 mb-4">
      <button
        className={`px-4 py-2 rounded ${
          tab === "todas" ? "bg-blue-600 text-white" : "bg-gray-200"
        }`}
        onClick={() => setTab("todas")}
      >
        Dependientes
      </button>
      <button
        className={`px-4 py-2 rounded ${
          tab === "administrativas" ? "bg-blue-600 text-white" : "bg-gray-200"
        }`}
        onClick={() => setTab("administrativas")}
      >
        Administrativas
      </button>
      <button
        className={`px-4 py-2 rounded ${
          tab === "calculadas" ? "bg-blue-600 text-white" : "bg-gray-200"
        }`}
        onClick={() => setTab("calculadas")}
      >
        Calculadas
      </button>
      <button
        onClick={exportarExcel}
        className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700"
      >
        📥 Exportar a Excel
      </button>
    </div>

    {/* Botón de acción masiva */}
    {selected.length > 0 && (
      <div className="mb-3 flex gap-2">
        <button
          onClick={() => ejecutarAccionMasiva("votar")}
          className="px-4 py-2 bg-indigo-600 text-white rounded"
        >
          🗳️ Mandar seleccionados a votación
        </button>
        <button
          onClick={() => ejecutarAccionMasiva("quitar")}
          className="px-4 py-2 bg-gray-500 text-white rounded"
        >
          ❌ Quitar de votación
        </button>
        <button
          onClick={() => ejecutarAccionMasiva("pausar")}
          className="px-4 py-2 bg-yellow-500 text-white rounded"
        >
          ⏸️ Pausar/Reactivar
        </button>
        <button
          onClick={() => ejecutarAccionMasiva("eliminar")}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          🗑️ Eliminar
        </button>
      </div>
    )}

    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-300 text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">
              <input
                type="checkbox"
                checked={selected.length === sortedTareas.length}
                onChange={toggleSelectAll}
              />
            </th>
            <th className="border px-2 py-1">Nombre</th>
            <th
              className="border px-2 py-1 cursor-pointer"
              onClick={() => handleSortHeader("tiempo")}
            >
              Tiempo (min)
            </th>

            {tab === "todas" && (
              <th
                className="border px-2 py-1 cursor-pointer"
                onClick={() => handleSortHeader("factorBoca")}
              >
                % Boca
              </th>
            )}

            {tab === "todas" && (
              <th
                className="border px-2 py-1 cursor-pointer"
                onClick={() => handleSortHeader("precio")}
              >
                Precio ($)
              </th>
            )}

            {tab === "administrativas" && (
              <th className="border px-2 py-1">Precio ($)</th>
            )}

            {tab === "calculadas" && (
              <th className="border px-2 py-1">Porcentaje (%)</th>
            )}

            <th className="border px-2 py-1">Estado</th>
            <th className="border px-2 py-1">Actualización</th>
            <th className="border px-2 py-1">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {sortedTareas.map((tarea) => {
            const tareaKey = `${tarea.id}_${tarea.variante || "default"}`; // 👈 clave única
            // 👇 Lógica de cálculo según tipo
            let precio = 0;
            if (tarea.tipo === "administrativa") {
              precio = tarea.valor || 0;
            } else if (tarea.tipo === "calculada") {
              precio =
                ((tarea.valorUnidad || 0) * (tarea.porcentaje || 0)) / 100;
            } else if (tarea.dependeDe === "Boca") {
              const baseBoca = tareas.find(
                (x) =>
                  x.nombre === "Boca" ||
                  x.id === "Boca" ||
                  x.idOriginal === "Boca"
              );
              const valorBoca =
                baseBoca && baseBoca.tiempo
                  ? (baseBoca.tiempo / 60) *
                    (baseBoca.multiplicador ?? 1) *
                    tarifaHoraria
                  : 0;
              precio = valorBoca * (tarea.factorBoca || 1);
            } else {
              precio =
                ((tarea.tiempo || 0) / 60) *
                (tarea.multiplicador ?? 1) *
                tarifaHoraria;
            }

            return (
              // Lo que sombrea el renglon y pone en gris tarea pausada
              <tr key={tareaKey} className={`hover:bg-indigo-200 transition-colors ${tarea.pausada ? "bg-gray-200 text-gray-500" : ""
                }`}
              >

                {/* Checkbox */}
              <td className="border px-2 py-1 text-center">
                <input
                  type="checkbox"
                  checked={selected.includes(tareaKey)}
                  onChange={() => toggleSelect(tareaKey)}
                />
              </td>

                {/* Nombre */}
                <td className="border px-2 py-1">{tarea.nombre}</td>

                {/* Tiempo */}
                <td className="border px-2 py-1 text-center">
                  {tarea.tiempo ?? "-"}
                </td>

                {/* Dependientes → % Boca y Precio */}
                {tab === "todas" && (
                  <>
                    <td className="border px-2 py-1 text-center">
                      {tarea.factorBoca ?? "-"}
                    </td>
                    <td className="border px-2 py-1 text-right">
                      {fmtPesos(precio)}
                    </td>
                  </>
                )}

                {/* Administrativas → solo Precio */}
                {tab === "administrativas" && (
                  <td className="border px-2 py-1 text-right">
                    {tarea.valor ? fmtPesos(tarea.valor) : "—"}
                  </td>
                )}

                {/* Calculadas → solo Porcentaje */}
                {tab === "calculadas" && (
                  <td className="border px-2 py-1 text-center">
                    {tarea.porcentaje ? `${tarea.porcentaje}%` : "—"}
                  </td>
                )}

                {/* Estado */}
                <td className="border px-2 py-1">
                  {tarea.enVotacion ? (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">
                      🎭 En votación
                    </span>
                  ) : tarea.pausada ? (
                    "En pausa"
                  ) : (
                    "Activa"
                  )}
                </td>

                {/* Actualizacion */}
                <td className="border px-2 py-1">
                  {tarea.updatedAt
                    ? new Date(tarea.updatedAt).toLocaleDateString()
                    : "-"}
                </td>

                {/* Acciones */}
                <td className="border px-2 py-1 flex justify-center gap-2">
                  <button
                    onClick={() => abrirModal(tarea)}
                    className="text-blue-600 hover:text-blue-400"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() =>
                      eliminarTarea(tarea.idOriginal || tarea.id)
                    }
                    className="text-red-600 hover:text-red-400"
                  >
                    <FaTrash />
                  </button>
                  <button
                    onClick={() => togglePausa(tarea.id, tarea.pausada)}
                    className={`text-green-700 hover:text-yellow-400 ${
                      tarea.pausada ? "opacity-50" : ""
                    }`}
                    title={tarea.pausada ? "Reactivar" : "Pausar"}
                  >
                    {tarea.pausada ? <FaPlay /> : <FaPause />}
                  </button>

                  {tarea.enVotacion ? (
                    <button
                      onClick={() => quitarDeVotacion(tarea)}
                      className="text-gray-600 hover:text-gray-400"
                    >
                      ❌
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        habilitarVotacion(tarea, tarea.variante || null)
                      }
                      className="text-purple-600 hover:text-purple-400"
                    >
                      🗳️
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
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
