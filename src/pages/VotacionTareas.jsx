// src/pages/VotacionTareas.jsx
import { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  getDoc,
  query,
  where,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

export default function VotacionTareas({ usuario: usuarioProp }) {
  const auth = getAuth();
  const currentUser = usuarioProp || auth.currentUser;

  const [tareas, setTareas] = useState([]);
  const [tareasExpandida, setTareasExpandida] = useState([]);
  const [votos, setVotos] = useState({});
  const [loading, setLoading] = useState(true);
  const [tarifaHoraria, setTarifaHoraria] = useState(0);
  const [sugerenciaTemp, setSugerenciaTemp] = useState("");
  const [sentidoTemp, setSentidoTemp] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [tareaParaVotar, setTareaParaVotar] = useState(null);
  const [argumentoTemp, setArgumentoTemp] = useState("");
  const [opcionSeleccionada, setOpcionSeleccionada] = useState(null);

  // -----------------------
  // Cargas iniciales
  // -----------------------
  useEffect(() => {
    const fetchAll = async () => {
      if (!currentUser) return;

      try {
        let tarifa = 0;

        // 0) Traer tarifaHoraria del usuario
        const userRef = doc(db, "usuarios", currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          tarifa = userSnap.data().tarifaHoraria || 0;
          setTarifaHoraria(tarifa);
        }

        // 1) Traer tareas_votables activas
        const votablesSnap = await getDocs(
          query(collection(db, "tareas_votables"), where("activa", "==", true))
        );
        const votables = votablesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

        // 2) Traer todas las tareas
        const tareasSnap = await getDocs(collection(db, "tareas"));
        const todas = tareasSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

        // 3) Filtrar solo las que están en votables (respetando la 'opcion' si existe)
        const filtradas = [];
        for (const v of votables) {
          const tareaId = v.tareaId;
          const opcion = v.opcion ?? null;
          const t = todas.find((x) => String(x.id) === String(tareaId) || String(x.id) === String(tareaId));
          if (!t) continue;

          if (opcion && t.opciones?.[opcion]) {
            // Variante puntual: construyo objeto variante y elimino `opciones` para evitar doble-expansión
            const base = { ...t };
            delete base.opciones;
            filtradas.push({
              ...base,
              id: `${base.id}__${opcion}`,
              idOriginal: base.id,
              variante: opcion,
              nombre: `${base.nombre} - ${opcion}`,
              ...t.opciones[opcion],
            });
          } else {
            // Solo la tarea base (si tiene opciones, NO la expandimos aquí para que no aparezcan todas)
            const base = { ...t };
            delete base.opciones; // importante: evitamos que el effect de "expand" la rompa en variantes
            filtradas.push({ ...base, idOriginal: base.id });
          }
        }

        // deduplicar por idOriginal + variante (por si hay duplicados en la colección votables)
        const seen = new Set();
        const unique = [];
        for (const f of filtradas) {
          const key = `${f.idOriginal || f.id}::${f.variante || "default"}`;
          if (!seen.has(key)) {
            seen.add(key);
            unique.push(f);
          }
        }

        // 4) Traer votos del usuario logueado
        const votosSnap = await getDocs(
          query(collection(db, "votos"), where("userId", "==", currentUser.uid))
        );
        const votosUsuario = {};
        votosSnap.docs.forEach((d) => {
          const v = d.data();
          const key = `${v.tareaId}_${v.opcion || "default"}`;
          votosUsuario[key] = v;
        });
        setVotos(votosUsuario);

        // 🔥 Asegurar que Boca siempre esté disponible como referencia (solo en memoria)
        const boca = todas.find((x) => x.nombre === "Boca" || String(x.id) === "Boca");
        if (boca) {
          const bocaKey = `${boca.id}::default`;
          if (!unique.some((f) => (f.idOriginal || f.id) === boca.id)) {
            unique.push({ ...boca, soloReferencia: true });
          }
        }

        setTareas(unique);
      } catch (err) {
        console.error("Error en fetchAll VotacionTareas:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [currentUser]);

  // -----------------------
  // Expandir variantes (solo para los items que tengan opciones y no fueron intencionalmente "pruned")
  // -----------------------
  useEffect(() => {
    const expand = [];
    for (const t of tareas) {
      // Si es solo referencia (e.j. Boca) o fue añadido sin opciones, respetamos tal cual
      if (t.soloReferencia) {
        expand.push({ ...t, idOriginal: t.id, soloReferencia: true });
        continue;
      }

      // Si el objeto tiene 'opciones' (no debería si lo pruned arriba), lo expandimos.
      if (t.opciones && typeof t.opciones === "object") {
        Object.entries(t.opciones).forEach(([variante, datos]) => {
          expand.push({
            ...t,
            id: `${t.id}__${variante}`,
            idOriginal: t.id,
            variante,
            nombre: `${t.nombre} - ${variante}`,
            tiempo: datos.tiempo ?? t.tiempo,
            multiplicador: datos.multiplicador ?? t.multiplicador,
            factorBoca: datos.factorBoca ?? t.factorBoca,
            valor: datos.valor ?? t.valor,
            porcentaje: datos.porcentaje ?? t.porcentaje,
            valorUnidad: datos.valorUnidad ?? t.valorUnidad,
            soloReferencia: t.soloReferencia || false,
          });
        });
      } else {
        expand.push({ ...t, idOriginal: t.id, soloReferencia: t.soloReferencia || false });
      }
    }
    setTareasExpandida(expand);
  }, [tareas, tarifaHoraria]);

  // -----------------------
  // Util: formateo precio
  // -----------------------
  const fmtPesos = (n) =>
    typeof n === "number" ? n.toLocaleString("es-AR", { maximumFractionDigits: 0 }) : "-";

  // -----------------------
  // Lógica de cálculo
  // -----------------------
  const calcularPrecioTarea = (tarea, todasLasTareas = []) => {
    if (!tarea) return 0;

    if (tarea.tipo === "administrativa") {
      if (typeof tarea.valor === "number") return tarea.valor || 0;
      return 0;
    }

    if (tarea.tipo === "calculada") {
      const porcentaje =
        tarea.porcentaje ??
        (tarea.opciones && tarea.variante && tarea.opciones[tarea.variante]
          ? tarea.opciones[tarea.variante].porcentaje
          : 0);
      return (tarifaHoraria * porcentaje) / 100;
    }

    if (tarea.nombre === "Boca" || tarea.idOriginal === "Boca" || tarea.id === "Boca") {
      return ((tarea.tiempo || 0) / 60) * tarifaHoraria * (tarea.multiplicador ?? 1);
    }

    if (tarea.dependeDe === "Boca") {
      const baseBoca = todasLasTareas.find(
        (t) => t.nombre === "Boca" || t.idOriginal === "Boca" || t.id === "Boca"
      );
      if (!baseBoca) return 0;

      const valorBoca =
        ((baseBoca.tiempo || 0) / 60) * tarifaHoraria * (baseBoca.multiplicador ?? 1);

      const factor = tarea.factorBoca ?? 1;
      return valorBoca * factor;
    }

    return ((tarea.tiempo || 0) / 60) * (tarea.multiplicador ?? 1) * tarifaHoraria;
  };

  // -----------------------
  // Acciones de voto
  // -----------------------
  const abrirModalVoto = (tarea) => {
    setTareaParaVotar(tarea);
    setSugerenciaTemp("");
    setSentidoTemp("");
    setArgumentoTemp("");
    setOpcionSeleccionada(tarea?.variante ?? null);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setTareaParaVotar(null);
    setSugerenciaTemp("");
    setSentidoTemp("");
    setArgumentoTemp("");
    setOpcionSeleccionada(null);
  };

  // opcionOverride: por ejemplo para votos positivos llamamos con t.variante
  const guardarVoto = async (tareaId, voto, sentido = null, sugerencia = null, opcionOverride = null) => {
    try {
      if (!currentUser) {
        alert("Debes iniciar sesión para votar.");
        return;
      }

      // Determinar opción: prioridad -> opcionOverride -> opcionSeleccionada (UI) -> "default"
      const opcionKey = opcionOverride ?? opcionSeleccionada ?? "default";

      // Buscar la tarea correcta (id + variante)
      const tareaSeleccionada = tareasExpandida.find(
        (t) =>
          (String(t.id) === String(tareaId) || String(t.idOriginal) === String(tareaId)) &&
          (t.variante === opcionKey || (!t.variante && opcionKey === "default"))
      );

      const precioCalculadora = tareaSeleccionada ? calcularPrecioTarea(tareaSeleccionada, tareasExpandida) : 0;

      const precioSugerido =
        sugerencia !== null &&
        sugerencia !== undefined &&
        String(sugerencia).trim() !== ""
          ? Number(sugerencia)
          : null;

      if (voto === -1 && (precioSugerido === null || isNaN(precioSugerido))) {
        alert("Por favor ingresá un precio sugerido para marcar como inadecuado.");
        return;
      }

      const docId = `${tareaId}_${opcionKey}_${currentUser.uid}`;
      const votoRef = doc(db, "votos", docId);

      const nuevo = {
        tareaId,
        opcion: opcionKey,
        userId: currentUser.uid,
        voto,
        sentido: sentido || null,
        sugerencia: precioSugerido,
        argumento: argumentoTemp || null,
        precioCalculadora,
        precioSugerido,
        diferenciaPorcentaje:
          voto === -1 && precioSugerido !== null && precioCalculadora > 0
            ? Number((((precioSugerido - precioCalculadora) / precioCalculadora) * 100).toFixed(1))
            : null,
        tarifaBase: tarifaHoraria,
        fecha: new Date().toISOString(),
      };

      await setDoc(votoRef, nuevo);

      // clave local idéntica a la que usamos para render
      const localKey = `${tareaId}_${opcionKey}`;
      setVotos((prev) => ({ ...prev, [localKey]: nuevo }));

      cerrarModal();
    } catch (e) {
      console.error("Error guardando voto:", e);
      alert("Ocurrió un error al guardar tu voto. Revisa la consola.");
    }
  };

  // -----------------------
  // Render
  // -----------------------
  if (loading) return <div className="p-6">Cargando tareas...</div>;

  return (
    <>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">🗳️ Votación de Tareas</h1>
        <p className="mb-4 text-sm text-gray-600">
          Aquí podés revisar los montos que genera la calculadora según tu tarifa.
          Votá si el monto te parece correcto o inadecuado. Si lo marcás como inadecuado,
          podés sugerir un valor para que lo tengamos en cuenta.
        </p>

        <div className="overflow-x-auto">
          <div className="grid gap-4 md:grid-cols-2">
            {tareasExpandida
              .filter((t) => !t.soloReferencia)
              .map((t) => {
                const precio = calcularPrecioTarea(t, tareasExpandida) || 0;
                const voteKey = `${t.idOriginal || t.id}_${t.variante || "default"}`;
                const voto = votos[voteKey];
                const votoValido =
                  voto &&
                  !(
                    voto.voto === -1 &&
                    voto.tarifaBase !== undefined &&
                    voto.tarifaBase !== tarifaHoraria
                  )
                    ? voto
                    : null;

                return (
                  <div
                    key={t.id}
                    className={`p-4 rounded-2xl shadow-md transition ${
                      votoValido?.voto === 1
                        ? "bg-green-50 border-green-200"
                        : votoValido?.voto === -1
                        ? "bg-red-50 border-red-200"
                        : "bg-white border"
                    }`}
                  >
                    <h3 className="text-lg font-semibold mb-2">{t.nombre}</h3>
                    <p className="text-gray-700 mb-3">
                      💰 Precio actual: <span className="font-bold">${fmtPesos(precio)}</span>
                    </p>

                    {votoValido?.voto === 1 ? (
                      <p className="text-green-600 font-medium">👍 ¡Aceptada!</p>
                    ) : votoValido?.voto === -1 ? (
                      <p className="text-red-600 font-medium">🤔 Marcada como inadecuada</p>
                    ) : (
                      <div className="flex gap-3">
                        <button
                          onClick={() => guardarVoto(t.idOriginal || t.id, 1, null, null, t.variante)}
                          className="flex-1 px-4 py-2 rounded-xl bg-green-500 text-white font-medium text-lg transform transition hover:scale-105"
                        >
                          👍 Está bien
                        </button>
                        <button
                          onClick={() => abrirModalVoto(t)}
                          className="flex-1 px-4 py-2 rounded-xl bg-red-500 text-white font-medium text-lg transform transition hover:scale-105"
                        >
                          🤔 Yo lo ajustaría
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Modal simple para Inadecuado */}
      {modalOpen && tareaParaVotar && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded p-5 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-3">Marcar como inadecuado</h3>
            <p className="text-sm mb-3">
              Tarea: <strong>{tareaParaVotar.nombre}</strong>
            </p>

            <label className="block text-sm mb-2">¿Es muy alto o muy bajo?</label>
            <select
              value={sentidoTemp}
              onChange={(e) => setSentidoTemp(e.target.value)}
              className="w-full border px-3 py-2 rounded mb-3"
            >
              <option value="">Selecciona...</option>
              <option value="Muy alto">Muy alto</option>
              <option value="Muy bajo">Muy bajo</option>
            </select>

            <label className="block text-sm mb-2">Precio sugerido ($)</label>
            <input
              type="number"
              value={sugerenciaTemp}
              onChange={(e) => setSugerenciaTemp(e.target.value)}
              className="w-full border px-3 py-2 rounded mb-4"
            />

            <div className="mb-3">
              <label className="block text-sm font-medium">Argumento</label>
              <textarea
                value={argumentoTemp}
                onChange={(e) => setArgumentoTemp(e.target.value)}
                className="w-full border px-3 py-2 rounded"
                rows={3}
                placeholder="Contanos por qué te parece inadecuado el precio."
              />
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={cerrarModal} className="px-3 py-1 rounded border">
                Cancelar
              </button>
              <button
                onClick={() =>
                  guardarVoto(
                    tareaParaVotar.idOriginal || tareaParaVotar.id,
                    -1,
                    sentidoTemp || "Sin especificar",
                    sugerenciaTemp || null
                  )
                }
                className="px-3 py-1 rounded bg-red-500 text-white"
              >
                Enviar voto
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
