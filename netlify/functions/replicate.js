// Netlify Function — Replicate API Proxy
// Token stays here on the server, never exposed to browser

exports.handler = async function(event, context) {
  const REPLICATE_TOKEN = process.env.REPLICATE_TOKEN;

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // GET — poll prediction status
    if (event.httpMethod === 'GET') {
      const predictionId = event.queryStringParameters?.id;
      if (!predictionId) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing prediction ID' }) };
      }

      const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: { 'Authorization': `Token ${REPLICATE_TOKEN}` }
      });

      const data = await response.json();
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    // POST — start prediction
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body);
      const { image, scale } = body;

      if (!image || !scale) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing image or scale' }) };
      }

      // Validate scale (prevent abuse)
      const validScale = Math.min(Math.max(parseInt(scale), 2), 10);

      const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${REPLICATE_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          version: '42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b',
          input: {
            image: image,
            scale: validScale,
            face_enhance: false
          }
        })
      });

      const data = await response.json();
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
