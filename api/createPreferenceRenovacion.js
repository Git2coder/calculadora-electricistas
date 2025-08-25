// api/createPreferenceRenovacion.js
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app";

// ⚡ Inicializar Firebase (si ya lo hacés en otro archivo común, podés reutilizarlo)
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { uid } = req.body;

  if (!uid) {
    return res.status(400).json({ error: "Falta el uid" });
  }

  try {
    // 🔎 Traer el precio dinámico desde Firestore
    const configSnap = await getDoc(doc(db, "config", "app"));
    if (!configSnap.exists()) {
      return res.status(500).json({ error: "No existe la configuración en Firestore" });
    }
    const { suscripcionPrecio } = configSnap.data();
    if (!suscripcionPrecio) {
      return res.status(500).json({ error: "No está definido el precio de suscripción" });
    }

    // 📦 Crear preferencia en Mercado Pago
    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.MERCADO_PAGO_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [
          {
            title: "Renovación suscripción Electricista+",
            description: "Extiende 30 días adicionales",
            quantity: 1,
            currency_id: "ARS",
            unit_price: suscripcionPrecio, // 💰 ahora dinámico desde Firestore
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

    if (!data.init_point) {
      console.error("❌ Error creando preferencia:", data);
      return res.status(500).json({ error: "No se pudo crear la preferencia de renovación" });
    }

    return res.status(200).json({ init_point: data.init_point });
  } catch (error) {
    console.error("❌ Error al crear preferencia de renovación:", error);
    return res.status(500).json({ error: "Error interno al generar preferencia de renovación" });
  }
}
