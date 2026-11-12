"use client";

import { useState } from "react";
import type { CheckQuestion } from "@/content/types";
import { playSound } from "@/accessibility/sound";
import { useApp } from "@/state/AppState";
import { Icon } from "../Icon";

/**
 * "Story check" / "Quick check": short questions at the end of a story or lesson.
 * Try again as many times as you like; the right answer is always explained. No stars or scores.
 */
export function CheckQuiz({ title, questions, testId }: { title: string; questions: CheckQuestion[]; testId?: string }) {
  const { data } = useApp();
  const [i, setI] = useState(0);
  const [wrong, setWrong] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);
  const [finished, setFinished] = useState(false);
  if (!questions.length) return null;
  const q = questions[i];
  const sfx = (s: Parameters<typeof playSound>[0]) => data.settings.soundOn && playSound(s);

  const choose = (k: number) => {
    if (solved || wrong.includes(k)) return;
    if (k === q.answer) {
      setSolved(true);
      sfx("correct");
    } else {
      setWrong([...wrong, k]);
      sfx("try-again");
    }
  };

  return (
    <section className="card sky stack check-quiz" aria-labelledby={`${testId ?? "check"}-h`} data-testid={testId}>
      <h2 id={`${testId ?? "check"}-h`} className="row" style={{ gap: 8, margin: 0 }}>
        <Icon name="sparkle" size={22} /> {title}
      </h2>
      {finished ? (
        <p className="pop" role="status" style={{ margin: 0, fontWeight: 700 }}>
          Well done! You remembered so much.
        </p>
      ) : (
        <>
          {questions.length > 1 && (
            <p className="small muted" style={{ margin: 0 }}>
              Question {i + 1} of {questions.length}
            </p>
          )}
          <p style={{ margin: 0, fontWeight: 800, fontSize: "1.1rem" }} id={`${testId ?? "check"}-q`}>
            {q.question}
          </p>
          <div className="stack" role="group" aria-labelledby={`${testId ?? "check"}-q`} style={{ gap: 8 }}>
            {q.options.map((o, k) => {
              const right = solved && k === q.answer;
              const isWrong = wrong.includes(k);
              return (
                <button key={o} type="button" className={`check-option${right ? " right" : ""}${isWrong ? " wrong" : ""}`} aria-disabled={isWrong || (solved && !right)} onClick={() => choose(k)}>
                  <span aria-hidden="true" className="quiz-letter">
                    {right ? <Icon name="check" size={16} strokeWidth={3} /> : isWrong ? <Icon name="close" size={16} strokeWidth={3} /> : ["A", "B", "C"][k]}
                  </span>
                  {o}
                  {right && <span className="sr-only">, correct</span>}
                  {isWrong && <span className="sr-only">, not this one</span>}
                </button>
              );
            })}
          </div>
          {wrong.length > 0 && !solved && (
            <p className="small" role="status" style={{ margin: 0 }}>
              Not quite! Have another go.
            </p>
          )}
          {solved && (
            <>
              <p className="notice pop" role="status" style={{ margin: 0, background: "var(--success-bg)", color: "var(--success-text)" }}>
                <strong>That&apos;s right!</strong> {q.explanation}
              </p>
              <button
                type="button"
                className="btn block"
                onClick={() => {
                  if (i + 1 < questions.length) {
                    setI(i + 1);
                    setWrong([]);
                    setSolved(false);
                  } else {
                    setFinished(true);
                    sfx("celebrate");
                  }
                }}
              >
                {i + 1 < questions.length ? "Next question" : "Done"} <Icon name="arrowRight" size={18} />
              </button>
            </>
          )}
        </>
      )}
    </section>
  );
}
