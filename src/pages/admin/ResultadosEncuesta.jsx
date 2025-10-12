import { useState, useEffect, useRef } from "react";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";

export default function ResultadosEncuesta() {
  const [vista, setVista] = useState("resultados");
  const [encuestaId, setEncuestaId] = useState("");
  const [activa, setActiva] = useState(false);
  const [listaCampanias, setListaCampanias] = useState([]);
  const [respuestas, setRespuestas] = useState([]);
  const [resultados, setResultados] = useState([]);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const campañasUnsubRef = useRef(null);
  const respuestasUnsubRef = useRef(null);
  const [filtro, setFiltro] = useState(null);

  const respuestasFiltradas = filtro
    ? respuestas.filter((r) => r.nivelValor === filtro)
    : respuestas;

  const nivelesMeta = {
    1: { emoji: "😣", texto: "Complicada", color: "bg-red-50 border-red-200 text-red-700" },
    2: { emoji: "😐", texto: "Malos precios", color: "bg-yellow-50 border-yellow-200 text-yellow-700" },
    3: { emoji: "⏱️", texto: "Ahorra tiempo", color: "bg-green-50 border-green-200 text-green-700" },
    4: { emoji: "⚡", texto: "¡Excelente!", color: "bg-blue-50 border-blue-200 text-blue-700" },
  };

  // Suscripción campañas
  useEffect(() => {
    const colRef = collection(db, "encuestas");
    const q = query(colRef, orderBy("creadaEn", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((c) => !c.deleted);
        setListaCampanias(data);
      },
      (err) => console.error("Error escuchando encuestas:", err)
    );
    campañasUnsubRef.current = unsub;
    return () => unsub();
  }, []);

  // Suscripción respuestas
  useEffect(() => {
    if (respuestasUnsubRef.current) respuestasUnsubRef.current();
    if (!encuestaId) {
      setRespuestas([]);
      setResultados([]);
      setActiva(false);
      return;
    }

    const encRef = doc(db, "encuestas", encuestaId);
    const unsubCfg = onSnapshot(encRef, (snap) => {
      const data = snap.exists() ? snap.data() : null;
      setActiva(!!data?.activa);
    });

    const resCol = collection(db, "encuestas", encuestaId, "respuestas");
    const q = query(resCol, orderBy("timestamp", "desc"));
    const unsubResp = onSnapshot(
      q,
      (snap) => {
        const datos = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setRespuestas(datos);

        const conteo = { 1: 0, 2: 0, 3: 0, 4: 0 };
        datos.forEach((r) => {
          const v = Number(r.nivelValor);
          if (conteo[v] !== undefined) conteo[v]++;
        });
        const total = Object.values(conteo).reduce((a, b) => a + b, 0);
        const porcentajes = [1, 2, 3, 4].map((nivel) => ({
          nivel,
          cantidad: conteo[nivel],
          porcentaje: total ? ((conteo[nivel] / total) * 100).toFixed(1) : "0.0",
        }));
        setResultados(porcentajes);
      },
      (err) => console.error("Error escuchando respuestas:", err)
    );

    respuestasUnsubRef.current = () => {
      unsubResp();
      unsubCfg();
    };

    return () => {
      if (respuestasUnsubRef.current) respuestasUnsubRef.current();
    };
  }, [encuestaId]);

  // Crear nueva campaña
  const crearNuevaEncuesta = async () => {
    const fecha = new Date();
    const nuevoId =
      nuevoNombre.trim() ||
      `encuesta_${fecha.getFullYear()}_${(fecha.getMonth() + 1)
        .toString()
        .padStart(2, "0")}_${fecha.getDate()}`;

    await setDoc(doc(db, "encuestas", nuevoId), {
      creadaEn: fecha,
      activa: true,
      deleted: false,
    });

    const cfgRef = doc(db, "config", "encuestaActual");
    const cfgSnap = await getDoc(cfgRef);
    const prevVersion = cfgSnap.exists() ? cfgSnap.data().version || 1 : 1;
    const nuevaVersion = prevVersion + 1;
    await setDoc(cfgRef, { id: nuevoId, activa: true, version: nuevaVersion });
    setNuevoNombre("");
    setEncuestaId(nuevoId);
    alert(`✅ Nueva campaña creada: ${nuevoId}`);
  };

  // Activar / desactivar
  const toggleActiva = async (forzarEstado) => {
    if (!encuestaId) return alert("Seleccioná una campaña primero.");
    const newState = typeof forzarEstado === "boolean" ? forzarEstado : !activa;
    await setDoc(doc(db, "encuestas", encuestaId), { activa: newState }, { merge: true });

    const cfgRef = doc(db, "config", "encuestaActual");
    const cfgSnap = await getDoc(cfgRef);
    if (newState) {
      const prevVersion = cfgSnap.exists() ? cfgSnap.data().version || 1 : 1;
      const nuevaVersion = prevVersion + 1;
      await setDoc(cfgRef, { id: encuestaId, activa: true, version: nuevaVersion });
    } else if (cfgSnap.exists() && cfgSnap.data().id === encuestaId) {
      await setDoc(cfgRef, { id: null, activa: false }, { merge: true });
    }
  };

  // Eliminar campaña
  const eliminarEncuesta = async (id) => {
    if (!confirm(`¿Eliminar campaña "${id}" y todas sus respuestas?`)) return;
    try {
      const resCol = collection(db, "encuestas", id, "respuestas");
      const snap = await getDocs(resCol);
      await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
      await deleteDoc(doc(db, "encuestas", id));

      const cfgRef = doc(db, "config", "encuestaActual");
      const cfgSnap = await getDoc(cfgRef);
      if (cfgSnap.exists() && cfgSnap.data().id === id) {
        await setDoc(cfgRef, { id: null, activa: false }, { merge: true });
      }

      setListaCampanias((prev) => prev.filter((c) => c.id !== id));
      if (encuestaId === id) {
        setEncuestaId("");
        setRespuestas([]);
        setResultados([]);
      }
      alert("🗑️ Campaña eliminada correctamente.");
    } catch (err) {
      console.error("Error eliminando campaña:", err);
      alert("Error eliminando campaña. Revisá la consola.");
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex gap-3 mb-4">
        <button
          onClick={() => setVista("resultados")}
          className={`px-4 py-2 rounded-lg ${
            vista === "resultados" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
          }`}
        >
          📊 Resultados
        </button>
        <button
          onClick={() => setVista("admin")}
          className={`px-4 py-2 rounded-lg ${
            vista === "admin" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
          }`}
        >
          ⚙️ Campañas
        </button>
      </div>

      {vista === "resultados" && (
        <div className="max-w-5xl mx-auto">
          <h3 className="text-lg font-semibold text-blue-700 mb-3">📈 Resultados de encuestas</h3>

          <div className="mb-3">
            <label className="block text-sm mb-1 text-gray-700">Seleccionar campaña:</label>
            <select
              value={encuestaId}
              onChange={(e) => setEncuestaId(e.target.value)}
              className="w-full border rounded-lg p-2 text-sm"
            >
              <option value="">Seleccionar una encuesta...</option>
              {listaCampanias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id}{" "}
                  {c.creadaEn
                    ? `(${new Date(c.creadaEn.seconds * 1000).toLocaleDateString()})`
                    : ""}
                </option>
              ))}
            </select>
          </div>

          {encuestaId ? (
            <>
              {/* 🔹 Cuadros compactos distribuidos horizontalmente */}
              <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-4">
                {resultados.map(({ nivel, cantidad, porcentaje }) => {
                  const activo = filtro === nivel;
                  return (
                    <button
                      key={nivel}
                      onClick={() => setFiltro(activo ? null : nivel)}
                      className={`flex flex-col items-center justify-center py-3 rounded-xl border text-xl font-medium transition-all duration-200 shadow-sm
                        ${nivelesMeta[nivel].color}
                        ${
                          activo
                            ? "ring-2 ring-blue-400 scale-105 bg-white shadow-md"
                            : "hover:scale-105"
                        }`}
                      title={`Filtrar por: ${nivelesMeta[nivel].texto}`}
                    >
                      <span className="text-2xl">{nivelesMeta[nivel].emoji}</span>
                      <span className="text-[11px] mt-1 leading-tight text-gray-700 text-center px-1">
                        {porcentaje}% ({cantidad})
                      </span>
                    </button>
                  );
                })}
              </div>

              {filtro && (
                <div className="text-center mb-2">
                  <button
                    onClick={() => setFiltro(null)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Mostrar todos los comentarios
                  </button>
                </div>
              )}

              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-500">
                  Total de respuestas: <strong>{respuestas.length}</strong>
                </p>
                {filtro && (
                  <p className="text-sm text-gray-600 italic">
                    Filtrando por: <strong>{nivelesMeta[filtro].texto}</strong>
                  </p>
                )}
              </div>

              <h4 className="text-md font-semibold text-gray-800 mb-2">Opiniones</h4>

              {respuestasFiltradas.length === 0 ? (
                <p className="text-gray-500 text-sm">No hay respuestas registradas para esta campaña.</p>
              ) : (
                <div className="max-h-[70vh] overflow-y-auto space-y-2 p-1 bg-gray-50 rounded-lg">
                  {respuestasFiltradas.map((r) => (
                    <div
                      key={r.id}
                      className={`p-3 rounded-lg border ${
                        r.nivelValor === 1
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="text-sm text-gray-800">
                          {r.comentario || "(Sin comentario)"}
                        </div>
                        <div className="text-xs text-gray-400 whitespace-nowrap">
                          {r.timestamp?.toDate
                            ? r.timestamp.toDate().toLocaleString()
                            : ""}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-500 text-sm">
              Seleccioná una campaña para ver resultados.
            </p>
          )}
        </div>
      )}

      {/* ADMIN */}
      {vista === "admin" && (
        <div className="max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-blue-700 mb-3">
            ⚙️ Administración de campañas
          </h3>

          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm text-gray-700">Estado actual:</span>
            <button
              onClick={() => toggleActiva()}
              className={`px-4 py-2 rounded-lg font-medium ${
                activa ? "bg-green-500 text-white" : "bg-gray-300 text-gray-700"
              }`}
            >
              {activa ? "Activa" : "Inactiva"}
            </button>
          </div>

          <input
            type="text"
            placeholder="Ej: encuesta_octubre"
            value={nuevoNombre}
            onChange={(e) => setNuevoNombre(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
          <button
            onClick={crearNuevaEncuesta}
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-500 transition mb-6"
          >
            Crear nueva campaña
          </button>

          <h4 className="text-md font-semibold text-gray-800 mb-2">
            Campañas creadas
          </h4>
          <div className="max-h-64 overflow-y-auto border rounded-lg divide-y">
            {listaCampanias.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">
                No hay campañas registradas.
              </p>
            ) : (
              listaCampanias.map((c) => (
                <div
                  key={c.id}
                  className="flex justify-between items-center px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium text-gray-700">{c.id}</p>
                    {c.creadaEn?.toDate && (
                      <p className="text-xs text-gray-500">
                        {c.creadaEn.toDate().toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setEncuestaId(c.id);
                        setVista("resultados");
                      }}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Ver
                    </button>
                    <button
                      onClick={() => toggleActiva(c.activa ? false : true)}
                      className="text-sm border px-2 py-1 rounded text-gray-700"
                    >
                      {c.activa ? "Desactivar" : "Activar"}
                    </button>
                    <button
                      onClick={() => eliminarEncuesta(c.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
