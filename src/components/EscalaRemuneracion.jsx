import { Shield, Sword, Swords, ShieldHalf, Zap, Medal } from "lucide-react"; // Asegurate de tener Lucide

export default function EscalaRemuneracion() {
  const roles = [
    {
      rol: "Ayudante",
      icono: <ShieldHalf size={20} className="text-green-600 inline-block mr-1" />,
      valor: 46252.62, // 24 dias
      descripcion: "Realiza tareas físicas simples. No toma decisiones técnicas.",
    },
    {
      rol: "Medio Oficial",
      icono: <Sword size={20} className="text-blue-500 inline-block mr-1" />,
      valor: 50457.40, // 22 dias
      descripcion: "Apoya técnicamente al oficial. Arma canalizaciones, cablea, realiza conexiones bajo supervisión.",
    },
    {
      rol: "Oficial",
      icono: <Swords size={20} className="text-red-500 inline-block mr-1" />,
      valor: 55503.15, // 20 dias
      descripcion: "Interpreta planos y realiza pruebas. Trabaja con autonomía.",
    },
    {
      rol: "Especializado",
      icono: <Medal size={20} className="text-yellow-500 inline-block mr-1" />,
      valor: 69378.93, // 16 dias
      descripcion: "Domina automatización, armado de tableros complejos y liderazgo técnico en obra. Ejecuta instalaciones completas.",
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-md p-4 mt-6 border border-gray-200">
      <h2 className="text-lg font-semibold mb-4 text-gray-700">
        💼 Escala de Remuneración por Categoría Técnica 
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        Basado en la Canasta Básica Total de abril 2025 - Gran Buenos Aires ($1.110.063 mensuales por hogar tipo: 4 integrantes). Valor diario mínimo, considerando 24 dias: $46.252,62.
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
        Esta escala sugiere un piso de referencia por categoría técnica. Los valores pueden ajustarse según experiencia, condiciones y ubicación geográfica.
      </p>
    </div>
  );
}
