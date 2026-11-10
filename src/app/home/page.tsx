"use client";

import { ListenButton } from "@/components/Listen";
import Link from "next/link";
import { Avatar } from "@/characters/Avatars";
import { Noor } from "@/characters/Characters";
import { Icon, IconChip } from "@/components/Icon";
import { LogoMark } from "@/components/Logo";
import { Illustration } from "@/components/art/Illustration";
import { VillageScene } from "@/components/village/VillageScene";
import { ProgressBar, SoundToggle, StarCount } from "@/components/ui";
import { ENCOURAGEMENTS } from "@/content/copy";
import { calendarStatus, daysFor, formatDate, isDayOpen } from "@/storage/calendar";
import { completedDayIds, dayPartsDone, totalStars } from "@/storage/rewards";
import { useApp } from "@/state/AppState";

export default function HomePage() {
  const { data } = useApp();
  const { profile, settings, completions } = data;
  if (!profile) return null;

  const cal = settings.calendar;
  const status = calendarStatus(cal);
  const days = daysFor(cal);
  const done = new Set(completedDayIds(completions));
  const doneInJourney = days.filter((d) => done.has(d.id)).length;
  const stars = totalStars(completions);

  // Today's mission: the calendar day if configured, otherwise the first open day not yet finished.
  const today =
    status.mode === "during"
      ? days[status.day - 1]
      : days.find((d) => isDayOpen(cal, d.day) && !done.has(d.id)) ?? days[days.length - 1];
  const todayParts = dayPartsDone(completions, today.id);
  const partsDone = Object.values(todayParts).filter(Boolean).length;
  const todayOpen = isDayOpen(cal, today.day);

  const greeting = completions.length === 0 ? `Welcome to Ramadan Village, ${profile.nickname}!` : `Welcome back, ${profile.nickname}! ${ENCOURAGEMENTS[completions.length % ENCOURAGEMENTS.length]}`;

  const title = status.mode === "during" ? `Ramadan Day ${status.day}` : status.mode === "explore" ? "Explore Ramadan" : status.mode === "before" ? "Getting ready for Ramadan" : "Ramadan journey";
  const SHORTCUTS = [
    { href: "/learn/", label: "Learn", sub: "Stories & lessons", icon: "book", tone: "sky" },
    { href: "/games/", label: "Play", sub: "Games & quizzes", icon: "games", tone: "lavender" },
    { href: "/dhivehi/", label: "Learn Dhivehi", sub: "Letters & words", icon: "scroll", tone: "emerald" },
    { href: "/kindness/", label: "Kindness", sub: "Good deeds", icon: "heart", tone: "rose" },
    { href: "/rewards/room/", label: "My Room", sub: "Decorate it", icon: "lantern", tone: "gold" },
    { href: "/goals/", label: "My Goals", sub: "Little steps", icon: "target", tone: "emerald" },
    { href: "/first-fast/", label: "My First Fast", sub: "Learn gently", icon: "moon", tone: "sky" },
  ] as const;

  return (
    <div className="stack-lg">
      <div className="top-bar">
        <h1 className="brand" style={{ margin: 0, fontSize: "1.15rem" }}>
          <LogoMark size={38} />
          <span>Little Ramadan</span>
          <span className="sr-only">: Noor&apos;s House</span>
        </h1>
        <div className="row" style={{ gap: 8 }}>
          <ListenButton compact selector="#main" label="Listen to this page" narrationKey="page" />
          <SoundToggle />
          <StarCount stars={stars} />
          <Link href="/rewards/room/" aria-label={`My room. Your avatar is ${profile.avatar}`} className="icon-btn" style={{ padding: 0, overflow: "hidden" }}>
            <Avatar id={profile.avatar} size={42} decorative />
          </Link>
        </div>
      </div>

      <section className="hero" aria-labelledby="greet">
        <Noor size={118} expression="wave" title="Noor waving hello" />
        <div className="hero-text">
          <p className="eyebrow" style={{ margin: 0 }}>Assalamu alaikum</p>
          <h2 id="greet" style={{ margin: "2px 0 6px", fontSize: "1.35rem" }}>
            {completions.length === 0 ? `Welcome, ${profile.nickname}!` : `Welcome back, ${profile.nickname}!`}
          </h2>
          <p style={{ margin: 0, opacity: 0.9, fontWeight: 600 }}>{greeting.replace(/^Welcome[^!]*!\s*/, "") || "Let's explore Ramadan Village together."}</p>
        </div>
      </section>

      <section className="card emerald stack" aria-labelledby="today-title">
        <div className="spread">
          <div>
            <p className="eyebrow" style={{ margin: 0 }}>Today&apos;s mission</p>
            <h2 id="today-title" style={{ margin: "2px 0 0" }}>
              {title}
            </h2>
          </div>
          <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 18, padding: 4 }}>
            <Illustration name={today.illustration} size={58} />
          </div>
        </div>
        {status.mode === "before" && (
          <p style={{ margin: 0 }}>
            Ramadan starts in {status.daysUntil} day{status.daysUntil === 1 ? "" : "s"} (on {formatDate(cal.startDate!)}). You can explore the stories and games now!
          </p>
        )}
        {status.mode === "after" && <p style={{ margin: 0 }}>Ramadan has finished. You can still visit every day of your journey.</p>}
        {status.mode === "explore" && <p style={{ margin: 0, opacity: 0.9 }}>Pick any day of the journey. A grown-up can set your Ramadan dates in the Parents area.</p>}
        <p style={{ margin: 0, fontSize: "1.1rem" }}>
          <strong>
            Day {today.day} · {today.theme}
          </strong>{" "}
          — {today.activity}
        </p>
        <div className="row" style={{ gap: 6 }} aria-label={`${partsDone} of 3 activities done`}>
          {[todayParts.learn, todayParts.kindness, todayParts.play].map((d, i) => (
            <span key={i} style={{ flex: 1, height: 8, borderRadius: 8, background: d ? "var(--gold)" : "rgba(255,255,255,0.18)" }} />
          ))}
        </div>
        <p className="small" style={{ margin: 0, opacity: 0.85 }}>
          {partsDone === 3 ? "All done! Wonderful." : `${partsDone} of 3 activities done`}
        </p>
        {todayOpen ? (
          <Link className="btn gold block shine" href={`/journey/${today.id}/`} data-sound="open">
            {partsDone === 0 ? "Start today's mission" : partsDone === 3 ? "Visit again" : "Continue today's mission"}
            <Icon name="arrowRight" />
          </Link>
        ) : (
          <Link className="btn gold block" href="/learn/">
            Explore stories while you wait
          </Link>
        )}
      </section>

      <div className="card">
        <ProgressBar value={doneInJourney} max={days.length} label="My Ramadan journey" />
      </div>

      <section aria-labelledby="village-title" className="stack">
        <div className="spread">
          <h2 id="village-title" style={{ margin: 0 }}>
            Ramadan Village
          </h2>
          <span className="pill gold">
            <Icon name="lantern" size={14} /> Lights grow as you learn
          </span>
        </div>
        <VillageScene />
      </section>

      <section aria-labelledby="shortcuts-title" className="stack">
        <h2 id="shortcuts-title">Quick links</h2>
        <div className="grid-2 wide-3">
          {SHORTCUTS.map((s) => (
            <Link key={s.href} className="tile" href={s.href}>
              <IconChip name={s.icon} tone={s.tone} size={52} />
              {s.label}
              <span className="tile-sub">{s.sub}</span>
            </Link>
          ))}
        </div>
      </section>

      <Link href="/safety/" className="list-link" style={{ background: "var(--danger-bg)", borderColor: "rgba(138,43,18,0.15)" }}>
        <IconChip name="heart" tone="rose" />
        <span className="grow">
          <strong style={{ color: "var(--danger-text)" }}>Your health comes first</strong>
          <span className="small">Feeling unwell? Tap here.</span>
        </span>
        <Icon name="next" className="chev" />
      </Link>

      <Link href="/parent/" className="list-link" style={{ background: "var(--parent-bg)" }}>
        <IconChip name="parents" tone="parent" />
        <span className="grow">
          <strong style={{ color: "var(--parent)" }}>Parent Zone</strong>
          <span className="small">For grown-ups: settings, progress and privacy.</span>
        </span>
        <Icon name="next" className="chev" />
      </Link>
    </div>
  );
}
