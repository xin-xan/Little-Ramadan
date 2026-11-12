"use client";

import Link from "next/link";
import { useState } from "react";
import { JOURNAL_OPTIONS } from "@/content/firstFast";
import { Illustration } from "@/components/art/Illustration";
import { localISODate } from "@/storage/calendar";
import { FAST_EXPERIENCES, PRAYERS, type JournalExperience, type Prayer } from "@/storage/schema";
import { STAR_VALUES } from "@/content/copy";
import { formatTime, stateOf, windowOf, type PrayerState } from "@/prayer/times";
import { usePrayerTimes } from "@/prayer/usePrayerTimes";
import { FAST_CHOICES, fastPhase } from "@/prayer/fasting";
import { useApp } from "@/state/AppState";
import { Icon } from "../Icon";
import { HealthNotice } from "../ui";

export const PRAYER_NAMES: Record<Prayer, string> = { fajr: "Fajr", dhuhr: "Dhuhr", asr: "Asr", maghrib: "Maghrib", isha: "Isha" };

/** A little sky for each prayer time: dawn, midday, afternoon, sunset and night. */
function PrayerSky({ prayer }: { prayer: Prayer }) {
  const sky = { fajr: ["#3d4a7a", "#f4b783"], dhuhr: ["#6ec3f0", "#bfe6fb"], asr: ["#7cc2e6", "#f6d9a0"], maghrib: ["#e6875b", "#f7c46b"], isha: ["#16213f", "#2b3a68"] }[prayer];
  const sun = { fajr: { cy: 30, r: 6, c: "#ffd27a" }, dhuhr: { cy: 11, r: 7, c: "#ffd84d" }, asr: { cy: 19, r: 6.5, c: "#ffc94d" }, maghrib: { cy: 29, r: 7, c: "#ff9f43" } } as const;
  const id = `sky-${prayer}`;
  return (
    <svg viewBox="0 0 40 36" width="40" height="36" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky[0]} />
          <stop offset="1" stopColor={sky[1]} />
        </linearGradient>
        <clipPath id={`${id}-c`}>
          <rect x="0" y="0" width="40" height="36" rx="10" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-c)`}>
        <rect width="40" height="36" fill={`url(#${id})`} />
        {prayer === "isha" ? (
          <>
            <path d="M24 8a9 9 0 1 0 6 14 7 7 0 1 1-6-14Z" fill="#ffe7a3" />
            <circle cx="10" cy="9" r="1.2" fill="#fff" />
            <circle cx="15" cy="17" r="0.9" fill="#fff" />
          </>
        ) : (
          <circle cx={prayer === "asr" ? 26 : prayer === "maghrib" ? 20 : prayer === "fajr" ? 20 : 20} cy={sun[prayer].cy} r={sun[prayer].r} fill={sun[prayer].c} />
        )}
        <path d="M0 30c8-3 14-3 20 0s12 3 20 0v6H0Z" fill={prayer === "isha" ? "#0f1830" : "#2f7d6b"} opacity="0.9" />
      </g>
    </svg>
  );
}

/**
 * Home: today's Salah with the island's prayer times (1 star on time, ½ star after its time) and,
 * when a parent has switched the journal on, today's fast (owner decisions, November 2026).
 * Reminders are gentle: no shame, health first, and it is never "too late" to pray.
 */
