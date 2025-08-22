// pages/api/createPreferenceRenovacion.js
import mercadopago from "mercadopago";

mercadopago.configure({
  access_token: process.env.MERCADO_PAGO_TOKEN, // ⚡ usa tu token privado de MP en .env
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { uid } = req.body; 
    if (!uid) {
      return res.status(400).json({ error: "Falta el UID del usuario" });
    }

    const preference = {
      items: [
        {
          title: "Renovación de suscripción - Electricista+",
          description: "Extiende la suscripción por 30 días adicionales",
          unit_price: 3000, // 💰 ajusta el valor de la renovación
          quantity: 1,
        },
      ],
      metadata: {
        uid: uid, // 👈 importante para que el webhook sepa a quién renovar
      },
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_BASE_URL}/gracias`,
        failure: `${process.env.NEXT_PUBLIC_BASE_URL}/error`,
        pending: `${process.env.NEXT_PUBLIC_BASE_URL}/espera`,
      },
      auto_return: "approved",
    };

    const response = await mercadopago.preferences.create(preference);
    return res.status(200).json({ id: response.body.id });
  } catch (error) {
    console.error("❌ Error al crear preferencia de renovación:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}
