// api/webhook.js
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

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
  if (req.method === "POST") {
    const { type, data } = req.body;

    if (type === "payment.created" || type === "payment.updated") {
      // Acá deberías consultar la API de MP para obtener info detallada
      const uid = data.metadata?.uid; // Esto lo tenés que pasar al generar la preferencia
      if (!uid) return res.status(400).json({ error: "uid no encontrado en metadata" });

      const ref = db.collection("usuarios").doc(uid);
      await ref.update({
        estado: "activo",
        fechaExpiracion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 días
      });

      return res.status(200).json({ ok: true });
    }

    return res.status(200).json({ msg: "Evento ignorado" });
  }

  res.setHeader("Allow", "POST");
  res.status(405).end("Method Not Allowed");
}
