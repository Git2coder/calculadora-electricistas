import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit, startAfter, startAt, updateDoc, deleteDoc, doc, where } from "firebase/firestore";
import { db } from "../../firebaseConfig";

const UsuariosAdmin = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [ultimaPagina, setUltimaPagina] = useState(null);
  const [primeraPagina, setPrimeraPagina] = useState(null);
  const [paginaStack, setPaginaStack] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);

  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  const [seleccionados, setSeleccionados] = useState([]);
  const [filtroTarjeta, setFiltroTarjeta] = useState(null);
  
  const aplicarFiltroDesdeTarjeta = async (tipo) => {
    try {
      let q = collection(db, "usuarios");

      if (tipo === "suscriptos") {
        q = query(q, where("suscripcionActiva", "==", true));
      } else if (tipo === "sinAcceso") {
        const snapshot = await getDocs(collection(db, "usuarios"));
        const hoy = new Date();

        const filtrados = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((u) => {
            // caso 1: suspendido explícito
            if (u.estado === "suspendido") return true;

            // caso 2: superó 7 días desde creadoEn y no tiene suscripción activa
            if (u.creadoEn?.toDate) {
              const creado = u.creadoEn.toDate();
              const diferenciaDias = (hoy - creado) / (1000 * 60 * 60 * 24);
              if (diferenciaDias > 7 && !u.suscripcionActiva) {
                return true;
              }
            }
            return false;
          });

        setUsuarios(filtrados);
        setPaginaActual(1);
        setFiltroActivo(tipo);
        return; // 👈 importante: salimos de la función aquí
      } else if (tipo === "nuevos") {
        const haceUnMes = new Date();
        haceUnMes.setMonth(haceUnMes.getMonth() - 1);
        q = query(q, where("creadoEn", ">=", haceUnMes));
      } else {
        // Usuarios totales → traigo todo
        q = collection(db, "usuarios");
      }

      const snapshot = await getDocs(q);
      const filtrados = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUsuarios(filtrados);
      setPaginaActual(1); // reseteo la paginación
      setFiltroActivo(tipo);
    } catch (error) {
      console.error("Error al aplicar filtro:", error);
    }
  };

  // Nuevo estado
  const [filtroActivo, setFiltroActivo] = useState("todos");

  // Helper: convierte Timestamp o Date a Date nativa
  const toDateSafe = (ts) => (ts?.toDate ? ts.toDate() : ts instanceof Date ? ts : null);

  // Usa la misma lógica que el AuthContext para clasificar acceso
  const evaluarAccesoAdmin = (u) => {
    const hoy = new Date();

    // 1) Suspendido explícito
    if (u.estado === "suspendido") return "suspendido";

    // 2) Suscripto si tiene suscripción activa o expiración futura
    const exp = toDateSafe(u.fechaExpiracion);
    if (u.suscripcionActiva === true || (exp && exp > hoy)) return "suscripto";

    // 3) Trial si dentro de 7 días desde creadoEn
    const creado = toDateSafe(u.creadoEn);
    if (creado) {
      const dias = (hoy - creado) / 86400000;
      if (dias <= 7) return "trial";
    }

    // 4) Resto: sin acceso (vencidos / nunca pagaron)
    return "sin-acceso";
  };

  const fetchUsuarios = async (reset = false) => {
    if (reset) {
      setUltimoDoc(null);
      setUsuarios([]);
      setTieneMas(true);
    }

    let baseQuery = collection(db, "usuarios");

    // 📌 Definir filtros según tarjeta activa
    if (filtroActivo === "suscriptos") {
      baseQuery = query(
        baseQuery,
        where("fechaExpiracion", ">", new Date())
      );
    } else if (filtroActivo === "sin-acceso") {
      baseQuery = query(
        baseQuery,
        where("fechaExpiracion", "<=", new Date())
      );
    } else if (filtroActivo === "nuevos") {
      const haceUnMes = new Date();
      haceUnMes.setMonth(haceUnMes.getMonth() - 1);
      baseQuery = query(
        baseQuery,
        where("creadoEn", ">", haceUnMes)
      );
    }

    // 📌 Paginación
    let q = query(baseQuery, orderBy("creadoEn", "desc"), limit(10));
    if (ultimoDoc && !reset) {
      q = query(baseQuery, orderBy("creadoEn", "desc"), startAfter(ultimoDoc), limit(10));
    }

    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const nuevosUsuarios = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsuarios((prev) => reset ? nuevosUsuarios : [...prev, ...nuevosUsuarios]);
      setUltimoDoc(snapshot.docs[snapshot.docs.length - 1]);
      setTieneMas(snapshot.docs.length === 10);
    } else {
      setTieneMas(false);
    }
  };

  // 📊 Resumen
    const [totalUsuarios, setTotalUsuarios] = useState(0);
    const [totalSuscriptos, setTotalSuscriptos] = useState(0);
    const [totalSinAcceso, setTotalSinAcceso] = useState(0);
    const [nuevosMes, setNuevosMes] = useState(0);
    
    const pageSize = 10;
  
  // 📊 Calcular métricas de resumen
    const calcularResumen = async () => {
      const snapshot = await getDocs(collection(db, "usuarios"));
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setTotalUsuarios(data.length);

      const hoy = new Date();
      const haceUnMes = new Date();
      haceUnMes.setMonth(haceUnMes.getMonth() - 1);

      let suscriptos = 0;
      let sinAcceso = 0;
      let nuevos = 0;

      data.forEach((u) => {
        const estadoAcceso = evaluarAccesoAdmin(u);

        if (estadoAcceso === "suscripto") suscriptos++;
        if (estadoAcceso === "sin-acceso" || estadoAcceso === "suspendido") sinAcceso++;
        

        const creado = toDateSafe(u.creadoEn);
        if (creado && creado > haceUnMes) nuevos++;
      });


      setTotalSuscriptos(suscriptos);
      setTotalSinAcceso(sinAcceso);
      setNuevosMes(nuevos);
    };

    useEffect(() => {
      calcularResumen();
    }, []);

  // 📌 Cargar la primera página
  const fetchPrimeraPagina = async () => {
    setCargando(true);
    const q = query(
      collection(db, "usuarios"),
      orderBy("creadoEn", "desc"),
      limit(pageSize)
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      setUsuarios(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setPrimeraPagina(snapshot.docs[0]);
      setUltimaPagina(snapshot.docs[snapshot.docs.length - 1]);
      setPaginaStack([]);
      setPaginaActual(1);
      setSeleccionados([]); // limpia selección
    }
    setCargando(false);
  };

  // 📌 Paginación siguiente y anterior (idéntica a la que ya tienes)
  const fetchSiguiente = async () => {
    if (!ultimaPagina) return;
    setCargando(true);
    const q = query(
      collection(db, "usuarios"),
      orderBy("creadoEn", "desc"),
      startAfter(ultimaPagina),
      limit(pageSize)
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      setPaginaStack((prev) => [...prev, primeraPagina]);
      setUsuarios(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setPrimeraPagina(snapshot.docs[0]);
      setUltimaPagina(snapshot.docs[snapshot.docs.length - 1]);
      setPaginaActual((prev) => prev + 1);
      setSeleccionados([]);
    }
    setCargando(false);
  };

  const fetchAnterior = async () => {
    if (paginaStack.length === 0) return;
    setCargando(true);
    const prevDoc = paginaStack[paginaStack.length - 1];
    const q = query(
      collection(db, "usuarios"),
      orderBy("creadoEn", "desc"),
      startAt(prevDoc),
      limit(pageSize)
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      setUsuarios(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setPrimeraPagina(snapshot.docs[0]);
      setUltimaPagina(snapshot.docs[snapshot.docs.length - 1]);
      setPaginaStack((prev) => prev.slice(0, -1));
      setPaginaActual((prev) => prev - 1);
      setSeleccionados([]);
    }
    setCargando(false);
  };

  useEffect(() => {
    fetchPrimeraPagina();
  }, []);

  // 📌 Filtrado en memoria (un solo lugar)
  const usuariosFiltrados = usuarios.filter((u) => {
    // 🔍 Búsqueda (soporta email o correo, y nombre/displayName)
    const texto = (u.displayName || u.nombre || "").toLowerCase();
    const mail  = (u.email || u.correo || "").toLowerCase();
    const coincideBusqueda =
      texto.includes(busqueda.toLowerCase()) || mail.includes(busqueda.toLowerCase());

    // 🎭 Rol / Estado (selects)
    const coincideRol = filtroRol === "todos" || (u.rol || "usuario") === filtroRol;
    const estadoAcceso = evaluarAccesoAdmin(u);  // lo usamos también más abajo
    const coincideEstado = filtroEstado === "todos" || estadoAcceso === filtroEstado;

    // 🟦 Filtro activado desde las tarjetas (usa la MISMA lógica)
    const hoy = new Date();
    const haceUnMes = new Date();
    haceUnMes.setMonth(haceUnMes.getMonth() - 1);

    let coincideTarjeta = true;
    
    if (filtroActivo === "suscriptos") {
      coincideTarjeta = estadoAcceso === "suscripto";
    }

    if (filtroActivo === "sin-acceso") {
      coincideTarjeta =
        estadoAcceso === "sin-acceso" || estadoAcceso === "suspendido";
    }

    if (filtroActivo === "nuevos") {
      const creado = toDateSafe(u.creadoEn);
      coincideTarjeta = !!(creado && creado > haceUnMes);
    }
    return coincideBusqueda && coincideRol && coincideEstado && coincideTarjeta;
  });

  // 📌 Selección
  const toggleSeleccion = (id) => {
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  const toggleSeleccionTodos = () => {
    if (seleccionados.length === usuariosFiltrados.length) {
      setSeleccionados([]);
    } else {
      setSeleccionados(usuariosFiltrados.map((u) => u.id));
    }
  };

  // 📌 Acciones masivas
  const cambiarRol = async (nuevoRol) => {
    for (const id of seleccionados) {
      await updateDoc(doc(db, "usuarios", id), { rol: nuevoRol });
    }
    fetchPrimeraPagina();
  };

  const eliminarUsuarios = async () => {
    if (!window.confirm("¿Seguro que quieres eliminar los usuarios seleccionados?")) return;
    for (const id of seleccionados) {
      await deleteDoc(doc(db, "usuarios", id));
    }
    fetchPrimeraPagina();
  };

  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-bold mb-4">👥 Panel de Usuarios</h2>
        
        {seleccionados.length > 0 && (
          <div className="mb-4 text-sm text-gray-700">
            {seleccionados.length} usuario(s) seleccionado(s)
          </div>
        )}

      {/* 📊 Tarjetas resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div
          onClick={() => aplicarFiltroDesdeTarjeta("todos")}
          className="cursor-pointer bg-blue-100 p-4 rounded-xl shadow text-center hover:bg-blue-200 transition"
        >
          <h3 className="text-lg font-semibold text-blue-800">Usuarios Totales</h3>
          <p className="text-2xl font-bold text-blue-900">{totalUsuarios}</p>
        </div>

        <div
          onClick={() => aplicarFiltroDesdeTarjeta("suscriptos")}
          className="cursor-pointer bg-green-100 p-4 rounded-xl shadow text-center hover:bg-green-200 transition"
        >
          <h3 className="text-lg font-semibold text-green-800">Suscriptos</h3>
          <p className="text-2xl font-bold text-green-900">{totalSuscriptos}</p>
        </div>

        <div
          onClick={() => aplicarFiltroDesdeTarjeta("sinAcceso")}
          className="cursor-pointer bg-red-100 p-4 rounded-xl shadow text-center hover:bg-red-200 transition"
        >
          <h3 className="text-lg font-semibold text-red-800">Sin acceso</h3>
          <p className="text-2xl font-bold text-red-900">{totalSinAcceso}</p>
        </div>

        <div
          onClick={() => aplicarFiltroDesdeTarjeta("nuevos")}
          className="cursor-pointer bg-yellow-100 p-4 rounded-xl shadow text-center hover:bg-yellow-200 transition"
        >
          <h3 className="text-lg font-semibold text-yellow-800">Nuevos último mes</h3>
          <p className="text-2xl font-bold text-yellow-900">{nuevosMes}</p>
        </div>
      </div>

      {/* 📌 Barra de búsqueda y filtros */}
      <div className="flex flex-wrap gap-4 mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="p-2 border rounded flex-1 min-w-[200px]"
        />

        <select
          value={filtroRol}
          onChange={(e) => setFiltroRol(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="todos">Todos los roles</option>
          <option value="usuario">Usuario</option>
          <option value="admin">Admin</option>
        </select>

        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="todos">Todos los estados</option>
          <option value="suscripto">Suscripción activa</option>
          <option value="trial">Periodo de prueba</option>
          <option value="sin-acceso">Sin acceso</option>
          <option value="suspendido">Suspendido</option>
        </select>
      </div>

      {/* 📌 Acciones masivas */}
      {seleccionados.length > 0 && (
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => cambiarRol("admin")}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Convertir en Admin
          </button>
          <button
            onClick={() => cambiarRol("usuario")}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Convertir en Usuario
          </button>
          <button
            onClick={eliminarUsuarios}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Eliminar seleccionados
          </button>
        </div>
      )}

      {cargando ? (
        <p>Cargando usuarios...</p>
      ) : (
        <>
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 border">
                  <input
                    type="checkbox"
                    checked={seleccionados.length === usuariosFiltrados.length && usuariosFiltrados.length > 0}
                    onChange={toggleSeleccionTodos}
                  />
                </th>
                <th className="px-4 py-2 border">Nombre</th>
                <th className="px-4 py-2 border">Email</th>
                <th className="px-4 py-2 border">Rol</th>
                <th className="px-4 py-2 border">Estado</th>
                <th className="px-4 py-2 border">Creado</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map((u) => (
                <tr key={u.id} className="text-center">
                  <td className="px-4 py-2 border">
                    <input
                      type="checkbox"
                      checked={seleccionados.includes(u.id)}
                      onChange={() => toggleSeleccion(u.id)}
                    />
                  </td>
                  <td className="px-4 py-2 border">{u.displayName || u.nombre || "Sin nombre"}</td>
                  <td className="px-4 py-2 border">{u.email}</td>
                  <td className="px-4 py-2 border">{u.rol || "usuario"}</td>
                  <td className="px-4 py-2 border">
                    {(() => {
                      const acceso = evaluarAccesoAdmin(u);
                      if (acceso === "suscripto") return "Suscripción activa";
                      if (acceso === "trial") return "Periodo de prueba";
                      if (acceso === "sin-acceso") return "Sin acceso";
                      if (acceso === "suspendido") return "Suspendido";
                      return "Desconocido";
                    })()}
                  </td>
                  <td className="px-4 py-2 border">
                    {u.creadoEn?.toDate ? u.creadoEn.toDate().toLocaleDateString("es-AR") : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* 📌 Controles de paginación */}
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={fetchAnterior}
              disabled={paginaStack.length === 0}
              className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
            >
              ⬅️ Anterior
            </button>
            <span className="font-semibold">Página {paginaActual}</span>
            <button
              onClick={fetchSiguiente}
              disabled={usuarios.length < pageSize}
              className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
            >
              Siguiente ➡️
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default UsuariosAdmin;
