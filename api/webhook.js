import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

console.log("▶️ Webhook preparado, esperando eventos...");

// Solo inicializa Firebase Admin una vez
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
    console.log("Data:", JSON.stringify(data));

    if (type === "payment.created" || type === "payment.updated") {
      const uid = data.metadata?.uid;
      console.log("UID recibido desde metadata:", uid);

      if (!uid) return res.status(400).json({ error: "uid no encontrado en metadata" });

      const ref = db.collection("usuarios").doc(uid);
      await ref.update({
        estado: "activo",
        fechaExpiracion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      console.log(`✅ Usuario ${uid} activado con éxito.`);
      return res.status(200).json({ ok: true });
    }

    return res.status(200).json({ msg: "Evento ignorado" });
  }

  res.setHeader("Allow", "POST");
  res.status(405).end("Method Not Allowed");
}
