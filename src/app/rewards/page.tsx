"use client";

import Link from "next/link";
import { Hilmy } from "@/characters/Characters";
import { BadgeIcon } from "@/components/art/BadgeIcon";
import { DecorationThumb } from "@/components/room/DecorationArt";
import { PageHeader } from "@/components/ui";
import { badges } from "@/content/badges";
import { decorations } from "@/content/decorations";
import { STAR_VALUES } from "@/content/copy";
import { countKind, progressOf, ruleMet, ruleProgress } from "@/storage/rewards";
import { useApp } from "@/state/AppState";

export default function RewardsPage() {
  const { data } = useApp();
  const c = data.completions;
  const p = progressOf(c);
  const earned = badges.filter((b) => ruleMet(b.rule, c, p));
  return (
    <div className="stack-lg">
      <PageHeader title="Celebration Square" back={{ href: "/home/", label: "Home" }} />
      <div className="card emerald row">
        <Hilmy size={80} expression="cheer" />
        <div>
          <p style={{ margin: 0, fontSize: "2rem", fontWeight: 800, color: "var(--gold)" }}>★ {p.stars}</p>
          <p style={{ margin: 0 }}>stars collected</p>
        </div>
      </div>

      <div className="grid-2">
        <Link href="/rewards/room/" className="tile">
          <span style={{ fontSize: "2rem" }} aria-hidden="true">🏮</span>
          My Ramadan Room
        </Link>
        <Link href="/goals/" className="tile">
          <span style={{ fontSize: "2rem" }} aria-hidden="true">🎯</span>
          My Goals
        </Link>
        <Link href="/rewards/certificate/" className="tile">
          <span style={{ fontSize: "2rem" }} aria-hidden="true">📜</span>
          My Certificate
        </Link>
        <Link href="/rewards/eid/" className="tile">
          <span style={{ fontSize: "2rem" }} aria-hidden="true">🌙</span>
          Eid Celebration
        </Link>
      </div>

      <section className="card stack" aria-labelledby="summary-h">
        <h2 id="summary-h">My achievements</h2>
        <ul style={{ margin: 0 }}>
          <li>{countKind(c, "lesson")} lessons learned</li>
          <li>{countKind(c, "story")} stories read</li>
          <li>{countKind(c, "kindness")} kind things done</li>
          <li>{countKind(c, "quiz")} quizzes completed</li>
          <li>{p.gamesExplored} games explored</li>
          <li>{p.daysCompleted} journey days completed</li>
          <li>{countKind(c, "goal")} goals finished</li>
        </ul>
      </section>

      <section className="stack" aria-labelledby="badges-h">
        <h2 id="badges-h">
          Badges ({earned.length} of {badges.length})
        </h2>
        <ul className="grid-2 wide-3" style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {badges.map((b) => {
            const got = ruleMet(b.rule, c, p);
            const prog = Math.round(ruleProgress(b.rule, c, p) * 100);
            return (
              <li key={b.id} className="card stack center" style={{ gap: 4, padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <BadgeIcon id={b.id} size={72} locked={!got} />
                </div>
                <strong style={{ color: "var(--emerald)" }}>{b.title}</strong>
                <span className="small">{got ? b.description : b.hint}</span>
                <span className={`pill ${got ? "done" : ""}`} style={{ alignSelf: "center" }}>
                  {got ? "✓ Earned" : `${prog}% there`}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="stack" aria-labelledby="decor-h">
        <h2 id="decor-h">Decorations</h2>
        <p className="small muted">Earn decorations by learning, being kind and playing. They are never bought.</p>
        <ul className="grid-3 wide-4" style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {decorations.map((d) => {
            const got = ruleMet(d.rule, c, p);
            return (
              <li key={d.id} className="card stack center" style={{ gap: 2, padding: 8 }}>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <DecorationThumb id={d.id} size={56} locked={!got} />
                </div>
                <span className="small" style={{ fontWeight: 700 }}>{d.title}</span>
                <span className="small muted">{got ? "✓ Unlocked" : `🔒 ${d.hint}`}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="card sky stack" aria-labelledby="how-h">
        <h2 id="how-h">How do I earn stars?</h2>
        <ul style={{ margin: 0 }}>
          <li>Finish a lesson: {STAR_VALUES.lesson} stars</li>
          <li>Read a story: {STAR_VALUES.story} stars</li>
          <li>Do a kindness mission: {STAR_VALUES.kindness} stars</li>
          <li>Finish a quiz: {STAR_VALUES.quiz} stars</li>
          <li>Finish a personal goal: {STAR_VALUES.goal} stars</li>
          <li>Try a new game: {STAR_VALUES.game} star</li>
        </ul>
        <p className="small" style={{ margin: 0 }}>Stars are never taken away. Fasting or not fasting never changes your stars.</p>
      </section>
    </div>
  );
}
