import { useState, useEffect } from "react";
import { auth, db } from "../firebaseConfig";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function ModalAcceso({ onClose }) {
  const [modo, setModo] = useState("login"); // "login" o "registro"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Estados para registro asistente
  const [paso, setPaso] = useState(1);
  const [nombre, setNombre] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [tipoTrabajo, setTipoTrabajo] = useState("");
  const [tarifaHoraria, setTarifaHoraria] = useState("");

  // Intentar detectar ubicación automáticamente
  useEffect(() => {
    if (modo === "registro") {
      navigator.geolocation?.getCurrentPosition(
        async (pos) => {
          try {
            const res = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&localityLanguage=es`
            );
            const data = await res.json();
            if (data.city && data.countryName) {
              setUbicacion(`${data.city}, ${data.countryName}`);
            }
          } catch (e) {
            console.log("No se pudo obtener ubicación automática");
          }
        },
        () => console.log("Usuario rechazó geolocalización")
      );
    }
  }, [modo]);

  // Guardar nuevo usuario
  const registrarUsuario = async () => {
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "usuarios", userCred.user.uid), {
        uid: userCred.user.uid,
        email,
        nombre,
        ubicacion,
        tipoTrabajo,
        tarifaHoraria: parseFloat(tarifaHoraria) || 0,
        fechaRegistro: new Date().toISOString()
      });
      onClose();
    } catch (error) {
      alert("Error al registrar: " + error.message);
    }
  };

  // Login normal
  const iniciarSesion = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onClose();
    } catch (error) {
      alert("Error al iniciar sesión: " + error.message);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">
          {modo === "login" ? "Iniciar sesión" : "Registro de nuevo usuario"}
        </h2>

        {/* LOGIN */}
        {modo === "login" && (
          <>
            <input
              type="email"
              placeholder="Correo electrónico"
              className="w-full mb-3 p-2 border rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Contraseña"
              className="w-full mb-4 p-2 border rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              onClick={iniciarSesion}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Entrar
            </button>
            <p className="mt-4 text-center text-sm">
              ¿No tenés cuenta?{" "}
              <button
                className="text-blue-600 underline"
                onClick={() => setModo("registro")}
              >
                Registrate
              </button>
            </p>
          </>
        )}

        {/* REGISTRO ASISTENTE */}
        {modo === "registro" && (
          <div>
            {paso === 1 && (
              <>
                <p className="mb-2">¿Cuál es tu correo electrónico?</p>
                <input
                  type="email"
                  className="w-full mb-3 p-2 border rounded"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <p className="mb-2">Elegí una contraseña segura:</p>
                <input
                  type="password"
                  className="w-full mb-4 p-2 border rounded"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                  onClick={() => setPaso(2)}
                >
                  Siguiente
                </button>
              </>
            )}
            {paso === 2 && (
              <>
                <p className="mb-2">¿Cómo te llamás?</p>
                <input
                  type="text"
                  className="w-full mb-4 p-2 border rounded"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
                <div className="flex justify-between">
                  <button className="text-gray-500" onClick={() => setPaso(1)}>Atrás</button>
                  <button
                    className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                    onClick={() => setPaso(3)}
                  >
                    Siguiente
                  </button>
                </div>
              </>
            )}
            {paso === 3 && (
              <>
                <p className="mb-2">¿Dónde trabajás normalmente?</p>
                <input
                  type="text"
                  className="w-full mb-4 p-2 border rounded"
                  value={ubicacion}
                  onChange={(e) => setUbicacion(e.target.value)}
                  placeholder="Ej: Buenos Aires, Argentina"
                />
                <div className="flex justify-between">
                  <button className="text-gray-500" onClick={() => setPaso(2)}>Atrás</button>
                  <button
                    className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                    onClick={() => setPaso(4)}
                  >
                    Siguiente
                  </button>
                </div>
              </>
            )}
            {paso === 4 && (
              <>
                <p className="mb-2">¿Qué tipo de trabajos realizás?</p>
                <select
                  className="w-full mb-4 p-2 border rounded"
                  value={tipoTrabajo}
                  onChange={(e) => setTipoTrabajo(e.target.value)}
                >
                  <option value="">Seleccionar...</option>
                  <option value="residencial">Residencial</option>
                  <option value="comercial">Comercial</option>
                  <option value="industrial">Industrial</option>
                  <option value="mixto">Mixto</option>
                </select>
                <div className="flex justify-between">
                  <button className="text-gray-500" onClick={() => setPaso(3)}>Atrás</button>
                  <button
                    className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                    onClick={() => setPaso(5)}
                  >
                    Siguiente
                  </button>
                </div>
              </>
            )}
            {paso === 5 && (
              <>
                <p className="mb-2">Ingresá tu tarifa horaria estimada ($ARS):</p>
                <input
                  type="number"
                  className="w-full mb-4 p-2 border rounded"
                  value={tarifaHoraria}
                  onChange={(e) => setTarifaHoraria(e.target.value)}
                />
                <div className="flex justify-between">
                  <button className="text-gray-500" onClick={() => setPaso(4)}>Atrás</button>
                  <button
                    className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                    onClick={registrarUsuario}
                  >
                    Finalizar registro
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
