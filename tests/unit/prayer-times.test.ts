/** Maldives prayer timetable: decoding, leap-year layout, island offsets and prayer windows. */
import { describe, expect, it } from "vitest";
import { dayIndex, DEFAULT_ISLAND, formatTime, islandById, loadTimetable, stateOf, timesFor, windowOf } from "@/prayer/times";

describe("prayer times", () => {
  it("lays days out as in a leap year", () => {
    expect(dayIndex(new Date(2027, 0, 1))).toBe(0);
    expect(dayIndex(new Date(2028, 1, 29))).toBe(59);
    expect(dayIndex(new Date(2027, 2, 1))).toBe(60); // non-leap years skip Feb 29
    expect(dayIndex(new Date(2027, 11, 31))).toBe(365);
  });

  it("gives Malé's times in order for every day of the year", async () => {
    const tt = await loadTimetable();
    expect(islandById(tt, DEFAULT_ISLAND)[2]).toBe("މާލެ");
    const jan1 = timesFor(tt, DEFAULT_ISLAND, new Date(2027, 0, 1));
    expect(formatTime(jan1.fajr)).toBe("4:54 am");
    expect(formatTime(jan1.maghrib)).toBe("6:08 pm");
    for (let m = 0; m < 12; m++)
      for (let d = 1; d <= 28; d++) {
        const t = timesFor(tt, DEFAULT_ISLAND, new Date(2027, m, d));
        expect(t.fajr < t.sunrise && t.sunrise < t.dhuhr && t.dhuhr < t.asr && t.asr < t.maghrib && t.maghrib < t.isha).toBe(true);
      }
  });

  it("has sensible times for every island (no typos left in the timetable)", async () => {
    const tt = await loadTimetable();
    for (const [id] of tt.islands)
      for (const day of [0, 59, 120, 200, 300, 365]) {
        const d = new Date(2028, 0, 1);
        d.setDate(d.getDate() + day);
        const t = timesFor(tt, id, d);
        expect(t.fajr).toBeGreaterThan(4 * 60);
        expect(t.fajr).toBeLessThan(5 * 60 + 30);
        expect(t.sunrise - t.fajr).toBeGreaterThan(60);
        expect(t.sunrise - t.fajr).toBeLessThan(90);
        expect(t.isha).toBeLessThan(20 * 60);
      }
  });

  it("works out whether a prayer is upcoming, now or passed", async () => {
    const tt = await loadTimetable();
    const t = timesFor(tt, DEFAULT_ISLAND, new Date(2027, 0, 1));
    expect(windowOf(t, "dhuhr")).toEqual([t.dhuhr, t.asr]);
    expect(stateOf(t, "dhuhr", t.dhuhr - 1)).toBe("upcoming");
    expect(stateOf(t, "dhuhr", t.dhuhr)).toBe("now");
    expect(stateOf(t, "dhuhr", t.asr)).toBe("passed");
    expect(stateOf(t, "isha", 23 * 60 + 59)).toBe("now");
  });
});
