// Netlify Function — Replicate API Proxy v2
// Handles: Real-ESRGAN upscale + bria-rmbg + face-to-sticker + comic effects

exports.handler = async function(event, context) {
  const REPLICATE_TOKEN = process.env.REPLICATE_TOKEN;

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (!REPLICATE_TOKEN) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'REPLICATE_TOKEN not configured' })
    };
  }

  try {

    // ── GET: Poll prediction status ──────────────────────────────────────
    if (event.httpMethod === 'GET') {
      const predId = event.queryStringParameters && event.queryStringParameters.id;
      if (!predId) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing prediction ID' }) };
      }

      const r = await fetch(`https://api.replicate.com/v1/predictions/${predId}`, {
        headers: { 'Authorization': `Token ${REPLICATE_TOKEN}` }
      });

      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        return { statusCode: r.status, headers, body: JSON.stringify({ error: 'Replicate poll error', details: err }) };
      }

      const data = await r.json();
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    // ── POST: Start prediction ───────────────────────────────────────────
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body);

      // ─── Route A: Explicit model call (from applyEffectNow for rmbg/sticker/comic)
      if (body.model && body.input) {
        const { model, input } = body;

        // bria-rmbg-2.0 — remove background
        if (model === 'bria-ai/bria-rmbg-2.0') {
          const r = await fetch('https://api.replicate.com/v1/models/bria-ai/bria-rmbg-2.0/predictions', {
            method: 'POST',
            headers: {
              'Authorization': `Token ${REPLICATE_TOKEN}`,
              'Content-Type': 'application/json',
              'Prefer': 'wait'
            },
            body: JSON.stringify({ input })
          });

          if (!r.ok) {
            const err = await r.json().catch(() => ({}));
            if (r.status === 402) {
              return { statusCode: 402, headers, body: JSON.stringify({ error: 'Insufficient Replicate credits', code: 'INSUFFICIENT_CREDIT', details: err }) };
            }
            return { statusCode: r.status, headers, body: JSON.stringify({ error: 'Replicate model error', details: err }) };
          }

          const data = await r.json();
          return { statusCode: 200, headers, body: JSON.stringify(data) };
        }

        // face-to-sticker — versioned model
        if (model && model.includes('face-to-sticker')) {
          const version = '764d4827ea159608a07cdde8ddf1c6000019627515eb02b6b449695fd547e5ef';
          const r = await fetch('https://api.replicate.com/v1/predictions', {
            method: 'POST',
            headers: {
              'Authorization': `Token ${REPLICATE_TOKEN}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ version, input })
          });

          if (!r.ok) {
            const err = await r.json().catch(() => ({}));
            if (r.status === 402) {
              return { statusCode: 402, headers, body: JSON.stringify({ error: 'Insufficient Replicate credits', code: 'INSUFFICIENT_CREDIT', details: err }) };
            }
            return { statusCode: r.status, headers, body: JSON.stringify({ error: 'Replicate model error', details: err }) };
          }

          const data = await r.json();
          return { statusCode: 200, headers, body: JSON.stringify(data) };
        }

        // Any other model call (generic versioned)
        // Parse model:version format (e.g. "nightmareai/real-esrgan:42fed1c4...")
        let callVersion = body.version;
        let callModel = model;
        if (!callVersion && model && model.includes(':')) {
          const parts = model.split(':');
          callModel = parts[0];
          callVersion = parts[1];
        }

        const endpoint = callVersion
          ? 'https://api.replicate.com/v1/predictions'
          : `https://api.replicate.com/v1/models/${callModel}/predictions`;

        const payload = callVersion
          ? { version: callVersion, input }
          : { input };

        const r = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Token ${REPLICATE_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!r.ok) {
          const err = await r.json().catch(() => ({}));
          return { statusCode: r.status, headers, body: JSON.stringify({ error: 'Replicate model error', details: err }) };
        }

        const data = await r.json();
        return { statusCode: 200, headers, body: JSON.stringify(data) };
      }

      // ─── Route B: Legacy Real-ESRGAN upscale call (image + scale)
      const { image, scale } = body;

      if (!image || !scale) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing image or scale (or model/input for effect calls)' }) };
      }

      const validScale = Math.min(Math.max(parseInt(scale), 2), 4);

      const r = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${REPLICATE_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          version: '42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b',
          input: {
            image,
            scale: validScale,
            face_enhance: true
          }
        })
      });

      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        if (r.status === 402) {
          return {
            statusCode: 402,
            headers,
            body: JSON.stringify({
              error: 'Insufficient credit',
              message: 'No hay créditos en Replicate. Recarga en replicate.com/account/billing',
              code: 'INSUFFICIENT_CREDIT',
              details: err
            })
          };
        }
        return { statusCode: r.status, headers, body: JSON.stringify({ error: 'Replicate API error', details: err }) };
      }

      const data = await r.json();
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  } catch (error) {
    console.error('Function error:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal server error', message: error.message }) };
  }
};
