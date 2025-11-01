import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes, FaUserCircle, FaChevronDown } from "react-icons/fa";
import { signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useAuth } from "../context/AuthContext";
import NavbarRecursos from "./NavbarRecursos";

export default function Navbar({ setModalAbierto }) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [menuUsuario, setMenuUsuario] = useState(false);
  const [submenuRecursos, setSubmenuRecursos] = useState(false);
  const menuRef = useRef(null);
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === "admin";

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
    <nav className="bg-blue-800 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        {/* Botón móvil */}
        <button
          onClick={() => setMenuAbierto(!menuAbierto)}
          className="text-2xl sm:hidden"
        >
          {menuAbierto ? <FaTimes /> : <FaBars />}
        </button>

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 hover:opacity-90 transition"
          onClick={() => setMenuAbierto(false)}
        >
          <span className="text-3xl">⚡</span>
          <span className="font-bold text-lg hidden sm:inline">Electricista+</span>
        </Link>

        {/* Links principales (desktop) */}
        <ul className="hidden sm:flex items-center gap-2">
          <li>
            <Link
              to="/calculadora"
              className="bg-blue-200 text-blue-900 font-semibold px-5 py-2 rounded-md hover:bg-blue-300 transition"
            >
              Calculadora
            </Link>
          </li>

          <NavbarRecursos />

          <li>
            <Link
              to="/novedades"
              className="py-2 px-3 rounded hover:bg-blue-700 transition"
            >
              Novedades
            </Link>
          </li>
        </ul>

        {/* Menú usuario */}
        <div className="flex gap-2 items-center relative" ref={menuRef}>
          {usuario ? (
            <>
              <button
                onClick={() => setMenuUsuario((prev) => !prev)}
                className="flex items-center gap-2 text-white hover:opacity-80 transition"
              >
                <FaUserCircle className="text-3xl" />
                <span className="hidden sm:inline font-medium">
                  {usuario.nombre || usuario.email}
                </span>
              </button>

              {menuUsuario && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-30">
                  {esAdmin && (
                    <Link
                      to="/admin/tareas"
                      onClick={() => setMenuUsuario(false)}
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      🛠 Panel de control
                    </Link>
                  )}
                  <Link
                    to="/votacion"
                    onClick={() => setMenuUsuario(false)}
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    🗳️ Votación
                  </Link>
                  <Link to="/perfil" onClick={() => setMenuUsuario(false)} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">
  👤 Mi perfil
</Link>
<Link to="/ayuda" onClick={() => setMenuUsuario(false)} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">
  ❓ Ayuda / info
</Link>

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
                </div>
              )}
            </>
          ) : (
            <button
              onClick={() => setModalAbierto(true)}
              className="bg-white text-blue-800 px-4 py-1.5 rounded-full text-sm font-medium hover:bg-gray-100"
            >
              Acceder
            </button>
          )}
        </div>
      </div>

      {/* Menú móvil */}
      {menuAbierto && (
        <div className="sm:hidden bg-blue-900 flex flex-col items-center py-4 space-y-2 text-sm">
          <Link
            to="/calculadora"
            onClick={() => setMenuAbierto(false)}
            className="bg-yellow-400 text-blue-900 font-semibold px-4 py-2 rounded-md w-11/12 text-center hover:bg-yellow-300 transition"
          >
            Calculadora
          </Link>
          <Link
            to="/reglamentacion"
            onClick={() => setMenuAbierto(false)}
            className="hover:bg-blue-700 px-4 py-2 rounded w-11/12 text-center"
          >
            Reglamentación
          </Link>
          <Link
            to="/cables-certificados"
            onClick={() => setMenuAbierto(false)}
            className="hover:bg-blue-700 px-4 py-2 rounded w-11/12 text-center"
          >
            Cables certificados
          </Link>
          
        </div>
      )}
    </nav>
  );
}
