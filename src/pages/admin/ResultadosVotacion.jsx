// src/pages/ResultadosVotacion.jsx
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
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
          tareas[String(d.id)] = d.data().nombre;
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
            agrupados[key] = {
              tareaId: tareaBase,
              opcion: opcionReal !== "default" ? opcionReal : null,
              nombre: tareas[tareaBase]
                ? `${tareas[tareaBase]}${
                    opcionReal !== "default" ? " - " + opcionReal : ""
                  }`
                : `${tareaBase}${
                    opcionReal !== "default" ? " - " + opcionReal : ""
                  }`,
              positivos: 0,
              negativos: 0,
              diferencias: [],
            };
          }

          if (v.voto === -1) {
            agrupados[key].negativos++;
            if (v.diferenciaPorcentaje !== null) {
              agrupados[key].diferencias.push(Number(v.diferenciaPorcentaje));
            }
          }
          if (v.voto === 1) {
            agrupados[key].positivos++;
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

  if (loading) {
    return <div className="p-4">Cargando resultados...</div>;
  }

  // === Calcular global ===
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
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">📊 Resultados de Votación</h1>
      <p className="mb-4 text-sm text-gray-600">
        Total de usuarios registrados: <strong>{totalUsuarios}</strong>
      </p>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-3 py-2 text-left">Tarea</th>
              <th className="border border-gray-300 px-3 py-2 text-center">
                👍 A favor
              </th>
              <th className="border border-gray-300 px-3 py-2 text-center">
                👎 En contra
              </th>
              <th className="border border-gray-300 px-3 py-2 text-center">
                Δ Promedio (%)
              </th>
            </tr>
          </thead>
          <tbody>
            {resumen.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-4 text-gray-500">
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
                      <td className="border border-gray-300 px-3 py-2">
                        {t.nombre}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center">
                        {t.positivos} ({porcPosT}%)
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center">
                        {t.negativos} ({porcNegT}%)
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center">
                        {t.promedioDiferencia}%
                      </td>
                    </tr>
                  );
                })}

                {/* === Fila global === */}
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
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
