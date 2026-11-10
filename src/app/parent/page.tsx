"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AVATARS, Avatar } from "@/characters/Avatars";
import { ParentGate } from "@/components/ParentGate";
import { RecordingsPanel } from "@/components/parent/RecordingsPanel";
import { ProgressBar, Sheet, Switch } from "@/components/ui";
import { badges } from "@/content/badges";
import { allDays } from "@/content/days";
import { JOURNAL_OPTIONS } from "@/content/firstFast";
import { games } from "@/content/games";
import { lessons } from "@/content/lessons";
import { missions } from "@/content/missions";
import { quizSets } from "@/content/quizzes";
import { NOT_MEDICAL_NOTICE, NOT_RELIGIOUS_AUTHORITY_NOTICE, PARENT_FASTING_GUIDANCE } from "@/content/safety";
import { stories } from "@/content/stories";
import { contentReviewSummary, reviewItems } from "@/content/review";
import { hashPin, PIN_PATTERN } from "@/safety/parentGate";
import { calendarStatus, dateOfDay, daysFor, formatDate, localISODate } from "@/storage/calendar";
import { countKind, completedDayIds, totalStars, unlockedBadgeIds, unlockedDecorationIds } from "@/storage/rewards";
import { nicknameProblem, NICKNAME_MAX } from "@/storage/schema";
import { useApp } from "@/state/AppState";

const TABS = [
  { id: "progress", label: "Progress" },
  { id: "settings", label: "Settings" },
  { id: "calendar", label: "Calendar" },
  { id: "recordings", label: "Voice recordings" },
  { id: "journal", label: "Fasting journal" },
  { id: "guidance", label: "Safety guide" },
  { id: "privacy", label: "Privacy" },
  { id: "content", label: "Content & review" },
  { id: "data", label: "Reset & delete" },
] as const;
type TabId = (typeof TABS)[number]["id"];

