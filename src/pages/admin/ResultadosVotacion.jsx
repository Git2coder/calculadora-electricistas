// src/pages/ResultadosVotacion.jsx
import { useEffect, useState } from "react";
import { collection, getDocs, query, where, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";

export default function ResultadosVotacion() {
  const [resumen, setResumen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalUsuarios, setTotalUsuarios] = useState(0);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [snapVotos, snapTareas, snapUsuarios, snapVotables] =
          await Promise.all([
            getDocs(collection(db, "votos")),
            getDocs(collection(db, "tareas")),
            getDocs(collection(db, "usuarios")),
            getDocs(
              query(collection(db, "tareas_votables"), where("activa", "==", true))
            ),
          ]);

        const votos = snapVotos.docs.map((d) => d.data());

        const tareas = {};
        snapTareas.docs.forEach((d) => {
          tareas[String(d.id)] = d.data();
        });

        setTotalUsuarios(snapUsuarios.size);

        const idsPermitidos = snapVotables.docs.map((d) => {
          const data = d.data();
          return `${String(data.tareaId)}_${data.opcion || "default"}`;
        });

        const agrupados = {};
        votos.forEach((v) => {
          let tareaBase = String(v.tareaId);
          let opcionReal = v.opcion || "default";

          if (tareaBase.includes("__")) {
            const [idBase, variante] = tareaBase.split("__");
            tareaBase = idBase;
            if (!v.opcion && variante) {
              opcionReal = variante;
            }
          }

          const key = `${tareaBase}_${opcionReal}`;
          if (!idsPermitidos.includes(key)) return;

          if (!agrupados[key]) {
            const base = tareas[tareaBase] || {};
            agrupados[key] = {
              tareaId: tareaBase,
              opcion: opcionReal !== "default" ? opcionReal : null,
              nombre: base.nombre
                ? `${base.nombre}${opcionReal !== "default" ? " - " + opcionReal : ""}`
                : `${tareaBase}${opcionReal !== "default" ? " - " + opcionReal : ""}`,
              tipo: base.tipo || "generica",
              dependeDe: base.dependeDe || null,
              valor: base.valor || 0,
              porcentaje: base.porcentaje || 0,
              multiplicador: base.multiplicador || 1,
              factorBoca: base.factorBoca || 1,
              positivos: 0,
              negativos: 0,
              diferencias: [],
              sugerencias: [],
              preciosCalc: [],
            };
          }

          if (v.voto === -1) {
            agrupados[key].negativos++;
            if (v.diferenciaPorcentaje !== null) {
              agrupados[key].diferencias.push(Number(v.diferenciaPorcentaje));
            }
            if (v.precioSugerido) {
              agrupados[key].sugerencias.push(Number(v.precioSugerido));
            }
          }
          if (v.voto === 1) {
            agrupados[key].positivos++;
          }
          if (v.precioCalculadora) {
            agrupados[key].preciosCalc.push(Number(v.precioCalculadora));
          }
        });

        const resultado = Object.values(agrupados).map((t) => ({
          ...t,
          promedioDiferencia:
            t.diferencias.length > 0
              ? (
                  t.diferencias.reduce((a, b) => a + b, 0) / t.diferencias.length
                ).toFixed(1)
              : "-",
          promedioSugerencia:
            t.sugerencias.length > 0
              ? (
                  t.sugerencias.reduce((a, b) => a + b, 0) / t.sugerencias.length
                ).toFixed(0)
              : null,
          precioCalculadora:
            t.preciosCalc.length > 0
              ? (
                  t.preciosCalc.reduce((a, b) => a + b, 0) / t.preciosCalc.length
                ).toFixed(0)
              : null,
        }));

        setResumen(resultado);
      } catch (e) {
        console.error("Error cargando votos:", e);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  const aplicarAjuste = async (t) => {
    try {
      const precioActual = Number(t.precioCalculadora || 0);
      const precioSugerido = t.promedioSugerencia ? Number(t.promedioSugerencia) : null;

      if (!precioActual || !precioSugerido) {
        alert("No hay suficientes datos para ajustar esta tarea.");
        return;
      }

      const factor = precioSugerido / precioActual;
      const tareaRef = doc(db, "tareas", t.tareaId);

      const updates = {};
      if (t.tipo === "administrativa") {
        updates.valor = Math.round((t.valor || 0) * factor);
      } else if (t.tipo === "calculada") {
        updates.porcentaje = Math.round((t.porcentaje || 0) * factor);
      } else if (t.nombre.startsWith("Boca") || t.tareaId === "Boca") {
        updates.multiplicador = (t.multiplicador || 1) * factor;
      } else if (t.dependeDe === "Boca") {
        updates.factorBoca = (t.factorBoca || 1) * factor;
      } else {
        updates.multiplicador = (t.multiplicador || 1) * factor;
      }

      // ✅ Aplicar ajuste en la tarea
      await updateDoc(tareaRef, updates);

      // ✅ Buscar y desactivar tarea en tareas_votables
      const votablesSnap = await getDocs(
        query(
          collection(db, "tareas_votables"),
          where("tareaId", "==", t.tareaId),
          where("opcion", "==", t.opcion || null)
        )
      );

      for (const d of votablesSnap.docs) {
        await updateDoc(doc(db, "tareas_votables", d.id), { activa: false });
      }

      alert(`✅ Ajuste aplicado y tarea ${t.nombre} desactivada de votación`);
    } catch (err) {
      console.error("Error aplicando ajuste:", err);
      alert("Ocurrió un error al aplicar el ajuste.");
    }
  };

  if (loading) {
    return <div className="p-4">Cargando resultados...</div>;
  }

  const totalPos = resumen.reduce((acc, t) => acc + t.positivos, 0);
  const totalNeg = resumen.reduce((acc, t) => acc + t.negativos, 0);

  const porcPos =
    totalUsuarios > 0 ? ((totalPos / totalUsuarios) * 100).toFixed(1) : 0;
  const porcNeg =
    totalUsuarios > 0 ? ((totalNeg / totalUsuarios) * 100).toFixed(1) : 0;

  const todasDifs = resumen
    .map((t) => (t.promedioDiferencia !== "-" ? Number(t.promedioDiferencia) : null))
    .filter((n) => n !== null);

  const promedioGlobalDif =
    todasDifs.length > 0
      ? (todasDifs.reduce((a, b) => a + b, 0) / todasDifs.length).toFixed(1)
      : "-";

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">📊 Resultados de Votación</h1>
      <p className="mb-4 text-sm text-gray-600">
        Total de usuarios registrados: <strong>{totalUsuarios}</strong>
      </p>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-3 py-2 text-left">Tarea</th>
              <th className="border border-gray-300 px-3 py-2 text-center">👍 A favor</th>
              <th className="border border-gray-300 px-3 py-2 text-center">👎 En contra</th>
              <th className="border border-gray-300 px-3 py-2 text-center">Δ Promedio (%)</th>
              <th className="border border-gray-300 px-3 py-2 text-center">Promedio sugerido</th>
              <th className="border border-gray-300 px-3 py-2 text-center">Acción</th>
            </tr>
          </thead>
          <tbody>
            {resumen.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-4 text-gray-500">
                  No hay votos registrados todavía.
                </td>
              </tr>
            ) : (
              <>
                {resumen.map((t) => {
                  const porcPosT =
                    totalUsuarios > 0
                      ? ((t.positivos / totalUsuarios) * 100).toFixed(1)
                      : 0;
                  const porcNegT =
                    totalUsuarios > 0
                      ? ((t.negativos / totalUsuarios) * 100).toFixed(1)
                      : 0;

                  return (
                    <tr
                      key={`${t.tareaId}_${t.opcion || "default"}`}
                      className="odd:bg-white even:bg-gray-50"
                    >
                      <td className="border border-gray-300 px-3 py-2">{t.nombre}</td>
                      <td className="border border-gray-300 px-3 py-2 text-center">
                        {t.positivos} ({porcPosT}%)
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center">
                        {t.negativos} ({porcNegT}%)
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center">
                        {t.promedioDiferencia}%
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center">
                        {t.promedioSugerencia ? `$${t.promedioSugerencia}` : "-"}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center">
                        <button
                          onClick={() => aplicarAjuste(t)}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          Aplicar ajuste
                        </button>
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-gray-200 font-semibold">
                  <td className="border border-gray-300 px-3 py-2">TOTAL</td>
                  <td className="border border-gray-300 px-3 py-2 text-center">
                    {totalPos} ({porcPos}%)
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-center">
                    {totalNeg} ({porcNeg}%)
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-center">
                    {promedioGlobalDif}%
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-center">-</td>
                  <td className="border border-gray-300 px-3 py-2 text-center">-</td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
