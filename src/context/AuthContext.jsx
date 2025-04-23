import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { auth } from "../firebaseConfig";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [fechaCreacion, setFechaCreacion] = useState(null);
  const [fechaExpiracion, setFechaExpiracion] = useState(null);
  const [activo, setActivo] = useState(true); // por defecto activo
  const [rol, setRol] = useState("usuario");  // por defecto usuario
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (usuarioFirebase) => {
      setUsuario(usuarioFirebase);

      if (usuarioFirebase) {
        const db = getFirestore();
        const docRef = doc(db, "usuarios", usuarioFirebase.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setActivo(data.estado === "activo");
          setRol(data.rol ?? "usuario");

          // Fecha de creación
          if (data.creadoEn) {
            const fecha =
              typeof data.creadoEn.toDate === "function"
                ? data.creadoEn.toDate()
                : new Date(data.creadoEn);
            setFechaCreacion(fecha);
          } else {
            setFechaCreacion(null);
          }

          // Fecha de expiración
          if (data.fechaExpiracion) {
            const fecha =
              typeof data.fechaExpiracion.toDate === "function"
                ? data.fechaExpiracion.toDate()
                : new Date(data.fechaExpiracion);
            setFechaExpiracion(fecha);
          } else {
            setFechaExpiracion(null);
          }

        } else {
          // Si el documento no existe, dejar todo como inactivo
          setActivo(false);
          setRol("usuario");
          setFechaCreacion(null);
          setFechaExpiracion(null);
        }

      } else {
        setFechaCreacion(null);
        setFechaExpiracion(null);
        setActivo(false);
        setRol("usuario");
      }

      setCargando(false);
    });

    return unsub;
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, fechaCreacion, fechaExpiracion, activo, rol }}>
      {!cargando && children}
    </AuthContext.Provider>
  );
}
