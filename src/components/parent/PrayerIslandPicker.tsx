"use client";

import { useEffect, useState } from "react";
import { PRAYERS } from "@/storage/schema";
import { formatTime, islandById, loadTimetable, timesFor, type Timetable } from "@/prayer/times";
import { useApp } from "@/state/AppState";

const NAMES = { fajr: "Fajr", sunrise: "Sunrise", dhuhr: "Dhuhr", asr: "Asr", maghrib: "Maghrib", isha: "Isha" } as const;

/** Parent Zone: choose the island for prayer times (Maldives timetable) and see today's times. */
export function PrayerIslandPicker() {
  const { data, updateSettings } = useApp();
  const [tt, setTt] = useState<Timetable | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    loadTimetable().then(setTt, () => setError(true));
  }, []);
  if (error) return <p className="notice warn">The prayer timetable could not be loaded. Please try again.</p>;
  if (!tt) return <p className="small muted">Loading prayer times…</p>;
  const current = islandById(tt, data.settings.prayerIsland);
  const atoll = current[1];
  const atolls = [...new Set(tt.islands.map((i) => i[1]))];
  const islands = tt.islands.filter((i) => i[1] === atoll);
  const today = timesFor(tt, current[0], new Date());
  return (
    <div className="stack" style={{ gap: 10 }}>
      <h3 style={{ margin: 0 }}>Prayer times: your island</h3>
      <div className="row wrap">
        <label className="stack" style={{ gap: 4, flex: 1, minWidth: 150 }}>
          <span className="small" style={{ fontWeight: 700 }}>Atoll</span>
          <select
            className="input"
            aria-label="Atoll"
            value={atoll}
            onChange={(e) => {
              const first = tt.islands.find((i) => i[1] === e.target.value);
              if (first) void updateSettings({ prayerIsland: first[0] });
            }}
          >
            {atolls.map((a) => (
              <option key={a} value={a}>
                {tt.atolls[a] ?? a} ({a})
              </option>
            ))}
          </select>
        </label>
        <label className="stack" style={{ gap: 4, flex: 1, minWidth: 150 }}>
          <span className="small" style={{ fontWeight: 700 }}>Island</span>
          <select className="input thaana-select" aria-label="Island" value={current[0]} onChange={(e) => void updateSettings({ prayerIsland: Number(e.target.value) })}>
            {islands.map((i) => (
              <option key={i[0]} value={i[0]}>
                {i[2]}
              </option>
            ))}
          </select>
        </label>
      </div>
      <table className="salah-week" aria-label="Today's prayer times">
        <tbody>
          {(["fajr", "sunrise", ...PRAYERS.slice(1)] as const).map((k) => (
            <tr key={k}>
              <th scope="row">{NAMES[k]}</th>
              <td style={{ textAlign: "right" }}>{formatTime(today[k])}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="small muted" style={{ margin: 0 }}>
        Times come from the Maldives island prayer timetable (Ministry of Islamic Affairs format) bundled in the app, so they work offline. They have not yet been checked against the Ministry&apos;s current publication: please follow official announcements and your local mosque if they differ.
      </p>
    </div>
  );
}
