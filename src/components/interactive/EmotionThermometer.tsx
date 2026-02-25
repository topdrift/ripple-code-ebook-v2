import { useState } from 'preact/hooks';

interface Level {
  temp: number;
  label: string;
  emoji: string;
  color: string;
  description: string;
  tip: string;
}

const levels: Level[] = [
  { temp: 1, label: 'Calm & Peaceful', emoji: '😌', color: '#4CAF50', description: 'You feel relaxed and in control. Your ripples are clear and positive.', tip: 'Great state for making decisions and helping others!' },
  { temp: 2, label: 'Happy & Content', emoji: '😊', color: '#8BC34A', description: 'You\'re feeling good! Your positive energy creates warm ripples around you.', tip: 'Share this feeling — smile at someone!' },
  { temp: 3, label: 'A Little Nervous', emoji: '😬', color: '#FFC107', description: 'Something feels off. You might be worried about something. Your ripples start to wobble.', tip: 'Take 3 deep breaths. Name what you\'re feeling.' },
  { temp: 4, label: 'Frustrated', emoji: '😤', color: '#FF9800', description: 'Things aren\'t going your way. Your ripples are getting choppy and might splash others.', tip: 'Step away for a moment. Count to 10 slowly.' },
  { temp: 5, label: 'Very Angry', emoji: '🤬', color: '#f44336', description: 'You\'re at boiling point! Your ripples are like a storm — they can really hurt people around you.', tip: 'STOP. Don\'t act right now. Use the Cool-Down Toolkit below!' },
];

export default function EmotionThermometer() {
  const [selected, setSelected] = useState<number | null>(null);
  const current = selected !== null ? levels[selected] : null;

  return (
    <div class="my-6 p-6 bg-gradient-to-br from-yellow-50 to-red-50 dark:from-yellow-900/10 dark:to-red-900/10 rounded-2xl border-2 border-amber-300 dark:border-amber-600">
      <h4 class="font-bold text-xl mb-4 text-center text-amber-700 dark:text-amber-400" style={{ fontFamily: 'var(--font-display)' }}>
        🌡️ Emotion Thermometer
      </h4>
      <p class="text-center text-slate-600 dark:text-slate-400 mb-4">How are you feeling right now? Click a level!</p>

      <div class="flex flex-col items-center gap-2 mb-6">
        {[...levels].reverse().map((level, i) => (
          <button
            key={level.temp}
            onClick={() => setSelected(levels.length - 1 - i)}
            class={`w-full max-w-md flex items-center gap-3 p-3 rounded-xl font-semibold transition-all cursor-pointer border-2 ${
              selected === levels.length - 1 - i
                ? 'scale-105 shadow-lg'
                : 'opacity-80 hover:opacity-100'
            }`}
            style={{
              background: `${level.color}20`,
              borderColor: selected === levels.length - 1 - i ? level.color : 'transparent',
            }}
          >
            <span class="text-2xl">{level.emoji}</span>
            <span class="text-sm" style={{ color: level.color }}>{level.label}</span>
            <div class="ml-auto w-16 h-3 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
              <div class="h-full rounded-full" style={{ width: `${level.temp * 20}%`, background: level.color }} />
            </div>
          </button>
        ))}
      </div>

      {current && (
        <div class="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-md animate-bounce-in">
          <div class="text-center text-3xl mb-2">{current.emoji}</div>
          <h5 class="text-center font-bold text-lg mb-2" style={{ color: current.color }}>{current.label}</h5>
          <p class="text-center text-slate-700 dark:text-slate-300 mb-3">{current.description}</p>
          <div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p class="text-center text-sm font-semibold text-blue-700 dark:text-blue-400">
              💡 Tip: {current.tip}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
