import { useId } from "react";
import { iconPath } from "../Icon";

const BADGE_STYLE: Record<string, { a: string; b: string; icon: string }> = {
  "ramadan-explorer": { a: "#3fa58a", b: "#1d5a4d", icon: "journey" },
  "kindness-hero": { a: "#ec8fab", b: "#b0476a", icon: "heart" },
  "little-scholar": { a: "#6aa9dc", b: "#2b6a90", icon: "book" },
  "curious-mind": { a: "#a892e0", b: "#6a55a8", icon: "sparkle" },
  "story-lover": { a: "#f2ae6b", b: "#c06a1f", icon: "scroll" },
  "game-explorer": { a: "#7cc67f", b: "#3e8e41", icon: "games" },
  "goal-getter": { a: "#f1cc6b", b: "#b8871f", icon: "target" },
  "ramadan-star": { a: "#2d6f61", b: "#0b2a25", icon: "star" },
};

/** A metallic medal with ribbon. Locked badges are shown greyed with a lock. */
export function BadgeIcon({ id, size = 72, locked = false, label }: { id: string; size?: number; locked?: boolean; label?: string }) {
  const uid = useId().replace(/:/g, "");
  const s = BADGE_STYLE[id] ?? BADGE_STYLE["ramadan-explorer"];
  const a = locked ? "#cfd6d3" : s.a;
  const b = locked ? "#9aa5a1" : s.b;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <defs>
        <linearGradient id={`rim${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={locked ? "#e4e8e6" : "#fff3c4"} />
          <stop offset="0.45" stopColor={locked ? "#b9c1be" : "#e9c66b"} />
          <stop offset="1" stopColor={locked ? "#8e9894" : "#a8781a"} />
        </linearGradient>
        <radialGradient id={`face${uid}`} cx="35%" cy="28%" r="80%">
          <stop offset="0" stopColor={a} />
          <stop offset="1" stopColor={b} />
        </radialGradient>
      </defs>
      <path d="M33 62 L24 96 L37 89 L45 99 L52 68 Z" fill={locked ? "#b9c1be" : b} />
      <path d="M67 62 L76 96 L63 89 L55 99 L48 68 Z" fill={locked ? "#cfd6d3" : a} />
      <circle cx="50" cy="44" r="38" fill={`url(#rim${uid})`} />
      <circle cx="50" cy="44" r="30" fill={`url(#face${uid})`} />
      <path d="M26 34 A28 28 0 0 1 62 18" stroke="#fff" strokeOpacity="0.45" strokeWidth="4" fill="none" strokeLinecap="round" />
      <svg x="32" y="26" width="36" height="36" viewBox="0 0 24 24" fill={!locked && s.icon === "star" ? "#e9c66b" : "none"} stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d={iconPath(locked ? "lock" : s.icon)} />
      </svg>
    </svg>
  );
}
