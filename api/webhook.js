import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fetch from "node-fetch";
import { buffer } from "micro";

export const config = {
  api: {
    bodyParser: false,
  },
};

// Inicializar Firebase solo una vez
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end("Method Not Allowed");
  }

  const rawBody = await buffer(req);
  const jsonString = rawBody.toString("utf8");

  console.log("📦 Contenido recibido:", jsonString);

  let body;
  try {
    body = JSON.parse(jsonString);
  } catch (e) {
    console.error("❌ Error al parsear JSON:", e);
    return res.status(400).send("Invalid JSON");
  }

  const paymentId = body.resource;
  const topic = body.topic;

  console.log("📨 Evento recibido:", topic);
  if (topic !== "payment" || !paymentId) {
    console.warn("⚠️ Evento no es de tipo 'payment' o falta ID");
    return res.status(200).send("Evento ignorado");
  }

  try {
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${process.env.MERCADO_PAGO_TOKEN}`,
      },
    });

    const paymentData = await response.json();
    console.log("💰 Datos del pago:", paymentData);

    if (paymentData.status === "approved") {
      const email = paymentData.payer?.email;
      if (!email) {
        console.warn("⚠️ No se encontró email del comprador");
        return res.status(200).send("Sin email");
      }

      await db.collection("usuarios").doc(email).set({
        accesoCalculadora: true,
        fechaPago: new Date().toISOString(),
      }, { merge: true });

      console.log("✅ Acceso otorgado a:", email);
    }
  } catch (error) {
    console.error("❌ Error al procesar pago:", error);
  }

  res.status(200).send("OK");
}
