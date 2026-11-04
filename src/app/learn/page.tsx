"use client";

import Link from "next/link";
import { Amina } from "@/characters/Characters";
import { Illustration } from "@/components/art/Illustration";
import { PageHeader } from "@/components/ui";
import { lessons } from "@/content/lessons";
import { stories } from "@/content/stories";
import { has } from "@/storage/rewards";
import { useApp } from "@/state/AppState";
import { Icon } from "@/components/Icon";

export default function LearnPage() {
  const { data } = useApp();
  return (
    <div className="stack-lg">
      <PageHeader title="Knowledge Garden" back={{ href: "/home/", label: "Home" }} />
      <div className="speech">
        <Amina size={84} expression="happy" />
        <div className="bubble">
          <span className="who">Amina</span>
          Welcome to the Knowledge Garden! Pick a story or a lesson. Each one takes just a few minutes.
        </div>
      </div>

      <section className="stack" aria-labelledby="stories-h">
        <h2 id="stories-h">Stories</h2>
        <p className="small muted">Stories with Noor and Amina. They are made-up stories that show good values.</p>
        <ul className="stack" style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {stories.map((s) => {
            const done = has(data.completions, "story", s.id);
            return (
              <li key={s.id}>
                <Link href={`/learn/story/${s.id}/`} className="list-link">
                  <Illustration name={s.illustration} size={56} />
                  <span className="grow">
                    <strong>{s.title}</strong>
                    <span className="small muted">
                      {s.summary} · {s.minutes} min
                    </span>
                  </span>
                  <span className={`pill ${done ? "done" : ""}`}>{done ? <><Icon name="check" size={14} strokeWidth={3} /> Read</> : "New"}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="stack" aria-labelledby="lessons-h">
        <h2 id="lessons-h">Lessons</h2>
        <ul className="stack" style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {lessons.map((l) => {
            const done = has(data.completions, "lesson", l.id);
            return (
              <li key={l.id}>
                <Link href={`/learn/lesson/${l.id}/`} className="list-link">
                  <Illustration name={l.illustration} size={56} />
                  <span className="grow">
                    <strong>{l.title}</strong>
                    <span className="small muted">
                      {l.summary} · {l.minutes} min
                    </span>
                  </span>
                  <span className={`pill ${done ? "done" : ""}`}>{done ? <><Icon name="check" size={14} strokeWidth={3} /> Done</> : "New"}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
