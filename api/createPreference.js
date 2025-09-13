// api/createPreference.js
import admin from "firebase-admin";

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { uid, plan } = req.body;

  if (!uid || !plan) {
    return res.status(400).json({ error: "Faltan datos (uid o plan)" });
  }

  try {
    // 🔒 Leer el precio base desde Firestore
    const snap = await admin.firestore().doc("config/app").get();
    if (!snap.exists) {
      return res.status(500).json({ error: "Config no encontrada en Firestore" });
    }

    const { suscripcionPrecio } = snap.data();
    if (!suscripcionPrecio) {
      return res.status(500).json({ error: "Precio no definido en Firestore" });
    }

    // 🔑 Token MercadoPago
    const token = process.env.MERCADO_PAGO_TOKEN;
    if (!token) {
      return res.status(500).json({ error: "Falta MERCADO_PAGO_TOKEN" });
    }

    // 💰 Calcular precio según plan
    let precio = 0;
    let titulo = "Suscripción";

    if (plan === "profesional") {
      precio = suscripcionPrecio;
      titulo = "Suscripción Profesional";
    } else if (plan === "basico") {
      precio = suscripcionPrecio * 0.6;
      titulo = "Suscripción Básico";
    } else if (plan === "gratis") {
      return res.status(400).json({ error: "El plan gratis no requiere pago" });
    } else {
      return res.status(400).json({ error: "Plan inválido" });
    }

    // 📤 Crear preferencia en MercadoPago
    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [
          {
            title: titulo,
            quantity: 1,
            currency_id: "ARS",
            unit_price: Number(precio),
          },
        ],
        back_urls: {
          success: "https://calculadora-electricistas.vercel.app/gracias",
          failure: "https://calculadora-electricistas.vercel.app/error",
          pending: "https://calculadora-electricistas.vercel.app/espera",
        },
        auto_return: "approved",
        metadata: { uid, plan }, // ✅ guardamos ambos
      }),
    });

    const data = await response.json();

    if (!data.init_point) {
      console.error("❌ Error creando preferencia:", data);
      return res.status(500).json({ error: "No se pudo crear la preferencia" });
    }

    return res.status(200).json({ init_point: data.init_point });
  } catch (error) {
    console.error("❌ Error al crear preferencia:", error);
    return res.status(500).json({ error: "Error interno al generar preferencia" });
  }
}
