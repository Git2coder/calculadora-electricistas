// components/TareaItem.jsx
export default function TareaItem({ tarea, usuario, onClick }) {
  const puedeAcceder = tarea.nivel <= (usuario?.nivelMaximo || 1);

  return (
    <div
      className={`flex justify-between items-center w-full px-3 py-2 rounded-lg border shadow-sm transition ${
        puedeAcceder
          ? "bg-white hover:bg-blue-50 cursor-pointer"
          : "bg-gray-100 text-gray-500 cursor-not-allowed"
      }`}
      onClick={() => {
        if (puedeAcceder) onClick(tarea);
      }}
    >
      <span className="font-medium truncate">{tarea.nombre}</span>

      {!puedeAcceder && (
        <div className="flex items-center text-xs text-yellow-600 ml-2 shrink-0">
          <span className="mr-1">👑</span>
          {tarea.nivel === 2 ? "Plan Básico" : "Plan Completo"}
        </div>
      )}
    </div>
  );
}
