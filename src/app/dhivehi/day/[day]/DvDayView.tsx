"use client";

import Link from "next/link";
import { useState } from "react";
import { DvGamePlayer, LetterCard, TraceBoard } from "@/components/dhivehi/DvGames";
import { Icon } from "@/components/Icon";
import { NotFound, PageHeader, SpeechBubble } from "@/components/ui";
import { dhivehiPlan, dvDayId, dvGameById } from "@/content/dhivehi";
import { dateOfDay, formatDate, isDayOpen } from "@/storage/calendar";
import { has } from "@/storage/rewards";
import { useApp } from "@/state/AppState";

export function DvDayView({ day }: { day: number }) {
  const { data, complete } = useApp();
  const cal = data.settings.calendar;
  const plan = dhivehiPlan(cal.length);
  const d = plan.find((x) => x.day === day);
  const [traced, setTraced] = useState(false);
  if (!d) return <NotFound what="Dhivehi day" back={{ href: "/dhivehi/", label: "Learn Dhivehi" }} />;
  const game = dvGameById(d.game)!;
  const done = has(data.completions, "dhivehi", dvDayId(day));

  if (!isDayOpen(cal, day)) {
    const date = dateOfDay(cal, day);
    return (
      <div className="stack-lg">
        <PageHeader title={`Dhivehi day ${day}`} back={{ href: "/dhivehi/", label: "Learn Dhivehi" }} />
        <SpeechBubble who="hilmy">This day opens {date ? `on ${formatDate(date)}` : "soon"}. You can still play all the Dhivehi games!</SpeechBubble>
        <Link className="btn block" href="/dhivehi/">
          All Dhivehi games
        </Link>
      </div>
    );
  }

  const next = plan.find((x) => x.day === day + 1);
  return (
    <div className="stack-lg">
      <PageHeader title={`Day ${day} · ${d.title}`} back={{ href: "/dhivehi/", label: "Learn Dhivehi" }} />
      {d.letter && (
        <section className="stack" aria-labelledby="dv-meet">
          <h2 id="dv-meet" style={{ margin: 0 }}>
            1. Meet today&apos;s letter
          </h2>
          <LetterCard letter={d.letter} />
          <details className="card sky">
            <summary style={{ fontWeight: 700, cursor: "pointer", minHeight: 32 }}>Practise writing {d.letter.name}</summary>
            <div style={{ marginTop: 10 }}>
              <TraceBoard letter={d.letter} onTraced={() => setTraced(true)} />
              {traced && <p className="small" style={{ margin: "6px 0 0" }}>Lovely! You wrote {d.letter.name}.</p>}
            </div>
          </details>
        </section>
      )}
      <section className="stack" aria-labelledby="dv-play">
        <div className="spread">
          <h2 id="dv-play" style={{ margin: 0 }}>
            {d.letter ? "2. " : ""}
            {game.title}
          </h2>
          {done && (
            <span className="pill done">
              <Icon name="check" size={14} strokeWidth={3} /> Done
            </span>
          )}
        </div>
        <p className="small muted" style={{ margin: 0 }}>
          {game.howToPlay.join(" ")}
        </p>
        <DvGamePlayer game={d.game} focus={d.letter} onFinish={() => complete("dhivehi", dvDayId(day), { day })} />
      </section>
      {next ? (
        <Link href={`/dhivehi/day/${next.day}/`} className="btn ghost block">
          Day {next.day}: {next.title} <Icon name="arrowRight" size={20} />
        </Link>
      ) : (
        <Link href="/rewards/eid/" className="btn gold block">
          Eid celebration <Icon name="arrowRight" size={20} />
        </Link>
      )}
      <Link href="/dhivehi/" className="btn ghost block">
        All Dhivehi days
      </Link>
    </div>
  );
}
