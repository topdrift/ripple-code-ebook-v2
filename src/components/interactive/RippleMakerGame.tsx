import { useState } from 'preact/hooks';

interface Scenario {
  action: string;
  icon: string;
  positive: string;
  negative: string;
}

const scenarios: Scenario[] = [
  {
    action: 'Someone trips and drops their books in the hallway',
    icon: '📚',
    positive: 'You help pick up their books and ask if they\'re okay. They smile, feel grateful, and later help another student who needs it.',
    negative: 'You walk past or laugh. They feel embarrassed and alone, and become less likely to help others.',
  },
  {
    action: 'Your friend is sitting alone at lunch looking sad',
    icon: '😢',
    positive: 'You sit with them and ask how they\'re doing. They open up and feel less alone. Later, they invite a new kid to sit with your group.',
    negative: 'You ignore them and sit with others. They feel invisible and start to withdraw from everyone.',
  },
  {
    action: 'A classmate gets a wrong answer in class',
    icon: '🏫',
    positive: 'You encourage them: "Nice try!" They feel safe to keep trying. The whole class becomes more willing to participate.',
    negative: 'You snicker. They feel humiliated and stop raising their hand. Others also become afraid to answer.',
  },
  {
    action: 'Your sibling wants to play but you\'re busy',
    icon: '🎮',
    positive: 'You say "Give me 10 minutes and I\'ll play with you!" They feel respected and learn patience and planning.',
    negative: 'You yell "Go away!" They feel rejected and start acting out for attention.',
  },
];

export default function RippleMakerGame() {
  const [current, setCurrent] = useState(0);
  const [choice, setChoice] = useState<'positive' | 'negative' | null>(null);
  const [score, setScore] = useState(0);

  const scenario = scenarios[current];

  function choose(type: 'positive' | 'negative') {
    setChoice(type);
    if (type === 'positive') setScore(s => s + 1);
  }

  function next() {
    setChoice(null);
    setCurrent(c => (c + 1) % scenarios.length);
  }

  return (
    <div class="my-6 p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border-2 border-purple-300 dark:border-purple-600">
      <h4 class="font-bold text-xl mb-4 text-center text-purple-700 dark:text-purple-400" style={{ fontFamily: 'var(--font-display)' }}>
        🎮 Ripple Maker Game
      </h4>

      <div class="text-center mb-2 text-sm font-semibold text-purple-600 dark:text-purple-400">
        Positive Ripples: {score} / {scenarios.length}
      </div>

      <div class="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-md mb-4">
        <div class="text-3xl text-center mb-3">{scenario.icon}</div>
        <p class="text-center font-semibold text-lg text-slate-800 dark:text-slate-200">{scenario.action}</p>
      </div>

      {!choice ? (
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => choose('positive')}
            class="p-4 bg-green-100 dark:bg-green-900/30 border-2 border-green-400 rounded-xl font-bold text-green-700 dark:text-green-400 hover:scale-105 transition-transform cursor-pointer"
          >
            🌟 Create a Positive Ripple
          </button>
          <button
            onClick={() => choose('negative')}
            class="p-4 bg-red-100 dark:bg-red-900/30 border-2 border-red-400 rounded-xl font-bold text-red-700 dark:text-red-400 hover:scale-105 transition-transform cursor-pointer"
          >
            🌧️ Create a Negative Ripple
          </button>
        </div>
      ) : (
        <div class={`p-5 rounded-xl ${choice === 'positive' ? 'bg-green-50 dark:bg-green-900/20 border-green-400' : 'bg-red-50 dark:bg-red-900/20 border-red-400'} border-2`}>
          <div class="text-2xl text-center mb-2">{choice === 'positive' ? '✨' : '🌧️'}</div>
          <p class="text-center text-slate-700 dark:text-slate-300">
            {choice === 'positive' ? scenario.positive : scenario.negative}
          </p>
          <button
            onClick={next}
            class="mt-4 mx-auto block px-6 py-2 bg-purple-500 text-white font-bold rounded-full hover:bg-purple-600 transition-colors cursor-pointer"
          >
            Next Scenario →
          </button>
        </div>
      )}
    </div>
  );
}
