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
        <nav className="bg-blue-800 text-white p-4 shadow-md">
          <ul className="flex flex-wrap gap-4 text-sm sm:text-base font-medium">
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/Calculadora">Calculadora</Link></li>
            <li><Link to="/Noticias">Noticias</Link></li>
            <li><Link to="/Reglamentacion">Reglamentación</Link></li>
            <li><Link to="/Acerca">Acerca de</Link></li>
            <li><Link to="/Comentarios">Comentarios</Link></li>
          </ul>
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
          <p>&copy; {new Date().getFullYear()} Electricista</p>
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
