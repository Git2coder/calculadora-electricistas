import { useCart } from "../context/CartContext";
import { FaBolt, FaTools, FaCheckCircle } from "react-icons/fa";

const productos = [
  {
    id: 1,
    nombre: "Kit Bomba Alternada",
    descripcion: "Instalá en una sola visita sin errores",
    precio: 45000,
    beneficios: ["Ahorra tiempo", "Evita errores", "Instalación rápida"],
    icon: <FaBolt />,
  },
  {
    id: 2,
    nombre: "Kit Tablero Domiciliario",
    descripcion: "Armado rápido y profesional",
    precio: 38000,
    beneficios: ["Orden profesional", "Menos retrabajo", "Conexión clara"],
    icon: <FaTools />,
  },
  {
    id: 3,
    nombre: "Kit Automatización Tanque",
    descripcion: "Solución completa lista para instalar",
    precio: 52000,
    beneficios: ["Listo para usar", "Menos visitas", "Mayor confiabilidad"],
    icon: <FaCheckCircle />,
  },
];

export default function Tienda() {
  const { addToCart } = useCart();

  return (
    <div className="min-h-screen px-6 py-10 text-white bg-gradient-to-b from-gray-900 to-gray-950">
      
      {/* HEADER */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-3">
          Soluciones para Electricistas
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          No compres materiales sueltos. Comprá soluciones pensadas para trabajar más rápido,
          evitar errores y ganar más.
        </p>
      </div>

      {/* GRID */}
      <div className="grid md:grid-cols-3 gap-8">
        {productos.map((p) => (
          <div
            key={p.id}
            className="relative bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition group"
          >
            {/* badge */}
            <div className="absolute top-4 right-4 bg-green-500 text-black text-xs px-2 py-1 rounded">
              Recomendado
            </div>

            {/* icono */}
            <div className="text-green-400 text-3xl mb-4">
              {p.icon}
            </div>

            {/* título */}
            <h2 className="text-xl font-semibold mb-2 group-hover:text-green-400 transition">
              {p.nombre}
            </h2>

            {/* descripción */}
            <p className="text-gray-400 text-sm mb-4">
              {p.descripcion}
            </p>

            {/* beneficios */}
            <ul className="mb-4 space-y-1 text-sm">
              {p.beneficios.map((b, i) => (
                <li key={i} className="flex items-center gap-2 text-gray-300">
                  ✔ {b}
                </li>
              ))}
            </ul>

            {/* precio */}
            <p className="text-2xl font-bold mb-4">
              ${p.precio.toLocaleString()}
            </p>

            {/* botón */}
            <button
              onClick={() => addToCart(p)}
              className="w-full bg-green-500 hover:bg-green-600 text-black py-2 rounded-lg font-semibold transition"
            >
              Agregar al carrito
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}