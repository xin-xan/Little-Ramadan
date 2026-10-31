"use client";

import { useState } from "react";
import { Illustration } from "@/components/art/Illustration";
import { gameById, vocabulary } from "@/content/games";
import { makeChoiceRounds } from "@/game-engine/engine";
import { Feedback, GameDone, GameFrame, HowToPlay, useFinishGame, useSfx } from "./GameFrame";

const ROUNDS = 6;

export function VocabGame({ day }: { day: { id: string; day: number } | null }) {
  const game = gameById("vocab-match")!;
  const [rounds, setRounds] = useState(() => makeChoiceRounds(vocabulary, ROUNDS, 3));
  const [i, setI] = useState(0);
  const [wrong, setWrong] = useState<string[]>([]);
  const [solved, setSolved] = useState(false);
  const [done, setDone] = useState(false);
  const finish = useFinishGame("vocab-match", { day });
  const sfx = useSfx();
  const r = rounds[i];

  const restart = () => {
    setRounds(makeChoiceRounds(vocabulary, ROUNDS, 3));
    setI(0);
    setWrong([]);
    setSolved(false);
    setDone(false);
  };

  return (
    <GameFrame game={game} progress={done ? undefined : `Word ${i + 1} of ${rounds.length}`} dayId={day?.id} onRestart={restart}>
      {done ? (
        <GameDone message="You matched every word to its meaning. Fantastic learning!" onReplay={restart} dayId={day?.id} />
      ) : (
        <div className="stack">
          <HowToPlay game={game} />
          <div className="card emerald center stack" style={{ gap: 4 }}>
            <span className="small">What does this word mean?</span>
            <strong style={{ fontSize: "2rem", color: "var(--gold)" }} id="vocab-word">
              {r.target.word}
            </strong>
          </div>
          <div className="stack" role="group" aria-labelledby="vocab-word" data-testid="answers">
            {r.options.map((o) => {
              const isRight = solved && o.id === r.target.id;
              const isWrong = wrong.includes(o.id);
              return (
                <button
                  key={o.id}
                  className="btn ghost block"
                  style={{ justifyContent: "flex-start", textAlign: "left", background: isRight ? "var(--success-bg)" : isWrong ? "#f3f0ea" : "#fff", color: isWrong ? "var(--muted)" : undefined }}
                  aria-disabled={isWrong || solved}
                  onClick={() => {
                    if (solved || isWrong) return;
                    if (o.id === r.target.id) {
                      setSolved(true);
                      sfx("correct");
                    } else {
                      setWrong((w) => [...w, o.id]);
                      sfx("try-again");
                    }
                  }}
                >
                  <span aria-hidden="true">{isRight ? "✓" : isWrong ? "✗" : "•"}</span> {o.meaning}
                </button>
              );
            })}
          </div>
          {wrong.length > 0 && !solved && <Feedback kind="retry">Good try! Have another go.</Feedback>}
          {solved && (
            <>
              <Feedback kind="good">
                <span className="row" style={{ display: "inline-flex", verticalAlign: "middle" }}>
                  <Illustration name={r.target.illustration} size={40} />
                </span>{" "}
                <strong>{r.target.word}</strong> means “{r.target.meaning.toLowerCase()}”.
              </Feedback>
              <button
                className="btn block"
                data-autofocus
                onClick={async () => {
                  if (i + 1 < rounds.length) {
                    setI(i + 1);
                    setWrong([]);
                    setSolved(false);
                  } else {
                    setDone(true);
                    await finish();
                  }
                }}
              >
                {i + 1 < rounds.length ? "Next word →" : "Finish"}
              </button>
            </>
          )}
        </div>
      )}
    </GameFrame>
  );
}
