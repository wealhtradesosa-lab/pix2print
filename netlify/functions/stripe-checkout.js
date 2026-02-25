// Netlify Function — Stripe Checkout Session Creator
// Requiere: STRIPE_SECRET_KEY en las variables de entorno de Netlify

exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

  if (!STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY no está configurado en Netlify');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Stripe no configurado. Agrega STRIPE_SECRET_KEY en Netlify → Environment variables.' })
    };
  }

  try {
    const { priceId, mode, email, successUrl, cancelUrl } = JSON.parse(event.body);

    if (!priceId || !mode || !successUrl || !cancelUrl) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Faltan parámetros: priceId, mode, successUrl, cancelUrl' })
      };
    }

    // Construir el body del checkout session
    const params = new URLSearchParams();
    params.append('mode', mode);
    params.append('line_items[0][price]', priceId);
    params.append('line_items[0][quantity]', '1');
    params.append('success_url', successUrl);
    params.append('cancel_url', cancelUrl);

    // Si hay email, pre-llenarlo
    if (email) {
      params.append('customer_email', email);
    }

    // Permitir códigos de descuento
    params.append('allow_promotion_codes', 'true');

    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Stripe API error:', data);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({
          error: data.error?.message || 'Error de Stripe',
          code: data.error?.code || 'unknown'
        })
      };
    }

    if (!data.url) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Stripe no devolvió URL de checkout' })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ url: data.url, sessionId: data.id })
    };

  } catch (err) {
    console.error('stripe-checkout function error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Error interno: ' + err.message })
    };
  }
};
