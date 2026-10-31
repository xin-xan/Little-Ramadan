/** My Little Ramadan Room — renders the chosen decoration in each slot. */
import { Avatar } from "@/characters/Avatars";
import type { RoomSlot } from "@/content/types";
import { DECORATION_ART } from "./DecorationArt";

const ORDER: RoomSlot[] = ["window", "wall", "garland", "floor", "shelf", "plant", "cushion", "ceiling"];

export function RoomScene({ layout, avatar, nickname }: { layout: Partial<Record<RoomSlot, string>>; avatar: string; nickname: string }) {
  const described = ORDER.map((s) => layout[s]).filter(Boolean).length;
  return (
    <div style={{ position: "relative", borderRadius: 24, overflow: "hidden", boxShadow: "var(--shadow-soft)" }}>
      <svg viewBox="0 0 360 300" width="100%" role="img" aria-label={`${nickname}'s Ramadan Room with ${described} decoration${described === 1 ? "" : "s"}`} style={{ display: "block" }}>
        <defs>
          <linearGradient id="roomwall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFF1D6" />
            <stop offset="1" stopColor="#F6E2BC" />
          </linearGradient>
          <linearGradient id="roomfloor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#D9B88A" />
            <stop offset="1" stopColor="#C49B68" />
          </linearGradient>
        </defs>
        <rect width="360" height="220" fill="url(#roomwall)" />
        <rect y="210" width="360" height="90" fill="url(#roomfloor)" />
        <rect y="206" width="360" height="8" fill="#B88A55" />
        {layout.shelf && <rect x="262" y="182" width="76" height="8" rx="3" fill="#8A5A3B" />}
        {ORDER.map((slot) => {
          const id = layout[slot];
          const draw = id ? DECORATION_ART[id] : undefined;
          return draw ? <g key={slot}>{draw()}</g> : null;
        })}
      </svg>
      <div style={{ position: "absolute", left: "50%", bottom: "6%", transform: "translateX(-50%)" }}>
        <Avatar id={avatar} size={70} />
      </div>
    </div>
  );
}
