/**
 * Original illustration set used by all content (lessons, stories, missions,
 * games). Each key renders a small, soft-shaded SVG scene in a 100×100 box.
 * No sacred text, people's faces or sacred figures are drawn here.
 */
import type { ReactNode } from "react";
import type { IllustrationKey } from "./illustrationKeys";

const G = { emerald: "#123C35", teal: "#286356", green: "#3E9B74", cream: "#FFF7E8", gold: "#E9C66B", deepGold: "#C99A2E", sky: "#BBD8E8", lav: "#D9CFF0", night: "#1D2B4F", sand: "#F3DFB3", sea: "#4FB3C8", coral: "#E2725B", pink: "#F3C6D3", brown: "#8A5A3B" };

const shine = (x: number, y: number, r = 6) => <circle cx={x} cy={y} r={r} fill="#fff" opacity="0.45" />;

function Lantern({ x = 50, y = 18, s = 1, body = G.gold, glow = "#FFE9A8" }: { x?: number; y?: number; s?: number; body?: string; glow?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <line x1="0" y1="-14" x2="0" y2="0" stroke={G.deepGold} strokeWidth="2" />
      <path d="M-10 4 L10 4 L6 0 L-6 0 Z" fill={G.deepGold} />
      <path d="M-14 6 Q-16 30 -8 44 L8 44 Q16 30 14 6 Z" fill={body} />
      <path d="M-8 10 Q-9 28 -4 40 L4 40 Q9 28 8 10 Z" fill={glow} />
      <path d="M-8 46 L8 46 L4 52 L-4 52 Z" fill={G.deepGold} />
      <circle cx="-6" cy="16" r="2.5" fill="#fff" opacity="0.7" />
    </g>
  );
}

function Crescent({ x = 50, y = 50, r = 30, fill = G.gold }: { x?: number; y?: number; r?: number; fill?: string }) {
  return <path d={`M${x + r * 0.3} ${y - r} A${r} ${r} 0 1 0 ${x + r * 0.3} ${y + r} A${r * 1.3} ${r * 1.3} 0 0 1 ${x + r * 0.3} ${y - r} Z`} fill={fill} />;
}

function Star({ x, y, r = 6, fill = G.gold }: { x: number; y: number; r?: number; fill?: string }) {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 === 0 ? r : r * 0.45;
    return `${x + rr * Math.cos(a)},${y + rr * Math.sin(a)}`;
  }).join(" ");
  return <polygon points={pts} fill={fill} />;
}

function Mosque({ ground = true }: { ground?: boolean }) {
  return (
    <g>
      {ground && <rect x="0" y="82" width="100" height="18" fill={G.sand} />}
      <rect x="14" y="26" width="10" height="58" rx="3" fill={G.cream} stroke="#E2D3B5" />
      <path d="M12 26 L19 12 L26 26 Z" fill={G.teal} />
      <rect x="28" y="50" width="56" height="34" rx="3" fill={G.cream} stroke="#E2D3B5" />
      <path d="M36 50 Q56 14 76 50 Z" fill={G.teal} />
      <path d="M40 50 Q50 30 56 30" stroke="#fff" strokeOpacity="0.5" strokeWidth="3" fill="none" />
      <path d="M50 84 L50 70 Q56 62 62 70 L62 84 Z" fill={G.emerald} />
      <path d="M34 66 Q38 60 42 66 L42 74 L34 74 Z" fill={G.sky} />
      <path d="M70 66 Q74 60 78 66 L78 74 L70 74 Z" fill={G.sky} />
      <line x1="56" y1="22" x2="56" y2="30" stroke={G.deepGold} strokeWidth="2" />
      <circle cx="56" cy="20" r="3" fill={G.gold} />
    </g>
  );
}

function Palm({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 0 Q4 -20 2 -40" stroke={G.brown} strokeWidth="5" fill="none" strokeLinecap="round" />
      {[-60, -20, 20, 60, 100].map((a) => (
        <path key={a} d="M2 -40 Q16 -50 30 -42" transform={`rotate(${a} 2 -40)`} stroke={G.green} strokeWidth="6" fill="none" strokeLinecap="round" />
      ))}
    </g>
  );
}

