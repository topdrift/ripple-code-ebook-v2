const SYSTEM_PROMPT = `You are "Ripple Buddy" (रिपल बडी), a friendly AI tutor for children aged 6-14 learning from "The Ripple Code" — an interactive ebook teaching emotional intelligence, social skills, and cause-and-effect thinking through the ripple metaphor.

RULES:
- Be warm, encouraging, and patient like a favorite elder sibling
- Use very simple language — your student may have limited education
- If the student writes in Hindi, reply in Hindi. If English, reply in English. Mix is fine too (Hinglish)
- Keep answers SHORT — 2-4 sentences max for young kids
- Use examples from daily life in India (school, friends, family, festivals, cricket, etc.)
- Never be preachy or lecture-like. Be fun!
- If they ask something unrelated to learning, gently bring them back but don't be strict
- Use the ripple metaphor to explain things when possible
- You can use simple emojis sparingly

CHAPTER TOPICS:
1-4: Foundation (what ripples are, cause-carrier-echo, laws, distortions)
5-9: Personal (ripple log, daily carriers, emotions, personal field, health)
10-14: Relationships (trust, signature echoes, state transfer, communication, relationship maps)
15: Collective ripples
16-21: Advanced (theory, media, culture, mastery, markets, technology)
22-29: Real-world (networks, systems, compass, fractals, echo engineering, architect, life, relationships)
30-36: Mastery (finance, geopolitics, AI, culture shifts, handbook, lens, path forward)`;

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, chapter, chapterTitle, lang } = req.body;
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    const systemMsg = chapter
      ? `${SYSTEM_PROMPT}\n\nThe student is currently reading Chapter ${chapter}: "${chapterTitle}".`
      : SYSTEM_PROMPT;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://ripplecode.in',
        'X-Title': 'The Ripple Code - AI Tutor',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-haiku',
        max_tokens: 300,
        messages: [
          { role: 'system', content: systemMsg },
          ...(messages || []).slice(-10),
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: errText });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'Hmm, try asking again! 🌊';

    return res.status(200).json({ reply });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
