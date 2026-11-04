"use client";

import { useState } from "react";
import { DecorationThumb } from "@/components/room/DecorationArt";
import { RoomScene } from "@/components/room/RoomScene";
import { resolveLayout } from "@/components/room/layout";
import { PageHeader } from "@/components/ui";
import { decorations, ROOM_SLOTS } from "@/content/decorations";
import type { RoomSlot } from "@/content/types";
import { unlockedDecorationIds } from "@/storage/rewards";
import { useApp } from "@/state/AppState";
import { playSound } from "@/accessibility/sound";
import { Icon } from "@/components/Icon";

export default function RoomPage() {
  const { data, setRoomSlot } = useApp();
  const [slot, setSlot] = useState<RoomSlot>("ceiling");
  const unlocked = new Set(unlockedDecorationIds(data.completions));
  const layout = resolveLayout(data.room.slots, unlocked);
  const options = decorations.filter((d) => d.slot === slot);
  if (!data.profile) return null;

  return (
    <div className="stack-lg">
      <PageHeader title="My Ramadan Room" back={{ href: "/rewards/", label: "Celebration Square" }} />
      <RoomScene layout={layout} avatar={data.profile.avatar} nickname={data.profile.nickname} />
      <p className="small muted center">Tap a place, then choose a decoration. Your room is private to you.</p>
      <div className="tabs" role="tablist" aria-label="Room places">
        {ROOM_SLOTS.map((s) => (
          <button key={s.id} role="tab" aria-selected={slot === s.id} onClick={() => setSlot(s.id)} style={{ borderColor: "var(--teal)", color: slot === s.id ? "#fff" : "var(--teal)", background: slot === s.id ? "var(--teal)" : "#fff" }}>
            {s.label}
          </button>
        ))}
      </div>
      <div className="grid-3" role="radiogroup" aria-label={`${ROOM_SLOTS.find((s) => s.id === slot)?.label} decorations`}>
        <button type="button" role="radio" aria-checked={!layout[slot]} className="choice" style={{ minHeight: 110 }} onClick={() => setRoomSlot(slot, "none")}>
          <span style={{ fontSize: "2rem" }} aria-hidden="true">⬜</span>
          Empty
        </button>
        {options.map((d) => {
          const got = unlocked.has(d.id);
          return (
            <button
              key={d.id}
              type="button"
              role="radio"
              aria-checked={layout[slot] === d.id}
              aria-disabled={!got}
              className="choice"
              style={{ minHeight: 110, opacity: got ? 1 : 0.7 }}
              onClick={() => {
                if (!got) return;
                void setRoomSlot(slot, d.id);
                if (data.settings.soundOn) playSound("tap");
              }}
              aria-label={got ? d.title : `${d.title}, locked. ${d.hint}`}
            >
              <DecorationThumb id={d.id} size={56} locked={!got} />
              <span>{d.title}</span>
              {!got && <span className="small muted" style={{ fontWeight: 500 }}><Icon name="lock" size={12} /> {d.hint}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
