import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

// 🔑 Función para evaluar estado de acceso
const evaluarAcceso = (usuarioData) => {
  if (!usuarioData) return { estadoAcceso: "sin-usuario", puedeAcceder: false };

  const ahora = new Date();

  // 1. Si está suspendido manualmente
  if (usuarioData.estado === "suspendido") {
    return { estadoAcceso: "suspendido", puedeAcceder: false };
  }

  // 2. Si tiene fechaExpiracion futura
  if (usuarioData.fechaExpiracion && usuarioData.fechaExpiracion.toDate() > ahora) {
    return { estadoAcceso: "suscripto", puedeAcceder: true };
  }

  // 3. Si está en período de prueba (7 días desde creadoEn)
  if (!usuarioData.creadoEn) {
    return { estadoAcceso: "trial", puedeAcceder: true };
  }

  if (usuarioData.creadoEn && usuarioData.creadoEn.toDate) {
    const creado = usuarioData.creadoEn.toDate();
    const diasDesdeCreacion = (ahora - creado) / (1000 * 60 * 60 * 24);
    if (diasDesdeCreacion <= 7) {
      return { estadoAcceso: "trial", puedeAcceder: true };
    }
  }

  // 4. Caso contrario: vencido
  return { estadoAcceso: "vencido", puedeAcceder: false };
};

  export const AuthProvider = ({ children }) => {
    const [usuario, setUsuario] = useState(null);
    const [cargando, setCargando] = useState(true);

    // 🔑 Mapa de equivalencia suscripción ↔ nivel
    const mapaSuscripcionNivel = {
      gratuita: 1,
      basica: 2,
      completa: 3,
    };

    useEffect(() => {
      let unsubscribeDoc = null;

      const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
        if (user) {
          const docRef = doc(db, "usuarios", user.uid);

          // 🔄 Escucha en tiempo real al documento del usuario
          unsubscribeDoc = onSnapshot(docRef, async (docSnap) => {
            if (docSnap.exists()) {
              const usuarioDoc = docSnap.data();
              console.log("Usuario cargado en tiempo real:", usuarioDoc);

              // 📌 Determinamos el nivel máximo según su suscripción
              const suscripcion = usuarioDoc.suscripcion || "gratuita";
              const nivelMaximo = mapaSuscripcionNivel[suscripcion];

              setUsuario((prev) => ({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                rol: usuarioDoc.rol || "usuario",
                ...usuarioDoc,
                suscripcion,   // 👈 ahora queda siempre definido
                nivelMaximo,   // 👈 se calcula automáticamente
                ...evaluarAcceso(usuarioDoc),
              }));
            } else {
              // 🚀 Si no existe, lo creamos en Firestore
              await setDoc(docRef, {
                email: user.email,
                displayName: user.displayName || "",
                creadoEn: serverTimestamp(),
                estado: "activo",
                rol: "usuario",
                suscripcion: "gratuita",     // 👈 nuevo campo por defecto
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
    }, []);

    const logout = async () => {
      await signOut(auth);
    };

    const actualizarPerfil = async (nombre) => {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: nombre });
        setUsuario((prev) => ({ ...prev, displayName: nombre }));
      }
    };

    return (
      <AuthContext.Provider
        value={{ usuario, cargando, logout, actualizarPerfil }}
      >
        {children}
      </AuthContext.Provider>
    );
  };

