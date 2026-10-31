import { describe, expect, it } from "vitest";
import { journeyDays } from "@/content/days";
import { addDays, calendarStatus, dateOfDay, daysBetween, isDayOpen } from "@/storage/calendar";
import type { CalendarSettings } from "@/storage/schema";

const cal = (startDate: string | null, length: 29 | 30 = 30, openAllDays = false): CalendarSettings => ({ startDate, length, openAllDays });

describe("29/30-day calendar", () => {
  it("supports 30 days with Eid on day 30", () => {
    const d = journeyDays(30);
    expect(d).toHaveLength(30);
    expect(d[29].theme).toBe("Eid Celebration");
    expect(d.filter((x) => x.isFinal).map((x) => x.day)).toEqual([30]);
  });

  it("supports 29 days: the final day becomes the Eid celebration", () => {
    const d = journeyDays(29);
    expect(d).toHaveLength(29);
    expect(d[28].theme).toBe("Eid Celebration");
    expect(d[28].day).toBe(29);
    expect(d[28].isFinal).toBe(true);
    expect(d.map((x) => x.day)).toEqual(Array.from({ length: 29 }, (_, i) => i + 1));
  });

  it("explore mode (no dates) opens every day and never invents a current day", () => {
    expect(calendarStatus(cal(null))).toEqual({ mode: "explore" });
    expect(isDayOpen(cal(null), 30)).toBe(true);
  });

  it("computes the current day from the parent's start date", () => {
    expect(calendarStatus(cal("2026-02-18"), "2026-02-18")).toEqual({ mode: "during", day: 1 });
    expect(calendarStatus(cal("2026-02-18"), "2026-03-01")).toEqual({ mode: "during", day: 12 });
    expect(calendarStatus(cal("2026-02-18"), "2026-02-15")).toEqual({ mode: "before", daysUntil: 3 });
    expect(calendarStatus(cal("2026-02-18", 29), "2026-03-19")).toEqual({ mode: "after" });
    expect(calendarStatus(cal("2026-02-18", 30), "2026-03-19")).toEqual({ mode: "during", day: 30 });
  });

  it("missed days stay open; future days open on their date unless the parent opens all", () => {
    const c = cal("2026-02-18");
    const today = "2026-02-25"; // day 8
    expect(isDayOpen(c, 1, today)).toBe(true);
    expect(isDayOpen(c, 8, today)).toBe(true);
    expect(isDayOpen(c, 9, today)).toBe(false);
    expect(isDayOpen({ ...c, openAllDays: true }, 30, today)).toBe(true);
    expect(isDayOpen(c, 30, "2026-04-01")).toBe(true); // after Ramadan everything is open
  });

  it("date arithmetic is safe across month boundaries", () => {
    expect(addDays("2026-02-27", 3)).toBe("2026-03-02");
    expect(daysBetween("2026-02-27", "2026-03-02")).toBe(3);
    expect(dateOfDay(cal("2026-02-18"), 30)).toBe("2026-03-19");
  });
});
