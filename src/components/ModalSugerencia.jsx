import { useState } from "react";
import { db } from "../firebaseConfig"; 
import { collection, addDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion"; 
import { FaTasks, FaRuler, FaInfoCircle, FaClock, FaCheckCircle } from "react-icons/fa";
import confetti from "canvas-confetti";

export default function ModalSugerencia({ onClose }) {
  const [nombre, setNombre] = useState("");
  const [unidad, setUnidad] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tiempoEstimado, setTiempoEstimado] = useState("");
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "sugerencias"), {
        nombre,
        unidad,
        descripcion,
        tiempoEstimado,
        fecha: new Date()
      });
      setEnviado(true);
      setNombre("");
      setUnidad("");
      setDescripcion("");
      setTiempoEstimado("");
      lanzarConfetti();
    } catch (error) {
      console.error("Error al enviar sugerencia:", error);
      alert("Hubo un error. Intenta de nuevo.");
    }
  };

  const lanzarConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      >
        {enviado ? (
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            className="bg-white p-8 rounded-xl shadow-xl text-center space-y-4 max-w-md"
          >
            <FaCheckCircle className="text-green-500 text-6xl mx-auto" />
            <h2 className="text-2xl font-bold text-green-600">¡Gracias!</h2>
            <p className="text-gray-700">Recibimos tu sugerencia 🚀</p>
            <button
              className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={onClose}
            >
              Cerrar
            </button>
          </motion.div>
        ) : (
          <motion.form
            onSubmit={handleSubmit}
            initial={{ y: "-50%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: "-50%", opacity: 0 }}
            className="bg-white p-6 rounded-xl shadow-xl space-y-6 max-w-md w-full"
          >
            <h2 className="text-2xl font-bold text-center text-blue-700">🔎 Sugerir Nueva Tarea</h2>

            <div className="space-y-4">
              {/* Nombre */}
              <div className="flex items-center border rounded p-2">
                <FaTasks className="text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Nombre de la tarea"
                  className="flex-1 outline-none"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </div>

              {/* Unidad */}
              <div className="flex items-center border rounded p-2">
                <FaRuler className="text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Unidad (opcional)"
                  className="flex-1 outline-none"
                  value={unidad}
                  onChange={(e) => setUnidad(e.target.value)}
                />
              </div>

              {/* Tiempo estimado */}
              <div className="flex items-center border rounded p-2">
                <FaClock className="text-gray-400 mr-2" />
                <input
                  type="number"
                  placeholder="Tiempo estimado en minutos"
                  className="flex-1 outline-none"
                  value={tiempoEstimado}
                  onChange={(e) => setTiempoEstimado(e.target.value)}
                />
              </div>

              {/* Descripción */}
              <div className="flex items-start border rounded p-2">
                <FaInfoCircle className="text-gray-400 mr-2 mt-2" />
                <textarea
                  placeholder="Descripción breve o situación de uso"
                  className="flex-1 outline-none resize-none"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  rows="4"
                  required
                />
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button
                type="submit"
                className="px-5 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
              >
                Enviar
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded"
              >
                Cancelar
              </button>
            </div>
          </motion.form>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
