import * as admin from "firebase-admin";
import fetch from "node-fetch";
import { buffer } from "micro";

// 🔒 Usa tu único secreto de Firebase
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_KEY);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}
const db = admin.firestore();

export const config = {
  api: { bodyParser: false }
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  // Leemos el raw body
  const buf = await buffer(req);
  const body = JSON.parse(buf.toString("utf8"));
  console.log("📦 Webhook body:", body);

  // Mercado Pago en prod envía { resource, topic }
  const paymentId = body.resource;
  const topic     = body.topic;
  if (topic !== "payment" || !paymentId) {
    console.log("⚠️ Ignorado:", topic);
    return res.status(200).end("Ignored");
  }

  // Consultamos el pago con tu token correcto
  const mpRes = await fetch(
    `https://api.mercadopago.com/v1/payments/${paymentId}`,
    { headers: { Authorization: `Bearer ${process.env.MERCADO_PAGO_TOKEN}` } }
  );
  const payment = await mpRes.json();
  console.log("💰 Pago:", payment);

  if (payment.status === "approved") {
    const uid = payment.metadata?.uid;
    console.log("🔑 Activando acceso para UID:", uid);

    await db.collection("usuarios").doc(uid)
      .set({ accesoCalculadora: true, fechaPago: new Date() }, { merge: true });

    console.log("✅ Acceso habilitado");
  }

  res.status(200).end("OK");
}
