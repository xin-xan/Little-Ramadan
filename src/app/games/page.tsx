"use client";

import Link from "next/link";
import { Amina } from "@/characters/Characters";
import { Illustration } from "@/components/art/Illustration";
import { PageHeader } from "@/components/ui";
import { games } from "@/content/games";
import { has } from "@/storage/rewards";
import { useApp } from "@/state/AppState";
import { Icon } from "@/components/Icon";

export default function GamesPage() {
  const { data } = useApp();
  return (
    <div className="stack-lg">
      <PageHeader title="Puzzle Palace" back={{ href: "/home/", label: "Home" }} />
      <div className="speech">
        <Amina size={84} expression="cheer" />
        <div className="bubble">
          <span className="who">Amina</span>
          Choose a game! There are no timers, so take your time. You can pause or stop whenever you like.
        </div>
      </div>
      <Link href="/dhivehi/" className="list-link" data-testid="dhivehi-entry">
        <span className="dv-entry-glyph" aria-hidden="true" lang="dv" dir="rtl">
          ށ
        </span>
        <span className="grow">
          <strong>Learn Dhivehi</strong>
          <span className="small muted">12 games for Thaana letters, fili, words and numbers, with one for every day of Ramadan.</span>
        </span>
        <Icon name="next" className="chev" />
      </Link>
      <ul className="grid-2" style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {games.map((g) => {
          const tried = has(data.completions, "game", g.id);
          return (
            <li key={g.id}>
              <Link href={g.id === "quiz" ? "/games/quiz/" : `/games/${g.id}/`} className="tile" style={{ minHeight: 170, width: "100%" }}>
                <Illustration name={g.illustration} size={64} />
                <span>{g.title}</span>
                <span className="tile-sub">{g.description}</span>
                <span className={`pill ${tried ? "done" : "gold"}`}>{tried ? <><Icon name="check" size={14} strokeWidth={3} /> Played</> : "New"}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
