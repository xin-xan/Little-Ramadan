"use client";

import { VoiceButton } from "@/components/VoiceButton";
import { rid } from "@/recordings/ids";
import Link from "next/link";
import { CharacterById } from "@/characters/Characters";
import { BackToDay } from "@/components/activities/BackToDay";
import { useDayParam } from "@/components/activities/useDayParam";
import { CheckQuiz } from "@/components/activities/CheckQuiz";
import { FlipCards } from "@/components/activities/FlipCards";
import { useState } from "react";
import { Illustration } from "@/components/art/Illustration";
import { NotFound, PageHeader } from "@/components/ui";
import { STAR_VALUES } from "@/content/copy";
import { lessonById } from "@/content/lessons";
import { has } from "@/storage/rewards";
import { useApp } from "@/state/AppState";
import { Icon } from "@/components/Icon";

export function LessonReader({ id }: { id: string }) {
  const { data, complete } = useApp();
  const from = useDayParam();
  const lesson = lessonById(id);
  // Learn one part at a time (tap to learn more); grown-ups can show everything at once.
  const [shown, setShown] = useState(1);
  if (!lesson) return <NotFound what="lesson" back={{ href: "/learn/", label: "Knowledge Garden" }} />;
  const done = has(data.completions, "lesson", lesson.id);

  return (
    <article className="stack-lg">
      <PageHeader title={lesson.title} back={from ? { href: `/journey/${from.id}/`, label: "today's mission" } : { href: "/learn/", label: "Knowledge Garden" }} />
      <div className="card lav row">
        <CharacterById id={lesson.guide} size={80} />
        <div className="stack" style={{ gap: 8, flex: 1 }}>
          <p style={{ margin: 0, fontSize: "1.1rem" }}>{lesson.summary}</p>
          <VoiceButton id={rid.lessonSummary(lesson.id)} />
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Illustration name={lesson.illustration} size={140} label={lesson.title} />
      </div>
      <div className="lesson-steps" aria-hidden="true">
        {lesson.sections.map((s, i) => (
          <i key={s.heading} className={i < shown ? "on" : undefined} />
        ))}
      </div>
      {lesson.sections.slice(0, shown).map((s, i) => (
        <section key={s.heading} className="stack lesson-part" style={{ gap: 4 }}>
          <h2>{s.heading}</h2>
          <p className="reader-text">{s.text}</p>
          <VoiceButton id={rid.lessonSection(lesson.id, i)} />
        </section>
      ))}
      {shown < lesson.sections.length ? (
        <div className="stack" style={{ gap: 6 }}>
          <button className="btn block" onClick={() => setShown(shown + 1)} data-sound="page">
            Tap to learn more ({shown} of {lesson.sections.length}) <Icon name="arrowRight" size={20} />
          </button>
          <button className="link-btn small" onClick={() => setShown(lesson.sections.length)}>
            Show the whole lesson
          </button>
        </div>
      ) : (
        <>
          {lesson.keyWords.length > 0 && (
            <section className="stack lesson-part" aria-labelledby="kw">
              <h2 id="kw">Words to know</h2>
              <p className="small muted" style={{ margin: 0 }}>
                Tap a card to see what the word means.
              </p>
              <VoiceButton id={rid.lessonWords(lesson.id)} />
              <FlipCards words={lesson.keyWords} />
            </section>
          )}
          <div className="card sky lesson-part">
            <h2>Try this with your family</h2>
            <p style={{ margin: 0 }}>{lesson.tryThis}</p>
            <VoiceButton id={rid.lessonTry(lesson.id)} className="mt" />
          </div>
          {lesson.quickCheck && lesson.quickCheck.length > 0 && <CheckQuiz title="Quick check" questions={lesson.quickCheck} testId="quick-check" />}
        </>
      )}
      {done ? (
        <p className="pill done" style={{ alignSelf: "center", fontSize: "1rem" }}>
          <Icon name="check" size={14} strokeWidth={3} /> Lesson complete. You learned something new!
        </p>
      ) : (
        <button className="btn gold block" onClick={() => complete("lesson", lesson.id, { day: from?.day })}>
          I finished this lesson! (+{STAR_VALUES.lesson} stars)
        </button>
      )}
      {from ? <BackToDay dayId={from.id} /> : (
        <Link href="/learn/" className="btn ghost block">
          More lessons
        </Link>
      )}
      <p className="small muted center">Learning content is being checked by qualified teachers. Ask a grown-up if you have questions.</p>
    </article>
  );
}
