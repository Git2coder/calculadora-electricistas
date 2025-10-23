import React, { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";

/**
 * MensajesPanel.jsx
 * - Muestra mensajes desde la colección `mensajesUsuarios` (en tiempo real).
 * - Añade filtros por tipo/origen.
 * - Panel de estadísticas resumidas por tipo/origen.
 * - Botón admin para activar/desactivar la encuestaSatisfaccion (flag en config/app).
 */

export default function MensajesPanel() {
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === "admin";
  const db = getFirestore();

  const [mensajes, setMensajes] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroOrigen, setFiltroOrigen] = useState("todos");
  const [cargando, setCargando] = useState(true);
  // 🔹 Resumen general por tipo de mensaje
  const [resumenPorTipo, setResumenPorTipo] = useState({
    positivas: 0,
    criticas: 0,
    sugerencias: 0,
    soporte: 0,
  });

  // --- config/app: encuestaSatisfaccionActiva + version ---
  const [encuestaActiva, setEncuestaActiva] = useState(false);
  const [encuestaVersion, setEncuestaVersion] = useState(null);
  const [cfgLoading, setCfgLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    // Calcular resumen cuando cambian los mensajes
    const resumen = {
      positivas: 0,
      criticas: 0,
      sugerencias: 0,
      soporte: 0,
    };

    mensajes.forEach((msg) => {
      if (msg.estado === "revisado") return; // ignorar revisados

      if (msg.tipo === "satisfaccion") {
        if (msg.nivelValor <= 2) resumen.criticas++;
        else resumen.positivas++;
      } else if (msg.tipo === "sugerencia") {
        resumen.sugerencias++;
      } else if (msg.tipo === "soporte" || msg.origen === "asistente") {
        resumen.soporte++;
      }
    });

    setResumenPorTipo(resumen);
  }, [mensajes]);

  useEffect(() => {
    const q = query(collection(db, "mensajesUsuarios"), orderBy("fecha", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const datos = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMensajes(datos);
      setCargando(false);
    }, (err) => {
      console.error("Error escuchando mensajesUsuarios:", err);
      setCargando(false);
    });

    return () => unsub();
  }, [db]);

  // Leer config/app para el flag
  useEffect(() => {
    const cfgRef = doc(db, "config", "app");
    const unsub = onSnapshot(cfgRef, (snap) => {
      const data = snap.exists() ? snap.data() : {};
      setEncuestaActiva(!!data.encuestaSatisfaccionActiva);
      setEncuestaVersion(data.encuestaSatisfaccionVersion ?? null);
      setCfgLoading(false);
    }, (err) => {
      console.error("Error leyendo config/app:", err);
      setCfgLoading(false);
    });
    return () => unsub();
  }, [db]);

  // Estadísticas rápidas
  
  const resumenPorOrigen = mensajes.reduce((acc, m) => {
    acc[m.origen] = (acc[m.origen] || 0) + 1;
    return acc;
  }, {});

  const cambiarEstado = async (id, cambios) => {
    try {
      await updateDoc(doc(db, "mensajesUsuarios", id), cambios);
    } catch (err) {
      console.error("Error actualizando estado:", err);
      alert("No se pudo actualizar el estado. Revisá la consola.");
    }
  };

  const filtrarMensajes = () => {
    return mensajes.filter((m) => {
      let coincide = true;

      if (filtroTipo === "critica") {
        coincide = m.tipo === "satisfaccion" && m.nivelValor <= 2;
      } else if (filtroTipo === "positiva") {
        coincide = m.tipo === "satisfaccion" && m.nivelValor > 2;
      } else if (filtroTipo === "sugerencia") {
        coincide = m.tipo === "sugerencia";
      } else if (filtroTipo === "soporte") {
        coincide = m.tipo === "soporte";
      }

      return coincide;
    });
  };

  const mensajesFiltrados = mensajes.filter(
    (m) =>
      (filtroTipo === "todos" || m.tipo === filtroTipo) &&
      (filtroOrigen === "todos" || m.origen === filtroOrigen) &&
      (m.encuestaVersion === encuestaVersion || !m.encuestaVersion) // ✅ solo versión actual
  );

  const colores = {
    satisfaccion: "bg-blue-50 border-blue-300 text-blue-700",
    sugerencia: "bg-green-50 border-green-300 text-green-700",
    soporte: "bg-yellow-50 border-yellow-300 text-yellow-700",
    bloqueo: "bg-gray-50 border-gray-300 text-gray-700",
  };

  // --- Toggle flag admin ---
  const toggleEncuestaSatisfaccion = async () => {
    if (!esAdmin) return alert("Solo admins pueden activar/desactivar la encuesta.");
    setToggling(true);

    try {
      const cfgRef = doc(db, "config", "app");
      const snap = await getDoc(cfgRef);
      const current = snap.exists() ? snap.data() : {};
      const currentVersion = current.encuestaSatisfaccionVersion ?? 0;
      const currentState = current.encuestaSatisfaccionActiva ?? false;

      // Si la encuesta está inactiva → al activarla se incrementa la versión y se agrega la fecha
      const nuevaVersion = currentState ? currentVersion : currentVersion + 1;

      await setDoc(
        cfgRef,
        {
          encuestaSatisfaccionActiva: !currentState,
          encuestaSatisfaccionVersion: nuevaVersion,
          encuestaSatisfaccionLanzadaEn: !currentState
            ? new Date().toISOString() // solo al activar
            : null,                    // si se apaga, limpiamos la fecha
        },
        { merge: true }
      );

      console.log(
        `✅ Encuesta ${!currentState ? "activada" : "desactivada"} (versión ${nuevaVersion})`
      );
    } catch (err) {
      console.error("Error toggling encuesta flag:", err);
      alert("No se pudo cambiar el estado de la encuesta. Revisá la consola.");
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">📨 Mensajes de usuarios</h1>
          <p className="text-sm text-gray-600">Vista centralizada de mensajes (sugerencias, soporte, satisfaccion y bloqueo).</p>
        </div>

        {/* ADMIN CONTROLS */}
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600 mr-2">
            {cfgLoading ? "Cargando config..." : (
              <div className="text-right">
                <div className="text-xs text-gray-500">Encuesta activa: <span className="font-semibold">{encuestaActiva ? "Sí" : "No"}</span></div>
                <div className="text-xs text-gray-500">Versión: <span className="font-semibold">{encuestaVersion ?? "—"}</span></div>
              </div>
            )}
          </div>

          {esAdmin && (
            <button
              onClick={toggleEncuestaSatisfaccion}
              disabled={toggling}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${encuestaActiva ? "bg-red-600 text-white" : "bg-blue-600 text-white"} hover:opacity-90`}
              title={encuestaActiva ? "Desactivar encuesta de satisfacción" : "Activar encuesta de satisfacción"}
            >
              {toggling ? "Guardando..." : (encuestaActiva ? "Desactivar encuesta" : "Lanzar encuesta")}
            </button>
          )}
        </div>
      </div>

      {/* Estadísticas + filtros visuales */}
      <div className="flex flex-wrap gap-3 mb-6 items-center">

        {/* Totales */}
        <div className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm border">
          <div className="text-sm text-gray-700 font-semibold">Pendientes</div>
          <div className="text-sm text-gray-500">
            Mensajes:{" "}
            <span className="font-medium">
              {mensajes.filter((m) => m.estado !== "revisado").length}
            </span>
          </div>
        </div>

        {/* Resumen general con iconos clickeables */}
        <div className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm border">
          <div className="text-sm font-semibold text-gray-700">Resumen general</div>
          <div className="flex gap-2 items-center text-xs">

            {/* Soporte */}
            <button
              onClick={() => setFiltroTipo(filtroTipo === "soporte" ? "todos" : "soporte")}
              className={`px-2 py-1 rounded transition ${
                filtroTipo === "soporte"
                  ? "bg-red-600 text-white"
                  : "bg-red-50 text-blue-700 hover:bg-red-100"
              }`}
              title="Ver solo reportes o problemas"
            >
              🆘 {resumenPorTipo.soporte || 0}
            </button>

            {/* Críticas */}
            <button
              onClick={() => setFiltroTipo(filtroTipo === "critica" ? "todos" : "critica")}
              className={`px-2 py-1 rounded transition ${
                filtroTipo === "critica"
                  ? "bg-yellow-600 text-white"
                  : "bg-yellow-50 text-red-700 hover:bg-yellow-100"
              }`}
              title="Ver solo opiniones negativas"
            >
              👎 {resumenPorTipo.criticas || 0}
            </button>

            {/* Sugerencias */}
            <button
              onClick={() => setFiltroTipo(filtroTipo === "sugerencia" ? "todos" : "sugerencia")}
              className={`px-2 py-1 rounded transition ${
                filtroTipo === "sugerencia"
                  ? "bg-blue-600 text-white"
                  : "bg-blue-50 text-yellow-700 hover:bg-blue-100"
              }`}
              title="Ver solo sugerencias"
            >
              💬 {resumenPorTipo.sugerencias || 0}
            </button>

            {/* Positivas */}
            <button
              onClick={() => setFiltroTipo(filtroTipo === "positiva" ? "todos" : "positiva")}
              className={`px-2 py-1 rounded transition ${
                filtroTipo === "positiva"
                  ? "bg-green-600 text-white"
                  : "bg-green-50 text-green-700 hover:bg-green-100"
              }`}
              title="Ver solo opiniones positivas"
            >
              😃 {resumenPorTipo.positivas || 0}
            </button>
          </div>
        </div>
        {/* Porcentaje por origen */}
        <div className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm border">
          <div className="text-sm font-semibold text-gray-700">Origen de mensajes</div>
          <div className="flex gap-2 items-center text-xs">
            {Object.entries(resumenPorOrigen).length === 0 ? (
              <span className="text-xs text-gray-500">—</span>
            ) : (
              Object.entries(resumenPorOrigen).map(([origen, count]) => {
                const pct = ((count / mensajes.length) * 100).toFixed(0);
                return (
                  <span key={origen} className="px-2 py-1 rounded bg-gray-100 text-gray-700">
                    {origen}: {pct}%
                  </span>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* LISTA */}
      {cargando ? (
        <p className="text-gray-500">Cargando mensajes...</p>
      ) : mensajesFiltrados.length === 0 ? (
        <p className="text-gray-500">No hay mensajes con los filtros seleccionados.</p>
      ) : (
        <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-2">
          {mensajesFiltrados.map((msg) => {
            const fecha = msg.fecha?.toDate
              ? msg.fecha.toDate().toLocaleString("es-AR", {
                  dateStyle: "short",
                  timeStyle: "short",
                })
              : "—";

            const tipoIcon =
              msg.tipo === "satisfaccion"
                ? "⚡"
                : msg.tipo === "sugerencia"
                ? "💬"
                : msg.tipo === "soporte"
                ? "🆘"
                : "📨";

            // estado visual compacto
            const estado = msg.estado || "pendiente";

            return (
              <div
                key={msg.id}
                className={`p-3 border rounded-lg shadow-sm hover:shadow-md transition bg-white flex items-start justify-between gap-3 ${colores[msg.tipo] || ""}`}
              >
                {/* IZQUIERDA: icono + título + contenido (flexible) */}
                <div className="flex items-start gap-3 min-w-0">
                  <div className="text-lg w-9 h-9 rounded-full flex items-center justify-center border text-sm">
                    {tipoIcon}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-800 truncate">
                        {msg.tipo === "satisfaccion"
                          ? msg.nivelValor && msg.nivelValor <= 2
                            ? "Opinión crítica"
                            : "Opinión positiva"
                          : msg.tipo === "sugerencia"
                          ? "Sugerencia"
                          : msg.tipo === "soporte"
                          ? "Soporte / Reporte"
                          : "Mensaje"}
                      </span>
                      {msg.nivelValor ? (
                        <span className="text-[11px] text-gray-500 px-1 rounded">{`(${msg.nivelValor})`}</span>
                      ) : null}
                    </div>

                    {/* correo en linea, pequeño */}
                    {msg.email && (
                      <div className="text-xs text-gray-500 truncate">{msg.email}</div>
                    )}

                    {/* texto principal: truncar a 2 líneas si es muy largo */}
                    <div className="text-sm text-gray-700 leading-snug mt-1 truncate" style={{ WebkitLineClamp: 2, display: "-webkit-box", WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {msg.comentario || msg.mensaje || "(Sin texto)"}
                    </div>
                  </div>
                </div>

                {/* DERECHA: fecha y botones (alineados verticalmente si hace falta) */}
                <div className="flex flex-col items-end gap-2">
                  <span className="text-[11px] text-gray-400">{fecha}</span>

                  <div className="flex items-center gap-2">
                    {/* Botón para marcar pendiente/revisado */}
                    <button
                      onClick={async () => {
                        const nuevo = msg.estado === "revisado" ? "pendiente" : "revisado";
                        await cambiarEstado(msg.id, { estado: nuevo }); // cambia solo el campo estado
                      }}
                      className={`text-xs px-2 py-1 rounded ${
                        msg.estado === "revisado"
                          ? "bg-green-600 text-white hover:opacity-90"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                      title={msg.estado === "revisado" ? "Marcar pendiente" : "Marcar revisado"}
                    >
                      {msg.estado === "revisado" ? "Revisado" : "Marcar revisado"}
                    </button>

                    {/* Botón para marcar / desmarcar respondido */}
                    <button
                      onClick={async () => {
                        if (msg.respondidoEn) {
                          // Si ya estaba respondido, desmarcar
                          await cambiarEstado(msg.id, { respondidoEn: null });
                        } else {
                          // Si no lo estaba, marcar con fecha actual
                          await cambiarEstado(msg.id, { respondidoEn: new Date().toISOString() });
                        }
                      }}
                      className={`text-xs px-2 py-1 rounded ${
                        msg.respondidoEn
                          ? "bg-blue-600 text-white hover:opacity-90"
                          : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                      }`}
                      title={
                        msg.respondidoEn
                          ? `Respondido el ${new Date(msg.respondidoEn).toLocaleDateString("es-AR")}`
                          : "Marcar como respondido"
                      }
                    >
                      {msg.respondidoEn
                        ? new Date(msg.respondidoEn).toLocaleDateString("es-AR")
                        : "Respondido"}
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
