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
import { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import { UsuariosAdmin } from "./pages/admin/UsuariosAdmin";
import { AdminRoute } from "./components/AdminRoute";
import { useEffect } from "react"; 
import { Mantenimiento } from "./pages/Mantenimiento";
import Gracias from "./pages/Gracias";
import ErrorPago from "./pages/ErrorPago";
import Espera from "./pages/Espera";
import Terminos from "./pages/Terminos";
import DashboardLayout from "./layouts/DashboardLayout";
import { TareasAdmin } from "./pages/admin/TareasAdmin";
import CargarTareasManual from "./CargarTareasManual";


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
  const { user, logout } = useAuth();
  const { usuario } = useAuth(); // si ya lo estás usando, no hace falta repetir

  useEffect(() => {
    const handler = () => setMostrarModalAcceso(true);
    window.addEventListener("abrirModalAcceso", handler);
    return () => window.removeEventListener("abrirModalAcceso", handler);
  }, []);
  
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
            <div className="flex gap-2 items-center">
              {usuario ? (
                <button
                  onClick={() => signOut(auth)}
                  className="bg-white text-blue-800 px-4 py-1.5 rounded-full text-sm hover:bg-gray-100"
                >
                  Cerrar sesión
                </button>
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
