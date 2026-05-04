const { MercadoPagoConfig, Preference } = require("mercadopago");

module.exports = async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  if (!process.env.MP_ACCESS_TOKEN) {
    return res.status(500).json({ error: "Token de pago no configurado" });
  }

  const { title, price, quantity } = req.body || {};

  if (!price || isNaN(Number(price)) || Number(price) <= 0) {
    return res.status(400).json({ error: "Precio inválido" });
  }

  try {
    const client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN,
    });

    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: [
          {
            title: title || "Plan KreatuSitioWeb",
            quantity: Number(quantity) || 1,
            unit_price: Number(price),
            currency_id: "MXN",
          },
        ],
        back_urls: {
          success: "https://kreatusitioweb.com/onboarding",
          failure: "https://kreatusitioweb.com/#precios",
          pending: "https://kreatusitioweb.com/#precios",
        },
        auto_return: "approved",
      },
    });

    return res.status(200).json({
      id: result.id,
      init_point: result.init_point,
    });

  } catch (error) {
    console.error("Error MP:", error.message);
    return res.status(500).json({
      error: "Falla en pasarela",
      detalle: error.message,
    });
  }
};
