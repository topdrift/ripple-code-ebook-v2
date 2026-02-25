import { useState } from 'preact/hooks';

interface Question {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface Props {
  title: string;
  questions: Question[];
}

export default function QuizGame({ title, questions }: Props) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = questions[current];

  function answer(idx: number) {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === q.correct) setScore(s => s + 1);
  }

  function next() {
    if (current + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
    }
  }

  function restart() {
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
  }

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div class="my-6 p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-2xl border-2 border-green-300 dark:border-green-600 text-center">
        <div class="text-5xl mb-4">{pct >= 80 ? '🏆' : pct >= 50 ? '👏' : '💪'}</div>
        <h4 class="font-bold text-2xl mb-2 text-green-700 dark:text-green-400" style={{ fontFamily: 'var(--font-display)' }}>
          {pct >= 80 ? 'Amazing!' : pct >= 50 ? 'Good job!' : 'Keep practicing!'}
        </h4>
        <p class="text-lg text-slate-700 dark:text-slate-300 mb-4">
          You got <strong class="text-green-600">{score}</strong> out of <strong>{questions.length}</strong> correct ({pct}%)
        </p>
        <button onClick={restart} class="px-6 py-2 bg-green-500 text-white font-bold rounded-full hover:bg-green-600 transition-colors cursor-pointer">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div class="my-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-2xl border-2 border-blue-300 dark:border-blue-600">
      <h4 class="font-bold text-xl mb-1 text-center text-blue-700 dark:text-blue-400" style={{ fontFamily: 'var(--font-display)' }}>
        🧩 {title}
      </h4>
      <p class="text-center text-sm text-slate-500 mb-4">
        Question {current + 1} of {questions.length} · Score: {score}
      </p>

      <div class="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-md mb-4">
        <p class="font-semibold text-lg text-slate-800 dark:text-slate-200">{q.question}</p>
      </div>

      <div class="space-y-2 mb-4">
        {q.options.map((opt, i) => {
          let cls = 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 hover:border-blue-400';
          if (selected !== null) {
            if (i === q.correct) cls = 'bg-green-100 dark:bg-green-900/30 border-green-500';
            else if (i === selected) cls = 'bg-red-100 dark:bg-red-900/30 border-red-500';
          }
          return (
            <button
              key={i}
              onClick={() => answer(i)}
              disabled={selected !== null}
              class={`w-full p-3 rounded-xl border-2 text-left font-medium transition-all cursor-pointer ${cls}`}
            >
              <span class="mr-2 font-bold text-slate-400">{String.fromCharCode(65 + i)}.</span>
              {opt}
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <div class={`p-4 rounded-xl mb-4 ${selected === q.correct ? 'bg-green-50 dark:bg-green-900/20' : 'bg-amber-50 dark:bg-amber-900/20'}`}>
          <p class="text-sm text-slate-700 dark:text-slate-300">{q.explanation}</p>
        </div>
      )}

      {selected !== null && (
        <div class="text-center">
          <button onClick={next} class="px-6 py-2 bg-blue-500 text-white font-bold rounded-full hover:bg-blue-600 transition-colors cursor-pointer">
            {current + 1 >= questions.length ? 'See Results' : 'Next Question →'}
          </button>
        </div>
      )}
    </div>
  );
}
