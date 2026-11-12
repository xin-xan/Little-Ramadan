import type { Decoration, RoomSlot } from "./types";
import data from "./data/decorations.json";

/** Room decorations — always earned through activities, never bought or random. */
export const decorations = data as Decoration[];

export const ROOM_SLOTS: { id: RoomSlot; label: string }[] = [
  { id: "wall", label: "Wall" },
  { id: "window", label: "Window" },
  { id: "ceiling", label: "Lantern" },
  { id: "garland", label: "Garland" },
  { id: "floor", label: "Rug" },
  { id: "cushion", label: "Cushions" },
  { id: "shelf", label: "Shelf" },
  { id: "plant", label: "Plant" },
];

export const decorationById = (id: string) => decorations.find((d) => d.id === id);
