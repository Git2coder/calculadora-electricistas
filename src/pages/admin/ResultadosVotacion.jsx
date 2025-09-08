import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";

export default function ResultadosVotacion() {
  const [resumen, setResumen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalUsuarios, setTotalUsuarios] = useState(0);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Traer votos y usuarios en paralelo
        const [snapVotos, snapTareas, snapUsuarios] = await Promise.all([
          getDocs(collection(db, "votos")),
          getDocs(collection(db, "tareas")),
          getDocs(collection(db, "usuarios")),
        ]);

        const votos = snapVotos.docs.map((d) => d.data());

        // Mapeo de tareas id → nombre
        const tareas = {};
        snapTareas.docs.forEach((d) => {
          tareas[d.id] = d.data().nombre;
        });

        // Total de usuarios registrados
        setTotalUsuarios(snapUsuarios.size);

        // Agrupar por tarea + opcion
        const agrupados = {};
        votos.forEach((v) => {
          const key = v.opcion ? `${v.tareaId}_${v.opcion}` : v.tareaId;
          if (!agrupados[key]) {
            agrupados[key] = {
              tareaId: v.tareaId,
              opcion: v.opcion || null,
              nombre: tareas[v.tareaId] || v.tareaId,
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

        // Convertir a array con promedio de diferencias
        const resultado = Object.values(agrupados).map((t) => ({
          ...t,
          promedioDiferencia:
            t.diferencias.length > 0
              ? (
                  t.diferencias.reduce((a, b) => a + b, 0) /
                  t.diferencias.length
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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        📊 Resultados de Votación de Tareas
      </h1>
      <p className="mb-4 text-sm text-gray-600">
        Total de usuarios registrados: <strong>{totalUsuarios}</strong>
      </p>
      <table className="w-full border-collapse border border-gray-300 text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-3 py-2">Tarea</th>
            <th className="border border-gray-300 px-3 py-2">👍 Positivos</th>
            <th className="border border-gray-300 px-3 py-2">👎 Negativos</th>
            <th className="border border-gray-300 px-3 py-2">
              Diferencia Promedio (%)
            </th>
          </tr>
        </thead>
        <tbody>
          {resumen.map((t) => {
            const positivosPct =
              totalUsuarios > 0
                ? ((t.positivos / totalUsuarios) * 100).toFixed(1)
                : "-";
            const negativosPct =
              totalUsuarios > 0
                ? ((t.negativos / totalUsuarios) * 100).toFixed(1)
                : "-";

            return (
              <tr key={`${t.tareaId}_${t.opcion || "default"}`}>
                <td className="border border-gray-300 px-3 py-2">
                  {t.nombre}
                  {t.opcion ? ` - ${t.opcion}` : ""}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-green-600">
                  {t.positivos}{" "}
                  {positivosPct !== "-" && `(${positivosPct}%)`}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-red-600">
                  {t.negativos}{" "}
                  {negativosPct !== "-" && `(${negativosPct}%)`}
                </td>
                <td className="border border-gray-300 px-3 py-2">
                  {t.promedioDiferencia}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
