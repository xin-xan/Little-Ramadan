/**
 * Parent-configured Ramadan calendar. The app never claims an official date:
 * the current day is only shown when a parent has entered a start date.
 */
import { journeyDays, type PlannedDay } from "@/content/days";
import type { CalendarSettings } from "./schema";

/** Local calendar date as YYYY-MM-DD (not UTC). */
export function localISODate(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseLocal(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Whole days between two local dates (b - a). DST-safe. */
export function daysBetween(aIso: string, bIso: string): number {
  const a = parseLocal(aIso);
  const b = parseLocal(bIso);
  return Math.round((Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) - Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) / 86_400_000);
}

export function addDays(iso: string, n: number): string {
  const d = parseLocal(iso);
  d.setDate(d.getDate() + n);
  return localISODate(d);
}

export type CalendarStatus =
  | { mode: "explore" } // no start date configured
  | { mode: "before"; daysUntil: number }
  | { mode: "during"; day: number }
  | { mode: "after" };

export function calendarStatus(cal: CalendarSettings, today: string = localISODate()): CalendarStatus {
  if (!cal.startDate) return { mode: "explore" };
  const diff = daysBetween(cal.startDate, today);
  if (diff < 0) return { mode: "before", daysUntil: -diff };
  if (diff >= cal.length) return { mode: "after" };
  return { mode: "during", day: diff + 1 };
}

/** Date of a journey day, if a calendar is configured. */
export function dateOfDay(cal: CalendarSettings, day: number): string | null {
  return cal.startDate ? addDays(cal.startDate, day - 1) : null;
}

/**
 * Whether a day is open. Missed days always stay open; nothing ever re-locks.
 * Future days open on their date unless the parent chose "open all days".
 * Without a calendar ("Explore Ramadan"), every day is open.
 */
export function isDayOpen(cal: CalendarSettings, day: number, today: string = localISODate()): boolean {
  const s = calendarStatus(cal, today);
  if (s.mode === "explore" || s.mode === "after" || cal.openAllDays) return true;
  if (s.mode === "before") return false;
  return day <= s.day;
}

export function daysFor(cal: CalendarSettings): PlannedDay[] {
  return journeyDays(cal.length);
}

export function formatDate(iso: string): string {
  return parseLocal(iso).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}
