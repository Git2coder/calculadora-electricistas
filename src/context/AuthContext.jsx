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
  const evaluarAcceso = (usuarioData) => {
    if (!usuarioData) return { estadoAcceso: "sin-usuario", puedeAcceder: false };

    const ahora = new Date();
    const fechaFinBeta = new Date("2025-09-15T23:59:59-03:00");

    // 1️⃣ Si fue suspendido manualmente
    if (usuarioData.estado === "suspendido") {
      return { estadoAcceso: "suspendido", puedeAcceder: false };
    }

    // 2️⃣ Si tiene suscripción activa con fecha válida
    const fechaExp = usuarioData.fechaExpiracion?.toDate
      ? usuarioData.fechaExpiracion.toDate()
      : usuarioData.fechaExpiracion
      ? new Date(usuarioData.fechaExpiracion)
      : null;

    if (usuarioData.suscripcionActiva === true && fechaExp && fechaExp > ahora) {
      return { estadoAcceso: "suscripto", puedeAcceder: true };
    }

    // 3️⃣ Si está dentro del periodo BETA global
    const creado = usuarioData.creadoEn?.toDate
      ? usuarioData.creadoEn.toDate()
      : usuarioData.creadoEn
      ? new Date(usuarioData.creadoEn)
      : null;

    const esUsuarioBeta = creado && creado <= fechaFinBeta && ahora <= fechaFinBeta;
    if (esUsuarioBeta) {
      return { estadoAcceso: "beta", puedeAcceder: true };
    }

    // 4️⃣ Si fue creado después del beta y aún está dentro de los días de prueba configurados
    if (creado && creado > fechaFinBeta) {
      const diasDesdeCreacion = (ahora - creado) / (1000 * 60 * 60 * 24);
      if (diasDesdeCreacion <= configTrial) {
        return { estadoAcceso: "trial", puedeAcceder: true };
      }
    }

    // 5️⃣ Caso contrario → vencido
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
              ...evaluarAcceso(usuarioDoc),
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
