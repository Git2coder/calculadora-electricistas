import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Home } from "./pages/Home";
import { Calculadora } from "./pages/Calculadora";
import { Acerca } from "./pages/Acerca";
import { Noticias } from "./pages/Noticias";
import { Articulos } from "./pages/Articulos";
import { Reglamentacion } from "./pages/Reglamentacion";
import { Consejos } from "./pages/Consejos";
import { Comentarios } from "./components/Comentarios";

export function ComentariosPage() {
  return (
    <div className="min-h-screen py-10 px-4">
      <Comentarios />
    </div>
  );
}


export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <nav className="bg-blue-800 text-white shadow-md px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">

            {/* LOGO como botón de inicio */}
            <Link to="/" className="w-40 flex items-center gap-2 hover:opacity-80 transition">
              <span className="text-2xl">⚡</span>
              <span className="font-bold text-l hidden sm:inline">El electricista</span>
            </Link>

            {/* MENÚ centrado sin 'Inicio' */}
            <ul className="flex justify-center items-center space-x-0.1">
              <li>
                <Link
                  to="/calculadora"
                  className="block w-36 text-center py-2 rounded hover:bg-blue-700 transition"
                >
                  Calculadora
                </Link>
              </li>
              <li>
                <Link
                  to="/noticias"
                  className="block w-36 text-center py-2 rounded hover:bg-blue-700 transition"
                >
                  Noticias
                </Link>
              </li>
              <li>
                <Link
                  to="/reglamentacion"
                  className="block w-36 text-center py-2 rounded hover:bg-blue-700 transition"
                >
                  Reglamentacion
                </Link>
              </li>
              <li>
                <Link
                  to="/acerca"
                  className="block w-36 text-center py-2 rounded hover:bg-blue-700 transition"
                >
                  Acerca de
                </Link>
              </li><li>
                <Link
                  to="/comentarios"
                  className="block w-36 text-center py-2 rounded hover:bg-blue-700 transition"
                >
                  Comentarios
                </Link>
              </li>
            </ul>

            {/* ESPACIO futuro para Login */}
            <div className="w-40 text-right">
              {/* <Link to="/login" className="text-sm hover:underline">Ingresar</Link> */}
            </div>
          </div>
        </nav>

        <main className="flex-grow p-4 bg-gray-50">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/calculadora" element={<Calculadora />} />
            <Route path="/acerca" element={<Acerca />} />
            <Route path="/noticias" element={<Noticias />} />
            <Route path="/articulos" element={<Articulos />} />
            <Route path="/reglamentacion" element={<Reglamentacion />} />
            <Route path="/consejos" element={<Consejos />} />
            <Route path="/comentarios" element={<ComentariosPage />} />
          </Routes>
        </main>

        <footer className="bg-blue-800 text-white text-center py-4">
          <p>&copy; {new Date().getFullYear()} El electricista ⚡</p>
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
      
    </Router>
  );
}
