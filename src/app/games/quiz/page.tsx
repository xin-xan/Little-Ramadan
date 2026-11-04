"use client";

import Link from "next/link";
import { Illustration } from "@/components/art/Illustration";
import { PageHeader } from "@/components/ui";
import { quizSets } from "@/content/quizzes";
import { has } from "@/storage/rewards";
import { useApp } from "@/state/AppState";
import { Icon } from "@/components/Icon";

export default function QuizListPage() {
  const { data } = useApp();
  return (
    <div className="stack-lg">
      <PageHeader title="Ramadan Quiz" back={{ href: "/games/", label: "Puzzle Palace" }} />
      <p>Pick a quiz. Each one has {quizSets[0].questions.length} questions with 3 answers to choose from.</p>
      <ul className="stack" style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {quizSets.map((q) => {
          const done = has(data.completions, "quiz", q.id);
          return (
            <li key={q.id}>
              <Link href={`/games/quiz/${q.id}/`} className="list-link">
                <Illustration name={q.illustration} size={52} />
                <span className="grow">
                  <strong>{q.title}</strong>
                  <span className="small muted">{q.questions.length} questions</span>
                </span>
                <span className={`pill ${done ? "done" : ""}`}>{done ? <><Icon name="check" size={14} strokeWidth={3} /> Done</> : "Play"}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
