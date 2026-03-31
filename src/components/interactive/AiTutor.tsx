import { useState, useRef, useEffect } from 'preact/hooks';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Props {
  chapter?: number;
  chapterTitle?: string;
  lang?: 'en' | 'hi';
}

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

// OpenRouter API for AI tutor
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_DEFAULT_KEY = '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';
const OPENROUTER_MODEL = 'anthropic/claude-haiku-4-5-20251001';

const TUTOR_CONFIG_KEY = 'ripple-tutor-config';

function getTutorConfig(): { apiKey?: string; proxyUrl?: string } {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(TUTOR_CONFIG_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveTutorConfig(config: { apiKey?: string; proxyUrl?: string }) {
  localStorage.setItem(TUTOR_CONFIG_KEY, JSON.stringify(config));
}

const greetings = {
  en: "Hi! I'm your Ripple Buddy 🌊 Ask me anything about what you're learning! You can type in Hindi or English.",
  hi: "नमस्ते! मैं तुम्हारा रिपल बडी हूँ 🌊 जो भी सीख रहे हो, कुछ भी पूछो! हिंदी या English में बात कर सकते हो।",
};

const placeholders = {
  en: 'Ask me anything...',
  hi: 'कुछ भी पूछो...',
};

function generateOfflineReply(question: string, chapter?: number, chapterTitle?: string, lang?: string): string {
  const isHindi = lang === 'hi' || /[\u0900-\u097F]/.test(question);
  const q = question.toLowerCase();

  if (q.includes('ripple') || q.includes('लहर')) {
    return isHindi
      ? 'रिपल (लहर) मतलब — जब तुम कुछ करते हो, उसका असर दूसरों पर पड़ता है, बिल्कुल पानी में पत्थर फेंकने पर जो गोल-गोल लहरें बनती हैं वैसे! 🌊'
      : 'A ripple is like when you throw a stone in water — circles spread outward! Same way, everything you do affects the people around you. Cool, right? 🌊';
  }

  if (q.includes('emotion') || q.includes('भावना') || q.includes('feel') || q.includes('महसूस')) {
    return isHindi
      ? 'हमारी भावनाएँ भी लहरें बनाती हैं! जब तुम खुश होते हो, आसपास के लोग भी खुश होने लगते हैं। और जब गुस्सा आए तो गहरी साँस लो — गुस्से की लहर कम हो जाएगी! ✨'
      : 'Our emotions create ripples too! When you\'re happy, people around you feel happier. And when you\'re angry, take deep breaths — it calms the anger ripple! ✨';
  }

  if (q.includes('friend') || q.includes('दोस्त') || q.includes('trust') || q.includes('भरोसा')) {
    return isHindi
      ? 'दोस्ती सबसे मज़बूत रिपल है! जब तुम किसी पर भरोसा करते हो और वो तुम पर, तो एक "ट्रस्ट लूप" बनता है — दोनों एक-दूसरे को बेहतर बनाते हैं! 🤝'
      : 'Friendship is the strongest ripple! When you trust someone and they trust you, a "trust loop" forms — you both make each other better! 🤝';
  }

  if (q.includes('help') || q.includes('मदद') || q.includes('kind') || q.includes('अच्छ')) {
    return isHindi
      ? 'जब तुम किसी की मदद करते हो, वो भी किसी और की मदद करता है — यही तो रिपल इफ़ेक्ट है! एक छोटा सा अच्छा काम बहुत बड़ा बन सकता है! 🎯'
      : 'When you help someone, they help someone else — that\'s the ripple effect! One small kind act can become something huge! 🎯';
  }

  if (chapter) {
    return isHindi
      ? `अच्छा सवाल! यह अध्याय ${chapter} "${chapterTitle}" से जुड़ा है। इस अध्याय को ध्यान से पढ़ो — बहुत कुछ सीखने को मिलेगा! 🌊`
      : `Great question! This relates to Chapter ${chapter} "${chapterTitle}". Read through the chapter carefully — there's so much to discover! 🌊`;
  }

  return isHindi
    ? 'बहुत अच्छा सवाल! अध्याय पढ़ते रहो और सोचो कि यह तुम्हारी ज़िंदगी में कैसे काम करता है। सीखना कभी नहीं रुकता! 🌊'
    : 'Great question! Keep reading and think about how this works in your own life. Learning never stops! 🌊';
}

export default function AiTutor({ chapter, chapterTitle, lang = 'en' }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: greetings[lang] },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [config, setConfig] = useState<{ apiKey?: string; proxyUrl?: string }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    setConfig(getTutorConfig());
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  const callTutorApi = async (allMessages: Message[]): Promise<string> => {
    const { apiKey, proxyUrl } = config;

    // If custom proxy URL is set, use it
    if (proxyUrl) {
      const res = await fetch(proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: allMessages.slice(-10).map(m => ({ role: m.role, content: m.content })),
          chapter,
          chapterTitle,
          lang,
        }),
      });
      if (!res.ok) throw new Error('Proxy error');
      const data = await res.json();
      return data.reply || data.choices?.[0]?.message?.content || 'Something went wrong!';
    }

    // Use OpenRouter API (default key or user-provided key)
    const key = apiKey || OPENROUTER_DEFAULT_KEY;
    const systemMsg = chapter
      ? `${SYSTEM_PROMPT}\n\nThe student is currently reading Chapter ${chapter}: "${chapterTitle}".`
      : SYSTEM_PROMPT;

    const res = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'The Ripple Code - AI Tutor',
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        max_tokens: 300,
        messages: [
          { role: 'system', content: systemMsg },
          ...allMessages.slice(-10).map(m => ({ role: m.role, content: m.content })),
        ],
      }),
    });

    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content || 'Hmm, try asking again! 🌊';
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = { role: 'user', content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const reply = await callTutorApi(updatedMessages);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      const fallback = generateOfflineReply(text, chapter, chapterTitle, lang);
      setMessages(prev => [...prev, { role: 'assistant', content: fallback }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startVoiceInput = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SR();
    recognitionRef.current = recognition;
    recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
    recognition.interimResults = false;

    recognition.onresult = (e: any) => {
      setInput(prev => prev + e.results[0][0].transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
    setIsListening(true);
  };

  const saveSettings = (apiKey: string, proxyUrl: string) => {
    const newConfig = { apiKey: apiKey || undefined, proxyUrl: proxyUrl || undefined };
    setConfig(newConfig);
    saveTutorConfig(newConfig);
    setShowSettings(false);
  };

  const hasSpeech = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const hasApi = true; // Always true — OpenRouter default key is built-in

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          class="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-ripple-blue to-blue-600 text-white rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center text-2xl animate-[bounce-in_0.5s_ease-out]"
          aria-label="Open Ripple Buddy"
        >
          🌊
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div class="fixed bottom-4 right-4 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-2rem)] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col animate-[bounce-in_0.3s_ease-out] overflow-hidden">
          {/* Header */}
          <div class="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-ripple-blue to-blue-600 text-white rounded-t-2xl flex-shrink-0">
            <span class="text-2xl">🌊</span>
            <div class="flex-1">
              <h3 class="font-bold text-sm">{lang === 'hi' ? 'रिपल बडी' : 'Ripple Buddy'}</h3>
              <p class="text-xs text-blue-100">
                {chapter
                  ? (lang === 'hi' ? `अध्याय ${chapter}` : `Chapter ${chapter}`)
                  : (lang === 'hi' ? 'AI ट्यूटर' : 'AI Tutor')}
                {hasApi ? '' : (lang === 'hi' ? ' · ऑफ़लाइन' : ' · Offline')}
              </p>
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              class="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors text-xs"
              aria-label="Settings"
              title="Settings"
            >
              ⚙
            </button>
            <button
              onClick={() => setIsOpen(false)}
              class="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors text-xs"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Settings panel */}
          {showSettings && (
            <SettingsPanel
              apiKey={config.apiKey || ''}
              proxyUrl={config.proxyUrl || ''}
              onSave={saveSettings}
              onClose={() => setShowSettings(false)}
              lang={lang}
            />
          )}

          {/* Messages */}
          <div class="flex-1 overflow-y-auto p-4 space-y-3">
            {!hasApi && (
              <div class="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-xl p-3 text-xs text-amber-700 dark:text-amber-300">
                {lang === 'hi'
                  ? '💡 AI ट्यूटर ऑफ़लाइन मोड में है। पूरा अनुभव पाने के लिए ⚙ सेटिंग्स में API key डालें।'
                  : '💡 AI Tutor is in offline mode. For the full experience, add an API key in ⚙ Settings.'}
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} class={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  class={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-ripple-blue text-white rounded-br-md'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-md'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div class="flex justify-start">
                <div class="bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-4 py-2.5 rounded-2xl rounded-bl-md text-sm">
                  <span class="inline-flex gap-1">
                    <span class="animate-bounce" style="animation-delay: 0ms">●</span>
                    <span class="animate-bounce" style="animation-delay: 150ms">●</span>
                    <span class="animate-bounce" style="animation-delay: 300ms">●</span>
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div class="p-3 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
            <div class="flex items-center gap-2">
              {hasSpeech && (
                <button
                  onClick={startVoiceInput}
                  class={`w-9 h-9 rounded-full flex items-center justify-center transition-all flex-shrink-0 text-sm ${
                    isListening
                      ? 'bg-ripple-red text-white animate-pulse'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                  aria-label={isListening ? 'Stop' : 'Voice input'}
                >
                  🎤
                </button>
              )}
              <input
                ref={inputRef}
                type="text"
                value={input}
                onInput={(e) => setInput((e.target as HTMLInputElement).value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholders[lang]}
                class="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-full text-sm outline-none focus:ring-2 focus:ring-ripple-blue/50 placeholder:text-slate-400"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                class="w-9 h-9 rounded-full bg-ripple-blue text-white flex items-center justify-center hover:bg-blue-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                aria-label="Send"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function SettingsPanel({ apiKey, proxyUrl, onSave, onClose, lang }: {
  apiKey: string;
  proxyUrl: string;
  onSave: (apiKey: string, proxyUrl: string) => void;
  onClose: () => void;
  lang: string;
}) {
  const [key, setKey] = useState(apiKey);
  const [proxy, setProxy] = useState(proxyUrl);

  return (
    <div class="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 space-y-3">
      <div>
        <label class="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
          {lang === 'hi' ? 'OpenRouter API Key (वैकल्पिक)' : 'OpenRouter API Key (optional)'}
        </label>
        <input
          type="password"
          value={key}
          onInput={(e) => setKey((e.target as HTMLInputElement).value)}
          placeholder="sk-or-..."
          class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:ring-2 focus:ring-ripple-blue/50"
        />
      </div>
      <div>
        <label class="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
          {lang === 'hi' ? 'Proxy URL (वैकल्पिक)' : 'Proxy URL (optional)'}
        </label>
        <input
          type="text"
          value={proxy}
          onInput={(e) => setProxy((e.target as HTMLInputElement).value)}
          placeholder="https://your-api-proxy.com/tutor"
          class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:ring-2 focus:ring-ripple-blue/50"
        />
      </div>
      <div class="flex gap-2">
        <button
          onClick={() => onSave(key, proxy)}
          class="flex-1 px-3 py-2 bg-ripple-blue text-white text-xs font-bold rounded-lg hover:bg-blue-600 transition-colors"
        >
          {lang === 'hi' ? 'सेव करें' : 'Save'}
        </button>
        <button
          onClick={onClose}
          class="px-3 py-2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
        >
          {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
        </button>
      </div>
    </div>
  );
}
