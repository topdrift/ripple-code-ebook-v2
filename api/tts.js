/**
 * TTS API endpoint — uses Google Translate's neural TTS (free, Hindi + English)
 * Falls back gracefully if Google blocks the request.
 *
 * POST /api/tts
 * Body: { text: string, lang: 'hi' | 'en' }
 * Returns: audio/mpeg binary
 */

const MAX_CHUNK = 180; // Google TTS max chars per request

function chunkText(text, max) {
  // Clean emojis and special chars
  const clean = text.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').trim();
  if (!clean) return [];

  // Split by sentence boundaries
  const sentences = clean.match(/[^.!?।]+[.!?।]?\s*/g) || [clean];
  const chunks = [];
  let current = '';

  for (const sentence of sentences) {
    if ((current + sentence).length > max && current.length > 0) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current += sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

async function fetchGoogleTTS(text, lang) {
  const tl = lang === 'hi' ? 'hi' : 'en';
  const encoded = encodeURIComponent(text);
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${tl}&client=tw-ob&q=${encoded}`;

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Referer': 'https://translate.google.com/',
    },
  });

  if (!res.ok) throw new Error(`Google TTS error: ${res.status}`);
  return res.arrayBuffer();
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { text, lang = 'en' } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Missing text' });
    }

    const chunks = chunkText(text, MAX_CHUNK);
    if (chunks.length === 0) {
      return res.status(400).json({ error: 'Empty text after cleaning' });
    }

    // Fetch audio for each chunk
    const audioBuffers = [];
    for (const chunk of chunks) {
      try {
        const buf = await fetchGoogleTTS(chunk, lang);
        audioBuffers.push(Buffer.from(buf));
      } catch (err) {
        // If Google blocks, return error so client falls back to browser TTS
        return res.status(503).json({ error: 'TTS service unavailable', fallback: true });
      }
    }

    // Concatenate all audio chunks
    const combined = Buffer.concat(audioBuffers);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', combined.length);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache 24h
    return res.status(200).send(combined);
  } catch (error) {
    return res.status(500).json({ error: 'TTS failed', fallback: true });
  }
}
