"use client";

import { VoiceButton } from "@/components/VoiceButton";
import { rid } from "@/recordings/ids";
import Link from "next/link";
import { CharacterById } from "@/characters/Characters";
import { BackToDay } from "@/components/activities/BackToDay";
import { useDayParam } from "@/components/activities/useDayParam";
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
      {lesson.sections.map((s, i) => (
        <section key={s.heading} className="stack" style={{ gap: 4 }}>
          <h2>{s.heading}</h2>
          <p className="reader-text">{s.text}</p>
          <VoiceButton id={rid.lessonSection(lesson.id, i)} />
        </section>
      ))}
      <section className="stack" aria-labelledby="kw">
        <h2 id="kw">Words to know</h2>
        <VoiceButton id={rid.lessonWords(lesson.id)} />
        {lesson.keyWords.map((k) => (
          <p key={k.word} className="keyword" style={{ margin: 0 }}>
            <strong>{k.word}</strong> — {k.meaning}
          </p>
        ))}
      </section>
      <div className="card sky">
        <h2>Try this with your family</h2>
        <p style={{ margin: 0 }}>{lesson.tryThis}</p>
        <VoiceButton id={rid.lessonTry(lesson.id)} className="mt" />
      </div>
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
