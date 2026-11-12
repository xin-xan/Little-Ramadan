"use client";

import Link from "next/link";
import { JOURNAL_OPTIONS } from "@/content/firstFast";
import { Illustration } from "@/components/art/Illustration";
import { localISODate } from "@/storage/calendar";
import { PRAYERS, type JournalExperience, type Prayer } from "@/storage/schema";
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
 * Home: today's Salah (and, when a parent has switched the journal on, today's fasting choice).
 * Private and gentle: no stars, scores, counts, streaks or "missed" marks, and every day starts fresh.
 */
export function SalahFastingCard() {
  const { data, togglePrayer, addJournalEntry, deleteJournalEntry } = useApp();
  const showSalah = data.settings.salahTracker;
  const showFasting = data.settings.journalEnabled;
  if (!showSalah && !showFasting) return null;
  const today = localISODate();
  const prayed = data.salah[today] ?? [];
  const todays = data.journal.filter((j) => j.date === today).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const fastChoice = todays.at(-1)?.experience;

  const chooseFasting = async (experience: JournalExperience) => {
    if (experience === fastChoice) return;
    // Today's quick choice replaces the earlier quick choice (entries with a written note are kept).
    for (const j of todays) if (!j.note) await deleteJournalEntry(j.id);
    await addJournalEntry({ experience, date: today });
  };

  return (
    <section className="card tracker stack" aria-labelledby="tracker-title">
      <h2 id="tracker-title" className="row" style={{ gap: 10, margin: 0 }}>
        <Illustration name="prayer-mat" size={40} /> {showSalah && showFasting ? "My Salah & fasting today" : showSalah ? "My Salah today" : "My fasting today"}
      </h2>

      {showSalah && (
        <>
          <p className="small" style={{ margin: 0 }}>
            Try to pray each prayer on time. Ask a grown-up when it is time to pray. Practising now makes it easier when you grow up. Tap a prayer after you pray it. There are no scores here, and every day starts fresh.
          </p>
          <div className="prayer-row" role="group" aria-label="Today's prayers">
            {PRAYERS.map((p) => {
              const on = prayed.includes(p);
              return (
                <button key={p} type="button" className={`prayer${on ? " on" : ""}`} aria-pressed={on} onClick={() => togglePrayer(today, p)} data-sound={on ? "tap" : "toggle"}>
                  <span className="prayer-sky">
                    <PrayerSky prayer={p} />
                    {on && (
                      <span className="prayer-tick" aria-hidden="true">
                        <Icon name="check" size={14} strokeWidth={3.2} />
                      </span>
                    )}
                  </span>
                  <span className="prayer-name">{PRAYER_NAMES[p]}</span>
                </button>
              );
            })}
          </div>
          <Link href="/first-fast/#ff-growing-up" className="small tracker-link">
            Why do Muslims pray and fast?
          </Link>
          {prayed.length > 0 && (
            <p className="small tracker-note" role="status" style={{ margin: 0 }}>
              Lovely! Every prayer is special.
            </p>
          )}
        </>
      )}

      {showFasting && (
        <div className="stack" style={{ gap: 8 }}>
          <p style={{ margin: 0, fontWeight: 700 }}>Fasting today?</p>
          <p className="small" style={{ margin: 0 }}>
            If you feel well and your family says it is okay, you could try fasting, even for part of the day. Every little try is special, and you can stop whenever you need to.
          </p>
          <div className="fast-row" role="radiogroup" aria-label="Fasting today">
            {JOURNAL_OPTIONS.filter((o) => o.value !== "memory").map((o) => (
              <button key={o.value} type="button" role="radio" aria-checked={fastChoice === o.value} className={`fast-choice${fastChoice === o.value ? " on" : ""}`} onClick={() => void chooseFasting(o.value)}>
                <Illustration name={o.illustration} size={32} />
                <span>{o.label}</span>
              </button>
            ))}
          </div>
          {fastChoice && (
            <p className="small tracker-note" role="status" style={{ margin: 0 }}>
              Saved in your private journal. Every Ramadan day is special, whatever you did today!
            </p>
          )}
          <HealthNotice compact />
        </div>
      )}
    </section>
  );
}
