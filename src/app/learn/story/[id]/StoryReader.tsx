"use client";

import { VoiceButton } from "@/components/VoiceButton";
import { rid } from "@/recordings/ids";
import Link from "next/link";
import { useRef, useState } from "react";
import { BackToDay } from "@/components/activities/BackToDay";
import { useDayParam } from "@/components/activities/useDayParam";
import { CheckQuiz } from "@/components/activities/CheckQuiz";
import { FeelingsCheck } from "@/components/activities/FeelingsCheck";
import { TapPicture } from "@/components/activities/TapPicture";
import { NotFound, PageHeader } from "@/components/ui";
import { STAR_VALUES } from "@/content/copy";
import { storyById } from "@/content/stories";
import { has } from "@/storage/rewards";
import { useApp } from "@/state/AppState";
import { Icon } from "@/components/Icon";

/** Paged story reader. No autoplay: the child turns each page. */
export function StoryReader({ id }: { id: string }) {
  const { data, complete } = useApp();
  const from = useDayParam();
  const story = storyById(id);
  const [page, setPage] = useState(0);
  const textRef = useRef<HTMLDivElement>(null);
  if (!story) return <NotFound what="story" back={{ href: "/learn/", label: "Knowledge Garden" }} />;
  const done = has(data.completions, "story", story.id);
  const last = story.pages.length - 1;
  const atEnd = page > last;

  const turn = (to: number) => {
    setPage(to);
    requestAnimationFrame(() => textRef.current?.focus());
  };

  return (
    <article className="stack-lg">
      <PageHeader title={story.title} back={from ? { href: `/journey/${from.id}/`, label: "today's mission" } : { href: "/learn/", label: "Knowledge Garden" }} />
      {page === 0 && <p className="pill" style={{ alignSelf: "flex-start" }}>A story about {story.value.toLowerCase()}</p>}
      {!atEnd ? (
        <>
          <div className="card stack center" style={{ minHeight: 320 }}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <TapPicture key={page} name={story.pages[page].illustration} size={170} label={`Picture for page ${page + 1}`} />
            </div>
            <div ref={textRef} tabIndex={-1} aria-live="polite" className="reader-text" style={{ outline: "none" }}>
              {story.pages[page].text}
            </div>
            <VoiceButton id={rid.storyPage(story.id, page)} />
          </div>
          <p className="center small muted" aria-hidden="true">
            Page {page + 1} of {story.pages.length}
          </p>
          <div className="row">
            <button className="btn ghost" onClick={() => turn(page - 1)} disabled={page === 0} aria-label="Previous page" style={{ flex: 1 }} data-sound="page">
              <Icon name="back" /> Back
            </button>
            <button className="btn" data-sound="page" onClick={() => turn(page + 1)} style={{ flex: 2 }} aria-label={page === last ? "Finish the story" : `Next page, ${page + 2} of ${story.pages.length}`}>
              {page === last ? "The end" : "Next"} <Icon name={page === last ? "check" : "arrowRight"} size={20} />
            </button>
          </div>
        </>
      ) : (
        <>
        {story.questions && story.questions.length > 0 && <CheckQuiz title="Story check" questions={story.questions} testId="story-check" />}
        <FeelingsCheck />
        <div className="card gold stack center">
          <h2>The end!</h2>
          <p>
            This story was about <strong>{story.value.toLowerCase()}</strong>. What did you like about it?
          </p>
          {done ? (
            <p className="pill done" style={{ alignSelf: "center" }}>
              <Icon name="check" size={14} strokeWidth={3} /> Story read
            </p>
          ) : (
            <button className="btn gold block" onClick={() => complete("story", story.id, { day: from?.day })}>
              I read this story! (+{STAR_VALUES.story} stars)
            </button>
          )}
          <button className="btn ghost block" onClick={() => turn(0)}>
            Read it again
          </button>
          {from ? <BackToDay dayId={from.id} /> : (
            <Link href="/learn/" className="btn block">
              More stories
            </Link>
          )}
        </div>
        </>
      )}
    </article>
  );
}