function Plate({ x = 50, y = 64, w = 38 }: { x?: number; y?: number; w?: number }) {
  return (
    <g>
      <ellipse cx={x} cy={y + 4} rx={w} ry={w * 0.3} fill="#000" opacity="0.08" />
      <ellipse cx={x} cy={y} rx={w} ry={w * 0.32} fill="#fff" stroke="#E2D3B5" strokeWidth="2" />
    </g>
  );
}

function Hands({ y = 70 }: { y?: number }) {
  return (
    <g fill="#D9A27A" stroke="#B9825C" strokeWidth="2">
      <path d={`M28 ${y} Q24 ${y - 30} 36 ${y - 34} Q44 ${y - 30} 46 ${y - 6} Z`} />
      <path d={`M72 ${y} Q76 ${y - 30} 64 ${y - 34} Q56 ${y - 30} 54 ${y - 6} Z`} />
    </g>
  );
}

function Heart({ x = 50, y = 46, s = 1, fill = G.coral }: { x?: number; y?: number; s?: number; fill?: string }) {
  return <path transform={`translate(${x} ${y}) scale(${s})`} d="M0 14 C-22 0 -16 -18 0 -8 C16 -18 22 0 0 14 Z" fill={fill} />;
}

function Book({ x = 50, y = 56 }: { x?: number; y?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-34 -14 L0 -6 L34 -14 L34 18 L0 26 L-34 18 Z" fill={G.teal} />
      <path d="M-30 -16 L0 -8 L0 22 L-30 14 Z" fill={G.cream} />
      <path d="M30 -16 L0 -8 L0 22 L30 14 Z" fill="#FFFDF6" />
      <path d="M-24 -6 l18 4 M-24 2 l18 4 M6 -2 l18 -4 M6 6 l18 -4" stroke="#C9B994" strokeWidth="2" />
    </g>
  );
}

function Person({ x, y, s = 1, color = G.green, head = "#C98E62", scarf }: { x: number; y: number; s?: number; color?: string; head?: string; scarf?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-12 30 Q-12 6 0 4 Q12 6 12 30 Z" fill={color} />
      {scarf && <circle cx="0" cy="-6" r="12" fill={scarf} />}
      <circle cx="0" cy="-6" r="9" fill={head} />
      <circle cx="-3" cy="-7" r="1.4" fill="#2A1A12" />
      <circle cx="3" cy="-7" r="1.4" fill="#2A1A12" />
      <path d="M-3 -2 Q0 1 3 -2" stroke="#7A3A2A" strokeWidth="1.4" fill="none" />
    </g>
  );
}

