import { useEffect, useState } from "react";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { ShieldHalf, Sword, Swords, Medal } from "lucide-react";

export default function EscalaRemuneracion() {
  const [jornales, setJornales] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const db = getFirestore();
      const ref = doc(db, "jornales", "valores");
      const snap = await getDoc(ref);
      if (snap.exists()) setJornales(snap.data());
    };
    fetchData();
  }, []);

  if (!jornales) {
    return (
      <p className="text-gray-600 dark:text-gray-300">
        Cargando escala de remuneración...
      </p>
    );
  }

  const roles = [
    {
      rol: "Ayudante",
      icono: <ShieldHalf size={20} className="text-green-600 dark:text-green-400 inline-block mr-1" />,
      valor: (jornales.CBT / jornales.diasAyudante).toFixed(2),
      descripcion: "Su objetivo es aprender y ganar experiencia. Trabaja bajo supervisión.",
    },
    {
      rol: "Medio Oficial",
      icono: <Sword size={20} className="text-blue-500 dark:text-blue-400 inline-block mr-1" />,
      valor: (jornales.CBT / jornales.diasMedioOficial).toFixed(2),
      descripcion: "Ejecuta tareas básicas y algunas complejas, supervisado parcialmente.",
    },
    {
      rol: "Oficial",
      icono: <Swords size={20} className="text-red-500 dark:text-red-400 inline-block mr-1" />,
      valor: (jornales.CBT / jornales.diasOficial).toFixed(2),
      descripcion: "Profesional autónomo, realiza instalaciones y reparaciones completas.",
    },
    {
      rol: "Especializado",
      icono: <Medal size={20} className="text-yellow-500 dark:text-yellow-300 inline-block mr-1" />,
      valor: (jornales.CBT / jornales.diasEspecializado).toFixed(2),
      descripcion: "Con formación avanzada, maneja trabajos complejos y especializados.",
    },
  ];

  let fechaLegible = "";
  if (jornales?.fechaActualizacion) {
    const fecha =
      typeof jornales.fechaActualizacion.toDate === "function"
        ? jornales.fechaActualizacion.toDate()
        : new Date(jornales.fechaActualizacion);

    fecha.setMonth(fecha.getMonth() - 1);
    fechaLegible = fecha.toLocaleDateString("es-AR", {
      year: "numeric",
      month: "long",
    });
  }

  return (
    <div
      className="
        bg-white dark:bg-gray-900 
        rounded-xl shadow-md 
        p-4 mt-6 
        border border-gray-200 dark:border-gray-700
      "
    >
      <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">
        💼 Remuneración por Categoría Técnica
      </h2>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Basado en la Canasta Básica Total de {fechaLegible} — Gran Buenos Aires.
      </p>

      {/* TABLA */}
      <table className="w-full text-sm border-t border-b border-gray-200 dark:border-gray-700">
        <thead>
          <tr className="text-left text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800/70">
            <th className="py-2 w-40">Categoría</th>
            <th className="py-2 w-32">Jornada de 8h/día</th>
            <th className="py-2">Descripción del rol</th>
          </tr>
        </thead>

        <tbody>
          {roles.map((r, idx) => (
            <tr
              key={idx}
              className="
                border-t border-gray-100 dark:border-gray-800
                even:bg-gray-50 dark:even:bg-gray-800/40
              "
            >
              <td className="py-2 font-medium text-gray-800 dark:text-gray-200">
                {r.icono}
                {r.rol}
              </td>

              <td className="py-2 text-gray-900 dark:text-gray-100 font-semibold">
                ${Number(r.valor).toLocaleString()}
              </td>

              <td className="py-2 text-gray-700 dark:text-gray-300">
                {r.descripcion}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 italic leading-relaxed">
        Esta escala sugiere valores de referencia. Pueden ajustarse según experiencia,
        condiciones y ubicación geográfica. Se usa como base una CBT equivalente
        a un hogar de 3.25 unidades consumidoras (INDEC).
      </p>
    </div>
  );
}
