import { ModalAcceso } from "./components/ModalAcceso";
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
import { AdminUsuarios } from "./pages/AdminUsuarios";
import { AdminRoute } from "./components/AdminRoute";
import { useEffect } from "react"; 
import { Mantenimiento } from "./pages/Mantenimiento";


export function ComentariosPage() {
  return (
    <div className="min-h-screen py-10 px-4">
      <Comentarios />
    </div>
  );
}


export default function App() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [mostrarModalAcceso, setMostrarModalAcceso] = useState(false);
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
        <nav className="bg-blue-800 text-white shadow-md px-5 py-2 relative z-50">
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
              <li><Link to="/noticias" className="block w-32 text-center py-2 rounded hover:bg-blue-700 transition">Noticias</Link></li>
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
    onClick={() => setMostrarModalAcceso(true)}
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
              <Link to="/noticias" onClick={() => setMenuAbierto(false)} className="hover:bg-blue-700 px-4 py-2 rounded">Noticias</Link>
              <Link to="/reglamentacion" onClick={() => setMenuAbierto(false)} className="hover:bg-blue-700 px-4 py-2 rounded">Reglamentación</Link>
              <Link to="/acerca" onClick={() => setMenuAbierto(false)} className="hover:bg-blue-700 px-4 py-2 rounded">Acerca de</Link>
              <Link to="/comentarios" onClick={() => setMenuAbierto(false)} className="hover:bg-blue-700 px-4 py-2 rounded">Comentarios</Link>
            </div>
          )}
        </nav>

        {/* RESTO DEL CÓDIGO SIGUE IGUAL */}
        <main className="flex-grow p-4 bg-gray-50">
  <Routes>
    <Route path="*" element={<Mantenimiento />} />
  </Routes>
</main>


        <footer className="bg-blue-800 text-white text-center py-4">
          <p>&copy; {new Date().getFullYear()} Todos los derecho reservados. ⚡Electricista+ </p>
        </footer>
      </div>
    

      {/* Botón flotante de WhatsApp - <a
        href="https://wa.me/5491123456789"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 right-4 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2 z-50"
      >
        <span className="text-xl">💬</span>
        <span className="hidden sm:inline">Contactar por WhatsApp</span>
      </a> */}
      {mostrarModalAcceso && (
  <ModalAcceso onClose={() => setMostrarModalAcceso(false)} />
)}

    </Router>
  );
}
