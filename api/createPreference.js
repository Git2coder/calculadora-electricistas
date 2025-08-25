// api/createPreference.js
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { initializeApp, getApps } from "firebase/app";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
};

// Inicializar Firebase si no está inicializado
if (!getApps().length) {
  initializeApp(firebaseConfig);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { uid } = req.body;

  if (!uid) {
    return res.status(400).json({ error: "Falta el uid" });
  }

  try {
    // 🔒 Leer el precio directamente de Firestore
    const db = getFirestore();
    const docRef = doc(db, "config", "app");
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      return res.status(500).json({ error: "Config no encontrada en Firestore" });
    }

    const { suscripcionPrecio } = snap.data();

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.MERCADO_PAGO_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [
          {
            title: "Suscripción Electricista+",
            quantity: 1,
            currency_id: "ARS",
            unit_price: Number(suscripcionPrecio), // 👈 se usa SIEMPRE el de Firestore
          },
        ],
        back_urls: {
          success: "https://calculadora-electricistas.vercel.app/gracias",
          failure: "https://calculadora-electricistas.vercel.app/error",
          pending: "https://calculadora-electricistas.vercel.app/espera",
        },
        auto_return: "approved",
        metadata: { uid },
      }),
    });

    const data = await response.json();
    return res.status(200).json({ init_point: data.init_point });
  } catch (error) {
    console.error("Error al crear preferencia:", error);
    return res.status(500).json({ error: "Error interno al generar preferencia" });
  }
}
