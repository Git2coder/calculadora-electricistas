import { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig"; // ajustá si tu ruta difiere
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function ModalAcceso({ isOpen, onClose }) {
  const [modo, setModo] = useState("login"); // "login" | "registro"
  const [registroExitoso, setRegistroExitoso] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  // Campos comunes
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Campos de registro
  const [nombre, setNombre] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [tipoTrabajo, setTipoTrabajo] = useState("");
  const [experiencia, setExperiencia] = useState(""); // ej: "0-1", "2-5"
  const [grado, setGrado] = useState(""); // "Idóneo/Electricista" | "Técnico" | "Ingeniero"
  const [sabeTarifa, setSabeTarifa] = useState(""); // "Si" | "No"
  const [valorBoca, setValorBoca] = useState(""); // opcional

  // Cerrar con ESC
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Resetear mensajes y loading cuando abre
  useEffect(() => {
    if (isOpen) setError("");
  }, [isOpen]);

  if (!isOpen) return null;

  const validarRegistro = () => {
    if (!nombre.trim()) return "El nombre es obligatorio.";
    if (!email.trim()) return "El email es obligatorio.";
    if (!password.trim()) return "La contraseña es obligatoria.";
    if (!ubicacion.trim()) return "La ubicación es obligatoria.";
    if (!tipoTrabajo.trim()) return "Seleccioná el tipo de trabajo.";
    if (!experiencia.trim()) return "Indicá tus años de experiencia.";
    if (!grado.trim()) return "Seleccioná tu grado profesional.";
    if (!sabeTarifa.trim()) return "Respondé si sabés tu tarifa horaria.";
    return "";
  };

 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      if (modo === "registro") {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "usuarios", cred.user.uid), {
          nombre,
          ubicacion,
          tipoTrabajo,
          experiencia,
          grado,
          sabeTarifa,
          valorBoca,
          email,
          creadoEn: serverTimestamp(),
          estado: "activo",
          rol: "usuario",
        });

        setRegistroExitoso(true);
        setTimeout(() => {
          onClose();
          setRegistroExitoso(false);
        }, 2000);
      } else {
        // 🟢 Login
        await signInWithEmailAndPassword(auth, email, password);
        onClose();
      }
    } catch (err) {
      console.error("Error en acceso:", err);
      setError("No se pudo completar la acción. Intenta nuevamente.");
    }

    setCargando(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose} // clic fuera cierra
    >
      <div
    className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
    onClick={(e) => e.stopPropagation()} // evita cerrar si clic adentro
  >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="inline-flex rounded-lg bg-gray-100 p-1">
            <button
              className={`px-4 py-2 text-sm font-medium rounded-md transition ${
                modo === "login" ? "bg-white shadow" : "text-gray-600"
              }`}
              onClick={() => setModo("login")}
              type="button"
            >
              Iniciar sesión
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium rounded-md transition ${
                modo === "registro" ? "bg-white shadow" : "text-gray-600"
              }`}
              onClick={() => setModo("registro")}
              type="button"
            >
              Crear cuenta
            </button>
          </div>

          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
            type="button"
            aria-label="Cerrar"
            title="Cerrar"
          >
            ✖
          </button>
        </div>

        <h2 className="mb-4 text-center text-2xl font-semibold">
          {modo === "login" ? "Bienvenido" : "Registrate"}
        </h2>

        {error && (
          <div className="mb-4 rounded-md bg-red-100 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* EMAIL / PASSWORD siempre */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Correo electrónico<span className="text-red-500"> *</span>
            </label>
            <input
              type="email"
              className="w-full rounded-md border p-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Contraseña<span className="text-red-500"> *</span>
            </label>
            <input
              type="password"
              className="w-full rounded-md border p-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={modo === "login" ? "current-password" : "new-password"}
            />
          </div>

          {modo === "registro" && (
            <>
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Nombre completo<span className="text-red-500"> *</span>
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border p-2"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  autoComplete="name"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Ubicación (Ciudad, País)<span className="text-red-500"> *</span>
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border p-2"
                  value={ubicacion}
                  onChange={(e) => setUbicacion(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Tipo de trabajo<span className="text-red-500"> *</span>
                  </label>
                  <select
                    className="w-full rounded-md border p-2"
                    value={tipoTrabajo}
                    onChange={(e) => setTipoTrabajo(e.target.value)}
                  >
                    <option value="">Seleccionar…</option>
                    <option value="Doméstico">Doméstico</option>
                    <option value="Comercial">Comercial</option>
                    <option value="Industrial">Industrial</option>
                    <option value="Mixto">Mixto</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Años de experiencia<span className="text-red-500"> *</span>
                  </label>
                  <select
                    className="w-full rounded-md border p-2"
                    value={experiencia}
                    onChange={(e) => setExperiencia(e.target.value)}
                  >
                    <option value="">Seleccionar…</option>
                    <option value="0-1">0-1</option>
                    <option value="2-5">2-5</option>
                    <option value="5-10">5-10</option>
                    <option value="10+">10+</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Grado profesional<span className="text-red-500"> *</span>
                  </label>
                  <select
                    className="w-full rounded-md border p-2"
                    value={grado}
                    onChange={(e) => setGrado(e.target.value)}
                  >
                    <option value="">Seleccionar…</option>
                    <option value="Idóneo/Electricista">Idóneo/Electricista</option>
                    <option value="Técnico">Técnico</option>
                    <option value="Ingeniero">Ingeniero</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    ¿Sabés tu tarifa horaria?<span className="text-red-500"> *</span>
                  </label>
                  <div className="flex gap-3">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name="sabeTarifa"
                        value="Si"
                        checked={sabeTarifa === "Si"}
                        onChange={(e) => setSabeTarifa(e.target.value)}
                      />
                      <span>Sí</span>
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name="sabeTarifa"
                        value="No"
                        checked={sabeTarifa === "No"}
                        onChange={(e) => setSabeTarifa(e.target.value)}
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Valor estimado de la “boca” en tu zona (opcional)
                </label>
                <input
                  type="number"
                  className="w-full rounded-md border p-2"
                  value={valorBoca}
                  onChange={(e) => setValorBoca(e.target.value)}
                  min="0"
                  inputMode="numeric"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={cargando}
            className={`w-full py-2 px-4 rounded-lg text-white font-bold ${
              cargando ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {cargando
              ? "Procesando..."
              : modo === "registro"
              ? "Crear cuenta"
              : "Iniciar sesión"}
          </button>

          <p className="pt-2 text-center text-sm">
            {modo === "login" ? (
              <>
                ¿No tenés cuenta?{" "}
                <button
                  type="button"
                  className="text-blue-600 underline"
                  onClick={() => setModo("registro")}
                >
                  Registrate
                </button>
              </>
            ) : (
              <>
                ¿Ya tenés cuenta?{" "}
                <button
                  type="button"
                  className="text-blue-600 underline"
                  onClick={() => setModo("login")}
                >
                  Iniciá sesión
                </button>
              </>
            )}
          </p>
        </form>
        {registroExitoso && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center animate-fadeIn">
              <div className="text-green-600 text-6xl mb-4 animate-bounce">✔️</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Registro exitoso!</h2>
              <p className="text-gray-600">Tu cuenta fue creada y el acceso está habilitado.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
