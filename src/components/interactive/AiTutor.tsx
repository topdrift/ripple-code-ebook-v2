import { useState, useRef, useEffect, useCallback } from 'preact/hooks';
import RippleBuddyAvatar from './RippleBuddyAvatar';

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

const TEACH_PROMPT = `You are "Ripple Buddy" teaching a child a chapter from "The Ripple Code" ebook.

TASK: Break down the chapter into 4-6 small, digestible teaching chunks. For each chunk:
1. Explain ONE concept in 2-3 simple sentences
2. Give a relatable real-life example (Indian context: school, family, cricket, festivals)
3. End with a fun question to check understanding

FORMAT your response as numbered chunks separated by "---". Example:
1. [concept explanation]
Example: [real life example]
Question: [simple question]
---
2. [next concept]
...

RULES:
- If lang is 'hi', teach in Hindi. If 'en', teach in English.
- Use very simple language for a 10 year old with basic education
- Be fun and encouraging, like a favorite didi/bhaiya
- Keep each chunk SHORT — a child should be able to digest it in 30 seconds`;

// API config
const TUTOR_API_ENDPOINT = '/api/tutor';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_FALLBACK_KEY = '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';
const OPENROUTER_MODEL = 'anthropic/claude-3-haiku';

const TUTOR_CONFIG_KEY = 'ripple-tutor-config';

function getTutorConfig(): { apiKey?: string; proxyUrl?: string } {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(TUTOR_CONFIG_KEY) || '{}'); } catch { return {}; }
}
function saveTutorConfig(c: { apiKey?: string; proxyUrl?: string }) {
  localStorage.setItem(TUTOR_CONFIG_KEY, JSON.stringify(c));
}

// --- TTS ---
function speak(text: string, lang: string, onStart?: () => void, onEnd?: () => void) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const clean = text.replace(/[🌊✨🎯🤝💡🧠]/g, '').trim();
  if (!clean) return;
  const utt = new SpeechSynthesisUtterance(clean);
  utt.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
  utt.rate = 0.9;
  utt.pitch = 1.1;
  // Try to find a good voice
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(v => v.lang.startsWith(lang === 'hi' ? 'hi' : 'en') && v.name.includes('Female'))
    || voices.find(v => v.lang.startsWith(lang === 'hi' ? 'hi' : 'en'));
  if (preferred) utt.voice = preferred;
  utt.onstart = () => onStart?.();
  utt.onend = () => onEnd?.();
  utt.onerror = () => onEnd?.();
  window.speechSynthesis.speak(utt);
}

function stopSpeaking() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

// --- Offline fallback ---
function offlineReply(q: string, chapter?: number, title?: string, lang?: string): string {
  const hi = lang === 'hi' || /[\u0900-\u097F]/.test(q);
  const ql = q.toLowerCase();
  if (ql.includes('ripple') || ql.includes('लहर'))
    return hi ? 'रिपल मतलब — तुम जो करते हो उसका असर दूसरों पर पड़ता है, पानी में पत्थर की लहरों जैसे! 🌊' : 'A ripple is when your action spreads to others — like circles in water! 🌊';
  if (ql.includes('emotion') || ql.includes('भावना'))
    return hi ? 'भावनाएँ भी लहरें बनाती हैं! खुशी फैलाओ, दुनिया खुश होगी! ✨' : 'Emotions create ripples too! Spread happiness and the world gets happier! ✨';
  if (chapter)
    return hi ? `अध्याय ${chapter} "${title}" से जुड़ा अच्छा सवाल! ध्यान से पढ़ो — जवाब मिलेगा! 🌊` : `Great question about Chapter ${chapter}! Read carefully — the answer is there! 🌊`;
  return hi ? 'बहुत अच्छा सवाल! पढ़ते रहो, सीखते रहो! 🌊' : 'Great question! Keep reading, keep learning! 🌊';
}

type Mood = 'idle' | 'talking' | 'thinking' | 'happy' | 'waving';
type Mode = 'chat' | 'teach';

