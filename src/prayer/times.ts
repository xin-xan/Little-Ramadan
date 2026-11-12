/**
 * Maldives prayer times from the bundled island timetable (see docs/prayer-times.md).
 * The timetable is a perpetual one: the same times every year, by island category and day.
 * It is loaded on demand so it never slows down the first screen.
 */
import type { Prayer } from "@/storage/schema";

export interface Timetable {
  source: string;
  atolls: Record<string, string>;
  /** [islandId, atoll (Thaana), island (Thaana), categoryId, minuteOffset] */
  islands: [number, string, string, number, number][];
  /** category -> 6 columns (fajr, sunrise, dhuhr, asr, maghrib, isha) as [first value, delta string] */
  categories: Record<string, [number, string][]>;
}

export interface DayTimes {
  fajr: number;
  sunrise: number;
  dhuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
}

/** Malé (Kaafu). */
export const DEFAULT_ISLAND = 102;

let cache: Promise<Timetable> | null = null;
export function loadTimetable(): Promise<Timetable> {
  cache ??= import("./timetable.json").then((m) => m.default as unknown as Timetable);
  return cache;
}

const decoded = new Map<string, number[][]>();
function columns(tt: Timetable, category: number): number[][] {
  const key = String(category);
  let cols = decoded.get(key);
  if (!cols) {
    cols = tt.categories[key].map(([first, deltas]) => {
      const out = [first];
      for (const ch of deltas) out.push(out[out.length - 1] + ch.charCodeAt(0) - 77);
      return out;
    });
    decoded.set(key, cols);
  }
  return cols;
}

/** Row in the timetable: days are laid out as in a leap year (Feb 29 = row 59). */
export function dayIndex(d: Date): number {
  const leapStarts = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335];
  return leapStarts[d.getMonth()] + d.getDate() - 1;
}

export function islandById(tt: Timetable, id: number) {
  return tt.islands.find((i) => i[0] === id) ?? tt.islands.find((i) => i[0] === DEFAULT_ISLAND)!;
}

export function timesFor(tt: Timetable, islandId: number, date: Date): DayTimes {
  const [, , , category, offset] = islandById(tt, islandId);
  const cols = columns(tt, category);
  const i = dayIndex(date);
  const v = (k: number) => cols[k][i] + offset;
  return { fajr: v(0), sunrise: v(1), dhuhr: v(2), asr: v(3), maghrib: v(4), isha: v(5) };
}

export const formatTime = (m: number) => {
  const h = Math.floor(m / 60);
  const mm = String(m % 60).padStart(2, "0");
  return `${h % 12 === 0 ? 12 : h % 12}:${mm} ${h < 12 ? "am" : "pm"}`;
};

/** Each prayer's time: from its start until the next prayer (Fajr ends at sunrise, Isha at midnight). */
export function windowOf(t: DayTimes, p: Prayer): [number, number] {
  switch (p) {
    case "fajr":
      return [t.fajr, t.sunrise];
    case "dhuhr":
      return [t.dhuhr, t.asr];
    case "asr":
      return [t.asr, t.maghrib];
    case "maghrib":
      return [t.maghrib, t.isha];
    case "isha":
      return [t.isha, 24 * 60];
  }
}

export type PrayerState = "upcoming" | "now" | "passed";
export function stateOf(t: DayTimes, p: Prayer, minutesNow: number): PrayerState {
  const [start, end] = windowOf(t, p);
  return minutesNow < start ? "upcoming" : minutesNow < end ? "now" : "passed";
}

export const minutesOf = (d: Date) => d.getHours() * 60 + d.getMinutes();
