/** Sticker Album: one sticker per lesson, story and mission; earned only by finishing it; never from fasting. */
import { describe, expect, it } from "vitest";
import { lessons } from "@/content/lessons";
import { missions } from "@/content/missions";
import { stories } from "@/content/stories";
import { allStickers, earnedStickers, newStickerIds } from "@/storage/stickers";
import type { Completion } from "@/storage/schema";

const c = (kind: Completion["kind"], contentId: string, t = "2026-03-01T10:00:00Z"): Completion => ({ id: `${kind}:${contentId}`, kind, contentId, completedAt: t });

describe("stickers", () => {
  it("there is exactly one sticker for every lesson, story and kindness mission", () => {
    const ids = allStickers().map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.length).toBe(lessons.length + stories.length + missions.length);
  });
  it("are earned by finishing that activity, in the order earned", () => {
    const got = earnedStickers([c("kindness", missions[0].id, "2026-03-02T00:00:00Z"), c("lesson", lessons[0].id, "2026-03-01T00:00:00Z"), c("quiz", "ramadan-basics"), c("game", "quiz")]);
    expect(got.map((s) => s.id)).toEqual([`lesson:${lessons[0].id}`, `kindness:${missions[0].id}`]);
  });
  it("only new learning and kindness completions add stickers; removed content is ignored", () => {
    expect(newStickerIds([c("story", stories[0].id), c("dayplay", "d01"), c("lesson", "no-longer-exists")])).toEqual([`story:${stories[0].id}`]);
  });
  it("nothing about fasting or the journal can earn a sticker", () => {
    expect(JSON.stringify(allStickers().map((s) => s.kind))).not.toMatch(/journal|fast/);
  });
});
