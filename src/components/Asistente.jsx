import { useState } from "react";
import { tareasPredefinidas } from "../utils/tareas";
import { normalizarTexto, reemplazarSinonimos } from "../utils/normalizarTexto";

export default function Asistente() {
  const [consulta, setConsulta] = useState("");
  const [respuesta, setRespuesta] = useState(null);
  const [abierto, setAbierto] = useState(false);

  const enviarConsulta = () => {
    let texto = normalizarTexto(consulta);
    texto = reemplazarSinonimos(texto);

    const keywordsIgnoradas = ["de", "del", "la", "el", "en", "para", "una", "un"];

function calcularScore(tareaNombre, texto) {
  const palabras = normalizarTexto(tareaNombre)
    .split(/\s+/)
    .filter((p) => p && !keywordsIgnoradas.includes(p));

  let score = 0;
  palabras.forEach((p) => {
    if (texto.includes(p)) score += 1;
  });
  return score;
}

const coincidencias = tareasPredefinidas
  .map((t) => ({
    ...t,
    score: calcularScore(t.nombre || "", texto),
  }))
  .filter((t) => t.score > 0) // al menos una coincidencia real
  .sort((a, b) => b.score - a.score) // orden descendente por score
  .slice(0, 5); // quedate con las 5 más relevantes



    if (coincidencias.length > 0) {
      setRespuesta({
        mensaje: "Se encontraron tareas relacionadas",
        tareas: coincidencias.map((t) => ({ id: t.id, nombre: t.nombre })),
      });
    } else {
      setRespuesta({
        mensaje: "No se encontraron coincidencias exactas. Revisá la redacción.",
      });
    }
  };

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setAbierto(true)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition transform hover:scale-110 z-50"
      >
        🤖
      </button>

      {/* Modal lateral */}
      {abierto && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-end z-50">
          <div className="w-96 bg-white h-full shadow-xl flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Asistente interno</h2>
              <button
                onClick={() => setAbierto(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                ✖
              </button>
            </div>

            {/* Contenido */}
            <div className="flex-1 overflow-y-auto p-4">
              <textarea
                className="w-full p-2 border rounded mb-2"
                rows={4}
                value={consulta}
                onChange={(e) => setConsulta(e.target.value)}
                placeholder="Escribí lo que necesitás..."
              />
              <button
                onClick={enviarConsulta}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Consultar
              </button>

              {respuesta && (
                <div className="mt-4 p-2 bg-gray-50 border rounded">
                  <p className="font-medium">{respuesta.mensaje}</p>
                  {respuesta.tareas && (
                    <ul className="list-disc pl-6 mt-2 text-sm">
                      {respuesta.tareas.map((t) => (
                        <li key={t.id}>{t.nombre}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
