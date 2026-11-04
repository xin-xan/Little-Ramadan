"use client";

import Link from "next/link";
import { Amina, Hilmy, Noor } from "@/characters/Characters";
import { Illustration } from "@/components/art/Illustration";
import { PageHeader } from "@/components/ui";
import { calendarStatus, dateOfDay, formatDate } from "@/storage/calendar";
import { countKind, progressOf } from "@/storage/rewards";
import { useApp } from "@/state/AppState";
import { playSound } from "@/accessibility/sound";
import { Icon } from "@/components/Icon";

/** Eid celebration. Works with 29- or 30-day calendars and with no calendar at all. */
export default function EidPage() {
  const { data } = useApp();
  if (!data.profile) return null;
  const cal = data.settings.calendar;
  const status = calendarStatus(cal);
  const finalDate = dateOfDay(cal, cal.length);
  const ready = status.mode === "after" || status.mode === "explore" || (status.mode === "during" && status.day === cal.length);
  const p = progressOf(data.completions);
  const animate = !data.settings.reducedMotion;

  return (
    <div className="stack-lg">
      <PageHeader title="Eid Celebration" back={{ href: "/rewards/", label: "Celebration Square" }} />
      <div className="card emerald stack center" style={{ background: "linear-gradient(180deg,#1D2B4F,#123C35)", overflow: "hidden" }}>
        <div className={animate ? "float" : undefined} style={{ display: "flex", justifyContent: "center" }}>
          <Hilmy size={90} expression="cheer" />
        </div>
        <h2 style={{ fontSize: "2rem" }}>{ready ? `Eid Mubarak, ${data.profile.nickname}!` : "Eid is coming!"}</h2>
        <p>
          {ready
            ? "Ramadan has been a wonderful journey. Let's celebrate everything you learned and all the kindness you shared!"
            : `Eid al-Fitr comes after the last day of Ramadan${finalDate ? ` (Day ${cal.length}, ${formatDate(finalDate)})` : ""}, when the new moon is announced. Here's a sneak peek!`}
        </p>
        <div className="row" style={{ justifyContent: "center" }}>
          <Noor size={100} expression="cheer" />
          <Amina size={100} expression="cheer" />
        </div>
        {data.settings.soundOn && (
          <button className="btn gold" onClick={() => playSound("badge")}>
            <Icon name="sound-on" /> Play a happy sound
          </button>
        )}
      </div>

      <section className="card stack" aria-labelledby="eid-journey">
        <h2 id="eid-journey">Your Ramadan journey</h2>
        <div className="grid-2">
          <div className="card gold center">
            <strong style={{ fontSize: "1.6rem" }}>{p.stars}</strong>
            <div className="small">stars</div>
          </div>
          <div className="card sky center">
            <strong style={{ fontSize: "1.6rem" }}>{p.daysCompleted}</strong>
            <div className="small">days completed</div>
          </div>
          <div className="card lav center">
            <strong style={{ fontSize: "1.6rem" }}>{countKind(data.completions, "kindness")}</strong>
            <div className="small">kind things</div>
          </div>
          <div className="card center">
            <strong style={{ fontSize: "1.6rem" }}>{countKind(data.completions, "lesson") + countKind(data.completions, "story")}</strong>
            <div className="small">stories & lessons</div>
          </div>
        </div>
      </section>

      <section className="card stack" aria-labelledby="eid-ideas">
        <h2 id="eid-ideas">Eid ideas to do with your family</h2>
        <ul className="stack" style={{ listStyle: "none", padding: 0, margin: 0 }}>
          <li className="row">
            <Illustration name="card" size={48} /> Make an Eid card for someone you love.
          </li>
          <li className="row">
            <Illustration name="smile" size={48} /> Say &quot;Eid Mubarak!&quot; to your family and friends.
          </li>
          <li className="row">
            <Illustration name="maldivian-food" size={48} /> Help share treats (with a grown-up).
          </li>
          <li className="row">
            <Illustration name="thank-you" size={48} /> Say thank you to everyone who helped you this Ramadan.
          </li>
        </ul>
      </section>

      <Link href="/rewards/certificate/" className="btn gold block">
        <Icon name="scroll" /> See my certificate
      </Link>
      <Link href="/learn/lesson/eid-al-fitr/" className="btn ghost block">
        Learn about Eid al-Fitr
      </Link>
    </div>
  );
}
