import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";

export default function ResultadosVotacion() {
  const [resumen, setResumen] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarVotos = async () => {
      try {
        const [snapVotos, snapTareas] = await Promise.all([
          getDocs(collection(db, "votos")),
          getDocs(collection(db, "tareas")),
        ]);

        const votos = snapVotos.docs.map((d) => d.data());
        const tareas = {};
        snapTareas.docs.forEach((d) => {
          tareas[d.id] = d.data().nombre;
        });

        // Agrupar por tarea + opcion
        const agrupados = {};
        votos.forEach((v) => {
          const key = v.opcion ? `${v.tareaId}_${v.opcion}` : v.tareaId;
          if (!agrupados[key]) {
            agrupados[key] = {
              tareaId: v.tareaId,
              opcion: v.opcion || null,
              nombre: tareas[v.tareaId] || v.tareaId, // 👈 usar nombre si existe
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

    cargarVotos();
  }, []);

  if (loading) {
    return <div className="p-4">Cargando resultados...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        📊 Resultados de Votación de Tareas
      </h1>
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
          {resumen.map((t) => (
            <tr key={`${t.tareaId}_${t.opcion || "default"}`}>
              <td className="border border-gray-300 px-3 py-2">
                {t.nombre}
                {t.opcion ? ` - ${t.opcion}` : ""}
              </td>
              <td className="border border-gray-300 px-3 py-2 text-green-600">
                {t.positivos}
              </td>
              <td className="border border-gray-300 px-3 py-2 text-red-600">
                {t.negativos}
              </td>
              <td className="border border-gray-300 px-3 py-2">
                {t.promedioDiferencia}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
