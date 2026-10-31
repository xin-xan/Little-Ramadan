"use client";

import Link from "next/link";
import { useState } from "react";
import { MissionCard } from "@/components/activities/MissionCard";
import { Illustration } from "@/components/art/Illustration";
import { NotFound, PageHeader, SpeechBubble } from "@/components/ui";
import { STOPPING_MESSAGE } from "@/content/copy";
import { dayById } from "@/content/days";
import { gameById } from "@/content/games";
import { lessonById } from "@/content/lessons";
import { missionById } from "@/content/missions";
import { quizSetById } from "@/content/quizzes";
import { storyById } from "@/content/stories";
import { dateOfDay, daysFor, formatDate, isDayOpen } from "@/storage/calendar";
import { dayPartsDone } from "@/storage/rewards";
import { useApp } from "@/state/AppState";

function Step({ n, done, title, children }: { n: number; done: boolean; title: string; children: React.ReactNode }) {
  return (
    <section className="card stack" aria-labelledby={`step-${n}`}>
      <div className="spread">
        <h2 id={`step-${n}`} style={{ margin: 0, fontSize: "1.15rem" }}>
          {n}. {title}
        </h2>
        <span className={`pill ${done ? "done" : ""}`}>{done ? "✓ Done" : "To do"}</span>
      </div>
      {children}
    </section>
  );
}

export function DayView({ dayId }: { dayId: string }) {
  const { data, saveReflection } = useApp();
  const content = dayById(dayId);
  const cal = data.settings.calendar;
  const inJourney = daysFor(cal).find((d) => d.id === dayId);
  const saved = data.completions.find((c) => c.kind === "reflection" && c.contentId === dayId);
  const [reflection, setReflection] = useState(saved?.reflection ?? "");
  const [savedMsg, setSavedMsg] = useState(false);

  if (!content) return <NotFound what="day" back={{ href: "/journey/", label: "Journey" }} />;
  const dayNo = inJourney?.day ?? content.day;
  const isFinal = inJourney?.isFinal ?? false;

  if (inJourney && !isDayOpen(cal, dayNo)) {
    const date = dateOfDay(cal, dayNo);
    return (
      <div className="stack-lg">
        <PageHeader title={`Day ${dayNo}`} back={{ href: "/journey/", label: "Journey" }} />
        <SpeechBubble who="hilmy">
          This day opens {date ? `on ${formatDate(date)}` : "soon"}. Until then, you can read stories and play games in the village!
        </SpeechBubble>
        <Link className="btn block" href="/learn/">
          Go to Knowledge Garden
        </Link>
      </div>
    );
  }

  const parts = dayPartsDone(data.completions, dayId);
  const learn = content.learn.kind === "lesson" ? lessonById(content.learn.id) : storyById(content.learn.id);
  const mission = missionById(content.kindnessId);
  const game = gameById(content.play.game);
  const quiz = content.play.quizSetId ? quizSetById(content.play.quizSetId) : undefined;
  const allDone = parts.learn && parts.kindness && parts.play;
  const playHref = content.play.game === "quiz" && quiz ? `/games/quiz/${quiz.id}/?day=${dayId}` : `/games/${content.play.game}/?day=${dayId}`;
  const learnHref = content.learn.kind === "lesson" ? `/learn/lesson/${content.learn.id}/?day=${dayId}` : `/learn/story/${content.learn.id}/?day=${dayId}`;

  return (
    <div className="stack-lg">
      <PageHeader title={inJourney ? `Day ${dayNo} · ${content.theme}` : `Extra day · ${content.theme}`} back={{ href: "/journey/", label: "Journey" }} />
      <div className="card emerald row">
        <Illustration name={content.illustration} size={72} />
        <div>
          <p style={{ margin: 0, fontWeight: 800, color: "var(--gold)" }}>Today&apos;s mission</p>
          <p style={{ margin: 0, fontSize: "1.15rem" }}>{content.activity}</p>
        </div>
      </div>

      <Step n={1} done={parts.learn} title={content.learn.kind === "lesson" ? "Learn" : "Story time"}>
        {learn && (
          <Link href={learnHref} className="list-link">
            <Illustration name={learn.illustration} size={56} />
            <span className="grow">
              <strong>{learn.title}</strong>
              <span className="small muted">
                {learn.summary} · about {learn.minutes} min
              </span>
            </span>
            <span aria-hidden="true">›</span>
          </Link>
        )}
      </Step>

      <Step n={2} done={parts.kindness} title="Kindness mission">
        {mission && <MissionCard mission={mission} day={dayNo} />}
      </Step>

      <Step n={3} done={parts.play} title="Play">
        {game && (
          <Link href={playHref} className="list-link">
            <Illustration name={quiz?.illustration ?? game.illustration} size={56} />
            <span className="grow">
              <strong>{quiz ? `${game.title}: ${quiz.title}` : game.title}</strong>
              <span className="small muted">{game.description}</span>
            </span>
            <span aria-hidden="true">›</span>
          </Link>
        )}
      </Step>

      <section className="card lav stack" aria-labelledby="reflect-title">
        <h2 id="reflect-title" style={{ fontSize: "1.15rem", margin: 0 }}>
          💭 Think about it <span className="small muted">(optional)</span>
        </h2>
        <label htmlFor="day-reflection">{content.reflection}</label>
        <textarea id="day-reflection" className="input" maxLength={300} value={reflection} onChange={(e) => { setReflection(e.target.value); setSavedMsg(false); }} placeholder="Write a few words, or just think about it! Please don't write names or addresses." />
        <button
          className="btn secondary"
          disabled={!reflection.trim()}
          onClick={async () => {
            await saveReflection(dayId, dayNo, reflection);
            setSavedMsg(true);
          }}
        >
          Save my thought
        </button>
        {savedMsg && <p role="status" className="small">Saved privately on this device.</p>}
      </section>

      {allDone && (
        <div className="card gold stack center" role="status">
          <h2>🌟 Day {dayNo} complete!</h2>
          <p>{STOPPING_MESSAGE}</p>
        </div>
      )}

      {isFinal && (
        <section className="card emerald stack" aria-labelledby="final-title">
          <h2 id="final-title">🌙 The end of your Ramadan journey</h2>
          <p>Look back at everything you learned and all the kind things you did!</p>
          <Link className="btn gold block" href="/rewards/">
            See my achievements
          </Link>
          <Link className="btn gold block" href="/rewards/eid/">
            Eid celebration
          </Link>
          <Link className="btn gold block" href="/rewards/certificate/">
            My certificate
          </Link>
        </section>
      )}
    </div>
  );
}