export default function ParentZonePage() {
  const router = useRouter();
  const [unlocked, setUnlocked] = useState(false);
  const [tab, setTab] = useState<TabId>("progress");

  if (!unlocked) {
    return (
      <div className="parent-theme stack" style={{ borderRadius: 24, padding: 16 }}>
        <div className="parent-banner">
          <h1>Parent Zone</h1>
          <p style={{ margin: 0 }}>Settings, progress and privacy for grown-ups.</p>
        </div>
        <ParentGate open onPass={() => setUnlocked(true)} onCancel={() => router.push("/home/")} reason="The Parent Zone is for parents and guardians." />
      </div>
    );
  }

  return (
    <div className="parent-theme stack" style={{ borderRadius: 24, padding: 12, margin: "-4px -4px 0" }}>
      <div className="parent-banner spread">
        <div>
          <h1 style={{ margin: 0 }}>Parent Zone</h1>
          <p className="small" style={{ margin: 0 }}>
            For parents and guardians
          </p>
        </div>
        <button className="btn ghost small" onClick={() => setUnlocked(false)}>
          Lock
        </button>
      </div>
      <div className="tabs" role="tablist" aria-label="Parent Zone sections">
        {TABS.map((t) => (
          <button key={t.id} role="tab" id={`tab-${t.id}`} aria-selected={tab === t.id} aria-controls={`panel-${t.id}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>
      <section role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="stack">
        {tab === "progress" && <ProgressPanel />}
        {tab === "settings" && <SettingsPanel />}
        {tab === "calendar" && <CalendarPanel />}
        {tab === "recordings" && <RecordingsPanel />}
        {tab === "journal" && <JournalPanel />}
        {tab === "guidance" && <GuidancePanel />}
        {tab === "privacy" && <PrivacyPanel />}
        {tab === "content" && <ContentPanel />}
        {tab === "data" && <DataPanel />}
      </section>
    </div>
  );
}

function ProgressPanel() {
  const { data } = useApp();
  const c = data.completions;
  const days = daysFor(data.settings.calendar);
  const done = new Set(completedDayIds(c));
  const reflections = c.filter((x) => x.kind === "reflection" && x.reflection);
  const goalsDone = data.goals.filter((g) => g.completedAt).length;
  return (
    <>
      <div className="card row">
        {data.profile && <Avatar id={data.profile.avatar} size={64} />}
        <div>
          <h2 style={{ margin: 0 }}>{data.profile?.nickname}</h2>
          <p className="small muted" style={{ margin: 0 }}>
            Profile created {data.profile ? new Date(data.profile.createdAt).toLocaleDateString("en-GB") : ""}
          </p>
        </div>
      </div>
      <div className="card stack">
        <h2>Learning activity</h2>
        <ProgressBar value={days.filter((d) => done.has(d.id)).length} max={days.length} label="Journey days completed" />
        <ProgressBar value={countKind(c, "lesson")} max={lessons.length} label="Lessons" />
        <ProgressBar value={countKind(c, "story")} max={stories.length} label="Stories" />
        <ProgressBar value={countKind(c, "kindness")} max={missions.length} label="Kindness missions" />
        <ProgressBar value={countKind(c, "quiz")} max={quizSets.length} label="Quizzes" />
        <ProgressBar value={countKind(c, "game")} max={games.length} label="Games tried" />
        <p style={{ margin: 0 }}>
          {totalStars(c)} stars · {unlockedBadgeIds(c).length} of {badges.length} badges · {unlockedDecorationIds(c).length} decorations · {goalsDone} goals finished
        </p>
        <p className="small muted">Stars come only from learning, kindness, games and goals. Fasting never affects stars or badges.</p>
      </div>
      <div className="card stack">
        <h2>Private reflections</h2>
        {reflections.length === 0 ? (
          <p className="muted">No reflections written yet. Reflections are optional.</p>
        ) : (
          <ul>
            {reflections.map((r) => {
              const d = allDays.find((x) => x.id === r.contentId);
              return (
                <li key={r.id}>
                  <strong>{d ? `Day ${d.day} · ${d.theme}` : r.contentId}:</strong> {r.reflection}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}

function SettingsPanel() {
  const { data, updateSettings, updateProfile } = useApp();
  const s = data.settings;
  const [nickname, setNickname] = useState(data.profile?.nickname ?? "");
  const [nickMsg, setNickMsg] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const [pinMsg, setPinMsg] = useState<string | null>(null);

  const saveNick = async (e: React.FormEvent) => {
    e.preventDefault();
    const p = nicknameProblem(nickname);
    if (p) return setNickMsg(p);
    await updateProfile({ nickname });
    setNickMsg("Saved.");
  };

  const savePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!PIN_PATTERN.test(pin)) return setPinMsg("Please use 4 to 6 digits.");
    await updateSettings({ parentPin: await hashPin(pin) });
    setPin("");
    setPinMsg("PIN saved. It is stored only as a secure hash on this device.");
  };

  return (
    <>
      <div className="card stack">
        <h2>Child profile</h2>
        <form onSubmit={saveNick} className="stack">
          <label htmlFor="pz-nick">Nickname</label>
          <input id="pz-nick" className="input" value={nickname} maxLength={NICKNAME_MAX + 4} onChange={(e) => { setNickname(e.target.value); setNickMsg(null); }} />
          {nickMsg && <p role="status" className={nickMsg === "Saved." ? "small" : "field-error"}>{nickMsg}</p>}
          <button className="btn" type="submit">
            Save nickname
          </button>
        </form>
        <p style={{ fontWeight: 700, margin: 0 }}>Avatar</p>
        <div className="choice-grid" role="radiogroup" aria-label="Avatar">
          {AVATARS.map((a) => (
            <button key={a.id} type="button" role="radio" aria-checked={data.profile?.avatar === a.id} className="choice" onClick={() => updateProfile({ avatar: a.id })}>
              <Avatar id={a.id} size={48} decorative />
              {a.name}
            </button>
          ))}
        </div>
      </div>
      <div className="card">
        <h2>Sound, motion and display</h2>
        <Switch id="set-sound" label="Sound effects" description="Soft chimes and sparkles, generated on this device. Nothing in the app depends on sound." checked={s.soundOn} onChange={(v) => updateSettings({ soundOn: v })} />
        <Switch id="set-motion" label="Reduce motion" description="Turns off animations. The device's own reduce-motion setting is always respected too." checked={s.reducedMotion} onChange={(v) => updateSettings({ reducedMotion: v })} />
        <div className="toggle-row">
          <label htmlFor="set-village">Village view</label>
          <select id="set-village" className="input" style={{ maxWidth: 200 }} value={s.villageMode} onChange={(e) => updateSettings({ villageMode: e.target.value as typeof s.villageMode })}>
            <option value="auto">Automatic</option>
            <option value="scene">Village picture</option>
            <option value="simple">Simple list (lighter)</option>
          </select>
        </div>
        <p className="small muted">Automatic shows the simple list on low-powered devices or when data saver is on.</p>
      </div>
      <div className="card">
        <h2>Gentle screen-time reminder</h2>
        <Switch id="set-break" label="Remind my child to take a break" description="Shows a calm in-app message. No notifications are sent." checked={s.screenTime.enabled} onChange={(v) => updateSettings({ screenTime: { ...s.screenTime, enabled: v } })} />
        <div className="toggle-row">
          <label htmlFor="set-break-min">Remind after</label>
          <select id="set-break-min" className="input" style={{ maxWidth: 200 }} value={s.screenTime.minutes} onChange={(e) => updateSettings({ screenTime: { ...s.screenTime, minutes: Number(e.target.value) } })}>
            {[10, 15, 20, 30, 45, 60].map((m) => (
              <option key={m} value={m}>
                {m} minutes
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="card stack">
        <h2>Parent PIN (optional)</h2>
        <p className="small">
          By default, the Parent Zone asks a grown-up question. This keeps young children out but is not security. You can set a 4–6 digit PIN instead. It is stored only as a salted hash on this device.
        </p>
        <form onSubmit={savePin} className="stack">
          <label htmlFor="pz-pin">{s.parentPin ? "New PIN" : "Set a PIN"}</label>
          <input id="pz-pin" className="input" type="password" inputMode="numeric" autoComplete="new-password" value={pin} onChange={(e) => { setPin(e.target.value.replace(/\D/g, "").slice(0, 6)); setPinMsg(null); }} />
          {pinMsg && <p role="status" className="small">{pinMsg}</p>}
          <div className="row wrap">
            <button className="btn" type="submit">
              Save PIN
            </button>
            {s.parentPin && (
              <button type="button" className="btn ghost" onClick={async () => { await updateSettings({ parentPin: null }); setPinMsg("PIN removed. The grown-up question will be used instead."); }}>
                Remove PIN
              </button>
            )}
          </div>
        </form>
      </div>
    </>
  );
}

function CalendarPanel() {
  const { data, updateSettings } = useApp();
  const cal = data.settings.calendar;
  const [start, setStart] = useState(cal.startDate ?? "");
  const [msg, setMsg] = useState<string | null>(null);
  const status = calendarStatus(cal);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(start)) return setMsg("Please choose a date.");
    await updateSettings({ calendar: { ...cal, startDate: start } });
    setMsg("Calendar saved.");
  };

  return (
    <>
      <div className="card stack">
        <h2>Ramadan dates</h2>
        <p className="small">
          Ramadan starts when the new crescent moon is sighted, so dates differ between places and years. Please enter the first day of Ramadan from your <strong>local official announcement</strong>. Little Ramadan does not look up or claim official dates.
        </p>
        <form onSubmit={save} className="stack">
          <label htmlFor="cal-start">First day of Ramadan</label>
          <input id="cal-start" type="date" className="input" value={start} onChange={(e) => { setStart(e.target.value); setMsg(null); }} />
          <fieldset className="stack" style={{ border: 0, padding: 0, margin: 0 }}>
            <legend style={{ fontWeight: 700, color: "var(--parent)" }}>Length of the month</legend>
            <div className="row">
              {([29, 30] as const).map((n) => (
                <button key={n} type="button" className="choice" style={{ flex: 1, fontSize: "1rem" }} aria-pressed={cal.length === n} onClick={() => updateSettings({ calendar: { ...cal, length: n } })}>
                  {n} days
                </button>
              ))}
            </div>
            <p className="small muted">Not sure yet? Choose 30 and change it to 29 when Eid is announced. Progress is kept either way.</p>
          </fieldset>
          {msg && <p role="status">{msg}</p>}
          <button className="btn" type="submit">
            Save start date
          </button>
        </form>
        <Switch id="cal-open" label="Open all journey days now" description="Otherwise each day opens on its date. Missed days always stay open." checked={cal.openAllDays} onChange={(v) => updateSettings({ calendar: { ...cal, openAllDays: v } })} />
        {cal.startDate && (
          <>
            <p className="small">
              Current setting: Day 1 is {formatDate(cal.startDate)}; the final day (Day {cal.length}) is {formatDate(dateOfDay(cal, cal.length)!)}.{" "}
              {status.mode === "during" ? `Today is Day ${status.day}.` : status.mode === "before" ? `Ramadan starts in ${status.daysUntil} day(s).` : "This Ramadan has finished."}
            </p>
            <button className="btn ghost" type="button" onClick={async () => { await updateSettings({ calendar: { ...cal, startDate: null } }); setStart(""); setMsg("Calendar cleared. The app now shows \"Explore Ramadan\"."); }}>
              Clear dates (use Explore mode)
            </button>
          </>
        )}
        {!cal.startDate && <p className="small muted">No dates set: your child sees an &quot;Explore Ramadan&quot; journey with every day open.</p>}
        <p className="small muted">Today on this device: {formatDate(localISODate())}</p>
      </div>
    </>
  );
}

function JournalPanel() {
  const { data, updateSettings, deleteJournalEntry, clearJournal } = useApp();
  const [confirm, setConfirm] = useState(false);
  const entries = [...data.journal].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const label = (v: string) => JOURNAL_OPTIONS.find((o) => o.value === v)?.label ?? v;
  return (
    <>
      <div className="card stack">
        <h2>My First Fast journal</h2>
        <p className="small">The journal is an optional, private diary for children who are learning about fasting. It is off until you turn it on. Entries never earn stars or badges, there are no streaks, and nothing counts hours.</p>
        <Switch id="journal-on" label="Show the journal to my child" checked={data.settings.journalEnabled} onChange={(v) => updateSettings({ journalEnabled: v })} />
        <p className="small muted">The fasting learning pages and health message are always available, with or without the journal.</p>
      </div>
      <div className="card stack">
        <h2>Entries ({entries.length})</h2>
        {entries.length === 0 && <p className="muted">No entries yet.</p>}
        <ul className="stack" style={{ listStyle: "none", padding: 0 }}>
          {entries.map((e) => (
            <li key={e.id} className="spread" style={{ borderBottom: "1px solid #0001", paddingBottom: 8 }}>
              <span>
                <strong>{formatDate(e.date)}</strong> — {label(e.experience)}
                {e.note && <span className="small"> · “{e.note}”</span>}
              </span>
              <button className="btn ghost small" onClick={() => deleteJournalEntry(e.id)} aria-label={`Delete entry from ${formatDate(e.date)}`}>
                Delete
              </button>
            </li>
          ))}
        </ul>
        {entries.length > 0 && (
          <button className="btn danger" onClick={() => setConfirm(true)}>
            Delete all journal entries
          </button>
        )}
      </div>
      <ConfirmSheet open={confirm} title="Delete all journal entries?" body="This removes every journal entry from this device. It cannot be undone." action="Delete entries" onCancel={() => setConfirm(false)} onConfirm={async () => { await clearJournal(); setConfirm(false); }} />
    </>
  );
}

function GuidancePanel() {
  return (
    <>
      <div className="card stack">
        <h2>Fasting and wellbeing</h2>
        <ul className="stack">
          {PARENT_FASTING_GUIDANCE.map((g) => (
            <li key={g}>{g}</li>
          ))}
        </ul>
        <p className="notice">{NOT_MEDICAL_NOTICE}</p>
      </div>
      <div className="card stack">
        <h2>What your child sees</h2>
        <p>Every fasting page, and a health button on the home screen, says: “Your health comes first! If you feel dizzy, very weak or unwell, tell your parent or another trusted adult straight away. You can stop fasting whenever you need to. Your Ramadan adventure is still special!”</p>
        <p>Kindness missions that involve cooking, giving, visiting or calling someone are marked “Do this with a grown-up”.</p>
      </div>
      <div className="card stack">
        <h2>Child safety by design</h2>
        <ul>
          <li>No chat, comments, friends, public profiles or leaderboards.</li>
          <li>No ads, purchases, subscriptions or paid rewards — ever.</li>
          <li>No external links in the children&apos;s area.</li>
          <li>No location, camera or contacts access. The microphone is used only if a grown-up chooses to record their own voice in the Parent Zone.</li>
          <li>No streaks, timers or pressure in games. Missed days are never punished.</li>
        </ul>
      </div>
    </>
  );
}

function PrivacyPanel() {
  const { storageKind } = useApp();
  return (
    <div className="card stack">
      <h2>Privacy notice</h2>
      <p>
        <strong>Who we are:</strong> Little Ramadan is a free educational app for children aged 7–9. It has no accounts and no servers that receive children&apos;s data.
      </p>
      <p>
        <strong>What is stored:</strong> your child&apos;s nickname and cartoon avatar; app settings; which activities were completed; badges, decorations and goals; optional reflections and optional journal entries; and any voice recordings you make in “Voice recordings”.
      </p>
      <p>
        <strong>Where:</strong> only on this device, in this browser&apos;s storage (IndexedDB). {storageKind === "memory" ? "Right now this browser is not allowing storage, so nothing will be kept after the app closes." : ""}
      </p>
      <p>
        <strong>What leaves the device:</strong> nothing. There are no analytics, advertising, tracking, cookies for tracking, social logins or third-party services. After the first visit, the app works offline.
      </p>
      <p>
        <strong>What we never ask for:</strong> real names, birth dates, addresses, phone numbers, email, school, location, photos or camera access. The microphone is only used when a grown-up taps Record in “Voice recordings”, and it is switched off as soon as they tap Stop. Children are never asked to record anything.
      </p>
      <p>
        <strong>Keeping or removing data:</strong> data stays until you delete it in “Reset &amp; delete”, clear this browser&apos;s data, or remove the app. Changing devices does not move progress.
      </p>
      <p>
        <strong>Cost:</strong> Little Ramadan is free. There are no ads, purchases, subscriptions or premium features, and data is never sold.
      </p>
      <p className="small muted">{NOT_RELIGIOUS_AUTHORITY_NOTICE}</p>
    </div>
  );
}

function ContentPanel() {
  const summary = contentReviewSummary();
  return (
    <>
      <div className="card stack">
        <h2>Content review status</h2>
        <p className="small">
          All religious-learning content is written in simple language for young children and contains no Quran or hadith quotations. It is marked as a <strong>draft</strong> until a qualified reviewer approves it. Stories are fiction that illustrate values; they are not religious teachings.
        </p>
        <p>
          <strong>{summary.reviewed}</strong> reviewed · <strong>{summary.inReview}</strong> in review · <strong>{summary.draft}</strong> draft (of {summary.total} items)
        </p>
      </div>
      <div className="card" style={{ overflowX: "auto" }}>
        <table className="simple">
          <thead>
            <tr>
              <th>Item</th>
              <th>Type</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {reviewItems().map((r) => (
              <tr key={`${r.type}-${r.id}`}>
                <td>
                  {r.title}
                  {r.sourceNote && <div className="small muted">{r.sourceNote}</div>}
                </td>
                <td>{r.type}</td>
                <td>
                  <span className={`pill ${r.review.status === "reviewed" ? "done" : "draft"}`}>{r.review.status.replace("_", " ")}</span>
                  {r.review.reviewer && <div className="small">by {r.review.reviewer}</div>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card stack">
        <h2>Credits</h2>
        <p className="small">All characters, illustrations and sounds are original artwork created for Little Ramadan. No third-party images, fonts or sounds are used.</p>
      </div>
    </>
  );
}

function ConfirmSheet({ open, title, body, action, onCancel, onConfirm }: { open: boolean; title: string; body: string; action: string; onCancel(): void; onConfirm(): void | Promise<void> }) {
  const [busy, setBusy] = useState(false);
  return (
    <Sheet open={open} onClose={onCancel} labelledBy="confirm-title">
      <div className="stack">
        <h2 id="confirm-title">{title}</h2>
        <p>{body}</p>
        <button className="btn danger block" disabled={busy} onClick={async () => { setBusy(true); try { await onConfirm(); } finally { setBusy(false); } }}>
          {busy ? "Working…" : action}
        </button>
        <button className="btn ghost block" onClick={onCancel} data-autofocus>
          Cancel
        </button>
      </div>
    </Sheet>
  );
}

function DataPanel() {
  const { resetProgress, deleteEverything } = useApp();
  const router = useRouter();
  const [which, setWhich] = useState<null | "reset" | "delete">(null);
  const [done, setDone] = useState<string | null>(null);
  return (
    <>
      <div className="card stack">
        <h2>Reset progress</h2>
        <p>Clears completed activities, stars, badges, decorations, room layout, goals and reflections. Keeps the nickname, avatar, settings and journal.</p>
        <button className="btn danger" onClick={() => setWhich("reset")}>
          Reset progress
        </button>
        {done && <p role="status">{done}</p>}
      </div>
      <div className="card stack">
        <h2>Delete everything</h2>
        <p>Permanently removes all Little Ramadan data from this device — profile, settings, progress, journal and voice recordings — and returns to the welcome screen.</p>
        <button className="btn danger" onClick={() => setWhich("delete")}>
          Delete all data
        </button>
      </div>
      <ConfirmSheet
        open={which === "reset"}
        title="Reset all progress?"
        body="Stars, badges, decorations, goals and completed activities will be cleared. Your voice recordings are kept. This cannot be undone."
        action="Yes, reset progress"
        onCancel={() => setWhich(null)}
        onConfirm={async () => {
          await resetProgress();
          setWhich(null);
          setDone("Progress has been reset.");
        }}
      />
      <ConfirmSheet
        open={which === "delete"}
        title="Delete everything?"
        body="All Little Ramadan data on this device will be permanently deleted. This cannot be undone."
        action="Yes, delete everything"
        onCancel={() => setWhich(null)}
        onConfirm={async () => {
          await deleteEverything();
          setWhich(null);
          router.replace("/welcome/");
        }}
      />
    </>
  );
}
