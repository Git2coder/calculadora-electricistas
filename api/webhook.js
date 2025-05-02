import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fetch from "node-fetch"; // Asegurate de tener esto si usás Node 18 o menos

console.log("▶️ Webhook preparado, esperando eventos...");

if (!global._firebaseAdmin) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_KEY);

  initializeApp({
    credential: cert(serviceAccount),
  });

  global._firebaseAdmin = true;
}

const db = getFirestore();

export default async function handler(req, res) {
  console.log("▶️ Webhook recibido:", JSON.stringify(req.body));

  if (req.method === "POST") {
    const { type, data } = req.body;
    console.log("Evento recibido:", type);

    if (type === "payment.created" || type === "payment.updated") {
      const paymentId = data.id;
      console.log("🔎 Consultando pago ID:", paymentId);

      try {
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
          fechaExpiracion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });

        console.log(`✅ Usuario ${uid} activado con éxito.`);
        return res.status(200).json({ ok: true });
      } catch (error) {
        console.error("❌ Error al consultar el pago:", error);
        return res.status(500).json({ error: "Error al verificar pago" });
      }
    }

    return res.status(200).json({ msg: "Evento ignorado" });
  }

  res.setHeader("Allow", "POST");
  res.status(405).end("Method Not Allowed");
}
