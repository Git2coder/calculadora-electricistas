import admin from "firebase-admin";
import fetch from "node-fetch";
import { buffer } from "micro";

// Desactivar bodyParser para leer raw body
export const config = {
  api: { bodyParser: false },
};

// Inicializar Firebase Admin una sola vez
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_KEY);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}
const db = admin.firestore();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end("Method Not Allowed");
  }

  // Leemos el raw body
  const buf = await buffer(req);
  let body;
  try {
    body = JSON.parse(buf.toString("utf8"));
  } catch (e) {
    console.error("❌ Error al parsear JSON:", e);
    return res.status(400).end("Invalid JSON");
  }
  console.log("📦 Webhook body:", body);

  // Mercado Pago envía { resource, topic }
  const paymentId = body.resource;
  const topic     = body.topic;
  console.log("📨 Evento recibido:", topic);

  if (topic !== "payment" || !paymentId) {
    console.log("⚠️ Ignorado:", topic);
    return res.status(200).end("Ignored");
  }

  // Consultamos el pago
  let payment;
  try {
    const mpRes = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      { headers: { Authorization: `Bearer ${process.env.MERCADO_PAGO_TOKEN}` } }
    );
    payment = await mpRes.json();
    console.log("💰 Datos del pago:", payment);
  } catch (err) {
    console.error("❌ Error al consultar MP:", err);
    return res.status(500).end("MP query failed");
  }

  // Si está aprobado, activamos el acceso
  if (payment.status === "approved") {
    const uid = payment.metadata?.uid;
    console.log("🔑 UID a activar:", uid);
    if (uid) {
      try {
        await db.collection("usuarios").doc(uid).set(
          { accesoCalculadora: true, fechaPago: new Date() },
          { merge: true }
        );
        console.log("✅ Acceso habilitado");
      } catch (e) {
        console.error("❌ Error al escribir en Firestore:", e);
      }
    } else {
      console.warn("⚠️ No se encontró metadata.uid");
    }
  }

  res.status(200).end("OK");
}
