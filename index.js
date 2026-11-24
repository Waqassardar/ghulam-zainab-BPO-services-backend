const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Set FRONTEND_URL in Vercel env vars to your new frontend domain.
// The fallback is the old URL, so update it if the frontend is redeployed elsewhere.
const YOUR_DOMAIN = process.env.FRONTEND_URL || "https://maddy-bpo-services.vercel.app/";

app.get('/', (req, res) => {
  res.send('Maddy BPO Services backend is live ✅');
});

app.post('/create-checkout-session', async (req, res) => {
  const { price } = req.body;
  const amount = Number(price);

  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ error: 'Invalid price' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['cashapp'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: 'Maddy BPO Services - Business Consultation' },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: YOUR_DOMAIN,
      cancel_url: YOUR_DOMAIN,
    });
    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Export the app for Vercel
module.exports = app;
