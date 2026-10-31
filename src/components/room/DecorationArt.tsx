/**
 * Room decoration artwork. Each decoration is drawn in its slot's position
 * inside the room's 360×300 coordinate space; `Thumb` renders one alone.
 */
import type { ReactNode } from "react";
import { CrescentArt, LanternArt, PalmArt, StarArt } from "../art/Illustration";

const geometric = (x: number, y: number, s: number, c1: string, c2: string) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x="-20" y="-20" width="40" height="40" fill={c1} transform="rotate(45)" />
    <rect x="-20" y="-20" width="40" height="40" fill="none" stroke={c2} strokeWidth="4" />
    <circle r="8" fill={c2} />
  </g>
);

export const DECORATION_ART: Record<string, () => ReactNode> = {
  "banner-ramadan": () => (
    <g>
      <path d="M40 40 Q120 70 200 40" stroke="#8A5A3B" strokeWidth="2" fill="none" />
      {[52, 76, 100, 124, 148, 172].map((x, i) => (
        <path key={x} d={`M${x} ${44 + Math.sin((i / 5) * Math.PI) * 18} l10 22 l10 -22 Z`} fill={["#E9C66B", "#286356", "#F3C6D3", "#E9C66B", "#286356", "#F3C6D3"][i]} />
      ))}
    </g>
  ),
  "wall-geometric": () => (
    <g>
      {geometric(70, 80, 0.9, "#286356", "#E9C66B")}
      {geometric(120, 80, 0.9, "#D9CFF0", "#286356")}
      {geometric(170, 80, 0.9, "#286356", "#E9C66B")}
    </g>
  ),
  "wall-eid": () => (
    <g>
      <rect x="50" y="44" width="140" height="44" rx="10" fill="#123C35" />
      <text x="120" y="73" textAnchor="middle" fontSize="18" fontWeight="800" fill="#E9C66B">
        Eid Mubarak
      </text>
      <StarArt x={62} y={56} r={6} />
      <StarArt x={178} y={56} r={6} />
    </g>
  ),
  "window-crescent": () => (
    <g>
      <rect x="236" y="40" width="96" height="96" rx="12" fill="#1D2B4F" stroke="#FFF7E8" strokeWidth="6" />
      <CrescentArt x={278} y={86} r={22} />
    </g>
  ),
  "window-stars": () => (
    <g>
      <rect x="236" y="40" width="96" height="96" rx="12" fill="#1D2B4F" stroke="#FFF7E8" strokeWidth="6" />
      {[
        [256, 62, 6],
        [300, 58, 8],
        [318, 96, 5],
        [262, 108, 7],
        [290, 92, 4],
      ].map(([x, y, r], i) => (
        <StarArt key={i} x={x} y={y} r={r} fill={i % 2 ? "#fff" : "#E9C66B"} />
      ))}
    </g>
  ),
  "window-arch": () => (
    <g>
      <path d="M236 140 L236 84 Q284 20 332 84 L332 140 Z" fill="#1D2B4F" stroke="#E9C66B" strokeWidth="6" />
      <CrescentArt x={280} y={92} r={18} />
      <StarArt x={312} y={110} r={5} fill="#fff" />
    </g>
  ),
  "lantern-gold": () => <LanternArt x={150} y={18} s={1.1} />,
  "lantern-teal": () => <LanternArt x={150} y={18} s={1.1} body="#286356" glow="#BFF0E0" />,
  "lantern-trio": () => (
    <g>
      <LanternArt x={110} y={14} s={0.85} body="#C2577E" glow="#FFD6E5" />
      <LanternArt x={150} y={22} s={1} />
      <LanternArt x={190} y={14} s={0.85} body="#2F6FA8" glow="#CDE7FF" />
    </g>
  ),
  "rug-emerald": () => (
    <g>
      <ellipse cx="180" cy="262" rx="120" ry="26" fill="#286356" />
      <ellipse cx="180" cy="262" rx="100" ry="18" fill="none" stroke="#E9C66B" strokeWidth="4" />
    </g>
  ),
  "rug-geometric": () => (
    <g>
      <ellipse cx="180" cy="262" rx="120" ry="26" fill="#7A5FB5" />
      <ellipse cx="180" cy="262" rx="100" ry="18" fill="none" stroke="#E9C66B" strokeWidth="4" strokeDasharray="10 6" />
      <ellipse cx="180" cy="262" rx="30" ry="7" fill="#E9C66B" />
    </g>
  ),
  "cushion-gold": () => (
    <g>
      <ellipse cx="110" cy="242" rx="34" ry="16" fill="#E9C66B" />
      <ellipse cx="250" cy="242" rx="34" ry="16" fill="#E9C66B" />
      <ellipse cx="100" cy="236" rx="10" ry="4" fill="#fff" opacity="0.5" />
    </g>
  ),
  "cushion-lavender": () => (
    <g>
      <ellipse cx="110" cy="242" rx="34" ry="16" fill="#B9A6E3" />
      <ellipse cx="250" cy="242" rx="34" ry="16" fill="#B9A6E3" />
      <ellipse cx="100" cy="236" rx="10" ry="4" fill="#fff" opacity="0.5" />
    </g>
  ),
  "shelf-dates": () => (
    <g>
      <ellipse cx="300" cy="180" rx="22" ry="7" fill="#fff" stroke="#E2D3B5" strokeWidth="2" />
      {[290, 300, 310, 296, 306].map((x, i) => (
        <ellipse key={i} cx={x} cy={i < 3 ? 176 : 170} rx="6" ry="4" fill="#7B3F1D" />
      ))}
    </g>
  ),
  "shelf-crescent": () => <CrescentArt x={300} y={164} r={16} />,
  "plant-palm": () => (
    <g>
      <path d="M26 246 L50 246 L46 270 L30 270 Z" fill="#C8553D" />
      <PalmArt x={38} y={246} s={1.3} />
    </g>
  ),
  "plant-hibiscus": () => (
    <g>
      <path d="M26 246 L50 246 L46 270 L30 270 Z" fill="#286356" />
      {[
        [30, 224],
        [46, 214],
        [40, 234],
      ].map(([x, y], i) => (
        <g key={i}>
          <line x1="38" y1="246" x2={x} y2={y} stroke="#3E9B74" strokeWidth="3" />
          <circle cx={x} cy={y} r="9" fill="#E2725B" />
          <circle cx={x} cy={y} r="3" fill="#E9C66B" />
        </g>
      ))}
    </g>
  ),
  "garland-stars": () => (
    <g>
      <path d="M10 14 Q180 60 350 14" stroke="#C99A2E" strokeWidth="2" fill="none" />
      {[40, 90, 140, 190, 240, 290, 330].map((x, i) => (
        <StarArt key={x} x={x} y={24 + Math.sin((i / 6) * Math.PI) * 18} r={7} fill={i % 2 ? "#FFF7E8" : "#E9C66B"} />
      ))}
    </g>
  ),
};

