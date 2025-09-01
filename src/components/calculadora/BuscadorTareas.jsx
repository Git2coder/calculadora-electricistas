import React, { useState } from "react";
import { FaPlus, FaListUl } from "react-icons/fa";

const BuscadorTareas = ({
  busqueda,
  setBusqueda,
  indiceSeleccionado,
  setIndiceSeleccionado,
  tareasFiltradas,
  tareasPopulares,
  todasLasTareas, // 👈 nuevo: lista completa de tareas activas
  agregarTarea,
  setMostrarModalSugerencia,
}) => {
  const [mostrarTodas, setMostrarTodas] = useState(false);

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
            agregarTarea(tareasFiltradas[indiceSeleccionado]);
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
              Si la tarea es de tipo administrativa envianos un mensaje para
              poder añadirla a la lista.
            </div>
          ) : (
            tareasFiltradas.map((tarea, i) => (
              <div
                key={tarea.id}
                className={`p-2 cursor-pointer hover:bg-gray-100 ${
                  i === indiceSeleccionado ? "bg-blue-100 font-semibold" : ""
                }`}
                onClick={() => {
                  agregarTarea(tarea);
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
            onClick={() => agregarTarea(tarea)}
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

        {mostrarTodas && (
          <div className="mt-3 border rounded max-h-60 overflow-auto">
            {todasLasTareas.map((tarea) => (
              <div
                key={tarea.id}
                className="p-2 cursor-pointer hover:bg-gray-100"
                onClick={() => agregarTarea(tarea)}
              >
                {tarea.nombre}
              </div>
            ))}

            {/* 👉 Botón sugerencia dentro del listado */}
            <div className="text-center mt-4">
              <button
                onClick={() => setMostrarModalSugerencia(true)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500"
              >
                <FaPlus className="inline mr-2" />
                ¿No encontraste tu tarea? Sugerir nueva
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuscadorTareas;