export function SalahFastingCard() {
  const { data, togglePrayer, addJournalEntry, deleteJournalEntry } = useApp();
  const { times, minutesNow, now } = usePrayerTimes();
  const [hint, setHint] = useState<string | null>(null);
  const showSalah = data.settings.salahTracker;
  const showFasting = data.settings.journalEnabled;
  if (!showSalah && !showFasting) return null;
  const today = localISODate(now);
  const prayed = data.salah[today] ?? [];
  const late = new Set(PRAYERS.filter((p) => data.completions.some((c) => c.id === `salah-late:${today}.${p}`)));
  const state = (p: Prayer): PrayerState | null => (times ? stateOf(times, p, minutesNow) : null);
  const current = PRAYERS.find((p) => state(p) === "now");
  const notPrayed = PRAYERS.filter((p) => state(p) === "passed" && !prayed.includes(p));
  const todays = data.journal.filter((j) => j.date === today).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const fastChoice = todays.at(-1)?.experience;
  const phase = times ? fastPhase(times, minutesNow) : null;

  const tapPrayer = async (p: Prayer) => {
    setHint(null);
    const st = state(p);
    if (!times || !st) return;
    if (prayed.includes(p)) return togglePrayer(today, p);
    if (st === "upcoming") return setHint(`It's not time for ${PRAYER_NAMES[p]} yet. It starts at ${formatTime(windowOf(times, p)[0])}.`);
    const isLate = st === "passed";
    await togglePrayer(today, p, {
      late: isLate,
      message: isLate ? `You prayed ${PRAYER_NAMES[p]}. Well done for praying! Next time, try to pray when its time begins for a full star.` : `MashaAllah! You prayed ${PRAYER_NAMES[p]} on time.`,
    });
  };

  const chooseFasting = async (experience: JournalExperience) => {
    if (experience === fastChoice) return;
    const old = todays.filter((j) => !j.note);
    // Add the new choice first, then remove the earlier quick choice (entries with a note are kept).
    await addJournalEntry({ experience, date: today });
    for (const j of old) await deleteJournalEntry(j.id);
  };

  return (
    <section className="card tracker stack" aria-labelledby="tracker-title">
      <h2 id="tracker-title" className="row" style={{ gap: 10, margin: 0 }}>
        <Illustration name="prayer-mat" size={40} /> {showSalah && showFasting ? "My Salah & fasting today" : showSalah ? "My Salah today" : "My fasting today"}
      </h2>

      {showSalah && (
        <>
          <p className="small" style={{ margin: 0 }}>
            Pray each prayer on time and tap it: <strong>1 star</strong> on time, <strong>½ star</strong> if you pray after its time. Ask a grown-up when it is time to pray.
          </p>
          {!times && <p className="small muted" style={{ margin: 0 }}>Loading today&apos;s prayer times…</p>}
          <div className="prayer-row" role="group" aria-label="Today's prayers">
            {PRAYERS.map((p) => {
              const on = prayed.includes(p);
              const st = state(p);
              const cls = on ? " on" : st === "now" ? " now" : st === "passed" ? " passed" : st === "upcoming" ? " upcoming" : "";
              const status = on ? (late.has(p) ? "prayed, half a star" : "prayed on time") : st === "now" ? "time to pray now" : st === "passed" ? "not prayed yet, time has passed" : st === "upcoming" ? "later today" : "";
              return (
                <button key={p} type="button" className={`prayer${cls}`} aria-pressed={on} aria-label={`${PRAYER_NAMES[p]}${times ? `, ${formatTime(windowOf(times, p)[0])}` : ""}${status ? `, ${status}` : ""}`} onClick={() => void tapPrayer(p)} disabled={!times} data-sound={on ? "tap" : "toggle"}>
                  <span className="prayer-sky">
                    <PrayerSky prayer={p} />
                    {on && (
                      <span className={`prayer-tick${late.has(p) ? " half" : ""}`} aria-hidden="true">
                        {late.has(p) ? "½" : <Icon name="check" size={14} strokeWidth={3.2} />}
                      </span>
                    )}
                  </span>
                  <span className="prayer-name">{PRAYER_NAMES[p]}</span>
                  <span className="prayer-time" aria-hidden="true">
                    {on ? (late.has(p) ? "½ star" : "1 star") : st === "now" ? "Now!" : st === "passed" ? "Pray now" : times ? formatTime(windowOf(times, p)[0]).replace(" ", "") : ""}
                  </span>
                </button>
              );
            })}
          </div>
          {hint && (
            <p className="small tracker-note" role="status" style={{ margin: 0 }}>
              {hint}
            </p>
          )}
          {times && current && !prayed.includes(current) && (
            <p className="tracker-now" role="status" style={{ margin: 0 }}>
              It&apos;s {PRAYER_NAMES[current]} time now, until {formatTime(windowOf(times, current)[1] % (24 * 60))}. Pray on time and tap it for a full star!
            </p>
          )}
          {times && notPrayed.length > 0 && (
            <div className="tracker-reminder" role="status" data-testid="prayer-reminder">
              <strong>
                Did you pray {notPrayed.map((p) => PRAYER_NAMES[p]).join(" and ")}?
              </strong>{" "}
              Salah is how Muslims talk to Allah and thank Him, five times every day. Its time has passed, but it is not too late: pray now and tap it for ½ star. Tomorrow, try to pray each prayer on time. You can do it!
            </div>
          )}
          {prayed.length === PRAYERS.length && (
            <p className="small tracker-note" role="status" style={{ margin: 0 }}>
              MashaAllah! You prayed all five prayers today!
            </p>
          )}
          <Link href="/first-fast/#ff-growing-up" className="small tracker-link">
            Why do Muslims pray and fast?
          </Link>
        </>
      )}

      {showFasting && (
        <div className="stack" style={{ gap: 8 }}>
          <p style={{ margin: 0, fontWeight: 700 }}>{phase === "after" ? "How did your fast go today?" : "Fasting today?"}</p>
          {!times || !phase ? (
            <p className="small muted" style={{ margin: 0 }}>Loading today&apos;s fasting times…</p>
          ) : (
            <>
              <p className="small" style={{ margin: 0 }} data-testid="fast-phase">
                {phase === "before" && (
                  <>
                    <strong>Suhoor time!</strong> The fast begins at Fajr ({formatTime(times.fajr)}) and ends at Iftar, at Maghrib ({formatTime(times.maghrib)}). If you feel well and your family says it is okay, you could fast today, even for part of the day.
                  </>
                )}
                {phase === "during" && (
                  <>
                    <strong>Fasting time.</strong> Iftar is at {formatTime(times.maghrib)}. {fastChoice === "fasting" ? "Keep going if you feel well! After Iftar, come back and tell us how your fast went." : "If you stop early, that's okay: tap \u201cpart of the day\u201d."}
                  </>
                )}
                {phase === "after" && (
                  <>
                    <strong>Iftar time!</strong> Every fast earns <strong>{STAR_VALUES.fast} stars</strong>: practising, part of the day or a whole day.
                  </>
                )}
              </p>
              <div className="fast-row" role="radiogroup" aria-label="Fasting today">
                {FAST_CHOICES[phase].map((value) => {
                  const o = JOURNAL_OPTIONS.find((x) => x.value === value);
                  if (!o) return null;
                  const isFast = (FAST_EXPERIENCES as readonly string[]).includes(o.value);
                  return (
                    <button key={o.value} type="button" role="radio" aria-checked={fastChoice === o.value} className={`fast-choice${fastChoice === o.value ? " on" : ""}`} onClick={() => void chooseFasting(o.value)}>
                      <Illustration name={o.illustration} size={32} />
                      <span>
                        {o.label}
                        {isFast && <span className="fast-stars"> · {STAR_VALUES.fast} stars</span>}
                      </span>
                    </button>
                  );
                })}
              </div>
              {phase === "during" && (
                <p className="small muted" style={{ margin: 0 }}>
                  You can mark a whole day&apos;s fast after Iftar, at {formatTime(times.maghrib)}.
                </p>
              )}
              {fastChoice === "fasting" && (
                <p className="small tracker-note" role="status" style={{ margin: 0 }}>
                  {phase === "after" ? "Iftar time! Tap how your fast went to get your stars." : "You're fasting today. Your health comes first: stop and tell a grown-up if you feel unwell."}
                </p>
              )}
              {fastChoice && (FAST_EXPERIENCES as readonly string[]).includes(fastChoice) && (
                <p className="small tracker-note" role="status" style={{ margin: 0 }}>
                  Well done for fasting today! Saved in your private journal.
                </p>
              )}
              {fastChoice === "not_fast" && (
                <div className="tracker-reminder" role="status" data-testid="fast-reminder">
                  <strong>That&apos;s okay!</strong> Fasting in Ramadan is one of the five pillars of Islam, and when Muslims grow up it becomes a duty for everyone who is healthy. If you feel well and your family agrees, maybe try fasting for part of the day tomorrow. Your health always comes first.
                </div>
              )}
            </>
          )}
          <HealthNotice compact />
        </div>
      )}
    </section>
  );
}
