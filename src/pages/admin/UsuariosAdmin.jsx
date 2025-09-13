// src/pages/UsuariosAdmin.jsx
import { useEffect, useMemo, useState } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { FaUserShield, FaBan, FaRedo, FaTrash, FaSyncAlt } from "react-icons/fa";

// ---------- Helpers ----------
const toDateSafe = (ts) => {
  if (!ts) return null;
  if (typeof ts.toDate === "function") return ts.toDate();
  if (ts instanceof Date) return ts;
  const parsed = new Date(ts);
  return isNaN(parsed.getTime()) ? null : parsed;
};

const daysBetween = (a, b) => Math.round((b - a) / 86400000);

const TRIAL_DAYS = 7;
const POR_VENCER_DAYS = 3;
const EXTENDER_DAYS = 30;
const PAGE_SIZE = 25;

// ---------- Componente ----------
export default function UsuariosAdmin() {
  const [usuarios, setUsuarios] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filterRol, setFilterRol] = useState("todos");
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "usuarios"), orderBy("creadoEn", "desc"));
      const snap = await getDocs(q);
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setUsuarios(data);
      setLoading(false);
      setPage(1);
    } catch (err) {
      console.error("Error cargando usuarios:", err);
      setLoading(false);
    }
  };

  // ---------- Estado / clasificación ----------
  const evaluarAccesoAdmin = (u) => {
    const hoy = new Date();

    if (u.estado === "suspendido") return "suspendido";

    const creado = toDateSafe(u.creadoEn);
    if (creado && !u.fechaPago) {
      const dias = daysBetween(creado, hoy);
      if (dias <= TRIAL_DAYS) return "trial";
    }

    const exp = toDateSafe(u.fechaExpiracion);
    if (exp) {
      if (exp < hoy) return "vencido";
      const diasRest = daysBetween(hoy, exp);
      if (diasRest <= POR_VENCER_DAYS) return "por-vencer";
      return "suscripto";
    }

    return "sin-acceso";
  };

  const renderEstadoBadge = (u) => {
    const estado = evaluarAccesoAdmin(u);
    const baseClass =
      "px-2 py-1 rounded text-xs font-medium inline-block select-none";

    switch (estado) {
      case "suspendido":
        return <span className={`${baseClass} bg-red-100 text-red-700`}>Suspendido</span>;
      case "trial":
        return <span className={`${baseClass} bg-blue-100 text-blue-700`}>Prueba</span>;
      case "suscripto":
        return <span className={`${baseClass} bg-green-100 text-green-700`}>Suscripto</span>;
      case "por-vencer":
        return <span className={`${baseClass} bg-yellow-100 text-yellow-700`}>Por vencer</span>;
      case "vencido":
        return <span className={`${baseClass} bg-black text-white`}>Vencido</span>;
      default:
        return <span className={`${baseClass} bg-gray-50 text-gray-700`}>Sin acceso</span>;
    }
  };

  // ---------- Filtrado / búsqueda ----------
  useEffect(() => {
    let arr = [...usuarios];
    if (filterRol !== "todos") {
      arr = arr.filter((u) => u.rol === filterRol);
    }
    if (search.trim() !== "") {
      const q = search.toLowerCase();
      arr = arr.filter(
        (u) =>
          (u.nombre || "").toLowerCase().includes(q) ||
          (u.email || "").toLowerCase().includes(q) ||
          (u.uid || "").toLowerCase().includes(q)
      );
    }
    setFiltered(arr);
    setPage(1);
  }, [usuarios, search, filterRol]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSlice = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  // ---------- Selección ----------
  const toggleSelect = (id) => {
    setSelectedKeys((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAllCurrentPage = () => {
    const ids = pageSlice.map((u) => u.id);
    const allSelected = ids.every((id) => selectedKeys.includes(id));
    if (allSelected) {
      setSelectedKeys((prev) => prev.filter((id) => !ids.includes(id)));
    } else {
      setSelectedKeys((prev) => Array.from(new Set([...prev, ...ids])));
    }
  };

  // ---------- Acciones ----------
  const extenderDias = async (u, dias = EXTENDER_DAYS) => {
    try {
      const ref = doc(db, "usuarios", u.id);
      const expCurrent = toDateSafe(u.fechaExpiracion) || new Date();
      const nueva = new Date(expCurrent);
      nueva.setDate(nueva.getDate() + dias);
      await updateDoc(ref, { fechaExpiracion: nueva });
      await fetchUsuarios();
    } catch (err) {
      console.error("Error extenderDias:", err);
    }
  };

  const toggleSuspension = async (u) => {
    try {
      const ref = doc(db, "usuarios", u.id);
      const nuevo = u.estado === "suspendido" ? "activo" : "suspendido";
      await updateDoc(ref, { estado: nuevo });
      await fetchUsuarios();
    } catch (err) {
      console.error("Error toggleSuspension:", err);
    }
  };

  const toggleRol = async (u) => {
    try {
      const ref = doc(db, "usuarios", u.id);
      let nuevo = "usuario";
      if (u.rol === "usuario") nuevo = "moderador";
      else if (u.rol === "moderador") nuevo = "admin";
      else if (u.rol === "admin") nuevo = "usuario";
      await updateDoc(ref, { rol: nuevo });
      await fetchUsuarios();
    } catch (err) {
      console.error("Error toggleRol:", err);
    }
  };

  const eliminarUsuario = async (u) => {
    if (!confirm(`Eliminar usuario ${u.nombre} (${u.email}) ?`)) return;
    try {
      await deleteDoc(doc(db, "usuarios", u.id));
      await fetchUsuarios();
    } catch (err) {
      console.error("Error eliminarUsuario:", err);
    }
  };

  const ejecutarAccionMasiva = async (accion) => {
    if (selectedKeys.length === 0) return;
    try {
      const promises = selectedKeys.map(async (id) => {
        const u = usuarios.find((x) => x.id === id);
        if (!u) return;
        if (accion === "extender") return extenderDias(u);
        if (accion === "suspender") return toggleSuspension(u);
        if (accion === "rol") return toggleRol(u);
        if (accion === "eliminar") return eliminarUsuario(u);
        return null;
      });
      await Promise.all(promises);
      await fetchUsuarios();
      setSelectedKeys([]);
    } catch (err) {
      console.error("Error ejecutarAccionMasiva:", err);
    }
  };

  // ---------- KPIs ----------
  const kpTotal = usuarios.length;
  const kpSuscripto = usuarios.filter((u) => evaluarAccesoAdmin(u) === "suscripto").length;
  const kpTrial = usuarios.filter((u) => evaluarAccesoAdmin(u) === "trial").length;
  const kpPorVencer = usuarios.filter((u) => evaluarAccesoAdmin(u) === "por-vencer").length;
  const kpSuspendidos = usuarios.filter((u) => evaluarAccesoAdmin(u) === "suspendido").length;
  const kpVencidos = usuarios.filter((u) => evaluarAccesoAdmin(u) === "vencido").length;

  if (loading) return <div className="p-4">Cargando usuarios...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Usuarios (Admin)</h1>
        <button
          onClick={fetchUsuarios}
          className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200"
          title="Refrescar"
        >
          <FaSyncAlt />
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-4">
        <div className="p-3 bg-white rounded shadow text-center">
          <div className="text-sm text-gray-500">Total</div>
          <div className="text-xl font-bold">{kpTotal}</div>
        </div>
        <div className="p-3 bg-white rounded shadow text-center">
          <div className="text-sm text-gray-500">Suscriptos</div>
          <div className="text-xl font-bold text-green-700">{kpSuscripto}</div>
        </div>
        <div className="p-3 bg-white rounded shadow text-center">
          <div className="text-sm text-gray-500">Trial</div>
          <div className="text-xl font-bold text-blue-700">{kpTrial}</div>
        </div>
        <div className="p-3 bg-white rounded shadow text-center">
          <div className="text-sm text-gray-500">Por vencer</div>
          <div className="text-xl font-bold text-yellow-700">{kpPorVencer}</div>
        </div>
        <div className="p-3 bg-white rounded shadow text-center">
          <div className="text-sm text-gray-500">Suspendidos</div>
          <div className="text-xl font-bold text-red-700">{kpSuspendidos}</div>
        </div>
        <div className="p-3 bg-white rounded shadow text-center">
          <div className="text-sm text-gray-500">Vencidos</div>
          <div className="text-xl font-bold text-gray-700">{kpVencidos}</div>
        </div>
      </div>

      {/* Alertas */}
      <div className="mb-4 space-y-2">
        {kpPorVencer > 0 && (
          <div className="p-3 bg-yellow-50 border text-yellow-700 rounded">
            ⚠️ {kpPorVencer} usuarios con suscripción por vencer en {POR_VENCER_DAYS} días.
          </div>
        )}
        {kpTrial > 0 && (
          <div className="p-3 bg-blue-50 border text-blue-700 rounded">
            🔔 {kpTrial} usuarios en periodo de prueba (≤ {TRIAL_DAYS} días).
          </div>
        )}
      </div>

      {/* Controles */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
        <div className="flex gap-2 items-center">
          <input
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-3 py-2 rounded w-72"
          />
          <select
            value={filterRol}
            onChange={(e) => setFilterRol(e.target.value)}
            className="border px-2 py-2 rounded"
          >
            <option value="todos">Todos</option>
            <option value="usuario">Usuario</option>
            <option value="moderador">Moderador</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {selectedKeys.length > 0 && (
          <div className=" gap-2">
            <button
              onClick={() => ejecutarAccionMasiva("extender")}
              className="px-3 py-2 bg-blue-600 text-white rounded"
            >
              Extender +{EXTENDER_DAYS}d ({selectedKeys.length})
            </button>
            <button
              onClick={() => ejecutarAccionMasiva("suspender")}
              className="px-3 py-2 bg-orange-500 text-white rounded"
            >
              Suspender/Reactivar ({selectedKeys.length})
            </button>
            <button
              onClick={() => ejecutarAccionMasiva("rol")}
              className="px-3 py-2 bg-purple-500 text-white rounded"
            >
              Cambiar rol ({selectedKeys.length})
            </button>
            <button
              onClick={() => ejecutarAccionMasiva("eliminar")}
              className="px-3 py-2 bg-red-500 text-white rounded"
            >
              Eliminar ({selectedKeys.length})
            </button>
          </div>
        )}
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200 text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="border px-3 py-2 text-center">
                <input
                  type="checkbox"
                  checked={pageSlice.every((u) => selectedKeys.includes(u.id)) && pageSlice.length > 0}
                  onChange={toggleSelectAllCurrentPage}
                />
              </th>
              <th className="border px-3 py-2 text-left">Nombre</th>
              <th className="border px-3 py-2 text-left">Email</th>
              <th className="border px-3 py-2 text-center">Rol</th>
              <th className="border px-3 py-2 text-center">Estado</th>
              <th className="border px-3 py-2 text-center">Vence</th>
              <th className="border px-3 py-2 text-center">Pago</th>
              <th className="border px-3 py-2 text-center">Creado</th>
              <th className="border px-3 py-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pageSlice.map((u) => {
              const exp = toDateSafe(u.fechaExpiracion);
              const pago = toDateSafe(u.fechaPago);
              const creado = toDateSafe(u.creadoEn);

              return (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="border px-3 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={selectedKeys.includes(u.id)}
                      onChange={() => toggleSelect(u.id)}
                    />
                  </td>
                  <td className="border px-3 py-2">{u.nombre || "—"}</td>
                  <td className="border px-3 py-2">{u.email || "—"}</td>
                  <td className="border px-3 py-2 text-center">{u.rol || "usuario"}</td>
                  <td className="border px-3 py-2 text-center">{renderEstadoBadge(u)}</td>
                  <td className="border px-3 py-2 text-center">{exp ? exp.toLocaleDateString() : "—"}</td>
                  <td className="border px-3 py-2 text-center">{pago ? pago.toLocaleDateString() : "—"}</td>
                  <td className="border px-3 py-2 text-center">{creado ? creado.toLocaleDateString() : "—"}</td>
                  <td className="border px-3 py-2 text-center flex gap-2 justify-center">
                    <button
                      title={`Extender +${EXTENDER_DAYS} días`}
                      onClick={() => extenderDias(u)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FaRedo />
                    </button>
                    <button
                      title={u.estado === "suspendido" ? "Reactivar" : "Suspender"}
                      onClick={() => toggleSuspension(u)}
                      className="text-yellow-600 hover:text-yellow-800"
                    >
                      <FaBan />
                    </button>
                    <button
                      title="Cambiar rol"
                      onClick={() => toggleRol(u)}
                      className="text-purple-600 hover:text-purple-800"
                    >
                      <FaUserShield />
                    </button>
                    <button
                      title="Eliminar usuario"
                      onClick={() => eliminarUsuario(u)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Mostrando{" "}
          {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)} -{" "}
          {Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length} usuarios
        </div>
        <div className="flex gap-2 items-center">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="text-sm">
            {page} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
