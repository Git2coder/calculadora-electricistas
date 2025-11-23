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
  const [darkMode, setDarkMode] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [menuUsuario, setMenuUsuario] = useState(false);
  const { usuario } = useAuth();
  const [config, setConfig] = useState(null);
  const menuRef = useRef(null);
  const [mostrarModalTerminos, setMostrarModalTerminos] = useState(false);


  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    const newValue = !darkMode;
    setDarkMode(newValue);

    if (newValue) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

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

  return (
    <Router>
      {/* 🌓 Contenedor global con soporte dark */}
      <div className={`${darkMode ? "dark" : ""} min-h-screen flex flex-col bg-gray-100 dark:bg-gray-950 transition-colors`}>
        
        {/* NAVBAR — también necesita recibir darkMode si lo querés adaptar */}
        <Navbar setModalAbierto={setModalAbierto} />

        <ModalAcceso
          isOpen={modalAbierto}
          onClose={() => setModalAbierto(false)}
        />

        {/* --- MAIN --- */}
        {/* Quité bg-gray-50 porque forzaba siempre fondo claro */}
        <main className="flex-grow p-4 bg-gray-100 dark:bg-gray-800 transition-colors">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/calculadora"
              element={
                <ProtectedRoute>
                  <Calculadora />
                </ProtectedRoute>
              }
            />
            <Route path="/acerca" element={<Acerca />} />
            <Route path="/novedades/noticias" element={<Noticias />} />
            <Route path="/reglamentacion" element={<Reglamentacion />} />
            <Route path="/cables-certificados" element={<CablesCertificados />} />
            <Route path="/comentarios" element={<ComentariosPage />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/ayuda" element={<Ayuda />} />

            <Route
              path="/votacion"
              element={
                <ProtectedRoute>
                  <VotacionTareas />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <DashboardLayout />
                </AdminRoute>
              }
            >
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

        {/* --- FOOTER --- */}
        <footer className="bg-blue-800 dark:bg-blue-900 text-white py-4 transition-colors">
          <div className="max-w-6xl mx-auto flex flex-col items-center gap-2">

            <div className="flex items-center gap-2">
              <img
                src="/icons/Presupuesto1.png"
                alt="Presupuesto+"
                className="h-7 w-auto"
              />
              <span className="font-semibold text-lg">Presupuesto+</span>
            </div>

            <p className="text-sm opacity-90">
              &copy; {new Date().getFullYear()} Todos los derechos reservados.
            </p>

            {/* ⭐ Nuevo switch elegante en footer */}
            <div className="mt-3 flex items-center gap-3 text-sm opacity-90">

              <span className="text-white">Modo oscuro</span>

              <button onClick={toggleDarkMode}

                className="
                  relative inline-flex items-center
                  h-6 w-12 rounded-full
                  bg-gray-300 dark:bg-gray-600
                  transition-colors duration-300 shadow-inner
                "
              >
                <span
                  className={`absolute left-1 text-gray-700 dark:text-gray-300 text-[10px] transition-opacity ${
                    darkMode ? "opacity-0" : "opacity-100"
                  }`}
                >
                  🌙
                </span>

                <span
                  className={`absolute right-1 text-yellow-300 text-[10px] transition-opacity ${
                    darkMode ? "opacity-100" : "opacity-0"
                  }`}
                >
                  ☀️
                </span>

                <span
                  className={`
                    inline-block h-4 w-4 bg-white dark:bg-gray-200 rounded-full shadow 
                    transform transition-transform duration-300
                    ${darkMode ? "translate-x-6" : "translate-x-1"}
                  `}
                ></span>
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* Modal acceso */}
      {setModalAbierto && (
        <ModalAcceso isOpen={modalAbierto} onClose={() => setModalAbierto(false)} />
      )}

      {/* Modal T&C */}
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
          onVerTerminos={() => window.open("/terminos", "_blank")}
        />
      )}
    </Router>
  );
}
