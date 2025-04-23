import { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  updateDoc,
  doc,
  Timestamp
} from "firebase/firestore";
import { format } from "date-fns";

const db = getFirestore();

export function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    const obtenerUsuarios = async () => {
      try {
        const usuariosSnapshot = await getDocs(collection(db, "usuarios"));
        const lista = usuariosSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsuarios(lista);
      } catch (error) {
        console.error("Error al obtener usuarios:", error);
      } finally {
        setCargando(false);
      }
    };

    obtenerUsuarios();
  }, []);

  const alternarEstado = async (id, estadoActual) => {
    const nuevoEstado = estadoActual === "activo" ? "suspendido" : "activo";
    try {
      await updateDoc(doc(db, "usuarios", id), { estado: nuevoEstado });
      setUsuarios(usuarios.map(u => (u.id === id ? { ...u, estado: nuevoEstado } : u)));
    } catch (error) {
      console.error("Error al cambiar estado:", error);
    }
  };

  const renovarSuscripcion = async (id) => {
    const nuevaFecha = Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
    try {
      await updateDoc(doc(db, "usuarios", id), { fechaExpiracion: nuevaFecha });
      setUsuarios(usuarios.map(u =>
        u.id === id ? { ...u, fechaExpiracion: nuevaFecha } : u
      ));
    } catch (error) {
      console.error("Error al renovar suscripción:", error);
    }
  };

  const calcularAcceso = (usuario) => {
    const ahora = new Date();
    const creadoEn = usuario.creadoEn?.toDate?.() || usuario.creadoEn;
    const fechaExpiracion = usuario.fechaExpiracion?.toDate?.() || usuario.fechaExpiracion;

    if (usuario.estado !== "activo") {
      return { texto: "Suspendido", color: "text-red-600" };
    } else if (fechaExpiracion && fechaExpiracion >= ahora) {
      return { texto: "Suscripción activa", color: "text-green-600" };
    } else if (creadoEn && ahora - creadoEn < 7 * 24 * 60 * 60 * 1000) {
      return { texto: "Período de prueba", color: "text-yellow-700" };
    } else {
      return { texto: "Prueba vencida", color: "text-gray-600" };
    }
  };

  const usuariosFiltrados = usuarios.filter(u =>
    u.correo?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded shadow mt-10">
      <h2 className="text-2xl font-bold text-blue-800 mb-4">👥 Administración de Usuarios</h2>

      {/* 🔍 Buscador */}
      <input
        type="text"
        placeholder="Buscar por correo..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="mb-4 p-2 border w-full max-w-md rounded"
      />

      {cargando ? (
        <p className="text-center">Cargando usuarios...</p>
      ) : usuariosFiltrados.length === 0 ? (
        <p className="text-center text-gray-500">No se encontraron usuarios.</p>
      ) : (
        <div className="overflow-y-auto max-h-[300px]">
          <table className="min-w-full text-sm table-auto border border-gray-300">
            <thead className="bg-blue-100 sticky top-0">
              <tr>
                <th className="p-2 border">Correo</th>
                <th className="p-2 border">Registrado</th>
                <th className="p-2 border">Expira</th>
                <th className="p-2 border">Acceso</th>
                <th className="p-2 border">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map(usuario => {
                const acceso = calcularAcceso(usuario);
                const fechaExpira = usuario.fechaExpiracion?.toDate?.() || usuario.fechaExpiracion;
                return (
                  <tr key={usuario.id} className="text-center">
                    <td className="p-2 border">{usuario.correo}</td>
                    <td className="p-2 border">
                      {usuario.creadoEn
                        ? format(usuario.creadoEn.toDate?.() || usuario.creadoEn, "dd/MM/yyyy")
                        : "-"}
                    </td>
                    <td className="p-2 border">
                      {fechaExpira
                        ? format(new Date(fechaExpira), "dd/MM/yyyy")
                        : "-"}
                    </td>
                    <td className={`p-2 border font-semibold ${acceso.color}`}>
                      {acceso.texto}
                    </td>
                    <td className="p-2 border">
                        <div className="flex flex-wrap justify-center gap-2">
                            <button
                            className={`px-3 py-1 rounded text-white text-sm ${
                                usuario.estado === "activo" ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                            }`}
                            onClick={() => alternarEstado(usuario.id, usuario.estado)}
                            >
                            {usuario.estado === "activo" ? "Suspender" : "Reactivar"}
                            </button>

                            <button
                            className="px-3 py-1 rounded text-sm bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => renovarSuscripcion(usuario.id)}
                            >
                            +30 días
                            </button>
                        </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
