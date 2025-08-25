import { Link, Outlet, useLocation } from "react-router-dom";

const secciones = [
  { path: "/admin/usuarios", label: "Usuarios" },
  { path: "/admin/configuracion", label: "Accesos" },
  { path: "/admin/estadisticas", label: "Estadísticas" },
  { path: "/admin/tareas", label: "Tareas" },
  { path: "/admin/jornales", label: "Jornales" },
  { path: "/admin/actividad", label: "Actividad" },
  { path: "/admin/notificaciones", label: "Notificaciones" },
  { path: "/admin/permisos", label: "Permisos" },
 

];

export default function DashboardLayout() {
  const { pathname } = useLocation();

  return (
    <div className="flex h-screen">
      {/* Menú lateral */}
      <aside className="w-56 bg-blue-900 text-white p-4">
        <h2 className="text-xl font-bold mb-6">🔧 Panel Admin</h2>
        <nav className="space-y-2">
          {secciones.map((sec) => (
            <Link
              key={sec.path}
              to={sec.path}
              className={`block px-3 py-2 rounded hover:bg-blue-700 ${
                pathname === sec.path ? "bg-blue-800 font-semibold" : ""
              }`}
            >
              {sec.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 bg-gray-50 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
