"use client";

import Link from "next/link";
import { Hilmy } from "@/characters/Characters";
import { Icon, IconChip } from "@/components/Icon";
import { BadgeIcon } from "@/components/art/BadgeIcon";
import { PageHeader } from "@/components/ui";
import { badges } from "@/content/badges";
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
      <section className="hero" aria-label={`${p.stars} stars collected`}>
        <Hilmy size={110} expression="cheer" />
        <div className="hero-text">
          <p className="eyebrow" style={{ margin: 0 }}>Your collection</p>
          <p style={{ margin: 0, fontFamily: "var(--display)", fontSize: "2.6rem", fontWeight: 600, color: "var(--gold)", lineHeight: 1.1 }} className="row">
            <Icon name="star" size={34} fill strokeWidth={1.5} /> {p.stars}
          </p>
          <p style={{ margin: 0, fontWeight: 700 }}>stars collected</p>
        </div>
      </section>

      <div className="grid-2">
        {(
          [
            ["/journey/", "My Ramadan Journey", "journey", "gold"],
            ["/goals/", "My Goals", "target", "emerald"],
            ["/rewards/certificate/", "My Certificate", "scroll", "sky"],
            ["/rewards/eid/", "Eid Celebration", "moon", "lavender"],
          ] as const
        ).map(([href, label, icon, tone]) => (
          <Link key={href} href={href} className="tile">
            <IconChip name={icon} tone={tone} size={52} />
            {label}
          </Link>
        ))}
      </div>

      <section className="card stack" aria-labelledby="summary-h">
        <h2 id="summary-h">My achievements</h2>
        <div className="grid-2 wide-3">
          {(
            [
              [countKind(c, "lesson"), "lessons learned", "sprout", "emerald"],
              [countKind(c, "story"), "stories read", "book", "sky"],
              [countKind(c, "kindness"), "kind things done", "heart", "rose"],
              [countKind(c, "quiz"), "quizzes completed", "sparkle", "lavender"],
              [p.gamesExplored, "games explored", "games", "lavender"],
              [p.daysCompleted, "journey days completed", "journey", "gold"],
              [countKind(c, "goal"), "goals finished", "target", "emerald"],
            ] as const
          ).map(([n, label, icon, tone]) => (
            <div key={label} className="row" style={{ gap: 10, padding: 10, borderRadius: 16, background: "var(--cream)" }}>
              <IconChip name={icon} tone={tone} size={40} />
              <span style={{ lineHeight: 1.2 }}>
                <strong style={{ fontFamily: "var(--display)", fontSize: "1.3rem", display: "block" }}>{n}</strong>
                <span className="small muted">{label}</span>
              </span>
            </div>
          ))}
        </div>
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
                  {got ? <><Icon name="check" size={14} strokeWidth={3} /> Earned</> : `${prog}% there`}
                </span>
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
