// api/createPreferenceRenovacion.js
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

  const { uid, descuentoAnticipado } = req.body;
  if (!uid) {
    return res.status(400).json({ error: "Falta el uid" });
  }

  try {
    // 🔒 Leer precios desde config/planes
    const snap = await admin.firestore().doc("config/planes").get();
    if (!snap.exists) {
      return res.status(500).json({ error: "Config 'planes' no encontrada en Firestore" });
    }

    const { precioProfesional, porcentajeDescuentoRenovacion } = snap.data();

    if (!precioProfesional) {
      return res.status(500).json({ error: "Precio del plan profesional no definido en Firestore" });
    }

    const descuento = Number(porcentajeDescuentoRenovacion ?? 10);
    const precioFinal = descuentoAnticipado
      ? Number(precioProfesional) * (1 - descuento / 100)
      : Number(precioProfesional);

    const token = process.env.MERCADO_PAGO_TOKEN;
    if (!token) {
      return res.status(500).json({ error: "Falta MERCADO_PAGO_TOKEN" });
    }

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [
          {
            title: descuentoAnticipado
              ? `Renovación anticipada - Plan Completo (${descuento}% OFF)`
              : "Renovación suscripción - Plan Completo",
            description: "Extiende 30 días adicionales de acceso completo",
            quantity: 1,
            currency_id: "ARS",
            unit_price: parseFloat(precioFinal.toFixed(2)),
          },
        ],
        back_urls: {
          success: "https://calculadora-electricistas.vercel.app/gracias",
          failure: "https://calculadora-electricistas.vercel.app/error",
          pending: "https://calculadora-electricistas.vercel.app/espera",
        },
        auto_return: "approved",
        metadata: {
          uid,
          tipoPlan: "completo",
          descuentoAnticipado: !!descuentoAnticipado,
        },
      }),
    });

    const data = await response.json();

    if (!data.init_point) {
      console.error("❌ Error creando preferencia de renovación:", data);
      return res.status(500).json({ error: "No se pudo crear la preferencia de renovación" });
    }

    return res.status(200).json({ init_point: data.init_point });
  } catch (error) {
    console.error("❌ Error al crear preferencia de renovación:", error);
    return res.status(500).json({ error: "Error interno al generar preferencia de renovación" });
  }
}
