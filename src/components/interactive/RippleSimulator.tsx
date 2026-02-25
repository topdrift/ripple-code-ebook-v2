import { useState, useRef, useCallback } from 'preact/hooks';

interface Ripple {
  id: number;
  x: number;
  y: number;
}

export default function RippleSimulator() {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const nextId = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback((e: MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = nextId.current++;
    setRipples(prev => [...prev, { id, x, y }]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, 2000);
  }, []);

  return (
    <div class="my-6">
      <h4 class="font-bold text-lg mb-3 text-center" style={{ fontFamily: 'var(--font-display)' }}>
        🌊 Ripple Simulator — Click the water!
      </h4>
      <div
        ref={containerRef}
        onClick={handleClick}
        class="relative w-full h-64 rounded-2xl cursor-pointer overflow-hidden select-none"
        style={{
          background: 'linear-gradient(180deg, #1a8cff 0%, #0066cc 50%, #004999 100%)',
        }}
      >
        {/* Water surface shimmer */}
        <div class="absolute inset-0 opacity-20" style={{
          background: 'repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.3) 40px, rgba(255,255,255,0.3) 42px)',
        }} />

        {ripples.map(r => (
          <div key={r.id} class="absolute pointer-events-none" style={{ left: r.x, top: r.y }}>
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                class="absolute rounded-full border-2 border-white/60"
                style={{
                  width: '10px',
                  height: '10px',
                  left: '-5px',
                  top: '-5px',
                  animation: `ripple-ring 2s ease-out ${i * 0.3}s forwards`,
                  opacity: 0,
                }}
              />
            ))}
            <div class="absolute w-2 h-2 -left-1 -top-1 bg-white rounded-full animate-ping" />
          </div>
        ))}

        <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span class="text-white/40 text-lg font-semibold">Click anywhere to create ripples!</span>
        </div>
      </div>

      <style>{`
        @keyframes ripple-ring {
          0% { transform: scale(0); opacity: 0.8; }
          100% { transform: scale(20); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
