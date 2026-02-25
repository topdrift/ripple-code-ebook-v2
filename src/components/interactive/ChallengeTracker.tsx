import { useState, useEffect } from 'preact/hooks';
import { saveChallengeProgress, getProgress } from '../../lib/progress';

interface Props {
  chapter?: number;
  title?: string;
  challenges?: string[];
}

const defaultChallenges = [
  'Practice what you learned today',
  'Share one idea with a friend or family member',
  'Try a new positive ripple action',
  'Reflect on your progress in a journal',
  'Teach someone else what you learned',
];

export default function ChallengeTracker({ chapter = 0, title = '7-Day Challenge', challenges = defaultChallenges }: Props) {
  const [checked, setChecked] = useState<boolean[]>(challenges.map(() => false));
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const saved = getProgress().challengeProgress[chapter];
    if (saved && saved.length === challenges.length) {
      setChecked(saved);
    }
  }, [chapter, challenges.length]);

  function toggle(i: number) {
    const next = [...checked];
    next[i] = !next[i];
    setChecked(next);
    saveChallengeProgress(chapter, next);
    if (next.every(Boolean)) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }

  const completed = checked.filter(Boolean).length;
  const pct = Math.round((completed / challenges.length) * 100);

  return (
    <div class="my-6 p-6 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/10 dark:to-yellow-900/10 rounded-2xl border-2 border-orange-300 dark:border-orange-600 relative overflow-hidden">
      {showConfetti && (
        <div class="absolute inset-0 pointer-events-none z-10">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} class="absolute text-2xl" style={{
              left: `${Math.random() * 100}%`,
              animation: `confetti-fall 3s linear ${Math.random() * 0.5}s forwards`,
            }}>
              {['🎉', '⭐', '🌟', '✨', '🎊'][i % 5]}
            </div>
          ))}
        </div>
      )}

      <h4 class="font-bold text-xl mb-2 text-center text-orange-700 dark:text-orange-400" style={{ fontFamily: 'var(--font-display)' }}>
        🏆 {title}
      </h4>

      <div class="mb-4">
        <div class="flex justify-between text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">
          <span>{completed}/{challenges.length} complete</span>
          <span>{pct}%</span>
        </div>
        <div class="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div class="h-full bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div class="space-y-2">
        {challenges.map((ch, i) => (
          <label key={i} class={`flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl cursor-pointer transition-all ${checked[i] ? 'opacity-60 line-through' : 'hover:shadow-md'}`}>
            <input
              type="checkbox"
              checked={checked[i]}
              onChange={() => toggle(i)}
              class="w-5 h-5 accent-orange-500 cursor-pointer"
            />
            <span class="text-slate-700 dark:text-slate-300">{ch}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
