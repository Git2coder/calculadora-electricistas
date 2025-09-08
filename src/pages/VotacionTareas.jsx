// src/pages/VotacionTareas.jsx
import { useEffect, useMemo, useState } from "react";
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

/**
 * Página: Votación de Tareas
 *
 * - Carga tareas desde Firestore (colección "tareas")
 * - Carga tarifaHoraria del usuario logueado (usuarios/{uid}.tarifaHoraria)
 * - Calcula precio de cada tarea con la misma lógica que la calculadora
 * - Permite votar (correcto / incorrecto + sentido + sugerencia)
 * - Guarda votos en colecc. "votos" con id `${tareaId}_${user.uid}`
 *
 * Nota: esta versión invalida localmente (y muestra como "sin votar")
 * los votos negativos cuya tarifaBase difiera de la tarifaHoraria actual.
 * Si preferís eliminar esos docs de Firestore, te lo adapto.
 */

export default function VotacionTareas({ usuario: usuarioProp }) {
  const auth = getAuth();
  const currentUser = usuarioProp || auth.currentUser;

  const [tareas, setTareas] = useState([]);
  const [tareasExpandida, setTareasExpandida] = useState([]);
  const [votos, setVotos] = useState({}); // { [tareaId]: votoObj | null }
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
      setLoading(true);
      try {
        // 1) Tareas
        const tarefasSnap = await getDocs(collection(db, "tareas"));
        const lista = tarefasSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setTareas(lista);

        // 2) Tarifas del usuario
        if (currentUser) {
          try {
            const userRef = doc(db, "usuarios", currentUser.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              const data = userSnap.data();
              if (typeof data.tarifaHoraria === "number") setTarifaHoraria(data.tarifaHoraria);
            }
          } catch (e) {
            console.error("Error cargando tarifas del usuario:", e);
          }
        }

        // 3) Votos del usuario (traemos solo sus votos)
        if (currentUser) {
          // mejor consultar por userId si hay muchos votos
          const votosQuery = query(collection(db, "votos"), where("userId", "==", currentUser.uid));
          const votosSnap = await getDocs(votosQuery);
          const votosUsuario = {};
          votosSnap.docs.forEach((d) => {
            const v = d.data();
            const key = v.opcion ? `${v.tareaId}_${v.opcion}` : `${v.tareaId}_default`;
            votosUsuario[key] = v;
          });

          setVotos(votosUsuario);
        } else {
          setVotos({});
        }
      } catch (err) {
        console.error("Error cargando datos de votación:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [currentUser]);

  // -----------------------
  // Expandir variantes (igual que hacemos en Admin / Calculadora)
  // -----------------------
  useEffect(() => {
    const expand = [];
    for (const t of tareas) {
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
          });
        });
      } else {
        expand.push({ ...t, idOriginal: t.id });
      }
    }
    setTareasExpandida(expand);
  }, [tareas]);

  // -----------------------
  // Util: formateo precio
  // -----------------------
  const fmtPesos = (n) =>
    typeof n === "number" ? n.toLocaleString("es-AR", { maximumFractionDigits: 0 }) : "-";

  // -----------------------
  // Lógica de cálculo: replicando la calculadora
  // -----------------------
  const calcularPrecioTarea = (tarea, todasLasTareas = []) => {
  if (!tarea) return 0;

  // 1) Administrativa => monto fijo
  if (tarea.tipo === "administrativa") {
    if (typeof tarea.valor === "number") return tarea.valor || 0;
    return 0;
  }

  // 2) Calculada => tarifaHoraria * (porcentaje / 100)
  if (tarea.tipo === "calculada") {
    const porcentaje =
      tarea.porcentaje ??
      (tarea.opciones && tarea.variante && tarea.opciones[tarea.variante]
        ? tarea.opciones[tarea.variante].porcentaje
        : 0);
    return (tarifaHoraria * porcentaje) / 100;
  }

  // 3) Boca (la madre)
  if (tarea.nombre === "Boca" || tarea.idOriginal === "Boca") {
    return ((tarea.tiempo || 0) / 60) * tarifaHoraria * (tarea.multiplicador ?? 1);
  }

  // 4) Depende de Boca
  if (tarea.dependeDe === "Boca") {
    // Buscar la tarea Boca
    const baseBoca = todasLasTareas.find(
      (t) => t.nombre === "Boca" || t.idOriginal === "Boca"
    );
    if (!baseBoca) return 0;

    // Valor de Boca
    const valorBoca =
      ((baseBoca.tiempo || 0) / 60) *
      tarifaHoraria *
      (baseBoca.multiplicador ?? 1);

    // Factor propio de la tarea
    const factor =
      tarea.factorBoca ??
      (tarea.opciones && tarea.variante && tarea.opciones[tarea.variante]
        ? tarea.opciones[tarea.variante].factorBoca ?? 1
        : 1);

    return valorBoca * (factor || 1);
  }

  // 5) Base genérica: tiempo × multiplicador × tarifaHoraria
  return (
    ((tarea.tiempo || 0) / 60) *
    (tarea.multiplicador ?? 1) *
    tarifaHoraria
  );
};

  // -----------------------
  // Acciones de voto
  // -----------------------
  const abrirModalVoto = (tarea) => {
  setTareaParaVotar(tarea);
  setSugerenciaTemp("");
  setSentidoTemp("");
  setArgumentoTemp("");
  // si la tarea expandida ya tiene variante, la usamos como opción por defecto
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

  const guardarVoto = async (tareaId, voto, sentido = null, sugerencia = null) => {
    try {
      if (!currentUser) {
        alert("Debes iniciar sesión para votar.");
        return;
      }

      // Determinar opción: prioridad -> opcionSeleccionada (UI) -> "default"
      const opcionKey = opcionSeleccionada ?? "default";

      // Buscar la tarea correcta (id + variante)
      const tareaSeleccionada = tareasExpandida.find(
        (t) =>
          (t.id === tareaId || t.idOriginal === tareaId) &&
          (t.variante === opcionKey || (!t.variante && opcionKey === "default"))
      );

      const precioCalculadora = tareaSeleccionada
        ? calcularPrecioTarea(tareaSeleccionada, tareasExpandida)
        : 0;

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

      // 👇 ACA es donde se define el votoRef (se te había perdido)
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
            ? Number(
                (((precioSugerido - precioCalculadora) / precioCalculadora) * 100).toFixed(1)
              )
            : null,
        tarifaBase: tarifaHoraria,
        fecha: new Date().toISOString(),
      };

      await setDoc(votoRef, nuevo);

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
          Votá si el monto te parece está en zona o si consideras que se encuentra fuera de ella. Si lo marcás como inadecuado tú podras
          sugerír un valor para que lo tengamos en cuenta.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1 text-left">Tarea</th>
                <th className="border px-2 py-1 text-right">Precio actual</th>
                <th className="border px-2 py-1 text-center">Tu voto</th>
              </tr>
            </thead>
            <tbody>
              {tareasExpandida.map((t) => {
                const precio = calcularPrecioTarea(t, tareasExpandida) || 0;
                const voteKey = `${t.idOriginal || t.id}_${t.variante || "default"}`;
                const voto = votos[voteKey] || votos[t.idOriginal] || votos[t.id];
                // intentos de compatibilidad
                // Si existe voto negativo y tarifaBase difiere de la actual -> lo mostramos como "sin votar"
                const votoValido =
                  voto && !(voto.voto === -1 && voto.tarifaBase !== undefined && voto.tarifaBase !== tarifaHoraria)
                    ? voto
                    : null;

                return (
                  <tr key={t.id} className="odd:bg-white even:bg-gray-50">
                    <td className="border px-2 py-2">{t.nombre}</td>
                    <td className="border px-2 py-2 text-right">${fmtPesos(precio)}</td>
                    <td className="border px-2 py-2 text-center">
                      {votoValido?.voto === 1 ? (
                        <span className="text-green-600 font-medium">✅ Aceptada</span>
                      ) : votoValido?.voto === -1 ? (
                        <div className="text-sm text-red-600">
                          ❌ Incorrecta
                          <div className="text-xs text-gray-600">
                            {votoValido.sentido ? `(${votoValido.sentido})` : ""}{" "}
                            {votoValido.sugerencia ? `- sugirió $${fmtPesos(votoValido.sugerencia)}` : ""}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => guardarVoto(t.idOriginal || t.id, 1)}
                            className="px-2 py-1 bg-green-500 text-white rounded text-sm"
                          >
                            Correcto
                          </button>
                          <button
                            onClick={() => abrirModalVoto(t)}
                            className="px-2 py-1 bg-red-500 text-white rounded text-sm"
                          >
                            Inadecuado
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal simple para Inadecuado */}
      {modalOpen && tareaParaVotar && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded p-5 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-3">Marcar como inadecuado</h3>
            <p className="text-sm mb-3">Tarea: <strong>{tareaParaVotar.nombre}</strong></p>

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
              <button onClick={cerrarModal} className="px-3 py-1 rounded border">Cancelar</button>
              <button
                onClick={() => {
                  guardarVoto(
                    tareaParaVotar.idOriginal || tareaParaVotar.id,
                    -1,
                    sentidoTemp || "Sin especificar",
                    sugerenciaTemp || null
                  );
                }}
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
