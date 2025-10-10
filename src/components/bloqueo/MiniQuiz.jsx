// MiniQuiz.jsx
import { useState, useEffect } from "react";

// === BANCO DE PREGUNTAS (20 en total) ===
const bancoPreguntas = [
  { pregunta: "¿Qué mide un amperímetro?", opciones: ["Voltaje", "Resistencia", "Corriente"], correcta: "Corriente" },
  { pregunta: "¿Qué ley relaciona tensión, corriente y resistencia?", opciones: ["Ley de Faraday", "Ley de Ohm", "Ley de Ampere"], correcta: "Ley de Ohm" },
  { pregunta: "¿Qué valor tiene un kiloohmio en ohmios?", opciones: ["100", "1000", "10000"], correcta: "1000" },
  { pregunta: "Según AEA 90364. La proteccion bipolar de un circuito IUG deberá ser para una corriente no mayor de:", opciones: ["16A", "20A", "25A"], correcta: "16A" },
  { pregunta: "Según AEA 90364. La proteccion bipolar de un circuito TUG deberá ser para una corriente no mayor de:", opciones: ["16A", "20A", "25A"], correcta: "20A" },
  { pregunta: "Según AEA 90364. ¿Qué colores se emplean para los conductores de linea (fases)?", opciones: ["Rojo, negro y azul", "Verde/amarillo, celeste y marrón", "Marron, negro y rojo"], correcta: "Marron, negro y rojo" },
  { pregunta: "¿Qué significa en un material eléctrico la sigla IP?", opciones: ["Protección contra polvo y agua", "Protección contra fuego", "Protección contra voltaje"], correcta: "Protección contra polvo y agua" },
  { pregunta: "¿Qué es un voltio?", opciones: ["Unidad de potencia", "Unidad de corriente", "Unidad de tensión"], correcta: "Unidad de tensión" },
  { pregunta: "Seleccione según corresponda. Muestra la ruta de distribución de energía eléctrica desde la fuente de alimentación hasta cada carga", opciones: ["Esquema funcional", "Diagrama unifilar", "Topográfico"], correcta: "Diagrama unifilar" },
  { pregunta: "¿Qué diferencia hay entre corriente alterna y corriente continua?", opciones: ["La continua cambia de polaridad", "La alterna cambia de polaridad", "No hay diferencia"], correcta: "La alterna cambia de polaridad" },
  { pregunta: "¿Qué diferencia hay entre un circuito monofásico y uno trifásico?", opciones: ["La cantidad de fases", "El tipo de cable", "El voltaje de neutro"], correcta: "La cantidad de fases" },
  { pregunta: "¿Para qué sirve la toma de tierra en los domicilios?", opciones: ["Para estabilizar la tensión", "Para proteger contra descargas eléctricas indeseadas", "Para medir la resistencia"], correcta: "Para proteger contra descargas eléctricas indeseadas" },
  { pregunta: "¿Cuál de los siguientes dispositivos se utiliza para proteger contra sobrecargas eléctricas?", opciones: ["Interruptor diferencial", "Interruptor termomagnético (ITM)", "Transformador"], correcta: "Interruptor termomagnético (ITM)" },
  { pregunta: "¿Qué significa el término 'aislación eléctrica'?", opciones: ["Separar partes conductoras a diferentes potenciales eléctricos", "Aumentar la corriente", "Reducir el voltaje"], correcta: "Separar partes conductoras a diferentes potenciales eléctricos" },
  { pregunta: "¿Cuál de los siguientes es un color adecuado para conductor PE?", opciones: ["Marrón", "Verde/Amarillo", "Celeste"], correcta: "Verde/Amarillo" },
  { pregunta: "¿Qué significa el término 'TGBT' en instalaciones eléctricas?", opciones: ["Tablero General de Baja Tensión", "Tensión General Básica de Trabajo", "Terminal General de Baja Tensión"], correcta: "Tablero General de Baja Tensión" },
  { pregunta: "¿Cuál es la función principal de un ITM en un circuito eléctrico?", opciones: ["Medir corriente", "Cortar por sobrecarga o cortocircuito", "Detectar fugas de corriente"], correcta: "Cortar por sobrecarga o cortocircuito" },
  { pregunta: "¿Cuál es la función principal de un ID en un circuito eléctrico?", opciones: ["Proteger contra fugas de corriente", "Regular la tensión", "Aumentar la potencia"], correcta: "Proteger contra fugas de corriente" },
  { pregunta: "¿Qué ley explica la inducción electromagnética?", opciones: ["Ley de Ohm", "Ley de Faraday", "Ley de Lenz"], correcta: "Ley de Faraday" },
  { pregunta: "¿Qué unidad se utiliza para medir la potencia eléctrica?", opciones: ["Voltios", "Watts", "Amperios"], correcta: "Watts" },
];

export default function MiniQuiz() {
  const [preguntas, setPreguntas] = useState([]);
  const [index, setIndex] = useState(0);
  const [puntuacion, setPuntuacion] = useState(0);
  const [finalizado, setFinalizado] = useState(false);

  // Seleccionar 4 preguntas aleatorias
  useEffect(() => {
    const seleccionadas = bancoPreguntas.sort(() => 0.5 - Math.random()).slice(0, 4);
    setPreguntas(seleccionadas);
  }, []);

  if (preguntas.length === 0) return <p>Cargando quiz...</p>;

  const pregunta = preguntas[index];

  const responder = (op) => {
    if (op === pregunta.correcta) setPuntuacion((p) => p + 1);
    if (index + 1 < preguntas.length) setIndex(index + 1);
    else setFinalizado(true);
  };

  if (finalizado) {
    let mensajeFinal = "";
    if (puntuacion === 0) mensajeFinal = "💡 ¡No pasa nada! Cada error es una chispa de aprendizaje.";
    else if (puntuacion <= 2) mensajeFinal = "🔌 Buen intento y no te rindas.";
    else if (puntuacion === 3) mensajeFinal = "⚡ ¡Muy bien! Tenés una buena base, seguí así.";
    else mensajeFinal = "🔥 ¡Sos un crack de la electricidad!";

    return (
      <div className="space-y-3 text-center">
        <p className="text-xl font-bold text-black-700">{mensajeFinal}</p>
        <p className="text-gray-700">
          Tu puntuación: <span className="font-semibold">{puntuacion}/{preguntas.length}</span>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="font-semibold text-gray-700">{pregunta.pregunta}</p>
      {pregunta.opciones.map((op) => (
        <button
          key={op}
          onClick={() => responder(op)}
          className="block w-full bg-yellow-100 hover:bg-yellow-200 text-black py-2 rounded-lg transition"
        >
          {op}
        </button>
      ))}
      <p className="text-sm text-gray-500 mt-2">
        Pregunta {index + 1} de {preguntas.length}
      </p>
    </div>
  );
}
