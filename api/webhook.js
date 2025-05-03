import { buffer } from "micro";
import admin from "firebase-admin";

export const config = {
  api: {
    bodyParser: false,
  },
};

// Inicializar Firebase si aún no está inicializado
if (!admin.apps.length) {
  const firebasePrivateKey = process.env.FIREBASE_ADMIN_KEY;
  if (!firebasePrivateKey) {
    console.error("❌ FIREBASE_ADMIN_KEY no está definida");
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(firebasePrivateKey)),
    });
  } catch (error) {
    console.error("❌ Error al inicializar Firebase:", error);
  }
}

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
          await admin.firestore().collection("usuarios").doc(uid).update({
            suscripcionActiva: true,
            fechaPago: admin.firestore.FieldValue.serverTimestamp(),
          });

          console.log("✅ Suscripción activada para UID:", uid);
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
