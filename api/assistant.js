// api/assistant.js
import { normalizarTexto, reemplazarSinonimos } from "../src/utils/normalizarTexto.js";
import { db } from "../src/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { consulta } = req.body;
  if (!consulta) {
    return res.status(400).json({ error: "Falta la consulta del usuario" });
  }

  try {
    // 🔹 Normalizar texto de usuario
    let texto = normalizarTexto(consulta);
    texto = reemplazarSinonimos(texto);

    // 🔹 Traer tareas desde Firestore
    const snapshot = await getDocs(collection(db, "tareas"));

    const tareas = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // 🔹 Buscar coincidencias
    const coincidencias = tareas.filter(t => {
      if (!t.nombre) return false;

      const nombreNormalizado = normalizarTexto(t.nombre);

      return nombreNormalizado
        .split(" ")
        .some(palabra => texto.includes(palabra));
    });

    // 🔹 Respuesta
    if (coincidencias.length > 0) {
      return res.status(200).json({
        mensaje: "Se encontraron tareas relacionadas",
        tareas: coincidencias.map(t => ({
          id: t.id,
          nombre: t.nombre
        }))
      });
    }

    return res.status(200).json({
      mensaje: "No se encontraron coincidencias exactas. Revisá la redacción."
    });

  } catch (error) {
    console.error("Error en assistant:", error);
    return res.status(500).json({
      error: "Error interno del servidor"
    });
  }
}