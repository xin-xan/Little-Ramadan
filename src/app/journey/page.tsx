"use client";

import Link from "next/link";
import { Hilmy } from "@/characters/Characters";
import { Illustration } from "@/components/art/Illustration";
import { PageHeader, ProgressBar } from "@/components/ui";
import { calendarStatus, dateOfDay, daysFor, formatDate, isDayOpen } from "@/storage/calendar";
import { dayPartsDone } from "@/storage/rewards";
import { useApp } from "@/state/AppState";
import { Icon } from "@/components/Icon";

export default function JourneyPage() {
  const { data } = useApp();
  const cal = data.settings.calendar;
  const status = calendarStatus(cal);
  const days = daysFor(cal);
  const parts = days.map((d) => Object.values(dayPartsDone(data.completions, d.id)).filter(Boolean).length);
  const complete = parts.filter((p) => p === 3).length;

  return (
    <div className="stack-lg">
      <PageHeader title="My Ramadan Journey" back={{ href: "/home/", label: "Home" }} />
      <div className="speech">
        <Hilmy size={72} />
        <div className="bubble">
          <span className="who">Hilmy</span>
          {status.mode === "during" && `Today is Day ${status.day} of ${cal.length}. You can visit any open day, in any order!`}
          {status.mode === "explore" && `Explore all ${cal.length} days in any order. Every day has a story or lesson, a kind deed and a game.`}
          {status.mode === "before" && `Ramadan starts in ${status.daysUntil} day${status.daysUntil === 1 ? "" : "s"}. Each day opens on its date.`}
          {status.mode === "after" && "Ramadan has finished. Every day is still open for you to enjoy."}
        </div>
      </div>
      <ProgressBar value={complete} max={days.length} label="Days completed" />
      <p className="small muted">Missed a day? That&apos;s okay! Days stay open, so you can come back any time.</p>
      {status.mode === "explore" && (
        <p className="notice small" style={{ margin: 0 }} data-testid="calendar-hint">
          <strong>For grown-ups:</strong> all days are open because no Ramadan start date is set. Set the start date in <strong>Parents → Calendar</strong> and a new day will open on each day of Ramadan.
        </p>
      )}
      <ol className="grid-3 wide-4" style={{ listStyle: "none", padding: 0, margin: 0 }} aria-label={`${days.length} journey days`}>
        {days.map((d, i) => {
          const open = isDayOpen(cal, d.day);
          const n = parts[i];
          const isToday = status.mode === "during" && status.day === d.day;
          const date = dateOfDay(cal, d.day);
          const stateText = !open ? `opens ${date ? formatDate(date) : "soon"}` : n === 3 ? "all done" : n > 0 ? `${n} of 3 done` : "ready";
          const inner = (
            <>
              <span style={{ fontSize: "0.8rem", fontWeight: 800 }}>{isToday ? "TODAY" : `Day ${d.day}`}</span>
              <Illustration name={d.illustration} size={44} />
              <span style={{ fontSize: "0.85rem", lineHeight: 1.2 }}>{d.theme}</span>
              <span className={`pill ${n === 3 ? "done" : ""}`} aria-hidden="true" style={{ fontSize: "0.7rem" }}>
                {!open ? <><Icon name="lock" size={12} /> Soon</> : n === 3 ? <><Icon name="check" size={14} strokeWidth={3} /> Done</> : n > 0 ? `${n}/3` : "Open"}
              </span>
            </>
          );
          return (
            <li key={d.id}>
              {open ? (
                <Link href={`/journey/${d.id}/`} className="tile" style={{ minHeight: 150, width: "100%", outline: isToday ? "4px solid var(--gold)" : undefined }} aria-label={`Day ${d.day}: ${d.theme}, ${stateText}${isToday ? ", today" : ""}`}>
                  {inner}
                </Link>
              ) : (
                <div className="tile" style={{ minHeight: 150, opacity: 0.6, boxShadow: "none" }} aria-label={`Day ${d.day}: ${d.theme}, ${stateText}`} role="group">
                  {inner}
                </div>
              )}
            </li>
          );
        })}
      </ol>
      {days[days.length - 1].isFinal && (
        <Link href="/rewards/eid/" className="btn gold block">
          <Icon name="moon" /> Eid celebration
        </Link>
      )}
    </div>
  );
}
