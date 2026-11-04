/**
 * Little Ramadan icon set: one consistent, rounded 24px line style (original artwork).
 * Use instead of emoji so icons look the same on every phone.
 */
const P: Record<string, string> = {
  home: "M3.5 11 12 4l8.5 7M6 9.5V19a1 1 0 0 0 1 1h3.5v-5h3v5H17a1 1 0 0 0 1-1V9.5",
  journey: "M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5ZM16 4.5l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6Z",
  games: "M9 3.5h3a1.5 1.5 0 0 1 3 0h3.5V8a1.5 1.5 0 0 1 0 3v3.5H15a1.5 1.5 0 0 0-3 0H8.5V11a1.5 1.5 0 0 0 0-3V3.5Z M5.5 14.5v6h6M18.5 18v2.5h-4",
  rewards: "M8 4h8v5a4 4 0 0 1-8 0V4ZM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v3.5M8.5 20h7l-1-3.5h-5Z",
  parents: "M12 3.5 5 6v5.5c0 4.2 3 7.6 7 9 4-1.4 7-4.8 7-9V6l-7-2.5ZM12 15.5s-3-1.8-3-3.9A1.6 1.6 0 0 1 12 10.5a1.6 1.6 0 0 1 3 1.1c0 2.1-3 3.9-3 3.9Z",
  back: "M15 5 8 12l7 7",
  next: "M9 5l7 7-7 7",
  close: "M6 6l12 12M18 6 6 18",
  pause: "M9 5.5v13M15 5.5v13",
  play: "M8 5.5v13l10.5-6.5Z",
  check: "M5 12.5 10 17.5 19 7",
  lock: "M7 11V8a5 5 0 0 1 10 0v3M5.5 11h13v9h-13ZM12 14.5v2",
  star: "M12 3.8l2.5 5.1 5.6.8-4 4 .9 5.6-5-2.6-5 2.6.9-5.6-4-4 5.6-.8Z",
  heart: "M12 20s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.6-7.5 10-7.5 10Z",
  book: "M12 6.5C10 5 7 4.8 4 5.5v13c3-.7 6-.5 8 1 2-1.5 5-1.7 8-1v-13c-3-.7-6-.5-8 1ZM12 6.5v13",
  sprout: "M12 20v-8M12 12C12 8 9 5.5 5 5.5c0 4 3 6.5 7 6.5ZM12 14c0-3.5 2.6-6 6.5-6 0 3.5-2.6 6-6.5 6ZM8 20h8",
  sparkle: "M12 3.5l1.8 5.2 5.2 1.8-5.2 1.8L12 17.5l-1.8-5.2L5 10.5l5.2-1.8ZM18.5 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7Z",
  gift: "M4.5 9.5h15v3.5h-15ZM5.5 13v7h13v-7M12 9.5V20M12 9.5S10.5 4.5 8 5.2c-2 .6-1 4.3 4 4.3ZM12 9.5s1.5-5 4-4.3c2 .6 1 4.3-4 4.3Z",
  lantern: "M12 2.5v2.5M9 5h6l1 2H8ZM8 7c-1 3-1 8 1 11h6c2-3 2-8 1-11M10.5 18h3l-.5 2.5h-2ZM12 10v5",
  target: "M12 20.5a8.5 8.5 0 1 1 0-17 8.5 8.5 0 0 1 0 17ZM12 16.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9ZM12 12h.01",
  scroll: "M7 4h11a2 2 0 0 1 2 2v1h-4M7 4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V7M7 4a2 2 0 0 1 2 2v12M11 9h4M11 12.5h4",
  "sound-on": "M4.5 9.5h3l4.5-4v13l-4.5-4h-3ZM15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11",
  "sound-off": "M4.5 9.5h3l4.5-4v13l-4.5-4h-3ZM16 9.5l5 5M21 9.5l-5 5",
  print: "M7 9V4h10v5M6 17H4.5v-7.5h15V17H18M7 14h10v6H7Z",
  download: "M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14",
  thought: "M7 17a4 4 0 0 1-.5-8 5.5 5.5 0 0 1 10.5-1 4.5 4.5 0 0 1 0 9ZM8 20.5h.01M5 21.5h.01",
  hand: "M8.5 12V6a1.5 1.5 0 0 1 3 0v5M11.5 11V4.5a1.5 1.5 0 0 1 3 0V11M14.5 11V6a1.5 1.5 0 0 1 3 0v7c0 4-2.5 7-6.5 7-3 0-4.5-1.5-6-4.5l-1.5-3a1.5 1.5 0 0 1 2.6-1.5l1.4 2",
  info: "M12 20.5a8.5 8.5 0 1 1 0-17 8.5 8.5 0 0 1 0 17ZM12 11v5.5M12 7.5h.01",
  refresh: "M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4.5v4.5H15",
  eye: "M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12ZM12 15a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z",
  calendar: "M4.5 6.5h15v13h-15ZM4.5 10.5h15M8.5 4v4M15.5 4v4M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01",
  family: "M8 10.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5ZM16 10.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5ZM3.5 19c0-3.5 2-5.5 4.5-5.5s4.5 2 4.5 5.5M11.5 19c0-3.5 2-5.5 4.5-5.5s4.5 2 4.5 5.5",
  moon: "M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5Z",
  settings: "M12 15a3 3 0 1 1 0-6 3 3 0 0 1 0 6ZM19 12a7 7 0 0 0-.1-1.3l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2.2-1.3L14 3h-4l-.4 2.4a7 7 0 0 0-2.2 1.3l-2.3-.9-2 3.4 2 1.5a7 7 0 0 0 0 2.6l-2 1.5 2 3.4 2.3-.9a7 7 0 0 0 2.2 1.3L10 21h4l.4-2.4a7 7 0 0 0 2.2-1.3l2.3.9 2-3.4-2-1.5c.1-.4.1-.9.1-1.3Z",
  water: "M12 3.5s6 6.5 6 10.5a6 6 0 0 1-12 0c0-4 6-10.5 6-10.5Z",
  shield: "M12 3.5 5 6v5.5c0 4.2 3 7.6 7 9 4-1.4 7-4.8 7-9V6l-7-2.5Z",
  door: "M6 20.5V5a1.5 1.5 0 0 1 1.5-1.5h9A1.5 1.5 0 0 1 18 5v15.5M4 20.5h16M14.5 12.5h.01",
  palm: "M12 21c0-5 .5-8 1.5-11M13.5 10C12 6.5 8.5 5.5 5 6.5M13.5 10c1-3.5 4.5-5.2 8-4M13.5 10c-3 0-6 1.5-7.5 4.5M13.5 10c3 .5 5.5 2.5 6.5 5.5M8 21h9",
  street: "M12 20.5s-7-4.2-7-9.6A4 4 0 0 1 12 8.6a4 4 0 0 1 7 2.3c0 5.4-7 9.6-7 9.6ZM12 3.5v2M6.5 4.5l1 1.7M17.5 4.5l-1 1.7",
  confetti: "M4 20l4.5-12 7.5 7.5ZM14 4.5c1 1.5 1 3-.5 4M19.5 10c-1.5-1-3-1-4 .5M17.5 4h.01M20 7h.01M11 3h.01",
  arrowRight: "M5 12h14M13 6l6 6-6 6",
};

export type IconName = keyof typeof P | string;

/** Raw path data, for drawing an icon inside another SVG (badges, certificate). */
export const iconPath = (name: string) => P[name] ?? P.sparkle;

export function Icon({ name, size = 24, strokeWidth = 2, className, label, fill }: { name: IconName; size?: number; strokeWidth?: number; className?: string; label?: string; fill?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={`icon ${className ?? ""}`}
      fill={fill ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <path d={P[name] ?? P.sparkle} />
    </svg>
  );
}

/** Icon in a soft coloured rounded square, used on tiles and list rows. */
export function IconChip({ name, tone = "emerald", size = 44 }: { name: IconName; tone?: "emerald" | "gold" | "sky" | "lavender" | "rose" | "parent"; size?: number }) {
  return (
    <span className={`icon-chip tone-${tone}`} style={{ width: size, height: size }} aria-hidden="true">
      <Icon name={name} size={Math.round(size * 0.55)} />
    </span>
  );
}
