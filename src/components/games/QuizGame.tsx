"use client";

import { useRef, useState } from "react";
import { ListenButton, useAutoRead } from "../Listen";
import { segmentsFrom, toSpoken, type Segment } from "@/accessibility/narration";
import { Amina } from "@/characters/Characters";
import { gameById } from "@/content/games";
import type { QuizSet } from "@/content/types";
import { prepareQuiz } from "@/game-engine/engine";
import { Feedback, GameDone, GameFrame, useFinishGame, useSfx } from "./GameFrame";
import { Icon } from "../Icon";

export function QuizGame({ set, day }: { set: QuizSet; day: { id: string; day: number } | null }) {
  const game = gameById("quiz")!;
  const [qs, setQs] = useState(() => prepareQuiz(set.questions));
  const [i, setI] = useState(0);
  const [wrong, setWrong] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);
  const [done, setDone] = useState(false);
  const finish = useFinishGame("quiz", { quizSetId: set.id, day });
  const sfx = useSfx();
  const q = qs[i];
  const askRef = useRef<HTMLDivElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  // Read the question the way a person would ask it: "...? Is it A, B, or C?"
  const askScript = (): Segment[] => {
    const root = askRef.current;
    if (!root) return [];
    const qEl = root.querySelector("#quiz-question");
    const segs = qEl ? segmentsFrom(qEl) : [];
    const opts = [...root.querySelectorAll<HTMLElement>("[data-narrate='read']")];
    opts.forEach((el, k) => {
      const t = (el.textContent ?? "").trim();
      // "The ninth month" -> "the ninth month", but keep names like "Ramadan" as they are.
      const lower = /^(The|A|An|To|In|On|At|By|For|With|Being|Saying|Helping|Sharing|Giving|Telling|Eating|Reading)\b/.test(t) ? t.charAt(0).toLowerCase() + t.slice(1) : t;
      const spoken = toSpoken(k === 0 ? `Is it ${lower},` : k === opts.length - 1 ? `or ${lower}?` : `${lower},`);
      const range = document.createRange();
      range.selectNodeContents(el);
      segs.push({ text: t, spoken, range, block: segs[0]?.block ?? 1 });
    });
    return segs;
  };
  // Then the gentle feedback after each try.
  useAutoRead(askScript, `${set.id}:${i}:${qs.length}`, "quiz", !done);
  useAutoRead(feedbackRef, `${i}:${solved}:${wrong.length}`, "quiz", !done && (solved || wrong.length > 0));

  const restart = () => {
    setQs(prepareQuiz(set.questions));
    setI(0);
    setWrong([]);
    setSolved(false);
    setDone(false);
  };

  const choose = (idx: number) => {
    if (solved || wrong.includes(idx)) return;
    if (idx === q.correct) {
      setSolved(true);
      sfx("correct");
    } else {
      setWrong((w) => [...w, idx]);
      sfx("try-again");
    }
  };

  const next = async () => {
    if (i + 1 < qs.length) {
      setI(i + 1);
      setWrong([]);
      setSolved(false);
    } else {
      setDone(true);
      await finish();
    }
  };

  return (
    <GameFrame game={game} title={set.title} progress={done ? undefined : `Question ${i + 1} of ${qs.length}`} dayId={day?.id} onRestart={restart}>
      {done ? (
        <GameDone message={`You answered all ${qs.length} questions about ${set.title.toLowerCase()}. You learned something new today!`} onReplay={restart} dayId={day?.id} />
      ) : (
        <div className="stack">
          <div ref={askRef} className="stack">
          <div className="speech">
            <Amina size={72} expression={solved ? "cheer" : "think"} />
            <div className="bubble" style={{ fontSize: "1.2rem", fontWeight: 700 }}>
              <ListenButton compact build={askScript} narrationKey="quiz" label="Hear the question" className="bubble-listen" />
              <span id="quiz-question">{q.question}</span>
            </div>
          </div>
          <div className="stack" role="group" aria-labelledby="quiz-question" data-testid="answers">
            {q.shown.map((opt, idx) => {
              const isRight = solved && idx === q.correct;
              const isWrong = wrong.includes(idx);
              return (
                <button
                  key={opt}
                  className="btn ghost block"
                  style={{
                    justifyContent: "flex-start",
                    textAlign: "left",
                    fontSize: "1.1rem",
                    background: isRight ? "var(--success-bg)" : isWrong ? "#f3f0ea" : "#fff",
                    borderColor: isRight ? "var(--success-text)" : undefined,
                    color: isWrong ? "var(--muted)" : undefined,
                  }}
                  aria-disabled={isWrong || (solved && !isRight)}
                  onClick={() => choose(idx)}
                >
                  <span aria-hidden="true" className="quiz-letter">
                    {isRight ? <Icon name="check" size={16} strokeWidth={3} /> : isWrong ? <Icon name="close" size={16} strokeWidth={3} /> : ["A", "B", "C"][idx]}
                  </span>
                  <span data-narrate="read">{opt}</span>
                  {isRight && <span className="sr-only">, correct</span>}
                  {isWrong && <span className="sr-only">, not this one</span>}
                </button>
              );
            })}
          </div>
          </div>
          <div ref={feedbackRef} className="stack">
          {wrong.length > 0 && !solved && <Feedback kind="retry">Not quite — that&apos;s okay! Have another go.</Feedback>}
          {solved && (
            <>
              <Feedback kind="good">
                <strong>That&apos;s right!</strong> {q.explanation}
              </Feedback>
            </>
          )}
          </div>
          {solved && (
            <button className="btn block" onClick={next} data-autofocus>
              {i + 1 < qs.length ? "Next question" : "Finish"} <Icon name="arrowRight" size={20} />
            </button>
          )}
        </div>
      )}
    </GameFrame>
  );
}
