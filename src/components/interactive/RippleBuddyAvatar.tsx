/** Animated SVG water-drop avatar for Ripple Buddy */

type Mood = 'idle' | 'talking' | 'thinking' | 'happy' | 'waving';

interface Props {
  mood?: Mood;
  size?: number;
}

export default function RippleBuddyAvatar({ mood = 'idle', size = 120 }: Props) {
  const s = size;
  const cx = s / 2;
  const cy = s / 2;
  const r = s * 0.32; // body radius

  // Eye positions
  const eyeL = { x: cx - r * 0.32, y: cy - r * 0.15 };
  const eyeR = { x: cx + r * 0.32, y: cy - r * 0.15 };
  const eyeR2 = r * 0.1;
  const pupilR = r * 0.055;

  // Pupil offset based on mood
  const pupilOff = mood === 'thinking' ? { x: 0, y: -2 } : { x: 0, y: 0 };

  // Mouth
  const mouthY = cy + r * 0.25;
  const mouthW = mood === 'happy' ? r * 0.45 : mood === 'talking' ? r * 0.2 : r * 0.35;

  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} class="ripple-buddy-avatar">
      <defs>
        <radialGradient id="bodyGrad" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stop-color="#7DD3FC" />
          <stop offset="60%" stop-color="#38BDF8" />
          <stop offset="100%" stop-color="#0EA5E9" />
        </radialGradient>
        <radialGradient id="cheekGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#FDA4AF" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#FDA4AF" stop-opacity="0" />
        </radialGradient>
        <filter id="shadow">
          <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#0EA5E9" flood-opacity="0.3" />
        </filter>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Ripple rings (visible when talking or happy) */}
      {(mood === 'talking' || mood === 'happy') && (
        <g>
          <circle cx={cx} cy={cy} r={r * 1.3} fill="none" stroke="#7DD3FC" stroke-width="1.5" opacity="0.4">
            <animate attributeName="r" from={r * 1.1} to={r * 2} dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.5" to="0" dur="1.5s" repeatCount="indefinite" />
          </circle>
          <circle cx={cx} cy={cy} r={r * 1.1} fill="none" stroke="#7DD3FC" stroke-width="1" opacity="0.3">
            <animate attributeName="r" from={r * 1.1} to={r * 1.8} dur="1.5s" begin="0.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.4" to="0" dur="1.5s" begin="0.5s" repeatCount="indefinite" />
          </circle>
        </g>
      )}

      {/* Body — water drop shape */}
      <g filter="url(#shadow)">
        <path
          d={`M${cx},${cy - r * 1.35}
              Q${cx + r * 0.05},${cy - r * 0.9} ${cx + r},${cy + r * 0.1}
              Q${cx + r},${cy + r * 0.8} ${cx},${cy + r}
              Q${cx - r},${cy + r * 0.8} ${cx - r},${cy + r * 0.1}
              Q${cx - r * 0.05},${cy - r * 0.9} ${cx},${cy - r * 1.35}Z`}
          fill="url(#bodyGrad)"
        >
          {/* Floating animation */}
          <animateTransform
            attributeName="transform"
            type="translate"
            values={mood === 'happy' ? '0,0;0,-5;0,0;0,-5;0,0' : '0,0;0,-3;0,0'}
            dur={mood === 'happy' ? '0.6s' : '2.5s'}
            repeatCount="indefinite"
          />
        </path>

        {/* Shine highlight */}
        <ellipse cx={cx - r * 0.25} cy={cy - r * 0.3} rx={r * 0.15} ry={r * 0.22} fill="white" opacity="0.4" transform={`rotate(-20,${cx - r * 0.25},${cy - r * 0.3})`} />
      </g>

      {/* Eyes */}
      <g>
        {/* Left eye */}
        <circle cx={eyeL.x} cy={eyeL.y} r={eyeR2} fill="white" />
        <circle cx={eyeL.x + pupilOff.x} cy={eyeL.y + pupilOff.y} r={pupilR} fill="#1E293B">
          {mood === 'talking' && (
            <animate attributeName="cy" values={`${eyeL.y};${eyeL.y - 1};${eyeL.y}`} dur="0.3s" repeatCount="indefinite" />
          )}
        </circle>

        {/* Right eye */}
        <circle cx={eyeR.x} cy={eyeR.y} r={eyeR2} fill="white" />
        <circle cx={eyeR.x + pupilOff.x} cy={eyeR.y + pupilOff.y} r={pupilR} fill="#1E293B">
          {mood === 'talking' && (
            <animate attributeName="cy" values={`${eyeR.y};${eyeR.y - 1};${eyeR.y}`} dur="0.3s" repeatCount="indefinite" />
          )}
        </circle>

        {/* Blink animation */}
        {mood === 'idle' && (
          <>
            <rect x={eyeL.x - eyeR2} y={eyeL.y - eyeR2} width={eyeR2 * 2} height={eyeR2 * 2} fill="url(#bodyGrad)" rx="2" opacity="0">
              <animate attributeName="opacity" values="0;0;1;0;0" dur="4s" keyTimes="0;0.47;0.5;0.53;1" repeatCount="indefinite" />
            </rect>
            <rect x={eyeR.x - eyeR2} y={eyeR.y - eyeR2} width={eyeR2 * 2} height={eyeR2 * 2} fill="url(#bodyGrad)" rx="2" opacity="0">
              <animate attributeName="opacity" values="0;0;1;0;0" dur="4s" keyTimes="0;0.47;0.5;0.53;1" repeatCount="indefinite" />
            </rect>
          </>
        )}
      </g>

      {/* Cheeks */}
      {(mood === 'happy' || mood === 'idle') && (
        <g>
          <circle cx={eyeL.x - r * 0.15} cy={mouthY - r * 0.05} r={r * 0.1} fill="url(#cheekGrad)" />
          <circle cx={eyeR.x + r * 0.15} cy={mouthY - r * 0.05} r={r * 0.1} fill="url(#cheekGrad)" />
        </g>
      )}

      {/* Mouth */}
      {mood === 'talking' ? (
        // Talking: animated open mouth
        <ellipse cx={cx} cy={mouthY} rx={mouthW} ry={r * 0.12} fill="#0369A1">
          <animate attributeName="ry" values={`${r * 0.08};${r * 0.15};${r * 0.05};${r * 0.13};${r * 0.08}`} dur="0.4s" repeatCount="indefinite" />
        </ellipse>
      ) : mood === 'happy' ? (
        // Happy: big smile
        <path
          d={`M${cx - mouthW},${mouthY - r * 0.05} Q${cx},${mouthY + r * 0.25} ${cx + mouthW},${mouthY - r * 0.05}`}
          fill="none" stroke="#0369A1" stroke-width="2.5" stroke-linecap="round"
        />
      ) : mood === 'thinking' ? (
        // Thinking: small 'o'
        <circle cx={cx + r * 0.1} cy={mouthY} r={r * 0.08} fill="#0369A1" opacity="0.8" />
      ) : (
        // Idle: gentle smile
        <path
          d={`M${cx - mouthW},${mouthY} Q${cx},${mouthY + r * 0.15} ${cx + mouthW},${mouthY}`}
          fill="none" stroke="#0369A1" stroke-width="2" stroke-linecap="round"
        />
      )}

      {/* Thinking dots */}
      {mood === 'thinking' && (
        <g>
          <circle cx={cx + r * 0.6} cy={cy - r * 0.7} r="3" fill="#7DD3FC">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" repeatCount="indefinite" />
          </circle>
          <circle cx={cx + r * 0.85} cy={cy - r * 1} r="4" fill="#7DD3FC">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" begin="0.2s" repeatCount="indefinite" />
          </circle>
          <circle cx={cx + r * 1.05} cy={cy - r * 1.35} r="5" fill="#7DD3FC">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" begin="0.4s" repeatCount="indefinite" />
          </circle>
        </g>
      )}

      {/* Waving hand */}
      {mood === 'waving' && (
        <g>
          <circle cx={cx + r * 1.1} cy={cy + r * 0.2} r={r * 0.18} fill="#FCD34D" stroke="#F59E0B" stroke-width="1.5">
            <animateTransform
              attributeName="transform"
              type="rotate"
              values={`0,${cx + r * 1.1},${cy + r * 0.5};20,${cx + r * 1.1},${cy + r * 0.5};-10,${cx + r * 1.1},${cy + r * 0.5};20,${cx + r * 1.1},${cy + r * 0.5};0,${cx + r * 1.1},${cy + r * 0.5}`}
              dur="0.8s"
              repeatCount="indefinite"
            />
          </circle>
        </g>
      )}
    </svg>
  );
}
