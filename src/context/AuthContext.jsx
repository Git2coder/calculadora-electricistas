import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut, updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [configTrial, setConfigTrial] = useState(7); // ✅ dentro del componente

  // 🔹 Cargar días de prueba desde Firestore
  useEffect(() => {
    const cargarTrial = async () => {
      try {
        const cfg = await getDoc(doc(db, "config", "trial"));
        if (cfg.exists()) {
          setConfigTrial(cfg.data().diasPrueba || 7);
        }
      } catch (error) {
        console.error("Error al cargar configTrial:", error);
      }
    };
    cargarTrial();
  }, []);

  // 🔑 Función para evaluar el estado de acceso del usuario
  // dentro de AuthContext.jsx
const [configApp, setConfigApp] = useState(null);

useEffect(() => {
  const cargarConfigApp = async () => {
    const appSnap = await getDoc(doc(db, "config", "app"));
    if (appSnap.exists()) setConfigApp(appSnap.data());
  };
  cargarConfigApp();
}, []);

const evaluarAcceso = (usuarioData, configApp, configTrial) => {
  if (!usuarioData) return { estadoAcceso: "sin-usuario", puedeAcceder: false };
  const ahora = new Date();

  const etapa = configApp?.etapa || "crecimiento";
  const fechaLanzamiento = configApp?.fechaLanzamiento
    ? new Date(configApp.fechaLanzamiento)
    : null;

  // 1️⃣ Suspendido
  if (usuarioData.estado === "suspendido")
    return { estadoAcceso: "suspendido", puedeAcceder: false };

  // 2️⃣ Suscripción activa
  const fechaExp = usuarioData.fechaExpiracion?.toDate
    ? usuarioData.fechaExpiracion.toDate()
    : usuarioData.fechaExpiracion
    ? new Date(usuarioData.fechaExpiracion)
    : null;
  if (usuarioData.suscripcionActiva && fechaExp && fechaExp > ahora)
    return { estadoAcceso: "suscripto", puedeAcceder: true };

  // 3️⃣ Etapa de crecimiento: acceso total sin límite
  if (etapa === "crecimiento")
    return { estadoAcceso: "crecimiento", puedeAcceder: true };

  // 4️⃣ Pre-lanzamiento: gratis hasta la fecha de lanzamiento
  if (etapa === "prelanzamiento" && fechaLanzamiento && ahora <= fechaLanzamiento)
    return { estadoAcceso: "prelanzamiento", puedeAcceder: true };

  // 5️⃣ Lanzamiento: aplica días de prueba
  const creado = usuarioData.creadoEn?.toDate
    ? usuarioData.creadoEn.toDate()
    : new Date(usuarioData.creadoEn);
  const diasDesdeCreacion = (ahora - creado) / (1000 * 60 * 60 * 24);
  if (diasDesdeCreacion <= configTrial)
    return { estadoAcceso: "trial", puedeAcceder: true };

  return { estadoAcceso: "vencido", puedeAcceder: false };
};


  // 🔹 Mapeo de planes
  const mapaSuscripcionNivel = {
    gratuita: 1,
    basica: 2,
    completa: 3,
  };

  // 🔹 Monitorear autenticación y datos del usuario
  useEffect(() => {
    let unsubscribeDoc = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "usuarios", user.uid);

        unsubscribeDoc = onSnapshot(docRef, async (docSnap) => {
          if (docSnap.exists()) {
            const usuarioDoc = docSnap.data();
            console.log("Usuario cargado en tiempo real:", usuarioDoc);

            const suscripcion = usuarioDoc.suscripcion || usuarioDoc.plan || "gratuita";
            const nivelMaximo = mapaSuscripcionNivel[suscripcion];

            setUsuario({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName,
  rol: usuarioDoc.rol || "usuario",
  ...usuarioDoc,
  suscripcion,
  nivelMaximo,
  ...evaluarAcceso(usuarioDoc, configApp, configTrial),
});

          } else {
            // Crear documento base si no existe
            await setDoc(docRef, {
              email: user.email,
              displayName: user.displayName || "",
              creadoEn: serverTimestamp(),
              estado: "activo",
              rol: "usuario",
              suscripcion: "gratuita",
              suscripcionActiva: false,
              fechaExpiracion: null,
            });
          }
          setCargando(false);
        });
      } else {
        setUsuario(null);
        setCargando(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, [configTrial]); // 👈 importante: volver a evaluar si cambian los días

  const logout = async () => await signOut(auth);

  const actualizarPerfil = async (nombre) => {
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName: nombre });
      setUsuario((prev) => ({ ...prev, displayName: nombre }));
    }
  };

  return (
    <AuthContext.Provider value={{ usuario, cargando, logout, actualizarPerfil }}>
      {children}
    </AuthContext.Provider>
  );
};
