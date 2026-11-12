/** Private Salah log: validated, ordered, pruned after 60 days; it never feeds rewards. */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { normalise, validateSalahLog } from "@/storage/schema";

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
  it("is never used by rewards, badges or stars", () => {
    const rewards = readFileSync(join(__dirname, "../../src/storage/rewards.ts"), "utf8");
    expect(rewards).not.toMatch(/salah|prayer/i);
  });
});
