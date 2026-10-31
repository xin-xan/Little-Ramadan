/**
 * Child avatars: friendly sea and island creatures, so children never use a
 * photo or a picture that looks like themselves.
 */
import { useId } from "react";

export const AVATARS = [
  { id: "turtle", name: "Turtle", body: "#4FA37A", shade: "#2E7A57", accent: "#C8E6A0" },
  { id: "dolphin", name: "Dolphin", body: "#6FA8DC", shade: "#3F7FB8", accent: "#E3F1FB" },
  { id: "fish", name: "Fish", body: "#F2A65A", shade: "#D27F2E", accent: "#FFE1BC" },
  { id: "crab", name: "Crab", body: "#E2725B", shade: "#B94C38", accent: "#FFD0C4" },
  { id: "bird", name: "Bird", body: "#F2CF6B", shade: "#C9A13A", accent: "#FFF1C2" },
  { id: "cat", name: "Cat", body: "#B9A6E3", shade: "#8F7BC4", accent: "#EFE8FF" },
  { id: "starfish", name: "Starfish", body: "#F28CA8", shade: "#CC5F7E", accent: "#FFE0EA" },
  { id: "octopus", name: "Octopus", body: "#9C8FD9", shade: "#6F61B5", accent: "#E6E1FF" },
] as const;

export type AvatarId = (typeof AVATARS)[number]["id"];

export const avatarById = (id: string) => AVATARS.find((a) => a.id === id) ?? AVATARS[0];

export function Avatar({ id, size = 64, decorative = false }: { id: string; size?: number; decorative?: boolean }) {
  const uid = useId().replace(/:/g, "");
  const a = avatarById(id);
  const eyes = (
    <g>
      <circle cx="40" cy="48" r="6" fill="#1E2B28" />
      <circle cx="60" cy="48" r="6" fill="#1E2B28" />
      <circle cx="42" cy="46" r="2" fill="#fff" />
      <circle cx="62" cy="46" r="2" fill="#fff" />
      <path d="M43 60 Q50 66 57 60" stroke="#1E2B28" strokeWidth="3" fill="none" strokeLinecap="round" />
      <ellipse cx="32" cy="58" rx="5" ry="3" fill="#F08A7E" opacity="0.5" />
      <ellipse cx="68" cy="58" rx="5" ry="3" fill="#F08A7E" opacity="0.5" />
    </g>
  );
  const fill = `url(#av${uid})`;
  let shape;
  switch (a.id) {
    case "turtle":
      shape = (
        <g>
          <ellipse cx="50" cy="82" rx="30" ry="12" fill={a.shade} />
          <path d="M22 80 Q24 50 50 48 Q76 50 78 80 Z" fill={a.accent} stroke={a.shade} strokeWidth="3" />
          <circle cx="50" cy="44" r="24" fill={fill} />
        </g>
      );
      break;
    case "dolphin":
      shape = (
        <g>
          <path d="M50 12 L58 26 L44 26 Z" fill={a.shade} />
          <ellipse cx="50" cy="52" rx="34" ry="32" fill={fill} />
          <ellipse cx="50" cy="66" rx="20" ry="12" fill={a.accent} />
        </g>
      );
      break;
    case "fish":
      shape = (
        <g>
          <path d="M84 52 L98 36 L98 68 Z" fill={a.shade} />
          <ellipse cx="48" cy="52" rx="38" ry="32" fill={fill} />
          <path d="M70 30 Q78 52 70 74" stroke={a.accent} strokeWidth="4" fill="none" />
        </g>
      );
      break;
    case "crab":
      shape = (
        <g>
          <circle cx="14" cy="34" r="10" fill={a.shade} />
          <circle cx="86" cy="34" r="10" fill={a.shade} />
          <ellipse cx="50" cy="56" rx="36" ry="28" fill={fill} />
        </g>
      );
      break;
    case "bird":
      shape = (
        <g>
          <ellipse cx="50" cy="54" rx="34" ry="34" fill={fill} />
          <path d="M46 62 L54 62 L50 70 Z" fill="#E2725B" />
          <ellipse cx="20" cy="60" rx="10" ry="16" fill={a.shade} />
        </g>
      );
      break;
    case "cat":
      shape = (
        <g>
          <path d="M20 34 L28 8 L42 26 Z" fill={a.shade} />
          <path d="M80 34 L72 8 L58 26 Z" fill={a.shade} />
          <ellipse cx="50" cy="52" rx="34" ry="32" fill={fill} />
        </g>
      );
      break;
    case "starfish":
      shape = (
        <path
          d="M50 6 L62 36 L94 38 L68 58 L78 90 L50 72 L22 90 L32 58 L6 38 L38 36 Z"
          fill={fill}
          stroke={a.shade}
          strokeWidth="3"
          strokeLinejoin="round"
        />
      );
      break;
    default:
      shape = (
        <g>
          {[18, 34, 50, 66, 82].map((x) => (
            <path key={x} d={`M${x} 70 Q${x - 4} 86 ${x + 2} 94`} stroke={a.shade} strokeWidth="8" fill="none" strokeLinecap="round" />
          ))}
          <ellipse cx="50" cy="48" rx="34" ry="34" fill={fill} />
        </g>
      );
  }
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} role={decorative ? undefined : "img"} aria-hidden={decorative || undefined} aria-label={decorative ? undefined : `${a.name} avatar`}>
      <defs>
        <radialGradient id={`av${uid}`} cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor={a.accent} />
          <stop offset="45%" stopColor={a.body} />
          <stop offset="100%" stopColor={a.shade} />
        </radialGradient>
      </defs>
      {shape}
      {eyes}
    </svg>
  );
}
