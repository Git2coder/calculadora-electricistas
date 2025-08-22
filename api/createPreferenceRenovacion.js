// api/createPreferenceRenovacion.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { uid } = req.body;

  if (!uid) {
    return res.status(400).json({ error: "Falta el uid" });
  }

  try {
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
            unit_price: 10, // 💰 ajustá al mismo precio que tu suscripción inicial
          },
        ],
        back_urls: {
          success: "https://calculadora-electricistas.vercel.app/gracias",
          failure: "https://calculadora-electricistas.vercel.app/error",
          pending: "https://calculadora-electricistas.vercel.app/espera",
        },
        auto_return: "approved",
        metadata: { uid }, // 👈 importantísimo: acá va el UID del usuario
      }),
    });

    const data = await response.json();

    if (!data.init_point) {
      console.error("❌ Error creando preferencia:", data);
      return res.status(500).json({ error: "No se pudo crear la preferencia" });
    }

    return res.status(200).json({ init_point: data.init_point });
  } catch (error) {
    console.error("❌ Error al crear preferencia de renovación:", error);
    return res.status(500).json({ error: "Error interno al generar preferencia de renovación" });
  }
}
