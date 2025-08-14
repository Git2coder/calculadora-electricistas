import { useState, useEffect, useRef } from "react";
import { auth, db } from "../firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function ModalAcceso({ isOpen, onClose }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [experiencia, setExperiencia] = useState("");
  const [conoceTarifa, setConoceTarifa] = useState(null);
  const [tarifaHoraria, setTarifaHoraria] = useState("");

  const modalRef = useRef();

  // Cierre por clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  const handleAuth = async () => {
    try {
      if (isRegister) {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        await setDoc(doc(db, "usuarios", userCredential.user.uid), {
          estado: "activo",
          email,
          ubicacion,
          experiencia,
          conoceTarifa,
          tarifaHoraria: conoceTarifa ? Number(tarifaHoraria) : null,
          fechaRegistro: Timestamp.now()
        });
        alert("Cuenta creada con éxito");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Inicio de sesión exitoso");
      }
      onClose();
    } catch (error) {
      alert(error.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative"
      >
        {/* Botón Cerrar */}
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          ❌
        </button>

        <h2 className="text-2xl font-bold mb-4 text-center">
          {isRegister ? "Crear cuenta" : "Iniciar sesión"}
        </h2>

        <input
          type="email"
          placeholder="Correo electrónico"
          className="border rounded w-full p-2 mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Contraseña"
          className="border rounded w-full p-2 mb-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {isRegister && (
          <>
            <input
              type="text"
              placeholder="Ubicación (ciudad, provincia)"
              className="border rounded w-full p-2 mb-3"
              value={ubicacion}
              onChange={(e) => setUbicacion(e.target.value)}
            />

            <select
              className="border rounded w-full p-2 mb-3"
              value={experiencia}
              onChange={(e) => setExperiencia(e.target.value)}
            >
              <option value="">Años de experiencia</option>
              <option value="0-1">0-1 años</option>
              <option value="2-5">2-5 años</option>
              <option value="5+">Más de 5 años</option>
            </select>

            {/* Pregunta sobre tarifa horaria */}
            <div className="mb-3">
              <p className="mb-2 font-medium">
                ¿Sabés tu tarifa horaria actual?
              </p>
              <div className="flex gap-4">
                <button
                  type="button"
                  className={`px-3 py-1 rounded border ${
                    conoceTarifa === true ? "bg-green-200" : ""
                  }`}
                  onClick={() => setConoceTarifa(true)}
                >
                  Sí
                </button>
                <button
                  type="button"
                  className={`px-3 py-1 rounded border ${
                    conoceTarifa === false ? "bg-red-200" : ""
                  }`}
                  onClick={() => setConoceTarifa(false)}
                >
                  No
                </button>
              </div>
            </div>

            {conoceTarifa && (
              <input
                type="number"
                placeholder="Tarifa horaria en $"
                className="border rounded w-full p-2 mb-3"
                value={tarifaHoraria}
                onChange={(e) => setTarifaHoraria(e.target.value)}
              />
            )}

            {conoceTarifa === false && (
              <p className="text-sm text-gray-600 mb-3">
                No te preocupes, te ayudaremos a calcularla más adelante.
              </p>
            )}
          </>
        )}

        <button
          onClick={handleAuth}
          className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700 transition"
        >
          {isRegister ? "Registrarme" : "Ingresar"}
        </button>

        <p
          className="mt-4 text-center text-sm cursor-pointer text-blue-500 hover:underline"
          onClick={() => setIsRegister(!isRegister)}
        >
          {isRegister
            ? "¿Ya tienes cuenta? Inicia sesión"
            : "¿No tienes cuenta? Regístrate"}
        </p>
      </div>
    </div>
  );
}
