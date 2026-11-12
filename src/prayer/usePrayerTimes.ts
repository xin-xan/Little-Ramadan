"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/state/AppState";
import { loadTimetable, minutesOf, timesFor, islandById, type DayTimes, type Timetable } from "./times";

/** Today's prayer times for the parent's chosen island, plus the current minute (updates every 30 s). */
export function usePrayerTimes() {
  const { data } = useApp();
  const [tt, setTt] = useState<Timetable | null>(null);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    let alive = true;
    loadTimetable().then((t) => alive && setTt(t)).catch(() => undefined);
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, []);
  const island = tt ? islandById(tt, data.settings.prayerIsland) : null;
  const times: DayTimes | null = tt ? timesFor(tt, data.settings.prayerIsland, now) : null;
  return { tt, times, now, minutesNow: minutesOf(now), island };
}
