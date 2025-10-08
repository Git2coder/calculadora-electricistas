import { buffer } from "micro";
import admin from "./firebase.js";
import crypto from "crypto";

export const config = {
  api: { bodyParser: false },
};

export default async function webhookHandler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end("Method Not Allowed");
  }

  // 🔹 1) Leer body crudo para validar firma
  const buf = await buffer(req);
  const rawBody = buf.toString("utf8");

  // 🔹 2) Verificar firma HMAC (seguridad)
  const secret = process.env.MP_WEBHOOK_SECRET; // tu Client Secret
  const signature = req.headers["x-signature"] || req.headers["x-hub-signature"];

  if (secret) {
    if (!signature) {
      console.warn("⚠️ Webhook recibido sin encabezado de firma");
      return res.status(401).end("Missing signature");
    }

    // Crear firma HMAC-SHA256 del cuerpo
    const computed = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

    // Comparar de forma segura
    const sigBuf = Buffer.from(signature, "utf8");
    const compBuf = Buffer.from(computed, "utf8");
    if (
      sigBuf.length !== compBuf.length ||
      !crypto.timingSafeEqual(sigBuf, compBuf)
    ) {
      console.warn("❌ Firma del webhook inválida");
      return res.status(401).end("Invalid signature");
    }
  } else {
    console.warn("⚠️ MP_WEBHOOK_SECRET no configurado, se omite verificación de firma.");
  }

  // 🔹 3) Parsear JSON
  let body;
  try {
    body = JSON.parse(rawBody);
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

  // 🔹 4) Siempre responder 200 a MP para evitar reintentos innecesarios
  res.status(200).send("Webhook recibido");
}
