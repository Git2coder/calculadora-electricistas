// components/BotonSuscripcion.jsx
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { db } from "../firebaseConfig"; // ajusta la ruta a tu config
import { doc, updateDoc } from "firebase/firestore";

export function BotonSuscripcion() {
  const { usuario } = useAuth();
  const [loading, setLoading] = useState(false);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);

  const handleSuscripcion = async () => {
    if (!usuario) {
      alert("¡Necesitas iniciar sesión primero!");
      return;
    }

    if (!aceptaTerminos) {
      alert("Debes aceptar los términos y condiciones para continuar.");
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ Guardar aceptación de términos en Firestore como subdocumento
      const userRef = doc(db, "usuarios", usuario.uid);
      await updateDoc(userRef, {
        terminos: {
          aceptado: true,
          aceptadoEn: new Date(),
          version: "2025-08-31", // 📌 pon la fecha o versión de tus T&C
        },
      });

      // 2️⃣ Crear la preferencia de pago
      const response = await fetch("/api/createPreference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: usuario.uid }),
      });

      const data = await response.json();

      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        alert("Hubo un problema al crear la preferencia de pago.");
      }
    } catch (error) {
      console.error("Error al procesar el pago:", error);
      alert("Hubo un error al procesar el pago. Intentalo nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 mt-0">
      <label className="flex items-start gap-2 text-sm text-gray-700 max-w-md">
        <input
          type="checkbox"
          checked={aceptaTerminos}
          onChange={(e) => setAceptaTerminos(e.target.checked)}
          className="mt-1"
        />
        <span>
          Confirmo que he leído y acepto los{" "}
          <Link
            to="/terminos"
            className="text-blue-600 underline hover:text-blue-800"
            target="_blank"
            rel="noopener noreferrer"
          >
            Términos y Condiciones
          </Link>
          .
        </span>
      </label>

      <button
        onClick={handleSuscripcion}
        disabled={!aceptaTerminos || loading}
        className={`px-6 py-3 font-semibold text-white rounded-xl transition ${
          !aceptaTerminos || loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {loading ? "Redirigiendo..." : "🚀 Quiero suscribirme"}
      </button>
    </div>
  );
}
