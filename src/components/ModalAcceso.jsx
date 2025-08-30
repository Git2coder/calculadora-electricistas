import React, { useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth } from "../firebaseConfig"; // ajusta la ruta si corresponde

export default function ModalAcceso({ isOpen, onClose }) {
  if (!isOpen) return null;

  const db = getFirestore();

  // --- UI state ---
  const [modo, setModo] = useState("login"); // "login" | "registro"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [registroExitoso, setRegistroExitoso] = useState(false);

  // --- Login state ---
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // --- Registro: paso a paso ---
  const totalSteps = 4;
  const [step, setStep] = useState(1);

  // Paso 1
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Contraseñas visibles y coincidentes
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  // Paso 2
  const [tipoTrabajo, setTipoTrabajo] = useState("Doméstico");
  const [experiencia, setExperiencia] = useState("0-1");
  const [grado, setGrado] = useState("Idóneo");
  const [especialidad, setEspecialidad] = useState("");
  const [modalidadTrabajo, setModalidadTrabajo] = useState("Independiente");

  // Paso 3
  const [provincia, setProvincia] = useState("");
  const [ciudad, setCiudad] = useState("");

  // Paso 4
  const [sabeTarifa, setSabeTarifa] = useState("No"); // "Si" | "No"
  const [valorBoca, setValorBoca] = useState("");

  // Cerrar con ESC
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // --- Acciones ---
  const handleLogin = async () => {
    setError("");
    setMensaje("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      onClose();
    } catch (err) {
      console.error(err);
      setError("No se pudo iniciar sesión. Verificá tu email/contraseña.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!loginEmail) {
      setError("Ingresá tu email para recuperar la contraseña.");
      return;
    }
    setError("");
    setMensaje("");
    try {
      await sendPasswordResetEmail(auth, loginEmail);
      setMensaje("📧 Revisá tu correo para restablecer la contraseña.");
    } catch (err) {
      console.error(err);
      setError("No se pudo enviar el correo de recuperación.");
    }
  };

  const handleRegister = async () => {
    setError("");
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;

      await setDoc(doc(db, "usuarios", uid), {
        uid,
        nombre,
        email,
        tipoTrabajo,
        experiencia,
        grado,
        especialidad,
        modalidadTrabajo,
        provincia,
        ciudad,
        conoceTarifa: sabeTarifa === "Si",
        valorBoca: valorBoca !== "" ? Number(valorBoca) : null,
        presupuestosGenerados: 0,
        creadoEn: serverTimestamp(),
        estado: "activo",
        rol: "usuario"
      });

      // ✅ Mostrar animación y cerrar luego
      setRegistroExitoso(true);
      setTimeout(() => {
        setRegistroExitoso(false);
        onClose();
      }, 4000);
    } catch (err) {
      console.error(err);
      setError("Error al crear la cuenta. Intentá nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // --- "Subcomponentes" como funciones (no JSX de componente) ---
  const PasoRegistro = () => (
    <>
      {/* Progreso */}
      <div className="mb-3 text-sm text-gray-600">
        Paso {step} de {totalSteps}
        <div className="w-full bg-gray-200 h-2 rounded mt-1">
          <div
            className="bg-blue-600 h-2 rounded transition-all"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {step === 1 && (
        <>
          <h2 className="text-xl font-bold mb-2">Datos básicos</h2>
          <input
            type="text"
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full border p-2 mb-2 rounded"
            autoFocus
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-2 mb-2 rounded"
          />

          {/* Contraseña */}
          <div className="relative mb-2">
            <input
              type={passwordVisible ? "text" : "password"}
              placeholder="Contraseña (mín. 6)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-2 rounded"
            />
            <button
              type="button"
              onClick={() => setPasswordVisible(!passwordVisible)}
              className="absolute right-2 top-2 text-gray-500"
            >
              {passwordVisible ? "🙈" : "👁️"}
            </button>
          </div>

          {/* Confirmar contraseña */}
          <div className="relative">
            <input
              type={confirmPasswordVisible ? "text" : "password"}
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border p-2 rounded"
            />
            <button
              type="button"
              onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
              className="absolute right-2 top-2 text-gray-500"
            >
              {confirmPasswordVisible ? "🙈" : "👁️"}
            </button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <h2 className="text-xl font-bold mb-2">Perfil profesional</h2>

          <label className="block text-sm">Tipo de trabajo</label>
          <select
            value={tipoTrabajo}
            onChange={(e) => setTipoTrabajo(e.target.value)}
            className="w-full border p-2 mb-2 rounded"
            autoFocus
          >
            <option>Doméstico</option>
            <option>Comercial</option>
            <option>Industrial</option>
            <option>Mixto</option>
          </select>

          <label className="block text-sm">Experiencia</label>
          <select
            value={experiencia}
            onChange={(e) => setExperiencia(e.target.value)}
            className="w-full border p-2 mb-2 rounded"
          >
            <option value="0-1">0-1 años</option>
            <option value="2-5">2-5 años</option>
            <option value="5-10">5-10 años</option>
            <option value="10+">10+ años</option>
          </select>

          <label className="block text-sm">Grado profesional</label>
          <select
            value={grado}
            onChange={(e) => setGrado(e.target.value)}
            className="w-full border p-2 mb-2 rounded"
          >
            <option>Idóneo</option>
            <option>Técnico</option>
            <option>Ingeniero</option>
          </select>

          <label className="block text-sm">Especialidad</label>
          <input
            type="text"
            placeholder="Ej: Tableros, automatización..."
            value={especialidad}
            onChange={(e) => setEspecialidad(e.target.value)}
            className="w-full border p-2 mb-2 rounded"
          />

          <label className="block text-sm">Modalidad de trabajo</label>
          <select
            value={modalidadTrabajo}
            onChange={(e) => setModalidadTrabajo(e.target.value)}
            className="w-full border p-2 mb-2 rounded"
          >
            <option>Independiente</option>
            <option>Relación de dependencia</option>
          </select>
        </>
      )}

      {step === 3 && (
        <>
          <h2 className="text-xl font-bold mb-2">Ubicación</h2>

          <label className="block text-sm">Provincia</label>
          <select
            value={provincia}
            onChange={(e) => setProvincia(e.target.value)}
            className="w-full border p-2 mb-2 rounded"
            autoFocus
          >
            <option value="">Seleccionar provincia...</option>
            <option>Buenos Aires</option>
            <option>Córdoba</option>
            <option>Santa Fe</option>
            <option>Corrientes</option>
            <option>Mendoza</option>
            {/* Agregá todas las que necesites */}
          </select>

          <label className="block text-sm">Ciudad / Localidad</label>
          <input
            type="text"
            placeholder="Ej: Itatí"
            value={ciudad}
            onChange={(e) => setCiudad(e.target.value)}
            className="w-full border p-2 mb-2 rounded"
          />
        </>
      )}

      {step === 4 && (
        <>
          <h2 className="text-xl font-bold mb-2">Información económica</h2>

          <label className="block text-sm">¿Conoce su tarifa horaria?</label>
          <select
            value={sabeTarifa}
            onChange={(e) => setSabeTarifa(e.target.value)}
            className="w-full border p-2 mb-2 rounded"
            autoFocus
          >
            <option>Si</option>
            <option>No</option>
          </select>

          <label className="block text-sm">Valor de boca (por tu zona de trabajo)</label>
          <input
            type="number"
            placeholder="Ej: opcional si conoces su valor"
            value={valorBoca}
            onChange={(e) => setValorBoca(e.target.value)}
            className="w-full border p-2 mb-2 rounded"
          />
        </>
      )}

      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}

      <div className="flex justify-between mt-4">
        {step > 1 ? (
          <button
            className="px-4 py-2 bg-gray-200 rounded"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
          >
            Anterior
          </button>
        ) : (
          <span />
        )}

        {step < totalSteps ? (
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={() => {
              // Paso 1: datos básicos
              if (step === 1) {
                if (!nombre || !email || !password || !confirmPassword) {
                  setError("Completá todos los campos para continuar.");
                  return;
                }
                // validar email con regex básico
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                  setError("Ingresa un correo electrónico válido.");
                  return;
                }
                if (password !== confirmPassword) {
                  setError("Las contraseñas no coinciden.");
                  return;
                }
              }

              // Paso 2: perfil profesional
              if (step === 2) {
                if (!tipoTrabajo || !experiencia || !grado || !especialidad || !modalidadTrabajo) {
                  setError("Completá todos los campos de perfil profesional.");
                  return;
                }
              }

              // Paso 3: ubicación
              if (step === 3) {
                if (!provincia || !ciudad) {
                  setError("Seleccioná tu provincia y ciudad/localidad.");
                  return;
                }
              }

              // Paso 4: valorBoca es opcional → no validamos
              setError("");
              setStep((s) => Math.min(totalSteps, s + 1));
            }}
          >
            Siguiente
          </button>
        ) : (
          <button
            className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
            onClick={handleRegister}
            disabled={loading}
          >
            {loading ? "Creando..." : "Crear cuenta"}
          </button>
        )}
      </div>
    </>
  );

  const VistaLogin = () => (
    <>
      <h2 className="text-xl font-bold mb-4">Iniciar sesión</h2>
      <input
        type="email"
        placeholder="Email"
        value={loginEmail}
        onChange={(e) => setLoginEmail(e.target.value)}
        className="w-full border p-2 mb-2 rounded"
        autoFocus
      />
      <div className="relative mb-2">
        <input
          type={passwordVisible ? "text" : "password"}
          placeholder="Contraseña"
          value={loginPassword}
          onChange={(e) => setLoginPassword(e.target.value)}
          className="w-full border p-2 mb-2 rounded"
        />
        <button
           type="button"
           onClick={() => setPasswordVisible(!passwordVisible)}
           className="absolute right-2 top-2 text-gray-500"
        >
           {passwordVisible ? "🙈" : "👁️"}
        </button>
      </div>
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      {mensaje && <p className="text-green-600 text-sm mt-2">{mensaje}</p>}

      <button
        className="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        onClick={handleLogin}
        disabled={loading}
      >
        {loading ? "Ingresando..." : "Ingresar"}
      </button>

      <button
        type="button"
        className="mt-2 text-sm text-blue-600 underline"
        onClick={handlePasswordReset}
      >
        ¿Olvidaste tu contraseña?
      </button>
    </>
  );

  return (
    <div
      className="fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-xl shadow-xl p-5 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cerrar */}
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ✕
        </button>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            className={`flex-1 py-2 rounded ${
              modo === "login" ? "bg-blue-600 text-white" : "bg-gray-100"
            }`}
            onClick={() => setModo("login")}
          >
            Iniciar sesión
          </button>
          <button
            className={`flex-1 py-2 rounded ${
              modo === "registro" ? "bg-blue-600 text-white" : "bg-gray-100"
            }`}
            onClick={() => setModo("registro")}
          >
            Crear cuenta
          </button>
        </div>

        {/* Render como funciones, no como componentes */}
        {modo === "login" ? VistaLogin() : PasoRegistro()}

        {registroExitoso && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/90 z-50 animate-fadeIn">
            <div className="text-center animate-pop">
              <svg
                className="w-20 h-20 mx-auto mb-3"
                viewBox="0 0 52 52"
              >
                <circle
                  cx="26"
                  cy="26"
                  r="25"
                  fill="none"
                  stroke="#4CAF50"
                  strokeWidth="2"
                />
                <path
                  fill="none"
                  stroke="#4CAF50"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="100"
                  strokeDashoffset="100"
                  d="M14 27l7 7 16-16"
                  style={{ animation: "draw 0.8s ease forwards" }}
                />
              </svg>
              <p className="text-green-700 font-bold text-lg">
                ¡Registro exitoso!
              </p>
              <p className="text-gray-600 text-sm">Acceso gratis por 7 días habilitado 🎉</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
