// api/createPreference.js
console.log("TOKEN:", process.env.MERCADO_PAGO_TOKEN);

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
              title: "Suscripción Electricista+",
              quantity: 1,
              currency_id: "ARS",
              unit_price: 10,
            },
          ],
          back_urls: {
            success: "https://tu-dominio.vercel.app/gracias",
            failure: "https://tu-dominio.vercel.app/error",
            pending: "https://tu-dominio.vercel.app/espera",
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
  