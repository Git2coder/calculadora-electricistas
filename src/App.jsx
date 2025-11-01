import ModalAcceso from "./components/ModalAcceso";
import { signOut } from "firebase/auth";
import { auth } from "./firebaseConfig";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Home } from "./pages/Home";
import { Calculadora } from "./pages/Calculadora";
import { Acerca } from "./pages/Acerca";
import { Noticias } from "./pages/Noticias";
import { Reglamentacion } from "./pages/Reglamentacion";
import { Comentarios } from "./components/Comentarios";
import React, { useEffect, useState, useRef } from "react";
import { FaBars, FaTimes, FaUserCircle } from "react-icons/fa";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import UsuariosAdmin from "./pages/admin/UsuariosAdmin";
import AdminRoute from "./components/AdminRoute";
import { Mantenimiento } from "./pages/Mantenimiento";
import Gracias from "./pages/Gracias";
import ErrorPago from "./pages/ErrorPago";
import Espera from "./pages/Espera";
import Terminos from "./pages/Terminos";
import DashboardLayout from "./layouts/DashboardLayout";
import { TareasAdmin } from "./pages/admin/TareasAdmin";
import CargarTareasManual from "./CargarTareasManual";
import { BotonRenovacion } from "./components/BotonRenovacion";
import Configuracion from "./pages/admin/Configuracion";
import { Jornales } from "./pages/admin/Jornales";
import Estadisticas from "./pages/admin/Estadisticas";
import { getFirestore, doc, getDoc, onSnapshot, updateDoc, } from "firebase/firestore";
import ModalTerminos from "./components/ModalTerminos";
import VotacionTareas from "./pages/VotacionTareas";
import ResultadosVotacion from "./pages/admin/ResultadosVotacion";
import ResultadosEncuesta from "./pages/admin/ResultadosEncuesta";
import MensajesPanel from "./pages/admin/MensajesPanel";
import Navbar from "./components/Navbar"
import Perfil from "./pages/Perfil";
import Ayuda from "./pages/Ayuda";

// 🧩 NUEVO: importar el Asistente unificado
import Asistente from "./components/Asistente";
import CablesCertificados from "./components/CablesCertificados";

// versión vigente de T&C → solo actualizás este string al modificar tus términos
const TERMINOS_VERSION = "2025-09-01";

export function ComentariosPage() {
  return (
    <div className="min-h-screen py-10 px-4">
      <Comentarios />
    </div>
  );
}

export default function App() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [menuUsuario, setMenuUsuario] = useState(false);
  const { usuario } = useAuth();
  const [config, setConfig] = useState(null);
  const menuRef = useRef(null);
  const [mostrarModalTerminos, setMostrarModalTerminos] = useState(false);

  useEffect(() => {
    const checkTerminos = async () => {
      if (!usuario) return;
      const db = getFirestore();
      const snap = await getDoc(doc(db, "usuarios", usuario.uid));
      if (snap.exists()) {
        const data = snap.data();
        if (
          !data.terminos ||
          data.terminos.version !== TERMINOS_VERSION ||
          !data.terminos.aceptado
        ) {
          setMostrarModalTerminos(true);
        }
      }
    };
    checkTerminos();
  }, [usuario]);

  useEffect(() => {
    const db = getFirestore();
    const docRef = doc(db, "config", "app");
    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        setConfig(snap.data());
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuUsuario && menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuUsuario(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuUsuario]);

  if (!config) return <p>Cargando...</p>;
  const esAdmin = usuario?.rol === "admin";

  if (!esAdmin && config?.habilitado === false) {
    return (
      // 🔹 bloque de mantenimiento (sin cambios)
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 text-center p-8">
        <div className="bg-white shadow-lg rounded-2xl p-10 max-w-lg border border-blue-200 relative overflow-hidden flex flex-col items-center">
          <h1 className="text-4xl font-extrabold text-blue-700 mb-3">
            ¡Estamos recargando energía!
          </h1>
          <p className="text-gray-700 text-lg mb-6">
            Realizando mejoras para brindarte un servicio de calidad 🧱
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Pronto volveremos para seguir trabajando con vos.
          </p>
          <div className="text-yellow-400 text-6xl animate-electric mb-2">⚡</div>
          <p className="text-black-600 font-extrabold text-xl tracking-wide">
            Electricista+
          </p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col">        
        {/* NAVBAR */}
        <Navbar />

        {/* RESTO DEL CÓDIGO SIGUE IGUAL */}
        <main className="flex-grow p-4 bg-gray-50">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/calculadora" element={<ProtectedRoute> <Calculadora /> </ProtectedRoute>} />
            <Route path="/acerca" element={<Acerca />} />
            <Route path="/novedades/noticias" element={<Noticias />} />
            <Route path="/reglamentacion" element={<Reglamentacion />} />
            <Route path="/cables-certificados" element={<CablesCertificados />} />
            <Route path="/comentarios" element={<ComentariosPage />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/ayuda" element={<Ayuda />} />

            <Route path="/votacion" element={<ProtectedRoute> <VotacionTareas /> </ProtectedRoute>} />

            <Route path="/admin" element={<AdminRoute> <DashboardLayout /> </AdminRoute>}>
              <Route path="usuarios" element={<UsuariosAdmin />} />
              <Route path="tareas" element={<TareasAdmin />} />
              <Route path="Configuracion" element={<Configuracion />} />
              <Route path="Jornales" element={<Jornales />} />
              <Route path="Estadisticas" element={<Estadisticas />} />
              <Route path="votacion-resultados" element={<ResultadosVotacion />} />
              <Route path="/admin/mensajes" element={<MensajesPanel />} />
              <Route path="cargar-tareas" element={<CargarTareasManual />} />
            </Route>
          
            <Route path="/gracias" element={<Gracias />} />
            <Route path="/error" element={<ErrorPago />} />
            <Route path="/espera" element={<Espera />} />
            <Route path="/terminos" element={<Terminos />} />
          </Routes>
        </main>

        <footer className="bg-blue-800 text-white text-center py-4">
          <p>
            &copy; {new Date().getFullYear()} Todos los derecho reservados. ⚡Electricista+
          </p>
        </footer>
      </div>

      {/* Modal de acceso */}
      {setModalAbierto && (
        <ModalAcceso isOpen={modalAbierto} onClose={() => setModalAbierto(false)} />
      )}

      {/* Modal bloqueante de T&C */}
      {mostrarModalTerminos && (
        <ModalTerminos
          usuario={usuario}
          onAceptar={async () => {
            if (usuario) {
              const db = getFirestore();
              const userRef = doc(db, "usuarios", usuario.uid);
              await updateDoc(userRef, {
                terminos: {
                  version: TERMINOS_VERSION,
                  aceptadoEn: new Date().toISOString(),
                  aceptado: true,
                },
              });
            }
            setMostrarModalTerminos(false);
          }}
          onVerTerminos={() => {
            window.open("/terminos", "_blank");
          }}
        />
      )}
      
    </Router>
  );
}
