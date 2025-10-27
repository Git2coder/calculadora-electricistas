import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { FaChevronDown } from "react-icons/fa";

export default function NavbarRecursos() {
  const [submenuVisible, setSubmenuVisible] = useState(false);
  const timerRef = useRef(null);

  const handleMouseEnter = () => {
    clearTimeout(timerRef.current);
    setSubmenuVisible(true);
  };

  const handleMouseLeave = () => {
    timerRef.current = setTimeout(() => setSubmenuVisible(false), 300);
  };

  const toggleOnClick = () => setSubmenuVisible((prev) => !prev);

  return (
    <li
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={toggleOnClick}
        className="flex items-center gap-1 py-2 px-3 rounded hover:bg-blue-700 transition"
      >
        Recursos <FaChevronDown className="text-sm mt-[2px]" />
      </button>

      {submenuVisible && (
        <ul className="absolute left-0 top-full bg-white text-gray-800 rounded-lg shadow-lg mt-1 w-56 overflow-hidden z-20 border border-gray-200">
          <li>
            <Link
              to="/reglamentacion"
              className="block px-4 py-2 hover:bg-gray-100"
              onClick={() => setSubmenuVisible(false)}
            >
              Indice reglamentos
            </Link>
          </li>
          <li>
            <Link
              to="/cables-certificados"
              className="block px-4 py-2 hover:bg-gray-100"
              onClick={() => setSubmenuVisible(false)}
            >
              Cables certificados
            </Link>
          </li>
        </ul>
      )}
    </li>
  );
}
