import { useState, useRef } from "react";

export function TooltipInfo({ texto, text }) {
  const contenido = texto || text; // 👈 acepta ambos

  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const iconRef = useRef();

  const mostrarTooltip = () => {
    const rect = iconRef.current.getBoundingClientRect();
    setCoords({ x: rect.right + 8, y: rect.top + rect.height / 2 });
    setVisible(true);
  };

  const ocultarTooltip = () => setVisible(false);

  return (
    <>
      <span
        ref={iconRef}
        onMouseEnter={mostrarTooltip}
        onMouseLeave={ocultarTooltip}
        className="text-blue-500 cursor-pointer ml-1 text-xs font-bold border border-blue-300 rounded-full px-1"
      >
        i
      </span>

      {visible && (
        <div
          className="fixed z-50 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs shadow-lg border dark:border-gray-600 rounded p-2 w-64"
          style={{
            top: `${coords.y}px`,
            left: `${coords.x}px`,
            transform: "translateY(-50%)"
          }}
        >
          {contenido}
        </div>
      )}
    </>
  );
}