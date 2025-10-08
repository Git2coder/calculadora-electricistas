import { buffer } from "micro";
import admin from "./firebase.js";

export const config = {
  api: { bodyParser: false },
};

export default async function webhookHandler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end("Method Not Allowed");
  }

  let body;
  try {
    const buf = await buffer(req);
    body = JSON.parse(buf.toString("utf8"));
  } catch (e) {
    console.error("❌ Error al parsear JSON:", e);
    return res.status(400).end("Invalid JSON");
  }

  const topic = body.type || body.topic;
  const paymentId = body.data?.id;

  if (topic !== "payment" || !paymentId) {
    console.warn("⚠️ Webhook ignorado (no es tipo 'payment' o falta ID).");
    return res.status(200).send("Ignored");
  }

  try {
    // 🔍 Consultar datos del pago en Mercado Pago
    const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${process.env.MERCADO_PAGO_TOKEN}`,
      },
    });

    const paymentData = await paymentResponse.json();
    console.log("💰 Pago recibido:", paymentData.status, paymentData.id);

    if (paymentData.status !== "approved") {
      console.log("🕒 Pago aún no aprobado, ignorado.");
      return res.status(200).send("Pago no aprobado todavía");
    }

    // 🧩 Obtener UID desde metadata
    const uid = paymentData.metadata?.uid;
    if (!uid) {
      console.error("⚠️ UID no encontrado en metadata del pago:", paymentData.metadata);
      return res.status(200).send("Sin UID");
    }

    const db = admin.firestore();
    const userRef = db.collection("usuarios").doc(uid);
    const userSnap = await userRef.get();

    let fechaBase = new Date();

    // ⏳ Si el usuario ya tenía una suscripción vigente, sumamos sobre esa fecha
    if (userSnap.exists) {
      const data = userSnap.data();
      if (data.fechaExpiracion && data.fechaExpiracion.toDate() > new Date()) {
        fechaBase = data.fechaExpiracion.toDate();
      }
    }

    // 📆 Extender 30 días más
    const nuevaFecha = admin.firestore.Timestamp.fromDate(
      new Date(fechaBase.getTime() + 30 * 24 * 60 * 60 * 1000)
    );

    await userRef.set(
      {
        suscripcionActiva: true,
        fechaPago: admin.firestore.FieldValue.serverTimestamp(),
        fechaExpiracion: nuevaFecha,
      },
      { merge: true }
    );

    console.log(`✅ Suscripción activada/renovada correctamente para UID: ${uid}`);
  } catch (error) {
    console.error("❌ Error procesando el webhook de pago:", error);
  }

  // Siempre responder 200 a MP para evitar reintentos innecesarios
  res.status(200).send("Webhook recibido");
}
