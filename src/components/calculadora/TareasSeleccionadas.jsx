// TareasSeleccionadas.jsx
import React, { useState, useRef, useEffect } from "react";
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
  extrasDisponibles,
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
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">🛠️ Tareas Seleccionadas</h2>

      {tareasSeleccionadas.length === 0 ? (
        <p className="text-gray-500">No hay tareas agregadas.</p>
      ) : (
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 relative">
          {tareasSeleccionadas.map((tarea) => (
            <div
              key={tarea.uid}
              className={`flex flex-wrap items-center justify-between border-b pb-2 gap-2 text-sm ${
                tarea.origen ? "pl-6 italic" : ""
              } ${tarea.pausada ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {/* Nombre y extras */}
              <span className="flex-1 flex items-center gap-1 relative">
                {tarea.origen && <span className="text-xs text-blue-400">↳</span>}
                {tarea.nombre}
                {tarea.pausada && (
                  <span className="ml-2 text-xs bg-yellow-300 px-2 py-0.5 rounded">
                    Pausada
                  </span>
                )}

                {/* Si es administrativa o calculada → mostrar input + icono lápiz */}
                {(tarea.tipo === "administrativa" || tarea.tipo === "calculada") && (
                  <div className="flex items-center gap-1">
                    
                    {/* ✏️ Lápiz con tooltip */}
                    <FaPen
                      className="text-blue-400 hover:text-blue-600 cursor-pointer"
                      title="Este tarea tiene valor editable"
                    />
                  </div>
                )}

                {/* ⚙️ Extras SOLO si no es administrativa */}
                {tarea.tipo !== "administrativa" && (
                  <div className="relative">
                    <button
                      onClick={(e) =>
                        extraMenuAbierto === tarea.uid
                          ? setExtraMenuAbierto(null)
                          : abrirMenu(tarea.uid, e)
                      }
                      className="ml-2 text-xs text-gray-500 hover:text-blue-600"
                      title="Marcar condiciones especiales"
                    >
                      ⚙️
                    </button>

                    {/* Renderizo portal solo cuando el menú de esa tarea está abierto */}
                    {extraMenuAbierto === tarea.uid &&
                      ReactDOM.createPortal(
                        <div
                          ref={menuRef} // 👈 referencia aquí
                          className="absolute bg-white border rounded shadow p-2 z-50"
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

              {/* 👉 Si está pausada, no muestro controles */}
              {!tarea.pausada && (
                <>
                  {/* Selector si la tarea tiene opciones */}
                  {tarea.opciones && (
                    <div className="flex gap-2 flex-wrap">
                      {Object.entries(tarea.opciones)
                        .sort(([a], [b]) => a.localeCompare(b)) // 🔄 ordena claves
                        .map(([clave, config]) => (
                          <button
                            key={clave}
                            className={`px-2 py-1 text-xs rounded ${
                              tarea.variante === clave
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 text-gray-700"
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
                    <label className="text-gray-500">
                      {tarea.unidad
                        ? `${tarea.unidad.charAt(0).toUpperCase() + tarea.unidad.slice(1)}:`
                        : "Cant.:"}
                    </label>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => actualizarCantidad(tarea.uid, tarea.cantidad - 1)}
                        className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
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
                        className="w-14 text-center border border-gray-300 rounded-md"
                      />
                      <button
                        onClick={() => actualizarCantidad(tarea.uid, tarea.cantidad + 1)}
                        className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        +
                      </button>
                    </div>
                  </div>
        
                  {/* Input adicional si requiere */}
                  {tarea.requiereInput && (
                    <div className="flex items-center gap-1">
                      <label className="text-gray-500">Valor TV:</label>
                      <input
                        type="number"
                        className="w-24 p-1 border rounded"
                        value={tarea.valorUnidad || ""}
                        onChange={(e) =>
                          modificarTarea(tarea.uid, "valorUnidad", e.target.value)
                        }
                      />
                    </div>
                  )}
                  
                  {/* Si es administrativa, valor directo */}
                  {tarea.tipo === "administrativa" && (
                    <div className="flex items-center gap-1">
                      <label className="text-gray-500">Valor:</label>
                      <input
                        type="number"
                        className="w-24 p-1 border rounded"
                        value={tarea.valor}
                        onChange={(e) => modificarTarea(tarea.uid, "valor", e.target.value)}
                      />
                    </div>
                  )}

                  {/* Eliminar */}
                  <button
                    className="text-red-600 transition-transform duration-150 hover:scale-150 active:scale-95"
                    onClick={() => eliminarTarea(tarea.uid)}                    
                    title="Eliminar tarea"
                  >
                    <FaTrash />
                  </button>
                </>
              )}
            </div>
          ))}

          {/* Botón limpiar lista */}
          <div className="sticky bottom-0 flex justify-end p-2 bg-gradient-to-t from-gray-50 via-gray-50/80 to-transparent">
            <button
              onClick={handleLimpiar}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-400 text-white rounded hover:bg-black shadow-md"
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