/** Square thumbnail of a decoration, framed around its art. */
const VIEW: Record<string, string> = {
  "banner-ramadan": "30 20 180 80",
  "wall-geometric": "40 50 160 60",
  "wall-eid": "40 34 160 64",
  "window-crescent": "226 30 116 116",
  "window-stars": "226 30 116 116",
  "window-arch": "226 30 116 116",
  "lantern-gold": "110 0 80 90",
  "lantern-teal": "110 0 80 90",
  "lantern-trio": "80 0 140 90",
  "rug-emerald": "50 226 260 72",
  "rug-geometric": "50 226 260 72",
  "cushion-gold": "60 210 240 56",
  "cushion-lavender": "60 210 240 56",
  "shelf-dates": "270 150 60 40",
  "shelf-crescent": "276 140 50 50",
  "plant-palm": "0 180 80 96",
  "plant-hibiscus": "10 196 60 78",
  "garland-stars": "0 0 360 60",
};

export function DecorationThumb({ id, size = 64, locked = false }: { id: string; size?: number; locked?: boolean }) {
  const draw = DECORATION_ART[id];
  return (
    <svg viewBox={VIEW[id] ?? "0 0 360 300"} width={size} height={size} preserveAspectRatio="xMidYMid meet" aria-hidden="true" style={locked ? { filter: "grayscale(1)", opacity: 0.4 } : undefined}>
      {draw?.()}
    </svg>
  );
}
