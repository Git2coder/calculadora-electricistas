import React, { useState, useRef, useEffect } from "react";
import { FaPlus, FaListUl, FaTrash } from "react-icons/fa";
import { getAuth } from "firebase/auth";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "../../firebaseConfig"; // ajustá la ruta según tu proyecto
import { useAuth } from "../../context/AuthContext";
import TareaItem from "../TareaItem"; // ruta según tu proyecto
import { catalogoTareas } from "../../utils/tareas";

const BuscadorTareas = ({
  busqueda,
  setBusqueda,
  indiceSeleccionado,
  setIndiceSeleccionado,
  tareasFiltradas,
  tareasPopulares,
  todasLasTareas, // 👈 lista completa de tareas activas
  agregarTarea,
  setPaso
}) => {
  const [mostrarTodas, setMostrarTodas] = useState(false);
  const [categoriaActiva, setCategoriaActiva] = useState(null);
  const [subcategoriaActiva, setSubcategoriaActiva] = useState(null);

  // 👇 manejo de tareas personalizadas
  const [customTasks, setCustomTasks] = useState([]);
  const [mostrarFormCustom, setMostrarFormCustom] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoTiempo, setNuevoTiempo] = useState("");
  const [nuevoValor, setNuevoValor] = useState("");

  // Estado de créditos
  const [creditos, setCreditos] = useState(null);
  const [userId, setUserId] = useState(null);
  const { usuario } = useAuth();

  const handleVolver = () => {
  if (subcategoriaActiva) {
    setSubcategoriaActiva(null);
  } else if (categoriaActiva) {
    setCategoriaActiva(null);
  } else {
    setPaso((prev) => prev - 1);
  }
};

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

  useEffect(() => {
    window.volverBuscador = handleVolver;

    return () => {
      delete window.volverBuscador;
    };
  }, [categoriaActiva, subcategoriaActiva]);

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
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow space-y-4">
      <h2 className="text-xl font-semibold">📋 Buscar y Agregar Tarea</h2>

        {/* CATEGORÍAS */}

        {!categoriaActiva && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {catalogoTareas.categorias.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setCategoriaActiva(cat);
                  setSubcategoriaActiva(null);
                }}
                className="p-4 rounded-lg border
                bg-blue-50 hover:bg-blue-100 hover:scale-105
                dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600
                transition"
                              >
                <div className="text-xl">{cat.icono}</div>
                <div className="font-medium">{cat.nombre}</div>
              </button>
            ))}
          </div>
        )}

        {/* SUBCATEGORÍAS */}

        {categoriaActiva && !subcategoriaActiva && (
          <div className="space-y-3">

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {categoriaActiva.subcategorias.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setSubcategoriaActiva(sub)}
                  className="p-3 rounded
                  bg-gray-100 hover:bg-gray-200
                  dark:bg-gray-700 dark:hover:bg-gray-600
                  transition"
                                  >
                  {sub.nombre}
                </button>
              ))}
            </div>
          </div>
        )}


        {subcategoriaActiva && (
          <div className="space-y-3">            

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {todasLasTareas
                .filter(
                  (t) =>
                    t.categoria === categoriaActiva.id &&
                    t.subcategoria === subcategoriaActiva.id
                )
                .map((tarea) => {
                  const puedeAcceder = tarea.nivel <= (usuario?.nivelMaximo || 1);

                  return (
                    <button
                      key={tarea.id}
                      disabled={!puedeAcceder}
                      onClick={() => handleAgregar(tarea)}
                      className={`p-3 rounded border transition
                      ${puedeAcceder
                        ? "bg-white hover:bg-blue-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600"
                        : "bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500"
                      }`}
                    >
                      {tarea.nombre}
                    </button>
                  );
                })
              }
            </div>
          </div>
        )}
    </div>
)}

export default BuscadorTareas;
