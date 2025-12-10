// TareasSeleccionadas.jsx
import React, { useState, useRef, useEffect } from "react";
import { extrasDisponibles } from "../../utils/extras";
import { FaTrash, FaBroom, FaPen } from "react-icons/fa";
import { Link } from "react-router-dom";
import ReactDOM from "react-dom";

const TareasSeleccionadas = ({
  tareasSeleccionadas,
  modificarTarea,
  actualizarCantidad,
  eliminarTarea,
  limpiarTareas,
  setTareasSeleccionadas,
  toggleExtra
}) => {
  
  // referencia al contenedor del menú
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        // 👇 si hago click fuera del menú → cierro
        setExtraMenuAbierto(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 👇 sonido cuando se agrega una tarea
  const sonidoLimpiar = useRef(new Audio("/sounds/air-blow.mp3")); // 👈 poné tu archivo

  // 🚀 Handler con sonido + limpiar
  const handleLimpiar = () => {
    sonidoLimpiar.current.currentTime = 0; // reinicia
    sonidoLimpiar.current.play();          // reproduce
    limpiarTareas();                       // ejecuta la función original
  };

  // Estado para menú de extras
  const [extraMenuAbierto, setExtraMenuAbierto] = useState(null);
  const [posicionMenu, setPosicionMenu] = useState({ top: 0, left: 0 });

  const abrirMenu = (tareaUid, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPosicionMenu({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
    });
    setExtraMenuAbierto(tareaUid);
  };
    
  return (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow transition-colors">
    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
      🛠️ Tareas Seleccionadas
    </h2>

    {tareasSeleccionadas.length === 0 ? (
      <p className="text-gray-500 dark:text-gray-400">No hay tareas agregadas.</p>
    ) : (
      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 relative">
        {tareasSeleccionadas.map((tarea) => (
          <div
            key={tarea.uid}
            className={`flex flex-wrap items-center justify-between border-b pb-2 gap-2 text-sm 
              border-gray-200 dark:border-gray-700
              ${tarea.origen ? "pl-6 italic" : ""}
              ${tarea.pausada ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {/* Nombre */}
            <span className="flex-1 flex items-center gap-1 relative text-gray-800 dark:text-gray-100">
              {tarea.origen && <span className="text-xs text-blue-400">↳</span>}
              {tarea.nombre}

              {/* Etiqueta pausada */}
              {tarea.pausada && (
                <span className="ml-2 text-xs bg-yellow-300 dark:bg-yellow-600 text-black px-2 py-0.5 rounded">
                  Pausada
                </span>
              )}

              {/* Icono lápiz para administrativas o calculadas */}
              {(tarea.tipo === "administrativa" || tarea.tipo === "calculada") && (
                <div className="flex items-center gap-1">
                  <FaPen
                    className="text-blue-400 hover:text-blue-600 cursor-pointer"
                    title="Este tarea tiene valor editable"
                  />
                </div>
              )}

              {/* Menú de extras */}
              {tarea.tipo !== "administrativa" && (
                <div className="relative">
                  <button
                    onClick={(e) =>
                      extraMenuAbierto === tarea.uid
                        ? setExtraMenuAbierto(null)
                        : abrirMenu(tarea.uid, e)
                    }
                    className="ml-2 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                    title="Marcar condiciones especiales"
                  >
                    ⚙️
                  </button>

                  {extraMenuAbierto === tarea.uid &&
                    ReactDOM.createPortal(
                      <div
                        ref={menuRef}
                        className="absolute bg-white dark:bg-gray-700 border dark:border-gray-600 rounded shadow p-2 z-50 text-gray-800 dark:text-gray-100"
                        style={{
                          top: posicionMenu.top,
                          left: posicionMenu.left,
                        }}
                      >
                        {extrasDisponibles.map((extra) => (
                          <label
                            key={extra.id}
                            className="flex items-center gap-2 text-sm cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={(tarea.extras || []).includes(extra.id)}
                              onChange={() => toggleExtra(tarea.uid, extra.id)}
                            />
                            {extra.nombre}
                          </label>
                        ))}
                      </div>,
                      document.body
                    )}
                </div>
              )}
            </span>

            {/* CONTROLES — NO visibles si la tarea está pausada */}
            {!tarea.pausada && (
              <>
                {/* Botones para variantes */}
                {tarea.opciones && (
                  <div className="flex gap-2 flex-wrap">
                    {Object.entries(tarea.opciones)
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([clave]) => (
                        <button
                          key={clave}
                          className={`px-2 py-1 text-xs rounded transition-colors
                            ${
                              tarea.variante === clave
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                            }`}
                          onClick={() => modificarTarea(tarea.uid, "variante", clave)}
                        >
                          {clave
                            .replaceAll("-", " ")
                            .replace("monofasico", "Monofásico")
                            .replace("trifasico", "Trifásico")}
                        </button>
                      ))}
                  </div>
                )}

                {/* Cantidad */}
                <div className="flex items-center gap-1">
                  <label className="text-gray-500 dark:text-gray-400">
                    {tarea.unidad
                      ? `${tarea.unidad.charAt(0).toUpperCase() + tarea.unidad.slice(1)}:`
                      : "Cant.:"}
                  </label>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => actualizarCantidad(tarea.uid, tarea.cantidad - 1)}
                      className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                      −
                    </button>

                    <input
                      type="number"
                      min="1"
                      value={tarea.cantidad}
                      onChange={(e) =>
                        setTareasSeleccionadas((prev) =>
                          prev.map((t) =>
                            t.uid === tarea.uid
                              ? { ...t, cantidad: Math.max(1, Number(e.target.value)) }
                              : t
                          )
                        )
                      }
                      className="w-14 text-center border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />

                    <button
                      onClick={() => actualizarCantidad(tarea.uid, tarea.cantidad + 1)}
                      className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Input extra */}
                {tarea.requiereInput && (
                  <div className="flex items-center gap-1">
                    <label className="text-gray-500 dark:text-gray-400">Valor TV:</label>
                    <input
                      type="number"
                      className="w-24 p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      value={tarea.valorUnidad || ""}
                      onChange={(e) =>
                        modificarTarea(tarea.uid, "valorUnidad", e.target.value)
                      }
                    />
                  </div>
                )}

                {/* Administrativa → slider + input */}
                {tarea.tipo === "administrativa" && (
                  <div className="flex items-center gap-2">
                    <label className="text-gray-500 dark:text-gray-400">Valor:</label>

                    <input
                      type="range"
                      min={Math.round(tarea.valorSugerido * 0.65)}
                      max={Math.round(tarea.valorSugerido * 1.35)}
                      step={10}
                      value={tarea.valor}
                      onChange={(e) =>
                        modificarTarea(tarea.uid, "valor", Number(e.target.value))
                      }
                      className="flex-1"
                    />

                    <input
                      type="number"
                      className="w-24 p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      value={tarea.valor > 0 ? tarea.valor : tarea.valorSugerido || 0}
                      onChange={(e) =>
                        modificarTarea(tarea.uid, "valor", Number(e.target.value) || 0)
                      }
                    />
                  </div>
                )}

                {/* Eliminar */}
                <button
                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-transform duration-150 hover:scale-150 active:scale-95"
                  onClick={() => eliminarTarea(tarea.uid)}
                  title="Eliminar tarea"
                >
                  <FaTrash />
                </button>
              </>
            )}
          </div>
        ))}

        {/* Vaciar lista */}
        <div className="sticky bottom-0 flex justify-end p-2 bg-gradient-to-t 
                        from-gray-50 via-gray-50/80 to-transparent 
                        dark:from-gray-800 dark:via-gray-800/70 dark:to-transparent">
          <button
            onClick={handleLimpiar}
            className="flex items-center gap-2 px-3 py-1 text-sm 
                       bg-gray-400 dark:bg-gray-700 
                       text-white rounded hover:bg-black dark:hover:bg-gray-600 shadow-md"
          >
            <FaBroom className="text-white" />
            Vaciar lista
          </button>
        </div>
      </div>
    )}
  </div>
);

};

export default TareasSeleccionadas;
