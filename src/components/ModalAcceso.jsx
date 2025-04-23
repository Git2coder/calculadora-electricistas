import { useState } from "react";
import { auth } from "../firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { getFirestore, doc, setDoc, Timestamp } from "firebase/firestore"; // asegurate de tener esto arriba
import { sendPasswordResetEmail } from "firebase/auth";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const handleRegistro = async () => {
  try {
    const credenciales = await createUserWithEmailAndPassword(auth, email, password);
    
    const db = getFirestore(); // 🔧 obtener instancia de Firestore

    // 🔐 Guardar usuario en la colección "usuarios"
    await setDoc(doc(db, "usuarios", credenciales.user.uid), {
      correo: email,
      estado: "activo",
      creadoEn: Timestamp.now()
    });

    setModo("login"); // opcional: volver al modo login automáticamente
    alert("Registro exitoso");
  } catch (error) {
    alert("Error al registrar: " + error.message);
  }
};


export function ModalAcceso({ onClose }) {
  const [vista, setVista] = useState("login");
  const [email, setEmail] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");
  const [mostrarClave, setMostrarClave] = useState(false);


  const cambiarVista = (nueva) => {
    setVista(nueva);
    setEmail("");
    setClave("");
    setError("");
  };

  const manejarAccion = async (e) => {
    e.preventDefault();
    try {
      if (vista === "login") {
        await signInWithEmailAndPassword(auth, email, clave);
      } else {
        const credenciales = await createUserWithEmailAndPassword(auth, email, clave);
  
        const db = getFirestore();
        await setDoc(doc(db, "usuarios", credenciales.user.uid), {
          correo: email,
          estado: "activo",
          creadoEn: Timestamp.now()
        });
      }
  
      onClose(); // cerrar modal si fue exitoso
    } catch (err) {
      let mensaje = "Ocurrió un error. Intentá de nuevo.";
    
      if (err.code === "auth/user-not-found") {
        mensaje = "No existe una cuenta con ese correo.";
      } else if (err.code === "auth/wrong-password") {
        mensaje = "La contraseña ingresada es incorrecta.";
      } else if (err.code === "auth/invalid-email") {
        mensaje = "El correo ingresado no es válido.";
      } else if (err.code === "auth/email-already-in-use") {
        mensaje = "Ese correo ya está en uso.";
      } else if (err.code === "auth/weak-password") {
        mensaje = "La contraseña debe tener al menos 6 caracteres.";
      } else if (err.code === "auth/invalid-credential") {
        mensaje = "Correo o contraseña incorrectos.";
      }
    
      setError(mensaje);
    }
    
  };
  const enviarReset = async () => {
    if (!email) {
      return setError("Por favor, ingresá tu correo.");
    }
  
    try {
      await sendPasswordResetEmail(auth, email);
      alert("📧 Te enviamos un correo para restablecer tu contraseña.");
    } catch (err) {
      setError("Error al enviar el correo: " + err.message);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-xl text-gray-500 hover:text-red-500"
        >
          ❌
        </button>

        <div className="flex justify-around mb-4">
          <button
            onClick={() => cambiarVista("login")}
            className={`px-4 py-2 rounded-t-md font-semibold ${
              vista === "login" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            Iniciar sesion
          </button>
          <button
            onClick={() => cambiarVista("registro")}
            className={`px-4 py-2 rounded-t-md font-semibold ${
              vista === "registro" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            Crear cuenta
          </button>
        </div>

        <form onSubmit={manejarAccion} className="space-y-4">
          <input
            type="email"
            placeholder="Correo electrónico"
            className="w-full p-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className="relative">
  <input
    type={mostrarClave ? "text" : "password"}
    placeholder="Contraseña"
    className="w-full p-2 border rounded pr-10"
    value={clave}
    onChange={(e) => setClave(e.target.value)}
    required
  />
  <span
    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 cursor-pointer"
    onClick={() => setMostrarClave(!mostrarClave)}
    title={mostrarClave ? "Ocultar contraseña" : "Mostrar contraseña"}
  >
    {mostrarClave ? <FaEyeSlash /> : <FaEye />}
  </span>
</div>


          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
          >
            {vista === "login" ? "Ingresar" : "Registrarse"}
          </button>
          {vista === "login" && (
            <button
              type="button"
              onClick={enviarReset}
              className="text-blue-600 text-sm underline mt-2 hover:text-blue-800"
            >
              ¿Olvidaste tu contraseña?
            </button>
          )}

        </form>
      </div>
    </div>
  );
}