export default function AiTutor({ chapter, chapterTitle, lang = 'en' }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [mood, setMood] = useState<Mood>('idle');
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [config, setConfig] = useState<{ apiKey?: string; proxyUrl?: string }>({});
  const [showSettings, setShowSettings] = useState(false);

  // Teach mode state
  const [teachChunks, setTeachChunks] = useState<string[]>([]);
  const [teachIndex, setTeachIndex] = useState(0);
  const [teachLoading, setTeachLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => { setConfig(getTutorConfig()); }, []);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, teachIndex]);
  useEffect(() => {
    if (isOpen && mode === 'chat') setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen, mode]);

  // Initialize greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = lang === 'hi'
        ? 'नमस्ते! मैं रिपल बडी हूँ! मुझसे कुछ भी पूछो या "Teach Me" बटन दबाओ — मैं तुम्हें पूरा chapter सिखाऊँगा!'
        : "Hey! I'm Ripple Buddy! Ask me anything or tap \"Teach Me\" — I'll walk you through the whole chapter!";
      setMessages([{ role: 'assistant', content: greeting }]);
      setMood('waving');
      if (ttsEnabled) speak(greeting, lang, () => setMood('talking'), () => setMood('idle'));
      else setTimeout(() => setMood('idle'), 2000);
    }
  }, [isOpen]);

  // --- API call ---
  const callApi = useCallback(async (msgs: { role: string; content: string }[], systemOverride?: string): Promise<string> => {
    const { apiKey, proxyUrl } = config;
    const payload = msgs.slice(-10);

    if (proxyUrl) {
      const r = await fetch(proxyUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: payload, chapter, chapterTitle, lang }) });
      if (!r.ok) throw new Error('Proxy error');
      const d = await r.json();
      return d.reply || d.choices?.[0]?.message?.content || '';
    }

    try {
      const r = await fetch(TUTOR_API_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: payload, chapter, chapterTitle, lang, systemOverride }) });
      if (r.ok) { const d = await r.json(); if (d.reply) return d.reply; }
    } catch { /* fall through */ }

    const key = apiKey || OPENROUTER_FALLBACK_KEY;
    const sys = systemOverride || (chapter ? `${SYSTEM_PROMPT}\n\nStudent is reading Chapter ${chapter}: "${chapterTitle}".` : SYSTEM_PROMPT);
    const r = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}`, 'HTTP-Referer': window.location.origin, 'X-Title': 'Ripple Code Tutor' },
      body: JSON.stringify({ model: OPENROUTER_MODEL, max_tokens: 800, messages: [{ role: 'system', content: sys }, ...payload] }),
    });
    if (!r.ok) throw new Error(`API ${r.status}`);
    const d = await r.json();
    return d.choices?.[0]?.message?.content || '';
  }, [config, chapter, chapterTitle, lang]);

  // --- Chat send ---
  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    stopSpeaking(); setIsSpeaking(false);

    const userMsg: Message = { role: 'user', content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setIsLoading(true);
    setMood('thinking');

    try {
      const reply = await callApi(updated.map(m => ({ role: m.role, content: m.content })));
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      setMood('happy');
      if (ttsEnabled) speak(reply, lang, () => setMood('talking'), () => setMood('idle'));
      else setTimeout(() => setMood('idle'), 1500);
    } catch {
      const fb = offlineReply(text, chapter, chapterTitle, lang);
      setMessages(prev => [...prev, { role: 'assistant', content: fb }]);
      setMood('idle');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Teach mode ---
  const startTeaching = async () => {
    if (!chapter) return;
    setMode('teach');
    setTeachChunks([]);
    setTeachIndex(0);
    setTeachLoading(true);
    setMood('thinking');

    try {
      const teachSys = `${TEACH_PROMPT}\n\nYou are teaching Chapter ${chapter}: "${chapterTitle}". Language: ${lang === 'hi' ? 'Hindi' : 'English'}.`;
      const reply = await callApi([{ role: 'user', content: `Teach me Chapter ${chapter}: ${chapterTitle}` }], teachSys);
      const chunks = reply.split(/---|\n\d+\.\s/).filter(c => c.trim().length > 20);
      if (chunks.length === 0) chunks.push(reply);
      setTeachChunks(chunks);
      setMood('happy');
      if (ttsEnabled) speak(chunks[0], lang, () => setMood('talking'), () => setMood('idle'));
      else setTimeout(() => setMood('idle'), 1000);
    } catch {
      const fb = lang === 'hi' ? 'अभी chapter नहीं सिखा पा रहा। थोड़ी देर बाद कोशिश करो!' : "Can't teach right now. Try again in a bit!";
      setTeachChunks([fb]);
      setMood('idle');
    } finally {
      setTeachLoading(false);
    }
  };

  const nextTeachChunk = () => {
    stopSpeaking();
    const next = teachIndex + 1;
    if (next < teachChunks.length) {
      setTeachIndex(next);
      setMood('happy');
      if (ttsEnabled) speak(teachChunks[next], lang, () => setMood('talking'), () => setMood('idle'));
    } else {
      setMood('happy');
      const done = lang === 'hi' ? 'शाबाश! पूरा chapter सीख लिया! कोई सवाल हो तो पूछो!' : 'Amazing! You finished the chapter! Got questions? Ask away!';
      if (ttsEnabled) speak(done, lang, () => setMood('talking'), () => setMood('idle'));
    }
  };

  const prevTeachChunk = () => {
    stopSpeaking();
    if (teachIndex > 0) {
      setTeachIndex(teachIndex - 1);
      if (ttsEnabled) speak(teachChunks[teachIndex - 1], lang, () => setMood('talking'), () => setMood('idle'));
    }
  };

  // --- Voice input ---
  const startVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return; }
    const rec = new SR();
    recognitionRef.current = rec;
    rec.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
    rec.interimResults = false;
    rec.onresult = (e: any) => { setInput(p => p + e.results[0][0].transcript); setIsListening(false); };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    rec.start();
    setIsListening(true);
  };

  const toggleTts = () => {
    if (isSpeaking || ttsEnabled) stopSpeaking();
    setIsSpeaking(false);
    setTtsEnabled(!ttsEnabled);
    setMood('idle');
  };

  const replayLast = () => {
    const lastAssistant = [...messages].reverse().find(m => m.role === 'assistant');
    if (lastAssistant) speak(lastAssistant.content, lang, () => setMood('talking'), () => setMood('idle'));
  };

  const hasSpeech = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  return (
    <>
      {/* Floating button with mini avatar */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          class="fixed bottom-6 right-6 z-50 group"
          aria-label="Open Ripple Buddy"
        >
          <div class="relative">
            <div class="w-16 h-16 bg-gradient-to-br from-sky-300 to-blue-500 rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center animate-[float_3s_ease-in-out_infinite]">
              <RippleBuddyAvatar mood="idle" size={50} />
            </div>
            <div class="absolute -top-1 -right-1 w-5 h-5 bg-ripple-green rounded-full border-2 border-white animate-pulse" />
            <div class="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {lang === 'hi' ? 'रिपल बडी से बात करो!' : 'Talk to Ripple Buddy!'}
            </div>
          </div>
        </button>
      )}

      {/* Main panel */}
      {isOpen && (
        <div class="fixed bottom-4 right-4 z-50 w-[400px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-2rem)] bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col animate-[bounce-in_0.3s_ease-out] overflow-hidden">

          {/* Header with avatar */}
          <div class="bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-500 text-white px-4 pt-3 pb-2 flex-shrink-0 relative overflow-hidden">
            {/* Background ripples */}
            <div class="absolute inset-0 opacity-10">
              <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border border-white animate-[pulse-glow_3s_infinite]" />
              <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 rounded-full border border-white animate-[pulse-glow_3s_0.5s_infinite]" />
            </div>

            <div class="relative flex items-start gap-3">
              {/* Avatar */}
              <div class="flex-shrink-0 -mb-3">
                <RippleBuddyAvatar mood={mood} size={80} />
              </div>

              <div class="flex-1 pt-1">
                <h3 class="font-bold text-base">{lang === 'hi' ? 'रिपल बडी' : 'Ripple Buddy'}</h3>
                <p class="text-xs text-blue-100 mt-0.5">
                  {mood === 'thinking' ? (lang === 'hi' ? 'सोच रहा हूँ...' : 'Thinking...') :
                   mood === 'talking' ? (lang === 'hi' ? 'बोल रहा हूँ...' : 'Speaking...') :
                   chapter ? (lang === 'hi' ? `अध्याय ${chapter} — ${chapterTitle}` : `Ch ${chapter} — ${chapterTitle}`) :
                   (lang === 'hi' ? 'तुम्हारा AI टीचर' : 'Your AI Teacher')}
                </p>

                {/* Mode tabs */}
                <div class="flex gap-1.5 mt-2">
                  <button
                    onClick={() => { setMode('chat'); stopSpeaking(); setMood('idle'); }}
                    class={`px-3 py-1 rounded-full text-xs font-bold transition-all ${mode === 'chat' ? 'bg-white text-blue-600' : 'bg-white/20 text-white hover:bg-white/30'}`}
                  >
                    {lang === 'hi' ? '💬 बात करो' : '💬 Chat'}
                  </button>
                  {chapter && (
                    <button
                      onClick={startTeaching}
                      class={`px-3 py-1 rounded-full text-xs font-bold transition-all ${mode === 'teach' ? 'bg-white text-blue-600' : 'bg-white/20 text-white hover:bg-white/30'}`}
                    >
                      {lang === 'hi' ? '📖 सिखाओ' : '📖 Teach Me'}
                    </button>
                  )}
                </div>
              </div>

              {/* Controls */}
              <div class="flex flex-col gap-1 pt-1">
                <button onClick={toggleTts} class={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-colors ${ttsEnabled ? 'bg-white/30' : 'bg-white/10 opacity-60'}`} title={ttsEnabled ? 'Voice on' : 'Voice off'}>
                  {ttsEnabled ? '🔊' : '🔇'}
                </button>
                <button onClick={() => setShowSettings(!showSettings)} class="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs" title="Settings">⚙</button>
                <button onClick={() => { setIsOpen(false); stopSpeaking(); setMood('idle'); }} class="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs">✕</button>
              </div>
            </div>
          </div>

          {/* Settings */}
          {showSettings && <SettingsPanel apiKey={config.apiKey || ''} proxyUrl={config.proxyUrl || ''} onSave={(k, p) => { const c = { apiKey: k || undefined, proxyUrl: p || undefined }; setConfig(c); saveTutorConfig(c); setShowSettings(false); }} onClose={() => setShowSettings(false)} lang={lang} />}

          {/* === TEACH MODE === */}
          {mode === 'teach' && (
            <div class="flex-1 overflow-y-auto p-4 flex flex-col">
              {teachLoading ? (
                <div class="flex-1 flex flex-col items-center justify-center gap-3">
                  <RippleBuddyAvatar mood="thinking" size={100} />
                  <p class="text-sm text-slate-500 dark:text-slate-400 animate-pulse">
                    {lang === 'hi' ? 'Chapter तैयार कर रहा हूँ...' : 'Preparing the lesson...'}
                  </p>
                </div>
              ) : teachChunks.length > 0 ? (
                <>
                  {/* Progress */}
                  <div class="flex items-center gap-2 mb-3">
                    <div class="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div class="h-full bg-gradient-to-r from-ripple-blue to-ripple-teal rounded-full transition-all duration-500" style={{ width: `${((teachIndex + 1) / teachChunks.length) * 100}%` }} />
                    </div>
                    <span class="text-xs text-slate-500 dark:text-slate-400 font-bold">{teachIndex + 1}/{teachChunks.length}</span>
                  </div>

                  {/* Content card */}
                  <div class="flex-1 bg-gradient-to-br from-blue-50 to-sky-50 dark:from-slate-700 dark:to-slate-700 rounded-2xl p-5 shadow-inner">
                    <p class="text-sm leading-relaxed text-slate-700 dark:text-slate-200 whitespace-pre-wrap">{teachChunks[teachIndex]}</p>
                  </div>

                  {/* Navigation */}
                  <div class="flex items-center justify-between mt-3 gap-2">
                    <button
                      onClick={prevTeachChunk}
                      disabled={teachIndex === 0}
                      class="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-sm font-bold disabled:opacity-30 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                    >
                      ← {lang === 'hi' ? 'पिछला' : 'Back'}
                    </button>

                    {ttsEnabled && (
                      <button
                        onClick={() => speak(teachChunks[teachIndex], lang, () => setMood('talking'), () => setMood('idle'))}
                        class="w-10 h-10 rounded-full bg-ripple-blue/10 text-ripple-blue flex items-center justify-center hover:bg-ripple-blue/20 transition-colors text-lg"
                        title={lang === 'hi' ? 'फिर से सुनो' : 'Replay'}
                      >
                        🔄
                      </button>
                    )}

                    <button
                      onClick={nextTeachChunk}
                      class="px-4 py-2 bg-gradient-to-r from-ripple-blue to-blue-600 text-white rounded-full text-sm font-bold hover:-translate-y-0.5 transition-all shadow-md"
                    >
                      {teachIndex < teachChunks.length - 1
                        ? (lang === 'hi' ? 'अगला →' : 'Next →')
                        : (lang === 'hi' ? 'पूरा हुआ! 🎉' : 'Done! 🎉')}
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          )}

          {/* === CHAT MODE === */}
          {mode === 'chat' && (
            <>
              <div class="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, i) => (
                  <div key={i} class={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start gap-2'}`}>
                    {msg.role === 'assistant' && (
                      <div class="flex-shrink-0 mt-1">
                        <RippleBuddyAvatar mood="idle" size={28} />
                      </div>
                    )}
                    <div class={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-ripple-blue text-white rounded-br-sm'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-sm'
                    }`}>
                      {msg.content}
                    </div>
                    {msg.role === 'assistant' && ttsEnabled && (
                      <button
                        onClick={() => speak(msg.content, lang, () => setMood('talking'), () => setMood('idle'))}
                        class="self-start mt-2 w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs hover:bg-slate-200 dark:hover:bg-slate-600 flex-shrink-0"
                        title={lang === 'hi' ? 'सुनो' : 'Listen'}
                      >
                        🔊
                      </button>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div class="flex justify-start gap-2">
                    <div class="flex-shrink-0 mt-1"><RippleBuddyAvatar mood="thinking" size={28} /></div>
                    <div class="bg-slate-100 dark:bg-slate-700 text-slate-500 px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm">
                      <span class="inline-flex gap-1">
                        <span class="animate-bounce" style="animation-delay:0ms">●</span>
                        <span class="animate-bounce" style="animation-delay:150ms">●</span>
                        <span class="animate-bounce" style="animation-delay:300ms">●</span>
                      </span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input bar */}
              <div class="p-3 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
                <div class="flex items-center gap-2">
                  {hasSpeech && (
                    <button
                      onClick={startVoice}
                      class={`w-9 h-9 rounded-full flex items-center justify-center transition-all flex-shrink-0 text-sm ${
                        isListening ? 'bg-ripple-red text-white animate-pulse' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      🎤
                    </button>
                  )}
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onInput={(e) => setInput((e.target as HTMLInputElement).value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    placeholder={lang === 'hi' ? 'कुछ भी पूछो...' : 'Ask me anything...'}
                    class="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-full text-sm outline-none focus:ring-2 focus:ring-ripple-blue/50 placeholder:text-slate-400"
                    disabled={isLoading}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || isLoading}
                    class="w-9 h-9 rounded-full bg-ripple-blue text-white flex items-center justify-center hover:bg-blue-600 transition-colors disabled:opacity-40 flex-shrink-0"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

function SettingsPanel({ apiKey, proxyUrl, onSave, onClose, lang }: {
  apiKey: string; proxyUrl: string;
  onSave: (k: string, p: string) => void;
  onClose: () => void; lang: string;
}) {
  const [key, setKey] = useState(apiKey);
  const [proxy, setProxy] = useState(proxyUrl);
  return (
    <div class="p-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 space-y-2">
      <div>
        <label class="text-xs font-semibold text-slate-500 block mb-1">OpenRouter API Key</label>
        <input type="password" value={key} onInput={(e) => setKey((e.target as HTMLInputElement).value)} placeholder="sk-or-..." class="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none" />
      </div>
      <div>
        <label class="text-xs font-semibold text-slate-500 block mb-1">Proxy URL</label>
        <input type="text" value={proxy} onInput={(e) => setProxy((e.target as HTMLInputElement).value)} placeholder="https://..." class="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none" />
      </div>
      <div class="flex gap-2">
        <button onClick={() => onSave(key, proxy)} class="flex-1 px-3 py-1.5 bg-ripple-blue text-white text-xs font-bold rounded-lg">{lang === 'hi' ? 'सेव' : 'Save'}</button>
        <button onClick={onClose} class="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg">{lang === 'hi' ? 'रद्द' : 'Cancel'}</button>
      </div>
    </div>
  );
}
