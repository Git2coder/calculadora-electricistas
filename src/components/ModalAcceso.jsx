import React, { useEffect, useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, } from "firebase/auth";
import { getFirestore, doc, setDoc, updateDoc, serverTimestamp, Timestamp, getDoc, onSnapshot } from "firebase/firestore";
import { auth } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";

export default function ModalAcceso({ isOpen, onClose, plan, origen }) {
  if (!isOpen) return null;

  const db = getFirestore();
  const [registroHabilitado, setRegistroHabilitado] = useState(true);
  // === ESTADO DE FASE ===
  const [fase, setFase] = useState("crecimiento");

  // Leer configuración global
  useEffect(() => {
    const ref = doc(db, "config", "app");
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setRegistroHabilitado(data.registroHabilitado ?? true);
      }
    });
    return () => unsub();
  }, [db]);
  
  const navigate = useNavigate();

  // --- UI state ---
  const [modo, setModo] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [registroExitoso, setRegistroExitoso] = useState(false);

  // --- Login state ---
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);

  // --- Registro por pasos ---
  const totalSteps = 4;
  const [step, setStep] = useState(1);

  // Datos registro
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const [tipoTrabajo, setTipoTrabajo] = useState("Doméstico");
  const [experiencia, setExperiencia] = useState("0-1");
  const [grado, setGrado] = useState("Idóneo");
  const [especialidad, setEspecialidad] = useState("");
  const [modalidadTrabajo, setModalidadTrabajo] = useState("Independiente");

  const [provincia, setProvincia] = useState("");
  const [ciudad, setCiudad] = useState("");

  const [sabeTarifa, setSabeTarifa] = useState("No");
  const [valorBoca, setValorBoca] = useState("");

  const [estado, setEstado] = useState(null); // null | redirigiendo | error

  // Cerrar con ESC
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // === Helpers ===
  const activarPlanGratis = async (uid) => {
    const userRef = doc(db, "usuarios", uid);
    await updateDoc(userRef, {
      suscripcionActiva: true,
      fechaExpiracion: Timestamp.fromDate(
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      ),
    });
    navigate("/calculadora");
    onClose();
  };

  const iniciarPago = async (uid, plan) => {
    try {
      const resp = await fetch("/api/createPreference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, plan }),
      });

      if (!resp.ok) throw new Error("No se pudo iniciar el pago");

      const data = await resp.json();
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        throw new Error("init_point no encontrado en la respuesta");
      }
    } catch (err) {
      console.error("Error iniciando pago:", err);
      setEstado("error");
    }
  };

  // === Acciones ===
  useEffect(() => {
    const ref = doc(db, "config", "app");
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setFase(data.etapa || "crecimiento"); 
      }
    });
    return () => unsub();
  }, [db]);

  // === ACCIÓN POST LOGIN CORREGIDA ===
  const postLoginAccion = async (uid) => {
    
    // 🌱 FASE 1 — CRECIMIENTO
    // Acceso totalmente libre, NO crear suscripción ni expiración.
    if (fase === "crecimiento") {
      navigate("/calculadora");
      onClose();
      return;
    }

    // 🚀 FASE 2 — PRELANZAMIENTO
    // Acceso gratuito hasta una fecha global definida en config/app
    if (fase === "prelanzamiento") {
      const ref = await getDoc(doc(db, "config", "app"));
      const data = ref.exists() ? ref.data() : null;

      const fechaLimite = data?.fechaLanzamiento
        ? new Date(data.fechaLanzamiento)
        : new Date("2025-02-01"); // fallback seguro

      await updateDoc(doc(db, "usuarios", uid), {
        suscripcionActiva: true,
        fechaExpiracion: Timestamp.fromDate(fechaLimite),
      });

      navigate("/calculadora");
      onClose();
      return;
    }

    // 💰 FASE 3 — LANZAMIENTO
    // Aquí sí funcionan planes (gratis o pago)
    if (fase === "lanzamiento") {
      if (plan === "gratis") {
        await activarPlanGratis(uid);
        return;
      }
      if (origen === "suscripcion") {
        setEstado("redirigiendo");
        await iniciarPago(uid, plan);
        return;
      }

      // Login normal durante el lanzamiento
      navigate("/calculadora");
      onClose();
    }
  };

  const handleLogin = async () => {
    setError("");
    setMensaje("");
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(
        auth,
        loginEmail,
        loginPassword
      );
      await postLoginAccion(cred.user.uid);
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
        rol: "usuario",
        // 👇 Campos necesarios para la calculadora
        tarifaHoraria: 0,     // valor inicial editable por el usuario
        costoConsulta: 0,     // valor inicial editable
      });

      setRegistroExitoso(true);
      setTimeout(async () => {
        setRegistroExitoso(false);
        await postLoginAccion(uid);
      }, 2000);
    } catch (err) {
      console.error(err);
      setError("Error al crear la cuenta. Intentá nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // === Vistas ===
  const VistaLogin = () => (
    <>
      <input
        type="email"
        placeholder="Correo electrónico"
        value={loginEmail}
        onChange={(e) => setLoginEmail(e.target.value)}
        autoComplete="off"
        className="w-full border p-2 mb-2 rounded"
      />
      <div className="relative mb-2">
        <input
          type={passwordVisible ? "text" : "password"}
          placeholder="Contraseña"
          value={loginPassword}
          onChange={(e) => setLoginPassword(e.target.value)}
          autoComplete="new-password"
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
            autoComplete="off"
            className="w-full border p-2 mb-2 rounded"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="off"
            className="w-full border p-2 mb-2 rounded"
          />
          <div className="relative mb-2">
            <input
              type="password"
              placeholder="Contraseña (mín. 6)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              className="w-full border p-2 rounded"
            />
          </div>
          <div className="relative">
            <input
              type={confirmPasswordVisible ? "text" : "password"}
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
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


  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-60 px-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        {/* Título dinámico */}
        <h2 className="text-xl font-bold mb-4 text-center">
          {origen === "suscripcion"
            ? modo === "login"
              ? "Iniciar sesión para suscribirte"
              : "Crear cuenta para suscribirte"
            : modo === "login"
            ? "Iniciar sesión"
            : "Crear cuenta"}
        </h2>

        {/* Contenido */}
        <div className={modo === "login" ? "block" : "hidden"}>{VistaLogin()}</div>
        <div className={modo === "registro" ? "block" : "hidden"}>
          {PasoRegistro()}
        </div>

        {/* Estado */}
        {estado === "redirigiendo" && (
          <p className="text-green-600 font-medium mt-3 text-center animate-pulse">
            ✔ Acceso correcto. Ahora te llevamos al pago de tu suscripción...
          </p>
        )}
        {estado === "error" && (
          <p className="text-red-600 font-medium mt-3 text-center">
            Ocurrió un problema. Intentalo nuevamente.
          </p>
        )}

        {/* Link para cambiar modo */}
        <p className="mt-4 text-center text-sm text-gray-600">
          {modo === "login" ? (
            registroHabilitado ? (
              <>
                ¿No tenés cuenta?{" "}
                <button
                  onClick={() => setModo("registro")}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Registrate
                </button>
              </>
            ) : (
              <div className="text-center text-gray-600 mt-4">
                <span className="font-semibold text-blue-600 block mb-1">
                  🚫 Registro temporalmente cerrado
                </span>
                <span className="text-gray-500 italic block">                  
                  Por ahora los cupos están completos, pero pronto abriremos nuevos lugares. 🙌
                </span>
              </div>
            )
          ) : (
            <>
              ¿Ya tenés cuenta?{" "}
              <button
                onClick={() => setModo("login")}
                className="text-blue-600 hover:underline font-medium"
              >
                Accedé
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
