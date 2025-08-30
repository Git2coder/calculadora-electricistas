import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut, updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
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
  // 🚀 Si creadoEn aún es null (porque serverTimestamp no llegó),
  // asumimos que es un usuario nuevo y le damos trial temporalmente
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "usuarios", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const usuarioDoc = docSnap.data();

          setUsuario({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            ...usuarioDoc,
            ...evaluarAcceso(usuarioDoc),
          });
        } else {
          // 🚀 Si no existe, lo creamos en Firestore
          await setDoc(docRef, {
            email: user.email,
            displayName: user.displayName || "",
            creadoEn: serverTimestamp(),
            estado: "activo",
            rol: "usuario",
            suscripcionActiva: false,
            fechaExpiracion: null,
          });

          // 👇 IMPORTANTE:
          // No seteamos usuario manualmente aquí.
          // Dejamos que en la próxima vuelta el snapshot de Firestore
          // lo traiga correctamente con el serverTimestamp.
        }
      } else {
        setUsuario(null);
      }
      setCargando(false);
    });

    return () => unsubscribe();
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
      value={{
        usuario,
        cargando,
        logout,
        actualizarPerfil,
      }}
    >
      {!cargando && children}
    </AuthContext.Provider>
  );
};
