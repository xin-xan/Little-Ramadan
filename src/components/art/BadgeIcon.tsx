import { useId } from "react";
import { CrescentArt, StarArt } from "./Illustration";

const BADGE_STYLE: Record<string, { ring: string; inner: string; icon: string }> = {
  "ramadan-explorer": { ring: "#286356", inner: "#BBD8E8", icon: "🧭" },
  "kindness-hero": { ring: "#C2577E", inner: "#FFD6E5", icon: "💗" },
  "little-scholar": { ring: "#2F6FA8", inner: "#CDE7FF", icon: "📘" },
  "curious-mind": { ring: "#7A5FB5", inner: "#E4D8FF", icon: "💡" },
  "story-lover": { ring: "#D9822B", inner: "#FFE2BF", icon: "📖" },
  "game-explorer": { ring: "#3E8E41", inner: "#D9F7C9", icon: "🧩" },
  "goal-getter": { ring: "#C99A2E", inner: "#FFF1B8", icon: "🎯" },
  "ramadan-star": { ring: "#123C35", inner: "#E9C66B", icon: "🌟" },
};

export function BadgeIcon({ id, size = 72, locked = false, label }: { id: string; size?: number; locked?: boolean; label?: string }) {
  const uid = useId().replace(/:/g, "");
  const s = BADGE_STYLE[id] ?? BADGE_STYLE["ramadan-explorer"];
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true} style={locked ? { filter: "grayscale(1)", opacity: 0.45 } : undefined}>
      <defs>
        <radialGradient id={`b${uid}`} cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor={s.inner} />
          <stop offset="100%" stopColor={s.inner} />
        </radialGradient>
      </defs>
      <path d="M30 70 L22 96 L36 88 L44 98 L50 72 Z" fill={s.ring} opacity="0.85" />
      <path d="M70 70 L78 96 L64 88 L56 98 L50 72 Z" fill={s.ring} opacity="0.85" />
      <circle cx="50" cy="46" r="40" fill={s.ring} />
      <circle cx="50" cy="46" r="32" fill={`url(#b${uid})`} />
      <text x="50" y="58" fontSize="30" textAnchor="middle">
        {locked ? "🔒" : s.icon}
      </text>
      {!locked && (
        <>
          <StarArt x={84} y={14} r={7} />
          <CrescentArt x={14} y={14} r={7} />
        </>
      )}
    </svg>
  );
}
