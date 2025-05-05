import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react"; // Asegurate de tener lucide-react instalado
import confetti from "canvas-confetti";


export default function Gracias() {
  const navigate = useNavigate();

  useEffect(() => {
    // Lanzamos el confeti al cargar
    confetti({
        particleCount: 120,
        spread: 100,
        origin: { y: 0.6 },
      });
    
      // 🔊 Reproducir sonido
    const audio = new Audio("../public/sounds/confetti.mp3");
    audio.play().catch((err) => {
      console.log("Error al reproducir el audio:", err);
    });

    // 🔁 Redirigir tras 4 segundos  
    const timer = setTimeout(() => {
      navigate("/calculadora");
    }, 4000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-100 to-blue-200">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center animate-fade-in">
        <CheckCircle className="text-green-500 mx-auto mb-4" size={60} />
        <h1 className="text-3xl font-bold text-blue-700 mb-2">¡Gracias por tu suscripción!</h1>
        <p className="text-gray-700 mb-4">
          Serás redirigido automáticamente a la calculadora...
        </p>
        <p className="text-sm text-gray-500">Si no sucede, <span className="underline cursor-pointer text-green-600" onClick={() => navigate("/calculadora")}>haz clic aquí</span>.</p>
      </div>
    </div>
  );
}
