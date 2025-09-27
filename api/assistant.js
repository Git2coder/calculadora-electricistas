// api/assistant.js
import { tareasPredefinidas } from "../src/utils/tareas.js";
import { normalizarTexto, reemplazarSinonimos } from "../src/utils/normalizarTexto.js";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { consulta } = req.body;
  if (!consulta) {
    return res.status(400).json({ error: "Falta la consulta del usuario" });
  }

  // Normalizar texto de usuario
  let texto = normalizarTexto(consulta);
  texto = reemplazarSinonimos(texto);

  // Buscar coincidencias en tareas
  const coincidencias = tareasPredefinidas.filter(t => {
    const nombreNormalizado = normalizarTexto(t.nombre);
    // match básico: que al menos una palabra clave del nombre aparezca en el texto del usuario
    return nombreNormalizado.split(" ").some(palabra => texto.includes(palabra));
  });

  if (coincidencias.length > 0) {
    return res.status(200).json({
      mensaje: "Se encontraron tareas relacionadas",
      tareas: coincidencias.map(t => ({ id: t.id, nombre: t.nombre }))
    });
  }

  return res.status(200).json({
    mensaje: "No se encontraron coincidencias exactas. Revisá la redacción."
  });
}
