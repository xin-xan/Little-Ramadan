"use client";

import Link from "next/link";
import { Avatar } from "@/characters/Avatars";
import { LogoMark } from "@/components/Logo";
import { Illustration } from "@/components/art/Illustration";
import { VillageScene } from "@/components/village/VillageScene";
import { ProgressBar, SpeechBubble, StarCount } from "@/components/ui";
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

  return (
    <div className="stack-lg">
      <div className="top-bar">
        <h1 className="brand" style={{ margin: 0, fontSize: "1.1rem" }}>
          <LogoMark size={36} />
          <span>Little Ramadan</span>
          <span className="sr-only">: Noor&apos;s House</span>
        </h1>
        <div className="row" style={{ gap: 8 }}>
          <StarCount stars={stars} />
          <Link href="/rewards/room/" aria-label={`My room. Your avatar is ${profile.avatar}`} className="icon-btn" style={{ padding: 0 }}>
            <Avatar id={profile.avatar} size={44} decorative />
          </Link>
        </div>
      </div>

      <SpeechBubble who="noor" expression="wave">
        {greeting}
      </SpeechBubble>

      <section className="card emerald stack" aria-labelledby="today-title">
        <div className="spread">
          <h2 id="today-title" style={{ margin: 0 }}>
            {status.mode === "during" ? `Ramadan Day ${status.day}` : status.mode === "explore" ? "Explore Ramadan" : status.mode === "before" ? "Getting ready for Ramadan" : "Ramadan journey"}
          </h2>
          <Illustration name={today.illustration} size={56} />
        </div>
        {status.mode === "before" && (
          <p>
            Ramadan starts in {status.daysUntil} day{status.daysUntil === 1 ? "" : "s"} (on {formatDate(cal.startDate!)}). You can explore the stories and games now!
          </p>
        )}
        {status.mode === "after" && <p>Ramadan has finished. You can still visit every day of your journey.</p>}
        {status.mode === "explore" && <p>Pick any day of the journey. A grown-up can set your Ramadan dates in the Parents area.</p>}
        <p style={{ margin: 0 }}>
          <strong>Today&apos;s mission:</strong> Day {today.day} · {today.theme} — {today.activity}
        </p>
        <p className="small" style={{ margin: 0 }}>
          {partsDone === 3 ? "✓ All done! Wonderful." : `${partsDone} of 3 activities done`}
        </p>
        {todayOpen ? (
          <Link className="btn gold block" href={`/journey/${today.id}/`}>
            {partsDone === 0 ? "Start today's mission" : partsDone === 3 ? "Visit again" : "Continue today's mission"}
          </Link>
        ) : (
          <Link className="btn gold block" href="/learn/">
            Explore stories while you wait
          </Link>
        )}
      </section>

      <ProgressBar value={doneInJourney} max={days.length} label="My Ramadan journey" />

      <section aria-labelledby="village-title" className="stack">
        <h2 id="village-title">Ramadan Village</h2>
        <VillageScene />
      </section>

      <section aria-labelledby="shortcuts-title" className="stack">
        <h2 id="shortcuts-title">Quick links</h2>
        <div className="grid-2 wide-3">
          <Link className="tile" href="/learn/">
            <Illustration name="reading" size={48} />
            Learn
          </Link>
          <Link className="tile" href="/games/">
            <Illustration name="puzzle" size={48} />
            Play
          </Link>
          <Link className="tile" href="/kindness/">
            <Illustration name="heart-hands" size={48} />
            Kindness
          </Link>
          <Link className="tile" href="/rewards/room/">
            <Illustration name="lantern" size={48} />
            My Room
          </Link>
          <Link className="tile" href="/goals/">
            <Illustration name="star" size={48} />
            My Goals
          </Link>
          <Link className="tile" href="/first-fast/">
            <Illustration name="hourglass" size={48} />
            My First Fast
          </Link>
        </div>
      </section>

      <Link href="/safety/" className="list-link" style={{ background: "var(--danger-bg)" }}>
        <span style={{ fontSize: "1.8rem" }} aria-hidden="true">
          ❤️
        </span>
        <span className="grow">
          <strong style={{ color: "var(--danger-text)" }}>Your health comes first</strong>
          <span className="small">Feeling unwell? Tap here.</span>
        </span>
      </Link>

      <Link href="/parent/" className="list-link" style={{ background: "var(--parent-bg)" }}>
        <span style={{ fontSize: "1.8rem" }} aria-hidden="true">
          👪
        </span>
        <span className="grow">
          <strong style={{ color: "var(--parent)" }}>Parent Zone</strong>
          <span className="small">For grown-ups: settings, progress and privacy.</span>
        </span>
      </Link>
    </div>
  );
}
