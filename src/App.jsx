import  ModalAcceso  from "./components/ModalAcceso";
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
import  UsuariosAdmin  from "./pages/admin/UsuariosAdmin";
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
import { Configuracion } from "./pages/admin/Configuracion";
import { Jornales } from "./pages/admin/Jornales";

import { getFirestore, doc, getDoc, onSnapshot } from "firebase/firestore";

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
  const esAdmin = usuario?.rol === "admin";

  const [config, setConfig] = useState(null);
  const menuRef = useRef(null);


useEffect(() => {
  const db = getFirestore();
  const docRef = doc(db, "config", "app");

  // Suscripción en tiempo real
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

 if (!config.habilitado && !esAdmin) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-2xl font-bold text-red-600">
        🚧 Sitio en mantenimiento 🚧
      </h1>
    </div>
  );
}

  return (
    <Router>

      <div className="min-h-screen flex flex-col">
        {/* NAVBAR */}
        <nav className="bg-blue-800 text-white shadow-md px-5 py-2 relative sticky top-0 z-50">
          <div className="max-w-8xl mx-auto flex items-center justify-between">

            {/* Botón Hamburguesa (solo en pantallas pequeñas) */}
            <button
              onClick={() => setMenuAbierto(!menuAbierto)}
              className="text-2xl sm:hidden"
            >
              {menuAbierto ? <FaTimes /> : <FaBars />}
            </button>

            {/* LOGO CENTRADO en móviles */}
            <Link
              to="/"
              className="absolute left-1/2 transform -translate-x-1/2 sm:static sm:transform-none sm:left-0 flex items-center gap-2 hover:opacity-80 transition"
              onClick={() => setMenuAbierto(false)}
            >
              <span className="text-2xl">⚡</span>
              <span className="font-bold text-l hidden sm:inline">Electricista +</span>
            </Link>

            {/* Menú horizontal para pantallas grandes */}
            <ul className="hidden sm:flex justify-center items-center gap-[2px]">
              <li><Link to="/calculadora" className="block w-32 text-center py-2 rounded hover:bg-blue-700 transition">Calculadora</Link></li>
              <li className="group relative">
                <span className="block w-32 text-center py-2 rounded hover:bg-blue-700 cursor-pointer transition">
                  Novedades ▾
                </span>
                <ul className="absolute left-0 top-full w-48 bg-blue-800 hidden group-hover:block shadow-lg z-10">
                  <li>
                    <Link to="/novedades/noticias" className="block px-4 py-2 hover:bg-blue-700">Noticias</Link>
                  </li>                  
                </ul>
              </li>
              <li><Link to="/reglamentacion" className="block w-32 text-center py-2 rounded hover:bg-blue-700 transition">Reglamentación</Link></li>
              <li><Link to="/acerca" className="block w-32 text-center py-2 rounded hover:bg-blue-700 transition">Acerca de</Link></li>
              <li><Link to="/comentarios" className="block w-32 text-center py-2 rounded hover:bg-blue-700 transition">Comentarios</Link></li>
            </ul>

            {/* Espacio login */}
            <div className="flex gap-2 items-center relative">
              {usuario ? (
                <div className="relative flex items-center gap-2" ref={menuRef}>
                  <button
                    onClick={() => setMenuUsuario((prev) => !prev)}
                    className="flex items-center gap-2 text-white hover:opacity-80 transition"
                  >
                    <FaUserCircle className="text-3xl" />
                    <span className="hidden sm:inline">{usuario.nombre || usuario.email}</span>
                  </button>

                  {menuUsuario && (
                    <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-20 animate-fadeIn">
                      {esAdmin && (
                        <Link
                          to="/admin/tareas"
                          onClick={() => setMenuUsuario(false)}
                          className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                        >
                          🛠 Panel de control
                        </Link>
                      )}
                      <button
                        onClick={() => alert("Abrir perfil")}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        👤 Mi perfil
                      </button>
                      <button
                        onClick={() => alert("Abrir configuración")}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        ⚙️ Configuración
                      </button>
                      <button
                        onClick={() => alert("Ver historial de presupuestos")}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        📂 Historial de presupuestos
                      </button>
                      <button
                        onClick={() => alert("Ver estadísticas")}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        📊 Panel de estadísticas
                      </button>
                      <button
                        onClick={() => alert("Abrir ayuda / tutorial")}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        ❓ Ayuda / info
                      </button>
                      <button
                        onClick={() => alert("Ver notificaciones")}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        🔔 Notificaciones
                      </button>
                      <hr className="my-1" />
                      <button
                        onClick={() => {
                              signOut(auth);
                              setMenuUsuario(false);
                          }}
                        className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-100"
                      >
                        🚪 Cerrar sesión
                      </button>
                      <BotonRenovacion />
                    </div>
                  )}

                </div>
              ) : (
                <button
                  onClick={() => setModalAbierto(true)}
                  className="bg-white text-blue-800 px-4 py-1.5 rounded-full text-sm hover:bg-gray-100"
                >
                  Acceder
                </button>
              )}
            </div>
          </div>

          {/* Menú desplegable en móviles */}
          {menuAbierto && (
            <div className="sm:hidden absolute top-full left-0 w-full bg-blue-900 flex flex-col items-center py-4 space-y-2">
              <Link to="/calculadora" onClick={() => setMenuAbierto(false)} className="hover:bg-blue-700 px-4 py-2 rounded">Calculadora</Link>
              <Link to="/novedades/noticias" onClick={() => setMenuAbierto(false)} className="hover:bg-blue-700 px-4 py-2 rounded">Noticias</Link>
              <Link to="/reglamentacion" onClick={() => setMenuAbierto(false)} className="hover:bg-blue-700 px-4 py-2 rounded">Reglamentación</Link>
              <Link to="/acerca" onClick={() => setMenuAbierto(false)} className="hover:bg-blue-700 px-4 py-2 rounded">Acerca de</Link>
              <Link to="/comentarios" onClick={() => setMenuAbierto(false)} className="hover:bg-blue-700 px-4 py-2 rounded">Comentarios</Link>
            </div>
          )}
        </nav>

      {/* RESTO DEL CÓDIGO SIGUE IGUAL */}
      <main className="flex-grow p-4 bg-gray-50">
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
            <Route path="/comentarios" element={<ComentariosPage />} />
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
              {/* Rutas adicionales se agregarán aquí */}
              <Route path="cargar-tareas" element={<CargarTareasManual />} />
            </Route>

      {/* NUEVAS RUTAS POST-PAGO */}
            <Route path="/gracias" element={<Gracias />} />
            <Route path="/error" element={<ErrorPago />} />
            <Route path="/espera" element={<Espera />} />
            <Route path="/terminos" element={<Terminos />} />

          </Routes>
        </main>

        <footer className="bg-blue-800 text-white text-center py-4">
          <p>&copy; {new Date().getFullYear()} Todos los derecho reservados. ⚡Electricista+ </p>
        </footer>
      </div>
  
      {setModalAbierto && (
<ModalAcceso isOpen={modalAbierto} onClose={() => setModalAbierto(false)} />
)}

    </Router>
  );
}
