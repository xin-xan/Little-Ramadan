"use client";

import { useState } from "react";
import { Illustration } from "@/components/art/Illustration";
import { gameById, sortCards } from "@/content/games";
import { pick, shuffle } from "@/game-engine/engine";
import { Feedback, GameDone, GameFrame, HowToPlay, useFinishGame, useSfx } from "./GameFrame";

const PER_ROUND = 8;

function newDeck() {
  const helpful = sortCards.filter((c) => c.helpful);
  const other = sortCards.filter((c) => !c.helpful);
  return shuffle([...pick(helpful, PER_ROUND / 2), ...pick(other, PER_ROUND / 2)]);
}

/** Sort actions into kind choices and ones we could choose better. Gentle, never shaming. */
export function SortGame({ day }: { day: { id: string; day: number } | null }) {
  const game = gameById("sort-deeds")!;
  const [deck, setDeck] = useState(newDeck);
  const [i, setI] = useState(0);
  const [answer, setAnswer] = useState<null | boolean>(null);
  const [done, setDone] = useState(false);
  const [kind, setKind] = useState<string[]>([]);
  const [better, setBetter] = useState<string[]>([]);
  const finish = useFinishGame("sort-deeds", { day });
  const sfx = useSfx();
  const card = deck[i];

  const restart = () => {
    setDeck(newDeck());
    setI(0);
    setAnswer(null);
    setDone(false);
    setKind([]);
    setBetter([]);
  };

  const choose = (helpful: boolean) => {
    if (answer !== null) return;
    setAnswer(helpful);
    sfx(helpful === card.helpful ? "correct" : "try-again");
    (card.helpful ? setKind : setBetter)((xs) => [...xs, card.text]);
  };

  return (
    <GameFrame game={game} progress={done ? undefined : `Card ${i + 1} of ${deck.length}`} dayId={day?.id} onRestart={restart}>
      {done ? (
        <GameDone message="You sorted all the cards. Thinking about our choices helps us be kind!" onReplay={restart} dayId={day?.id}>
          <div className="grid-2" style={{ textAlign: "left" }}>
            <div className="card" style={{ background: "var(--success-bg)" }}>
              <strong>💚 Kind choices</strong>
              <ul className="small" style={{ paddingLeft: 18, margin: 0 }}>
                {kind.map((k) => (
                  <li key={k}>{k}</li>
                ))}
              </ul>
            </div>
            <div className="card" style={{ background: "#fff1cc" }}>
              <strong>🤔 Could choose better</strong>
              <ul className="small" style={{ paddingLeft: 18, margin: 0 }}>
                {better.map((k) => (
                  <li key={k}>{k}</li>
                ))}
              </ul>
            </div>
          </div>
        </GameDone>
      ) : (
        <div className="stack">
          <HowToPlay game={game} />
          <div className="card center stack" style={{ minHeight: 200 }}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Illustration name={card.illustration} size={100} />
            </div>
            <p style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }} id="sort-card">
              {card.text}
            </p>
          </div>
          <div className="grid-2" role="group" aria-labelledby="sort-card">
            <button className="btn block" style={{ background: "var(--teal)", minHeight: 72 }} onClick={() => choose(true)} aria-disabled={answer !== null}>
              💚 Kind choice
            </button>
            <button className="btn block" style={{ background: "#8a5a00", minHeight: 72 }} onClick={() => choose(false)} aria-disabled={answer !== null}>
              🤔 Could choose better
            </button>
          </div>
          {answer !== null && (
            <>
              <Feedback kind={answer === card.helpful ? "good" : "info"}>
                {answer === card.helpful ? <strong>Good thinking! </strong> : <strong>Let&apos;s think about it together. </strong>}
                {card.explanation}
              </Feedback>
              <button
                className="btn block"
                data-autofocus
                onClick={async () => {
                  if (i + 1 < deck.length) {
                    setI(i + 1);
                    setAnswer(null);
                  } else {
                    setDone(true);
                    await finish();
                  }
                }}
              >
                {i + 1 < deck.length ? "Next card →" : "Finish"}
              </button>
            </>
          )}
        </div>
      )}
    </GameFrame>
  );
}
