import { describe, expect, it } from "vitest";
import { badges } from "@/content/badges";
import { allDays } from "@/content/days";
import { lessons } from "@/content/lessons";
import { missions } from "@/content/missions";
import { completedDayIds, dayPartsDone, isDayComplete, ruleMet, totalStars, unlockedBadgeIds } from "@/storage/rewards";
import { normalise, type Completion, type CompletionKind } from "@/storage/schema";

const c = (kind: CompletionKind, contentId: string): Completion => ({ id: `${kind}:${contentId}`, kind, contentId, completedAt: "2026-03-01T00:00:00Z" });

describe("stars (CLAUDE.md §6.11 values)", () => {
  it("awards the specified values", () => {
    expect(totalStars([c("lesson", "a")])).toBe(2);
    expect(totalStars([c("kindness", "a")])).toBe(3);
    expect(totalStars([c("quiz", "a")])).toBe(2);
    expect(totalStars([c("story", "a")])).toBe(2);
    expect(totalStars([c("goal", "a")])).toBe(3);
    expect(totalStars([c("game", "a")])).toBe(1);
    expect(totalStars([c("reflection", "d01"), c("dayplay", "d01")])).toBe(0);
  });
});

describe("fasting never affects rewards", () => {
  it("journal entries are not an input to the reward engine", () => {
    const data = normalise({
      completions: [c("lesson", "quran")],
      journal: [
        { id: "1", date: "2026-03-01", experience: "full" },
        { id: "2", date: "2026-03-02", experience: "full" },
        { id: "3", date: "2026-03-03", experience: "partial" },
      ],
      goals: [],
    });
    const none = normalise({ completions: [c("lesson", "quran")], journal: [], goals: [] });
    expect(totalStars(data.completions)).toBe(totalStars(none.completions));
    expect(unlockedBadgeIds(data.completions)).toEqual(unlockedBadgeIds(none.completions));
  });

  it("no badge rule mentions fasting", () => {
    for (const r of badges) {
      expect(JSON.stringify(r).toLowerCase()).not.toMatch(/fast|journal/);
    }
  });

  it("a non-fasting child can earn every badge", () => {
    const all: Completion[] = [
      ...lessons.map((l) => c("lesson", l.id)),
      ...missions.map((m) => c("kindness", m.id)),
      ...["a", "b", "c", "d", "e", "f"].map((s) => c("story", s)),
      ...["q1", "q2", "q3", "q4", "q5"].map((q) => c("quiz", q)),
      ...["quiz", "match-words", "missing-lantern", "mosque-puzzle", "sort-deeds", "memory-cards", "vocab-match"].map((g) => c("game", g)),
      c("goal", "goal-share"),
      ...Array.from({ length: 10 }, (_, i) => c("dhivehi", `day-${i + 1}`)),
      ...allDays.flatMap((d) => [c(d.learn.kind, d.learn.id), c("kindness", d.kindnessId), c("dayplay", d.id)]),
    ];
    expect(unlockedBadgeIds(all).sort()).toEqual(badges.map((b) => b.id).sort());
  });
});

describe("journey days", () => {
  it("a day is complete only when learn, kindness and play are done", () => {
    const d = allDays[2];
    const done = [c(d.learn.kind, d.learn.id), c("kindness", d.kindnessId)];
    expect(isDayComplete(done, d.id)).toBe(false);
    expect(dayPartsDone(done, d.id)).toEqual({ learn: true, kindness: true, play: false });
    expect(isDayComplete([...done, c("dayplay", d.id)], d.id)).toBe(true);
  });

  it("days can be completed in any order (missed days are never punished)", () => {
    const late = allDays[20];
    const comps = [c(late.learn.kind, late.learn.id), c("kindness", late.kindnessId), c("dayplay", late.id)];
    expect(completedDayIds(comps)).toEqual([late.id]);
  });

  it("badge rules work at thresholds", () => {
    const hero = badges.find((b) => b.id === "kindness-hero")!;
    expect(ruleMet(hero.rule, missions.slice(0, 4).map((m) => c("kindness", m.id)))).toBe(false);
    expect(ruleMet(hero.rule, missions.slice(0, 5).map((m) => c("kindness", m.id)))).toBe(true);
  });

});
