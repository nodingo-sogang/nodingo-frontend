import { useEffect } from 'react';

const KEYFRAMES = `
@keyframes nodingo-fog-out {
  0%   { opacity:1; }
  30%  { opacity:0.6; }
  100% { opacity:0; }
}
@keyframes nodingo-node-pop {
  0%   { opacity:0; }
  60%  { opacity:1; }
  100% { opacity:1; }
}
@keyframes nodingo-pulse-unlock {
  0%   { opacity:0.7; r:0; }
  100% { opacity:0; }
}
@keyframes nodingo-shine-unlock {
  0%   { opacity:0; }
  50%  { opacity:0.5; }
  100% { opacity:0; }
}
@keyframes nodingo-unlock-badge {
  0%   { opacity:0; }
  20%  { opacity:1; }
  80%  { opacity:1; }
  100% { opacity:0; }
}
@keyframes nodingo-modal-in {
  0%   { opacity:0; transform:translateY(28px) scale(0.97); }
  100% { opacity:1; transform:translateY(0) scale(1); }
}
@keyframes nodingo-receipt-in {
  0%   { opacity:0; transform:translateY(120%); }
  60%  { opacity:1; transform:translateY(-6%); }
  80%  { transform:translateY(2%); }
  100% { transform:translateY(0); }
}
`;

let injected = false;

function injectKeyframes() {
  if (injected || typeof document === 'undefined') return;
  const style = document.createElement('style');
  style.textContent = KEYFRAMES;
  document.head.appendChild(style);
  injected = true;
}

interface FogLayerProps {
  cx: number;
  cy: number;
  r: number;
}

export function FogLayer({ cx, cy, r }: FogLayerProps) {
  useEffect(() => { injectKeyframes(); }, []);

  return (
    <g style={{ pointerEvents: 'none' }}>
      {/* Fog haze */}
      <circle
        cx={cx} cy={cy} r={r * 2.6}
        fill="rgba(244,244,240,0.42)"
        style={{ filter: `blur(${Math.max(4, r * 0.5)}px)` }}
      />
      {/* Dark overlay on node */}
      <circle
        cx={cx} cy={cy} r={r * 1.4}
        fill="rgba(250,247,241,0.54)"
      />
      {/* Lock body */}
      <rect
        x={cx - r * 0.38} y={cy - r * 0.05}
        width={r * 0.76} height={r * 0.62}
        rx={r * 0.1}
        fill="#CFCFC8"
      />
      {/* Lock shackle */}
      <path
        d={`M ${cx - r * 0.22} ${cy - r * 0.05}
            L ${cx - r * 0.22} ${cy - r * 0.33}
            A ${r * 0.22} ${r * 0.22} 0 0 1 ${cx + r * 0.22} ${cy - r * 0.33}
            L ${cx + r * 0.22} ${cy - r * 0.05}`}
        fill="none"
        stroke="#CFCFC8"
        strokeWidth={r * 0.1}
        strokeLinecap="round"
      />
    </g>
  );
}

interface UnlockAnimationProps {
  cx: number;
  cy: number;
  r: number;
  color: string;
}

export function UnlockAnimation({ cx, cy, r, color }: UnlockAnimationProps) {
  useEffect(() => { injectKeyframes(); }, []);

  return (
    <g style={{ pointerEvents: 'none' }}>
      {/* Expanding ring */}
      <circle
        cx={cx} cy={cy} r={r * 1.8}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeOpacity={0.7}
        style={{ animation: 'nodingo-pulse-unlock 1s ease-out forwards' }}
      />
      {/* Glow burst */}
      <circle
        cx={cx} cy={cy} r={r * 2.8}
        fill={color}
        fillOpacity={0.25}
        style={{ animation: 'nodingo-shine-unlock 1.2s ease-out forwards' }}
      />
      {/* "해금!" text */}
      <text
        x={cx} y={cy - r * 2.2}
        textAnchor="middle"
        fontSize={r * 0.9}
        fontWeight="800"
        fill={color}
        style={{ animation: 'nodingo-unlock-badge 1.2s ease-out forwards', userSelect: 'none' }}
      >
        해금!
      </text>
    </g>
  );
}
