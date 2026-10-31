"use client";

import Link from "next/link";
import { useState } from "react";
import { Illustration } from "@/components/art/Illustration";
import { HealthNotice, PageHeader, SpeechBubble } from "@/components/ui";
import { firstFastPages, JOURNAL_OPTIONS, JOURNAL_SAVED_MESSAGE } from "@/content/firstFast";
import { formatDate, localISODate } from "@/storage/calendar";
import type { JournalExperience } from "@/storage/schema";
import { useApp } from "@/state/AppState";

/**
 * My First Fast — educational pages plus an OPTIONAL private journal
 * (off until a parent enables it). The journal never gives rewards,
 * streaks, timers or counts of hours.
 */
export default function FirstFastPage() {
  const { data, addJournalEntry } = useApp();
  const [choice, setChoice] = useState<JournalExperience | null>(null);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
  const enabled = data.settings.journalEnabled;
  const entries = [...data.journal].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="stack-lg">
      <PageHeader title="My First Fast" back={{ href: "/home/", label: "Home" }} />
      <HealthNotice />
      <SpeechBubble who="amina">Let&apos;s learn about fasting together. You don&apos;t have to fast to enjoy Ramadan — everyone can join in!</SpeechBubble>

      {firstFastPages.map((p) => (
        <section key={p.id} className="card stack" aria-labelledby={`ff-${p.id}`}>
          <div className="row">
            <Illustration name={p.illustration} size={56} />
            <h2 id={`ff-${p.id}`} style={{ margin: 0 }}>
              {p.title}
            </h2>
          </div>
          {p.paragraphs.map((t) => (
            <p key={t} className="reader-text" style={{ margin: 0 }}>
              {t}
            </p>
          ))}
        </section>
      ))}

      <div className="grid-2">
        <Link href="/learn/lesson/suhoor/" className="tile">
          <Illustration name="sunrise" size={48} />
          Lesson: Suhoor
        </Link>
        <Link href="/learn/lesson/iftar/" className="tile">
          <Illustration name="sunset" size={48} />
          Lesson: Iftar
        </Link>
      </div>

      <section className="card lav stack" aria-labelledby="journal-h">
        <h2 id="journal-h">📔 My private Ramadan journal</h2>
        {!enabled ? (
          <p style={{ margin: 0 }}>The journal is switched off. A grown-up can switch it on in the Parents area if your family would like to use it.</p>
        ) : (
          <>
            <p className="small" style={{ margin: 0 }}>
              Only you and your family can see this. It stays on this device. There are no stars here — every choice is a good one!
            </p>
            <fieldset style={{ border: 0, padding: 0, margin: 0 }} className="stack">
              <legend style={{ fontWeight: 700, color: "var(--emerald)", marginBottom: 8 }}>How was today? ({formatDate(localISODate())})</legend>
              <div className="stack" role="radiogroup" aria-label="Today's journal entry">
                {JOURNAL_OPTIONS.map((o) => (
                  <button key={o.value} type="button" role="radio" aria-checked={choice === o.value} className="choice" style={{ flexDirection: "row", justifyContent: "flex-start", gap: 12, fontSize: "1rem", textAlign: "left" }} onClick={() => { setChoice(o.value); setSaved(false); }}>
                    <Illustration name={o.illustration} size={40} />
                    {o.label}
                  </button>
                ))}
              </div>
            </fieldset>
            <label htmlFor="journal-note">Anything you&apos;d like to remember? (optional)</label>
            <textarea id="journal-note" className="input" maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Please don't write names or addresses." />
            <button
              className="btn"
              disabled={!choice}
              onClick={async () => {
                if (!choice) return;
                await addJournalEntry({ experience: choice, note, date: localISODate() });
                setChoice(null);
                setNote("");
                setSaved(true);
              }}
            >
              Save to my journal
            </button>
            {saved && (
              <p role="status" className="pill done" style={{ alignSelf: "flex-start" }}>
                {JOURNAL_SAVED_MESSAGE}
              </p>
            )}
            {entries.length > 0 && (
              <div className="stack">
                <h3>My memories</h3>
                <ul style={{ margin: 0 }}>
                  {entries.map((e) => (
                    <li key={e.id}>
                      <strong>{formatDate(e.date)}:</strong> {JOURNAL_OPTIONS.find((o) => o.value === e.experience)?.label}
                      {e.note && ` — “${e.note}”`}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </section>
      <HealthNotice compact />
    </div>
  );
}