const ART: Record<IllustrationKey, () => ReactNode> = {
  crescent: () => (
    <>
      <rect width="100" height="100" rx="18" fill={G.night} />
      <Crescent x={44} y={50} r={28} />
      <Star x={76} y={24} r={6} />
      <Star x={82} y={60} r={4} />
      <Star x={20} y={20} r={3} fill="#fff" />
    </>
  ),
  lantern: () => (
    <>
      <circle cx="50" cy="50" r="40" fill="#FFE9A8" opacity="0.35" />
      <Lantern x={50} y={24} s={1.2} />
    </>
  ),
  dates: () => (
    <>
      <Plate y={66} />
      {[30, 42, 54, 66, 38, 50, 62].map((x, i) => (
        <ellipse key={i} cx={x} cy={i < 4 ? 62 : 54} rx="8" ry="5" fill={i % 2 ? "#7B3F1D" : "#94522A"} transform={`rotate(-20 ${x} ${i < 4 ? 62 : 54})`} />
      ))}
      {shine(36, 52, 2)}
    </>
  ),
  mosque: () => (
    <>
      <rect width="100" height="100" rx="18" fill={G.sky} />
      <Mosque />
    </>
  ),
  book: () => (
    <>
      <path d="M20 80 L50 66 L80 80 Z" fill={G.brown} />
      <Book y={52} />
    </>
  ),
  "prayer-mat": () => (
    <>
      <rect x="22" y="12" width="56" height="78" rx="6" fill={G.teal} />
      <rect x="28" y="18" width="44" height="66" rx="4" fill="none" stroke={G.gold} strokeWidth="3" />
      <path d="M36 44 Q50 22 64 44 L64 76 L36 76 Z" fill={G.emerald} stroke={G.gold} strokeWidth="2" />
      <path d="M44 84 l0 6 M50 84 l0 6 M56 84 l0 6" stroke={G.gold} strokeWidth="2" />
    </>
  ),
  "family-table": () => (
    <>
      <rect x="10" y="58" width="80" height="10" rx="4" fill={G.brown} />
      <rect x="16" y="68" width="6" height="22" fill={G.brown} />
      <rect x="78" y="68" width="6" height="22" fill={G.brown} />
      <ellipse cx="32" cy="56" rx="12" ry="4" fill="#fff" />
      <ellipse cx="68" cy="56" rx="12" ry="4" fill="#fff" />
      <ellipse cx="32" cy="53" rx="7" ry="3" fill={G.coral} />
      <rect x="47" y="40" width="7" height="16" rx="2" fill={G.sky} />
      <ellipse cx="68" cy="53" rx="7" ry="3" fill="#7B3F1D" />
      <Lantern x={50} y={8} s={0.5} />
    </>
  ),
  "heart-hands": () => (
    <>
      <circle cx="50" cy="50" r="40" fill={G.pink} opacity="0.5" />
      <Heart x={50} y={36} s={1.4} />
      <Hands y={86} />
    </>
  ),
  "maldivian-food": () => (
    <>
      <Plate y={66} w={40} />
      <path d="M20 62 L32 46 L44 62 Z" fill="#E0A458" stroke="#B97A30" strokeWidth="2" />
      <path d="M44 62 L56 46 L68 62 Z" fill="#E7B66B" stroke="#B97A30" strokeWidth="2" />
      <circle cx="74" cy="58" r="7" fill="#C98A3A" />
      <circle cx="82" cy="62" r="6" fill="#C98A3A" />
      <circle cx="72" cy="56" r="2" fill="#fff" opacity="0.5" />
    </>
  ),
  water: () => (
    <>
      <path d="M50 12 Q74 44 74 60 A24 24 0 0 1 26 60 Q26 44 50 12 Z" fill={G.sea} />
      <path d="M38 56 Q38 70 50 74" stroke="#fff" strokeOpacity="0.7" strokeWidth="4" fill="none" strokeLinecap="round" />
    </>
  ),
  sunrise: () => (
    <>
      <rect width="100" height="100" rx="18" fill="#2C3E70" />
      <rect y="50" width="100" height="50" rx="0" fill="#F5B98A" opacity="0.5" />
      <circle cx="50" cy="66" r="18" fill="#FFD27A" />
      <rect y="66" width="100" height="34" fill={G.sea} />
      <path d="M10 76 h20 M40 84 h24 M70 76 h20" stroke="#fff" strokeOpacity="0.6" strokeWidth="2" />
      <Star x={20} y={18} r={3} fill="#fff" />
      <Star x={80} y={24} r={3} fill="#fff" />
    </>
  ),
  sunset: () => (
    <>
      <rect width="100" height="100" rx="18" fill="#F59E6B" />
      <rect width="100" height="40" rx="18" fill="#C86B8A" opacity="0.6" />
      <circle cx="50" cy="62" r="20" fill="#FFD27A" />
      <rect y="64" width="100" height="36" fill="#3A8FA8" />
      <Palm x={18} y={66} s={0.7} />
      <path d="M30 76 h40 M40 86 h20" stroke="#FFD27A" strokeOpacity="0.8" strokeWidth="3" />
    </>
  ),
  star: () => (
    <>
      <circle cx="50" cy="50" r="40" fill="#FFF1C2" />
      <Star x={50} y={52} r={32} />
      {shine(42, 40, 5)}
    </>
  ),
  gift: () => (
    <>
      <rect x="22" y="42" width="56" height="44" rx="6" fill={G.teal} />
      <rect x="18" y="32" width="64" height="14" rx="5" fill={G.green} />
      <rect x="45" y="32" width="10" height="54" fill={G.gold} />
      <path d="M50 32 Q34 14 30 28 Q34 34 50 32 Q66 14 70 28 Q66 34 50 32" fill={G.gold} />
    </>
  ),
  tidy: () => (
    <>
      <rect x="18" y="56" width="64" height="32" rx="6" fill={G.sky} />
      <rect x="26" y="40" width="14" height="20" rx="2" fill={G.coral} />
      <rect x="42" y="36" width="12" height="24" rx="2" fill={G.gold} />
      <rect x="56" y="42" width="14" height="18" rx="2" fill={G.teal} />
      <Star x={80} y={22} r={7} />
      <Star x={20} y={26} r={4} />
    </>
  ),
  card: () => (
    <>
      <rect x="20" y="20" width="60" height="64" rx="6" fill={G.cream} stroke={G.gold} strokeWidth="3" transform="rotate(-6 50 52)" />
      <Heart x={50} y={44} s={1} />
      <Crescent x={36} y={68} r={8} />
      <Star x={64} y={68} r={6} />
    </>
  ),
  reading: () => (
    <>
      <circle cx="50" cy="50" r="40" fill={G.lav} />
      <Book y={60} />
      <Star x={50} y={24} r={8} />
    </>
  ),
  garden: () => (
    <>
      <rect x="0" y="70" width="100" height="30" fill="#8CC084" />
      <Palm x={30} y={78} s={0.9} />
      {[60, 72, 84].map((x) => (
        <g key={x}>
          <line x1={x} y1="78" x2={x} y2="60" stroke={G.green} strokeWidth="3" />
          <circle cx={x} cy="56" r="6" fill={x === 72 ? G.coral : G.pink} />
          <circle cx={x} cy="56" r="2" fill={G.gold} />
        </g>
      ))}
    </>
  ),
  calendar: () => (
    <>
      <rect x="16" y="22" width="68" height="64" rx="8" fill="#fff" stroke={G.teal} strokeWidth="3" />
      <rect x="16" y="22" width="68" height="16" rx="8" fill={G.teal} />
      {[0, 1, 2, 3].map((r) => [0, 1, 2, 3].map((c) => <rect key={`${r}${c}`} x={24 + c * 15} y={44 + r * 10} width="10" height="7" rx="2" fill={r * 4 + c < 6 ? G.gold : G.sky} />))}
      <Crescent x={66} y={30} r={5} fill="#fff" />
    </>
  ),
  "night-sky": () => (
    <>
      <rect width="100" height="100" rx="18" fill={G.night} />
      {[
        [20, 20, 4],
        [70, 16, 5],
        [84, 40, 3],
        [36, 44, 3],
        [60, 54, 6],
        [16, 66, 3],
        [86, 76, 4],
      ].map(([x, y, r], i) => (
        <Star key={i} x={x} y={y} r={r} fill={i % 2 ? "#fff" : G.gold} />
      ))}
      <Crescent x={34} y={28} r={12} />
      <path d="M0 84 Q50 72 100 84 L100 100 L0 100 Z" fill="#14203D" />
    </>
  ),
  "charity-box": () => (
    <>
      <rect x="24" y="40" width="52" height="46" rx="6" fill={G.teal} />
      <rect x="40" y="38" width="20" height="5" rx="2" fill={G.emerald} />
      <Heart x={50} y={60} s={0.9} fill={G.gold} />
      <circle cx="50" cy="22" r="9" fill={G.gold} stroke={G.deepGold} strokeWidth="2" />
    </>
  ),
  island: () => (
    <>
      <rect width="100" height="100" rx="18" fill={G.sky} />
      <rect y="58" width="100" height="42" fill={G.sea} />
      <ellipse cx="50" cy="64" rx="34" ry="10" fill={G.sand} />
      <Palm x={44} y={62} s={0.9} />
      <path d="M10 80 h18 M60 86 h22" stroke="#fff" strokeOpacity="0.7" strokeWidth="2" />
    </>
  ),
  eid: () => (
    <>
      <rect width="100" height="100" rx="18" fill={G.lav} />
      <path d="M6 18 Q50 40 94 18" stroke={G.teal} strokeWidth="2" fill="none" />
      {[14, 30, 46, 62, 78].map((x, i) => (
        <path key={x} d={`M${x} ${20 + Math.sin(i) * 3} l6 14 l6 -14 Z`} fill={[G.gold, G.coral, G.teal, G.pink, G.gold][i]} transform={`translate(0 ${i === 2 ? 6 : i === 1 || i === 3 ? 4 : 0})`} />
      ))}
      <Crescent x={44} y={66} r={20} />
      <Star x={72} y={60} r={9} />
    </>
  ),
  sharing: () => (
    <>
      <ellipse cx="34" cy="62" rx="20" ry="8" fill="#fff" stroke="#E2D3B5" strokeWidth="2" />
      <ellipse cx="70" cy="62" rx="20" ry="8" fill="#fff" stroke="#E2D3B5" strokeWidth="2" />
      <circle cx="30" cy="56" r="6" fill={G.coral} />
      <circle cx="38" cy="57" r="5" fill={G.gold} />
      <circle cx="66" cy="56" r="6" fill={G.coral} />
      <circle cx="74" cy="57" r="5" fill={G.gold} />
      <path d="M40 34 Q50 24 60 34" stroke={G.teal} strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M58 28 l4 6 l-7 1" stroke={G.teal} strokeWidth="4" fill="none" strokeLinecap="round" />
    </>
  ),
  "thank-you": () => (
    <>
      <path d="M14 22 h72 a8 8 0 0 1 8 8 v34 a8 8 0 0 1 -8 8 h-44 l-14 14 v-14 h-14 a8 8 0 0 1 -8 -8 v-34 a8 8 0 0 1 8 -8 Z" fill="#fff" stroke={G.teal} strokeWidth="3" />
      <Heart x={50} y={44} s={1.1} />
    </>
  ),
  hourglass: () => (
    <>
      <rect x="26" y="12" width="48" height="8" rx="3" fill={G.brown} />
      <rect x="26" y="80" width="48" height="8" rx="3" fill={G.brown} />
      <path d="M32 20 L68 20 Q66 42 52 50 Q66 58 68 80 L32 80 Q34 58 48 50 Q34 42 32 20 Z" fill={G.sky} opacity="0.7" stroke={G.teal} strokeWidth="2" />
      <path d="M40 30 L60 30 Q56 42 50 46 Q44 42 40 30 Z" fill={G.sand} />
      <path d="M38 78 Q50 62 62 78 Z" fill={G.sand} />
    </>
  ),
  smile: () => (
    <>
      <circle cx="50" cy="50" r="38" fill={G.gold} />
      <circle cx="38" cy="42" r="5" fill="#5B3A12" />
      <circle cx="62" cy="42" r="5" fill="#5B3A12" />
      <path d="M34 58 Q50 76 66 58" stroke="#5B3A12" strokeWidth="5" fill="none" strokeLinecap="round" />
      {shine(36, 28, 6)}
    </>
  ),
  dua: () => (
    <>
      <circle cx="50" cy="40" r="30" fill="#FFF1C2" />
      <Star x={50} y={30} r={8} />
      <Hands y={90} />
    </>
  ),
  shoes: () => (
    <>
      <rect x="10" y="74" width="80" height="6" rx="3" fill={G.brown} />
      <path d="M18 72 Q18 56 30 56 L40 60 Q46 64 46 72 Z" fill={G.teal} />
      <path d="M54 72 Q54 56 66 56 L76 60 Q82 64 82 72 Z" fill={G.coral} />
      <Star x={50} y={28} r={8} />
    </>
  ),
  family: () => (
    <>
      <circle cx="50" cy="50" r="42" fill={G.sky} opacity="0.6" />
      <Person x={30} y={46} s={1.2} color={G.teal} head="#A8714B" />
      <Person x={70} y={46} s={1.2} color={G.lav} head="#C98E62" scarf={G.pink} />
      <Person x={50} y={60} s={0.9} color={G.green} />
    </>
  ),
  pillars: () => (
    <>
      <rect x="10" y="18" width="80" height="10" rx="3" fill={G.teal} />
      {[16, 31, 46, 61, 76].map((x) => (
        <rect key={x} x={x} y="28" width="8" height="54" rx="2" fill={G.cream} stroke="#E2D3B5" />
      ))}
      <rect x="8" y="82" width="84" height="8" rx="3" fill={G.teal} />
    </>
  ),
  toys: () => (
    <>
      <rect x="16" y="54" width="68" height="34" rx="6" fill={G.sky} />
      <circle cx="34" cy="48" r="12" fill={G.coral} />
      <rect x="50" y="36" width="20" height="20" rx="3" fill={G.gold} />
      <path d="M56 42 h8 M60 38 v8" stroke="#fff" strokeWidth="2" />
    </>
  ),
  "phone-call": () => (
    <>
      <rect x="32" y="14" width="36" height="72" rx="8" fill={G.emerald} />
      <rect x="36" y="22" width="28" height="52" rx="3" fill={G.sky} />
      <Heart x={50} y={44} s={0.8} />
      <path d="M74 30 q8 8 0 16 M80 24 q14 14 0 28" stroke={G.gold} strokeWidth="3" fill="none" strokeLinecap="round" />
    </>
  ),
  puzzle: () => (
    <>
      <rect x="14" y="14" width="34" height="34" rx="4" fill={G.teal} />
      <rect x="52" y="14" width="34" height="34" rx="4" fill={G.gold} />
      <rect x="14" y="52" width="34" height="34" rx="4" fill={G.lav} />
      <rect x="56" y="56" width="34" height="34" rx="4" fill={G.coral} transform="rotate(10 73 73)" />
      <circle cx="48" cy="31" r="6" fill={G.teal} />
      <circle cx="31" cy="48" r="6" fill={G.teal} />
    </>
  ),
  memory: () => (
    <>
      <rect x="12" y="20" width="34" height="48" rx="6" fill={G.teal} transform="rotate(-8 29 44)" />
      <rect x="54" y="26" width="34" height="48" rx="6" fill={G.cream} stroke={G.gold} strokeWidth="3" transform="rotate(8 71 50)" />
      <Crescent x={68} y={50} r={10} />
      <Star x={29} y={44} r={8} fill={G.gold} />
    </>
  ),
  quiz: () => (
    <>
      <circle cx="50" cy="50" r="40" fill={G.lav} />
      <path d="M38 38 Q38 24 50 24 Q62 24 62 36 Q62 46 50 50 L50 60" stroke={G.emerald} strokeWidth="8" fill="none" strokeLinecap="round" />
      <circle cx="50" cy="74" r="5" fill={G.emerald} />
    </>
  ),
  match: () => (
    <>
      <rect x="10" y="20" width="32" height="24" rx="5" fill={G.teal} />
      <rect x="58" y="56" width="32" height="24" rx="5" fill={G.gold} />
      <path d="M42 32 Q60 32 64 54" stroke={G.coral} strokeWidth="4" strokeDasharray="5 5" fill="none" />
      <Crescent x={74} y={68} r={7} fill="#fff" />
      <path d="M18 32 h16" stroke="#fff" strokeWidth="3" />
    </>
  ),
  sort: () => (
    <>
      <rect x="10" y="50" width="36" height="36" rx="6" fill="#CDEBD9" stroke={G.teal} strokeWidth="3" />
      <rect x="54" y="50" width="36" height="36" rx="6" fill="#FBE3DC" stroke={G.coral} strokeWidth="3" />
      <Heart x={28} y={66} s={0.7} fill={G.teal} />
      <path d="M64 68 h16" stroke={G.coral} strokeWidth="4" strokeLinecap="round" />
      <rect x="34" y="12" width="32" height="26" rx="4" fill={G.gold} />
    </>
  ),
  abc: () => (
    <>
      <rect x="12" y="24" width="24" height="24" rx="4" fill={G.teal} />
      <rect x="38" y="42" width="24" height="24" rx="4" fill={G.gold} />
      <rect x="64" y="24" width="24" height="24" rx="4" fill={G.coral} />
      <text x="24" y="42" fontSize="16" fontWeight="700" fill="#fff" textAnchor="middle">
        A
      </text>
      <text x="50" y="60" fontSize="16" fontWeight="700" fill={G.emerald} textAnchor="middle">
        B
      </text>
      <text x="76" y="42" fontSize="16" fontWeight="700" fill="#fff" textAnchor="middle">
        C
      </text>
    </>
  ),
};

export function Illustration({ name, size = 96, label, className }: { name: IllustrationKey; size?: number | string; label?: string; className?: string }) {
  const draw = ART[name] ?? ART.star;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      {draw()}
    </svg>
  );
}

export { Lantern as LanternArt, Crescent as CrescentArt, Star as StarArt, Mosque as MosqueArt, Palm as PalmArt };
export const ART_COLOURS = G;
export const hasIllustration = (k: string): k is IllustrationKey => k in ART;
