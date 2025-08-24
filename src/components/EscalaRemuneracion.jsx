import { Shield, Sword, Swords, ShieldHalf, Zap, Medal } from "lucide-react"; // Asegurate de tener Lucide

export default function EscalaRemuneracion() {
  const roles = [
    {
      rol: "Ayudante",
      icono: <ShieldHalf size={20} className="text-green-600 inline-block mr-1" />,
      valor: 47890.00, // 24 dias
      descripcion: "Realiza tareas físicas simples.",
    },
    {
      rol: "Medio Oficial",
      icono: <Sword size={20} className="text-blue-500 inline-block mr-1" />,
      valor: 52243.00, // 22 dias
      descripcion: "Realiza conexiones bajo supervisión.",
    },
    {
      rol: "Oficial",
      icono: <Swords size={20} className="text-red-500 inline-block mr-1" />,
      valor: 60492.00, // 19 dias
      descripcion: "Interpreta planos y realiza pruebas. Trabaja con autonomía.",
    },
    {
      rol: "Especializado",
      icono: <Medal size={20} className="text-yellow-500 inline-block mr-1" />,
      valor: 67609.00, // 17 dias
      descripcion: "Domina automatización, armado de tableros complejos y liderazgo técnico en obra.",
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-md p-4 mt-6 border border-gray-200">
      <h2 className="text-lg font-semibold mb-4 text-gray-700">
        💼 Escala de Remuneración por Categoría Técnica 
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        Basado en la Canasta Básica Total de julio 2025 - Gran Buenos Aires. 
      </p>

      <table className="w-full text-sm border-t border-b border-gray-200">
        <thead>
          <tr className="text-left text-gray-600">
            <th className="py-1 w-40">Categoría</th>
            <th className="py-1 w-22">Jornada de 8h/dia</th>
            <th className="py-1">Descripción del rol</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((r, idx) => (
            <tr key={idx} className="border-t border-gray-100">
              <td className="py-2 font-medium text-gray-800">
                {r.icono}
                {r.rol}
              </td>
              <td className="py-2">${r.valor.toLocaleString()}</td>
              <td className="py-2 text-gray-700">{r.descripcion}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="text-xs text-gray-500 mt-4 italic">
         Esta escala simplemente sugiere valores de referencia. Los mismos pueden ajustarse según experiencia, condiciones y ubicación geográfica. Se utiliza como base del calculo un hogar con 3.25 unidades consumidoras o adultos equivalentes, publicado por el INDEC en el informe de prensa mensual para la CBT.
      </p>
    </div>
  );
}
