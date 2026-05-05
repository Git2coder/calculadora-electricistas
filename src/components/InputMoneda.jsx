import { useState, useEffect } from "react";

export default function InputMoneda({ value, onChange, placeholder }) {
  const [display, setDisplay] = useState("");

  // 🔹 Formatear número a ARS
  const formatear = (num) => {
    if (num === "" || num === null || isNaN(num)) return "";
    return Number(num).toLocaleString("es-AR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  // 🔹 Convertir texto → número real
  const parsear = (str) => {
    if (!str) return 0;
    const limpio = str.replace(/\./g, "").replace(",", ".");
    return parseFloat(limpio) || 0;
  };

  // 🔹 Sync cuando cambia desde afuera
  useEffect(() => {
    setDisplay(formatear(value));
  }, [value]);

  const handleChange = (e) => {
    const raw = e.target.value;

    // solo números y separadores
    const limpio = raw.replace(/[^\d.,]/g, "");

    setDisplay(limpio);

    const numero = parsear(limpio);
    onChange(numero);
  };

  return (
    <div className="relative">
      <span className="absolute left-2 top-2 text-gray-500 dark:text-gray-300">
        $
      </span>
      <input
        type="text"
        value={display}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full pl-6 p-2 border rounded mt-1 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      />
    </div>
  );
}