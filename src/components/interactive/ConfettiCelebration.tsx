import { useState, useEffect } from 'preact/hooks';

interface Props {
  trigger?: boolean;
  message?: string;
}

export default function ConfettiCelebration({ trigger = false, message = 'Congratulations!' }: Props) {
  const [active, setActive] = useState(false);
  const [particles, setParticles] = useState<{ id: number; emoji: string; left: string; delay: string }[]>([]);

  useEffect(() => {
    if (trigger && !active) {
      activate();
    }
  }, [trigger]);

  function activate() {
    setActive(true);
    const emojis = ['🎉', '⭐', '🌟', '✨', '🎊', '🌊', '💫', '🎯'];
    const p = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      emoji: emojis[i % emojis.length],
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 1}s`,
    }));
    setParticles(p);
    setTimeout(() => { setActive(false); setParticles([]); }, 4000);
  }

  return (
    <div class="my-6 text-center">
      <button
        onClick={activate}
        class="px-8 py-3 bg-gradient-to-r from-ripple-purple to-pink-500 text-white font-bold text-lg rounded-full shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all cursor-pointer"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        🎉 {message}
      </button>

      {active && (
        <div class="fixed inset-0 pointer-events-none z-50">
          {particles.map(p => (
            <div
              key={p.id}
              class="absolute text-2xl"
              style={{
                left: p.left,
                top: '-20px',
                animation: `confetti-fall 3s linear ${p.delay} forwards`,
              }}
            >
              {p.emoji}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
