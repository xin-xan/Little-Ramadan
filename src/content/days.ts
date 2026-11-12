import type { JourneyDay } from "./types";
import data from "./data/days.json";

/**
 * The 30-day content plan (CLAUDE.md §7). Day IDs are "d01".."d30" and are
 * stable. For a 29-day Ramadan the final-day content (d30, Eid celebration)
 * becomes day 29 and the "My Achievements" review is folded into it — see
 * journeyDays().
 */
const plan = data as Omit<JourneyDay, "day">[];

export interface PlannedDay extends JourneyDay {
  /** Stable content ID, e.g. "d07". */
  id: string;
  /** True for the last day of the configured month — shows the Eid & achievements celebration. */
  isFinal: boolean;
}

export const allDays: PlannedDay[] = plan.map((d, i) => ({ ...d, day: i + 1, id: `d${String(i + 1).padStart(2, "0")}`, isFinal: i === plan.length - 1 }));

/** Days for a 29- or 30-day Ramadan. Never assumes 30. */
export function journeyDays(length: 29 | 30): PlannedDay[] {
  if (length === 30) return allDays;
  const first28 = allDays.slice(0, 28);
  const eid = allDays[29];
  return [...first28, { ...eid, day: 29, isFinal: true }];
}

export const dayById = (id: string) => allDays.find((d) => d.id === id);
