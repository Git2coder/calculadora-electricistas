import { buffer } from "micro";
import admin from "./firebase.js";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function webhookHandler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end("Method Not Allowed");
  }

  const buf = await buffer(req);
  let body;

  try {
    body = JSON.parse(buf.toString("utf8"));
  } catch (e) {
    console.error("❌ Error al parsear JSON:", e);
    console.error("❗Contenido recibido:", buf.toString("utf8"));
    return res.status(400).end("Invalid JSON");
  }

  console.log("📦 Webhook body:", body);

  const topic = body.type || body.topic;

  if (topic === "payment") {
    const paymentId = body.data?.id;

    try {
      const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          Authorization: `Bearer ${process.env.MERCADO_PAGO_TOKEN}`,
        },
      });

      const paymentData = await paymentResponse.json();
      console.log("💰 Payment data:", paymentData);

      if (paymentData.status === "approved") {
        const uid = paymentData.metadata?.uid;

        if (uid) {
          const userRef = admin.firestore().collection("usuarios").doc(uid);
          const userSnap = await userRef.get();

          let fechaBase = new Date();

          // Si ya tenía una suscripción vigente, sumamos sobre esa fecha
          if (userSnap.exists) {
            const data = userSnap.data();
            if (data.fechaExpiracion && data.fechaExpiracion.toDate() > new Date()) {
              fechaBase = data.fechaExpiracion.toDate();
            }
          }

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

          console.log("✅ Suscripción activada/renovada para UID:", uid);
        } else {
          console.error("⚠️ UID no encontrado en metadata");
        }
      } else {
        console.log("❌ Pago no aprobado:", paymentData.status);
      }
    } catch (error) {
      console.error("❌ Error al procesar el pago:", error);
    }
  }

  res.status(200).send("Webhook recibido");
}
