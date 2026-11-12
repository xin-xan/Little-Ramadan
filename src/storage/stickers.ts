/**
 * Sticker Album: every lesson, story and kindness mission has its own sticker, using that
 * activity's picture. Finishing the activity earns exactly that sticker: nothing random,
 * nothing bought, and nothing to do with fasting. Derived from completions, so no extra storage.
 */
import type { IllustrationKey } from "@/components/art/illustrationKeys";
import { lessons } from "@/content/lessons";
import { missions } from "@/content/missions";
import { stories } from "@/content/stories";
import type { Completion, CompletionKind } from "./schema";

export type StickerKind = "lesson" | "story" | "kindness";
export const STICKER_KINDS: StickerKind[] = ["lesson", "story", "kindness"];

export interface Sticker {
  /** Same as the completion id, e.g. "lesson:salah". */
  id: string;
  kind: StickerKind;
  contentId: string;
  title: string;
  illustration: IllustrationKey;
  /** A short fact or reminder shown on the back of the sticker. */
  blurb: string;
  /** Where to earn (or revisit) it. */
  href: string;
  album: "learning" | "kindness";
}

export function allStickers(): Sticker[] {
  return [
    ...lessons.map((l) => ({ id: `lesson:${l.id}`, kind: "lesson" as const, contentId: l.id, title: l.title, illustration: l.illustration, blurb: l.summary, href: `/learn/lesson/${l.id}/`, album: "learning" as const })),
    ...stories.map((s) => ({ id: `story:${s.id}`, kind: "story" as const, contentId: s.id, title: s.title, illustration: s.illustration, blurb: s.summary, href: `/learn/story/${s.id}/`, album: "learning" as const })),
    ...missions.map((m) => ({ id: `kindness:${m.id}`, kind: "kindness" as const, contentId: m.id, title: m.title, illustration: m.illustration, blurb: m.description, href: `/kindness/${m.id}/`, album: "kindness" as const })),
  ];
}

export const isStickerKind = (k: CompletionKind): k is StickerKind => (STICKER_KINDS as CompletionKind[]).includes(k);

/** Stickers earned, in the order they were earned. Stickers for removed content are ignored. */
export function earnedStickers(completions: Completion[]): Sticker[] {
  const byId = new Map(allStickers().map((s) => [s.id, s]));
  return [...completions]
    .filter((c) => isStickerKind(c.kind))
    .sort((a, b) => a.completedAt.localeCompare(b.completedAt))
    .map((c) => byId.get(c.id))
    .filter((s): s is Sticker => !!s);
}

/** The stickers a new batch of completions adds. */
export function newStickerIds(fresh: Completion[]): string[] {
  const ids = new Set(allStickers().map((s) => s.id));
  return fresh.filter((c) => isStickerKind(c.kind) && ids.has(c.id)).map((c) => c.id);
}
