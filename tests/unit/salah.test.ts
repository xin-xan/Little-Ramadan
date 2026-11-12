/** Private Salah log: validated, ordered, pruned after 60 days; it never feeds rewards. */
import { describe, expect, it } from "vitest";
import { normalise, validateSalahLog, type Completion } from "@/storage/schema";
import { countKind, formatStars, starsLabel, totalStars, unlockedBadgeIds } from "@/storage/rewards";

describe("Salah log", () => {
  const today = new Date("2027-03-20T12:00:00");
  it("keeps valid prayers in order and drops anything unknown", () => {
    expect(validateSalahLog({ "2027-03-20": ["isha", "fajr", "nap", "fajr"], "not-a-date": ["fajr"], "2027-03-19": "fajr" }, today)).toEqual({ "2027-03-20": ["fajr", "isha"] });
  });
  it("forgets days older than 60 days and empty days", () => {
    expect(validateSalahLog({ "2027-01-01": ["fajr"], "2027-03-01": [], "2027-03-02": ["asr"] }, today)).toEqual({ "2027-03-02": ["asr"] });
  });
  it("loads as empty from older saved data", () => {
    expect(normalise({ completions: [], journal: [], goals: [] }).salah).toEqual({});
  });
  it("rewards prayers: 1 star on time, ½ star after its time; badges never depend on them", () => {
    const c = (kind: Completion["kind"], id: string): Completion => ({ id: `${kind}:${id}`, kind, contentId: id, completedAt: "2027-03-20T10:00:00Z" });
    const done = [c("salah", "2027-03-20.fajr"), c("salah-late", "2027-03-20.asr"), c("fast", "2027-03-20")];
    expect(totalStars(done)).toBe(1 + 0.5 + 2);
    expect(formatStars(totalStars(done))).toBe("3½");
    expect(starsLabel(0.5)).toBe("half a star");
    expect(countKind(done, "any")).toBe(0); // prayers and fasts never count towards badges
    expect(unlockedBadgeIds(done)).toEqual([]);
  });
});
