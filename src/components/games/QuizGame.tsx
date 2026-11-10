"use client";

import { VoiceButton } from "@/components/VoiceButton";
import { rid } from "@/recordings/ids";
import { useState } from "react";
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
          <div className="speech">
            <Amina size={72} expression={solved ? "cheer" : "think"} />
            <div className="bubble" style={{ fontSize: "1.2rem", fontWeight: 700 }}>
              <VoiceButton compact id={rid.quizQuestion(set.id, q.id)} label="Hear the question" className="bubble-voice" />
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
                  {opt}
                  {isRight && <span className="sr-only">, correct</span>}
                  {isWrong && <span className="sr-only">, not this one</span>}
                </button>
              );
            })}
          </div>
          {wrong.length > 0 && !solved && <Feedback kind="retry">Not quite — that&apos;s okay! Have another go.</Feedback>}
          {solved && (
            <>
              <Feedback kind="good">
                <strong>That&apos;s right!</strong> {q.explanation}
              </Feedback>
              <VoiceButton id={rid.quizAnswer(set.id, q.id)} label="Listen to why" />
              <button className="btn block" onClick={next} data-autofocus>
                {i + 1 < qs.length ? "Next question" : "Finish"} <Icon name="arrowRight" size={20} />
              </button>
            </>
          )}
        </div>
      )}
    </GameFrame>
  );
}
