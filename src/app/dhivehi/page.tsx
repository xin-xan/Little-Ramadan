"use client";

import Link from "next/link";
import { PageHeader, SpeechBubble } from "@/components/ui";
import { Dv } from "@/components/dhivehi/DvGames";
import { DvPicture } from "@/components/dhivehi/DvPicture";
import { Icon } from "@/components/Icon";
import { DV_GAMES, dhivehiPlan, dvDayId, dvGameById, dvPlayId } from "@/content/dhivehi";
import { calendarStatus, isDayOpen } from "@/storage/calendar";
import { has } from "@/storage/rewards";
import { useApp } from "@/state/AppState";

/** Learn Dhivehi: one activity for each day of Ramadan, plus every game to play freely. */
export default function DhivehiPage() {
  const { data } = useApp();
  const cal = data.settings.calendar;
  const plan = dhivehiPlan(cal.length);
  const status = calendarStatus(cal);
  const done = (d: number) => has(data.completions, "dhivehi", dvDayId(d));
  const doneCount = plan.filter((d) => done(d.day)).length;
  // Today's day during Ramadan; otherwise the first day not done yet.
  const today = status.mode === "during" ? plan[status.day - 1] : (plan.find((d) => !done(d.day) && isDayOpen(cal, d.day)) ?? plan[0]);

  return (
    <div className="stack-lg">
      <PageHeader title="Learn Dhivehi" back={{ href: "/home/", label: "Home" }} />
      <SpeechBubble who="amina">
        Let&apos;s learn Dhivehi together! There is one new letter or game for each day of Ramadan. You can play every game whenever you like.
      </SpeechBubble>

      <Link href={`/dhivehi/day/${today.day}/`} className="card emerald row dv-today" data-testid="dv-today">
        <div className="dv-today-letter" aria-hidden="true">
          {today.letter ? <Dv>{today.letter.char}</Dv> : <DvPicture name={dvGameById(today.game)!.picture} size={56} />}
        </div>
        <div className="grow">
          <p className="eyebrow" style={{ margin: 0 }}>
            {status.mode === "during" ? "Today" : "Next up"} · Day {today.day}
          </p>
          <strong style={{ fontSize: "1.2rem", display: "block" }}>{today.title}</strong>
          <span>{dvGameById(today.game)!.title}</span>
        </div>
        <Icon name="next" />
      </Link>

      <section className="stack" aria-labelledby="dv-days-h">
        <div className="spread">
          <h2 id="dv-days-h" style={{ margin: 0 }}>
            My {cal.length} Dhivehi days
          </h2>
          <span className="pill">
            {doneCount} of {plan.length} done
          </span>
        </div>
        <ol className="dv-days" data-testid="dv-days">
          {plan.map((d) => {
            const open = isDayOpen(cal, d.day);
            const isDone = done(d.day);
            const label = `Day ${d.day}: ${d.title}${isDone ? ", done" : open ? "" : ", opens later"}`;
            return (
              <li key={d.day}>
                {open ? (
                  <Link href={`/dhivehi/day/${d.day}/`} className={`dv-day${isDone ? " done" : ""}`} aria-label={label}>
                    <span className="dv-day-n">{d.day}</span>
                    <span className="dv-day-glyph">{d.letter ? <Dv>{d.letter.char}</Dv> : <Icon name="star" size={20} />}</span>
                    {isDone && <Icon name="check" size={14} strokeWidth={3} className="dv-day-tick" />}
                  </Link>
                ) : (
                  <span className="dv-day locked" aria-label={label}>
                    <span className="dv-day-n">{d.day}</span>
                    <Icon name="lock" size={18} />
                  </span>
                )}
              </li>
            );
          })}
        </ol>
        <p className="small muted" style={{ margin: 0 }}>
          Days 1 to 24 each bring a new Thaana letter. Then come review days, and the last day is all about Eid words. Missed a day? No problem: come back any time.
        </p>
      </section>

      <section className="stack" aria-labelledby="dv-games-h">
        <h2 id="dv-games-h">All Dhivehi games</h2>
        <div className="grid-2">
          {DV_GAMES.map((g) => {
            const played = has(data.completions, "dhivehi", dvPlayId(g.id));
            return (
              <Link key={g.id} href={`/dhivehi/play/${g.id}/`} className={`dv-game-tile tone-${g.tone}`}>
                <DvPicture name={g.picture} size={52} />
                <strong>{g.title}</strong>
                <span className="small">{g.description}</span>
                {played && (
                  <span className="pill done" style={{ alignSelf: "flex-start" }}>
                    <Icon name="check" size={12} strokeWidth={3} /> Played
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </section>
      <p className="small muted center">Dhivehi words are being checked by a Dhivehi teacher. Ask a grown-up if you have questions.</p>
    </div>
  );
}
