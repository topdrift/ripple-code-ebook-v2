import { useState, useRef, useEffect } from 'preact/hooks';

type Tool = 'breathing' | 'counting' | 'grounding' | null;

export default function CoolDownToolkit() {
  const [active, setActive] = useState<Tool>(null);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathCount, setBreathCount] = useState(0);
  const [timer, setTimer] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  function startBreathing() {
    setActive('breathing');
    setBreathCount(0);
    setBreathPhase('inhale');
    setTimer(4);

    let phase: 'inhale' | 'hold' | 'exhale' = 'inhale';
    let count = 4;
    let rounds = 0;

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      count--;
      if (count <= 0) {
        if (phase === 'inhale') { phase = 'hold'; count = 7; }
        else if (phase === 'hold') { phase = 'exhale'; count = 8; }
        else { rounds++; if (rounds >= 3) { clearInterval(intervalRef.current!); setActive(null); return; } phase = 'inhale'; count = 4; }
        setBreathPhase(phase);
      }
      setTimer(count);
      setBreathCount(rounds);
    }, 1000);
  }

  function stop() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setActive(null);
  }

  const breathColors = { inhale: '#4CAF50', hold: '#2196F3', exhale: '#FF9800' };
  const breathLabels = { inhale: 'Breathe In...', hold: 'Hold...', exhale: 'Breathe Out...' };

  return (
    <div class="my-6 p-6 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-2xl border-2 border-teal-300 dark:border-teal-600">
      <h4 class="font-bold text-xl mb-4 text-center text-teal-700 dark:text-teal-400" style={{ fontFamily: 'var(--font-display)' }}>
        ❄️ Cool-Down Toolkit
      </h4>

      {!active ? (
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button onClick={startBreathing} class="p-4 bg-white dark:bg-slate-800 rounded-xl shadow-md hover:scale-105 transition-transform cursor-pointer text-center">
            <div class="text-3xl mb-2">🌬️</div>
            <div class="font-bold text-teal-700 dark:text-teal-400">4-7-8 Breathing</div>
            <div class="text-xs text-slate-500 mt-1">Calm your body fast</div>
          </button>
          <button onClick={() => setActive('counting')} class="p-4 bg-white dark:bg-slate-800 rounded-xl shadow-md hover:scale-105 transition-transform cursor-pointer text-center">
            <div class="text-3xl mb-2">🔢</div>
            <div class="font-bold text-teal-700 dark:text-teal-400">Count Backwards</div>
            <div class="text-xs text-slate-500 mt-1">From 10 to 1 slowly</div>
          </button>
          <button onClick={() => setActive('grounding')} class="p-4 bg-white dark:bg-slate-800 rounded-xl shadow-md hover:scale-105 transition-transform cursor-pointer text-center">
            <div class="text-3xl mb-2">🌍</div>
            <div class="font-bold text-teal-700 dark:text-teal-400">5-4-3-2-1 Grounding</div>
            <div class="text-xs text-slate-500 mt-1">Use your senses</div>
          </button>
        </div>
      ) : active === 'breathing' ? (
        <div class="text-center">
          <div class="relative w-40 h-40 mx-auto mb-4">
            <div class="absolute inset-0 rounded-full transition-all duration-1000" style={{
              background: `${breathColors[breathPhase]}30`,
              transform: breathPhase === 'inhale' ? 'scale(1.3)' : breathPhase === 'hold' ? 'scale(1.3)' : 'scale(0.8)',
              border: `4px solid ${breathColors[breathPhase]}`,
            }} />
            <div class="absolute inset-0 flex items-center justify-center flex-col">
              <span class="text-4xl font-bold" style={{ color: breathColors[breathPhase] }}>{timer}</span>
              <span class="text-sm font-semibold" style={{ color: breathColors[breathPhase] }}>{breathLabels[breathPhase]}</span>
            </div>
          </div>
          <p class="text-sm text-slate-600 dark:text-slate-400 mb-3">Round {breathCount + 1} of 3</p>
          <button onClick={stop} class="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-full font-semibold text-sm cursor-pointer hover:bg-slate-300 dark:hover:bg-slate-600">
            Stop
          </button>
        </div>
      ) : active === 'counting' ? (
        <div class="text-center">
          <p class="text-lg text-slate-700 dark:text-slate-300 mb-4">Close your eyes and slowly count backwards:</p>
          <div class="flex flex-wrap justify-center gap-3 mb-4">
            {[10,9,8,7,6,5,4,3,2,1].map(n => (
              <span key={n} class="w-12 h-12 flex items-center justify-center bg-teal-100 dark:bg-teal-900/30 rounded-full text-xl font-bold text-teal-700 dark:text-teal-400">{n}</span>
            ))}
          </div>
          <p class="text-sm text-slate-500 mb-3">Take a slow breath between each number</p>
          <button onClick={stop} class="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-full font-semibold text-sm cursor-pointer">Done</button>
        </div>
      ) : (
        <div class="text-center">
          <p class="text-lg text-slate-700 dark:text-slate-300 mb-4">Use your senses to ground yourself:</p>
          <div class="space-y-3 max-w-md mx-auto text-left">
            <div class="p-3 bg-white dark:bg-slate-800 rounded-lg"><strong>5 things you can SEE 👀</strong></div>
            <div class="p-3 bg-white dark:bg-slate-800 rounded-lg"><strong>4 things you can TOUCH ✋</strong></div>
            <div class="p-3 bg-white dark:bg-slate-800 rounded-lg"><strong>3 things you can HEAR 👂</strong></div>
            <div class="p-3 bg-white dark:bg-slate-800 rounded-lg"><strong>2 things you can SMELL 👃</strong></div>
            <div class="p-3 bg-white dark:bg-slate-800 rounded-lg"><strong>1 thing you can TASTE 👅</strong></div>
          </div>
          <button onClick={stop} class="mt-4 px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-full font-semibold text-sm cursor-pointer">Done</button>
        </div>
      )}
    </div>
  );
}
