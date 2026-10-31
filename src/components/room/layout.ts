import { decorations, ROOM_SLOTS } from "@/content/decorations";
import type { RoomSlot } from "@/content/types";

/** Default layout uses the starter decorations until the child changes a slot. */
export function resolveLayout(saved: Record<string, string>, unlocked: Set<string>): Partial<Record<RoomSlot, string>> {
  const out: Partial<Record<RoomSlot, string>> = {};
  for (const { id: slot } of ROOM_SLOTS) {
    const choice = saved[slot];
    if (choice === "none") continue;
    if (choice && unlocked.has(choice)) out[slot] = choice;
    else {
      const starter = decorations.find((d) => d.slot === slot && d.rule.type === "start");
      if (starter) out[slot] = starter.id;
    }
  }
  return out;
}

