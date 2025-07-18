import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";

export function UsuariosAdmin() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        const snapshot = await getDocs(collection(db, "usuarios"));
        const lista = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsuarios(lista);
      } catch (error) {
        console.error("Error al cargar usuarios:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarUsuarios();
  }, []);

  const hoy = new Date();

  const usuariosFiltrados = usuarios.filter(u =>
    u.correo?.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Indicadores
  const total = usuarios.length;

  const activos = usuarios.filter((u) => {
    const exp = u.fechaExpiracion?.toDate?.() || new Date(u.fechaExpiracion);
    return u.estado === "activo" && exp > hoy;
  }).length;

  const nuevosEsteMes = usuarios.filter((u) => {
    if (!u.creadoEn) return false;
    const creado = u.creadoEn.toDate?.() || new Date(u.creadoEn);
    return creado.getMonth() === hoy.getMonth() && creado.getFullYear() === hoy.getFullYear();
  }).length;

  const sinRenovar = usuarios.filter((u) => {
  const hoy = new Date();
  const exp = u.fechaExpiracion?.toDate?.() || new Date(u.fechaExpiracion);
  const creado = u.creadoEn?.toDate?.() || new Date(u.creadoEn);
  const diasDesdeRegistro = Math.floor((hoy - creado) / (1000 * 60 * 60 * 24));

  const estaSuspendido = u.estado === "suspendido";
  const vencido = exp < hoy;
  const sinSuscripcionYExpirado = u.estado === "activo" && !u.suscripcionActiva && diasDesdeRegistro > 7;

  return !estaSuspendido && (vencido || sinSuscripcionYExpirado);
}).length;


  // Visual del estado
  const obtenerEstadoVisual = (u) => {
  const hoy = new Date();
  const exp = u.fechaExpiracion?.toDate?.() || new Date(u.fechaExpiracion);
  const creado = u.creadoEn?.toDate?.() || new Date(u.creadoEn);
  const diasDesdeRegistro = Math.floor((hoy - creado) / (1000 * 60 * 60 * 24));

  if (u.estado === "suspendido") {
    return { texto: "Suspendido", color: "text-gray-500" };
  }

  if (u.estado === "activo" && !u.suscripcionActiva) {
    if (diasDesdeRegistro > 7) {
      return { texto: "Sin acceso", color: "text-red-600" };
    } else {
      return { texto: "Prueba gratuita", color: "text-blue-600" };
    }
  }

  if (exp && exp < hoy) {
    return { texto: "Sin acceso", color: "text-red-600" };
  }

  if (u.estado === "activo") {
    return { texto: "Suscripto", color: "text-green-600" };
  }

  return { texto: "Desconocido", color: "text-gray-400" };
};

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">👥 Gestión de Usuarios</h2>

      {/* Indicadores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white shadow p-4 rounded">
          <p className="text-sm text-gray-500">👤 Total usuarios</p>
          <p className="text-xl font-bold">{total}</p>
        </div>
        <div className="bg-white shadow p-4 rounded">
          <p className="text-sm text-gray-500">✅ Suscriptos</p>
          <p className="text-xl font-bold text-green-600">{activos}</p>
        </div>
        <div className="bg-white shadow p-4 rounded">
          <p className="text-sm text-gray-500">🚫 Sin acceso</p>
          <p className="text-xl font-bold text-red-600">{sinRenovar}</p>
        </div>
        <div className="bg-white shadow p-4 rounded">
          <p className="text-sm text-gray-500">📅 Nuevos este mes</p>
          <p className="text-xl font-bold text-blue-600">+{nuevosEsteMes}</p>
        </div>        
      </div>

      {/* Buscador */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por email..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="px-4 py-2 border rounded w-full sm:w-80"
        />
      </div>

      {/* Tabla */}
      {cargando ? (
        <p>Cargando usuarios...</p>
      ) : usuariosFiltrados.length === 0 ? (
        <p>No se encontraron usuarios.</p>
      ) : (
        <table className="min-w-full border bg-white shadow rounded overflow-hidden text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Estado</th>
              <th className="px-4 py-2 text-left">Registro</th>
              <th className="px-4 py-2 text-left">Pago</th>
              <th className="px-4 py-2 text-left">Expiración</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.map((u) => {
              const estado = obtenerEstadoVisual(u);
              return (
                <tr key={u.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{u.correo || "—"}</td>
                  <td className={`px-4 py-2 font-medium ${estado.color}`}>{estado.texto}</td>
                  <td className="px-4 py-2">
                    {u.creadoEn
                      ? (u.creadoEn.toDate?.() || new Date(u.creadoEn)).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-4 py-2">
                    {u.fechaPago
                      ? (u.fechaPago.toDate?.() || new Date(u.fechaPago)).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-4 py-2">
                    {u.fechaExpiracion
                      ? (u.fechaExpiracion.toDate?.() || new Date(u.fechaExpiracion)).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
