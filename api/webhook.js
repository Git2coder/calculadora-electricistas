import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fetch from "node-fetch";

// ⚠️ Esta línea es esencial para que Vercel no procese automáticamente el cuerpo de la petición
export const config = {
  api: {
    bodyParser: false,
  },
};

import { Readable } from "stream";

// 🔧 Función para obtener el body sin procesar (raw body)
async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

console.log("▶️ Webhook preparado, esperando eventos...");

// Inicializar Firebase si no está iniciado
if (!global._firebaseAdmin) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_KEY);

  initializeApp({
    credential: cert(serviceAccount),
  });

  global._firebaseAdmin = true;
}

const db = getFirestore();

export default async function handler(req, res) {
  console.log("▶️ Webhook recibido");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  try {
    const rawBody = await getRawBody(req);
    const body = JSON.parse(rawBody);

    console.log("📦 Contenido recibido:", body);

    const { type, data } = body;
    console.log("📨 Evento recibido:", type);

    if (type === "payment.created" || type === "payment.updated") {
      const paymentId = data.id;
      console.log("🔎 Consultando pago ID:", paymentId);

      const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          Authorization: `Bearer ${process.env.MERCADO_PAGO_TOKEN}`,
        },
      });
      const paymentInfo = await response.json();

      const uid = paymentInfo.metadata?.uid;
      console.log("UID recibido desde metadata:", uid);

      if (!uid) {
        console.error("❌ No se encontró metadata.uid en el pago");
        return res.status(400).json({ error: "uid no encontrado" });
      }

      const ref = db.collection("usuarios").doc(uid);
      await ref.update({
        estado: "activo",
        fechaExpiracion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
      });

      console.log(`✅ Usuario ${uid} activado con éxito.`);
      return res.status(200).json({ ok: true });
    }

    return res.status(200).json({ msg: "Evento ignorado" });
  } catch (error) {
    console.error("❌ Error procesando el webhook:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}
