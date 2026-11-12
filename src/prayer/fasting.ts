/**
 * When each fasting choice makes sense, from the island's prayer times: a fast runs from Fajr
 * to Maghrib (Iftar). A full fast can only be recorded once Iftar time has come, so children
 * can't mark a fast as done before it has even started.
 */
import type { JournalExperience } from "@/storage/schema";
import type { DayTimes } from "./times";

/** before = Suhoor time (before Fajr); during = fasting hours; after = from Iftar (Maghrib). */
export type FastPhase = "before" | "during" | "after";

export function fastPhase(t: DayTimes, minutesNow: number): FastPhase {
  return minutesNow < t.fajr ? "before" : minutesNow < t.maghrib ? "during" : "after";
}

/** The fasting choices that can be recorded right now (the journal's "memory" is always allowed). */
export const FAST_CHOICES: Record<FastPhase, JournalExperience[]> = {
  before: ["fasting", "not_fast"],
  during: ["fasting", "partial", "not_fast"],
  after: ["practice", "partial", "full", "not_fast"],
};

export const canRecord = (phase: FastPhase, e: JournalExperience) => e === "memory" || FAST_CHOICES[phase].includes(e);
