import React, { useState, useRef, useEffect } from "react";
import { FaPlus, FaListUl, FaTrash } from "react-icons/fa";
import { getAuth } from "firebase/auth";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "../../firebaseConfig"; // ajustá la ruta según tu proyecto

const BuscadorTareas = ({
  busqueda,
  setBusqueda,
  indiceSeleccionado,
  setIndiceSeleccionado,
  tareasFiltradas,
  tareasPopulares,
  todasLasTareas, // 👈 lista completa de tareas activas
  agregarTarea,
}) => {
  const [mostrarTodas, setMostrarTodas] = useState(false);

  // 👇 manejo de tareas personalizadas
  const [customTasks, setCustomTasks] = useState([]);
  const [mostrarFormCustom, setMostrarFormCustom] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoTiempo, setNuevoTiempo] = useState("");
  const [nuevoValor, setNuevoValor] = useState("");

  // Estado de créditos
  const [creditos, setCreditos] = useState(null);
  const [userId, setUserId] = useState(null);

  // 👇 cargar créditos desde Firestore al montar
  useEffect(() => {
    const fetchCreditos = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) return;

        setUserId(user.uid);

        const userRef = doc(db, "usuarios", user.uid);
        const snap = await getDoc(userRef);

        if (snap.exists()) {
          const data = snap.data();
          setCreditos(data.creditos ?? 0);
        }
      } catch (err) {
        console.error("Error obteniendo créditos:", err);
      }
    };

    fetchCreditos();
  }, []);

  // 👇 consumir 1 crédito y crear tarea
  const handleAgregarCustom = async () => {
    if (!nuevoNombre || !nuevoTiempo || !nuevoValor) return;
    if (creditos <= 0) return;

    const nueva = {
      id: Date.now(),
      nombre: nuevoNombre,
      tiempo: parseInt(nuevoTiempo) || 0,
      valor: parseInt(nuevoValor) || 0,
      tipo: "administrativa",
      customId: Date.now(),
    };

    setCustomTasks((prev) => [...prev, nueva]);
    setNuevoNombre("");
    setNuevoTiempo("");
    setNuevoValor("");
    setMostrarFormCustom(false);

    try {
      if (userId) {
        const userRef = doc(db, "usuarios", userId);
        await updateDoc(userRef, { creditos: increment(-1) });
        setCreditos((prev) => (prev !== null ? prev - 1 : prev));
      }
    } catch (err) {
      console.error("Error descontando crédito:", err);
    }
  };

  // 👇 sonido cuando se agrega una tarea
  const sonidoAgregar = useRef(new Audio("/sounds/bubble-pop.mp3"));

  const handleAgregar = (tarea) => {
    agregarTarea(tarea);
    sonidoAgregar.current.currentTime = 0;
    sonidoAgregar.current.play();
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-4">
      <h2 className="text-xl font-semibold">📋 Buscar y Agregar Tarea</h2>

      {/* 🔎 Input de búsqueda */}
      <input
        type="text"
        className="w-full p-2 border rounded"
        placeholder="Buscar tarea..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            setIndiceSeleccionado((prev) =>
              Math.min(prev + 1, tareasFiltradas.length - 1)
            );
          } else if (e.key === "ArrowUp") {
            setIndiceSeleccionado((prev) => Math.max(prev - 1, 0));
          } else if (
            e.key === "Enter" &&
            tareasFiltradas[indiceSeleccionado]
          ) {
            handleAgregar(tareasFiltradas[indiceSeleccionado]);
            setBusqueda("");
            setIndiceSeleccionado(-1);
          }
        }}
      />

      {/* 🔽 Resultados de búsqueda */}
      {busqueda && (
        <div className="border rounded bg-white max-h-40 overflow-auto">
          {tareasFiltradas.length === 0 ? (
            <div className="p-2 text-gray-500 text-sm text-center">
              Si no encontras tu tarea podes crear una personalizada dentro del botón del listado completo.
            </div>
          ) : (
            tareasFiltradas.map((tarea, i) => (
              <div
                key={tarea.id}
                className={`p-2 cursor-pointer hover:bg-gray-100 ${
                  i === indiceSeleccionado ? "bg-blue-100 font-semibold" : ""
                }`}
                onClick={() => {
                  handleAgregar(tarea);
                  setBusqueda("");
                  setIndiceSeleccionado(-1);
                }}
              >
                {tarea.nombre}
              </div>
            ))
          )}
        </div>
      )}

      {/* ⭐ Populares */}
      <div className="flex flex-wrap gap-2">
        {tareasPopulares.map((tarea) => (
          <button
            key={tarea.id}
            className={`px-4 py-2 rounded-full text-sm transition-colors duration-200 ${
              tarea.nombre === "Boca"
                ? "bg-yellow-100 text-yellow-900 border border-yellow-400 italic font-medium hover:bg-yellow-200"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
            onClick={() => handleAgregar(tarea)}
          >
            {tarea.nombre === "Boca" ? "⭐ Boca (unidad)" : tarea.nombre}
          </button>
        ))}
      </div>

      {/* 📋 Listado completo de tareas */}
      <div className="mt-4">
        <button
          onClick={() => setMostrarTodas((prev) => !prev)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          <FaListUl />
          {mostrarTodas ? "Ocultar todas las tareas" : "Ver todas las tareas"}
        </button>

        {/* 🔹 Modal con listado y custom */}
        {mostrarTodas && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* Fondo oscuro */}
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setMostrarTodas(false)}
            />
            <div className="relative z-50 w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
              {/* Cabecera */}
              <div className="p-5 border-b bg-gradient-to-r from-blue-500 to-blue-600 text-white flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold">Gestión de tareas</h3>
                  <p className="text-sm opacity-90">
                    Agregá o eliminá tus tareas personalizadas
                  </p>
                </div>
                <button
                  onClick={() => setMostrarTodas(false)}
                  className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30"
                >
                  ✖
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[75vh] space-y-8">
                {/* Formulario nueva personalizada */}
                {mostrarFormCustom && (
                  <div className="bg-blue-50 p-4 rounded-xl shadow-inner border border-blue-200">
                    <h4 className="font-semibold mb-3 flex items-center gap-2 text-blue-700">
                      <FaPlus /> Nueva tarea personalizada
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Nombre
                        </label>
                        <input
                          className="w-full p-2 border rounded-lg"
                          placeholder="Ej: Armado tablero"
                          value={nuevoNombre}
                          onChange={(e) => setNuevoNombre(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Tiempo (min)
                        </label>
                        <input
                          className="w-full p-2 border rounded-lg"
                          placeholder="Ej: 60"
                          value={nuevoTiempo}
                          onChange={(e) => setNuevoTiempo(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Valor fijo ($)
                        </label>
                        <input
                          className="w-full p-2 border rounded-lg"
                          placeholder="Ej: 12000"
                          value={nuevoValor}
                          onChange={(e) => setNuevoValor(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        Créditos disponibles: {creditos}
                      </span>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setMostrarFormCustom(false)}
                          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleAgregarCustom}
                          disabled={customTasks.length >= 3 || creditos <= 0}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          Añadir tarea
                        </button>
                      </div>
                    </div>
                    {creditos <= 0 && (
                      <p className="text-sm text-red-600 mt-2">
                        ⚠️ No tienes más créditos para crear tareas personalizadas.
                      </p>
                    )}
                  </div>
                )}

                {/* Botón toggle agregar */}
                {!mostrarFormCustom && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => setMostrarFormCustom(true)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                    >
                      <FaPlus /> Añadir personalizada
                    </button>
                  </div>
                )}

                {/* Tus tareas personalizadas */}
                {customTasks.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3">
                      Tus tareas personalizadas
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {customTasks.map((t) => (
                        <div
                          key={t.id}
                          className="flex items-center justify-between p-3 rounded-lg border shadow-sm bg-green-50 hover:bg-green-100 cursor-pointer"
                          onClick={() => handleAgregar(t)} // 👈 ahora se añade a la calculadora
                        >
                          <div>
                            <p className="font-medium">{t.nombre}</p>
                            <span className="text-sm text-gray-600">
                              ${t.valor.toLocaleString("es-AR")}
                            </span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // evitar que también se agregue
                              setCustomTasks((prev) => prev.filter((ct) => ct.id !== t.id));
                            }}
                            className="text-red-600 hover:text-red-800"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Listado completo */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">
                    Listado de tareas disponibles
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {todasLasTareas.map((tarea) => (
                      <button
                        key={tarea.id ?? tarea.uid}
                        onClick={() => handleAgregar(tarea)}
                        className="p-4 border rounded-lg bg-white hover:bg-blue-50 shadow-sm text-left"
                      >
                        <span className="font-medium">{tarea.nombre}</span>
                        
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuscadorTareas;
