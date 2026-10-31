"use client";

import { useState } from "react";
import { Illustration } from "@/components/art/Illustration";
import { gameById, memoryCards } from "@/content/games";
import { createDeck, flipCard, memoryDone, pick, type MemoryState } from "@/game-engine/engine";
import { Feedback, GameDone, GameFrame, HowToPlay, useFinishGame, useSfx } from "./GameFrame";

const newGame = (pairs: number): MemoryState => ({ deck: createDeck(pick(memoryCards, pairs).map((c) => c.id)), open: [], moves: 0 });

export function MemoryGame({ day }: { day: { id: string; day: number } | null }) {
  const game = gameById("memory-cards")!;
  const [pairs, setPairs] = useState(6);
  const [s, setS] = useState(() => newGame(6));
  const [finished, setFinished] = useState(false);
  const finish = useFinishGame("memory-cards", { day });
  const sfx = useSfx();
  const info = (id: string) => memoryCards.find((c) => c.id === id)!;
  const matchedPairs = s.deck.filter((c) => c.matched).length / 2;

  const restart = (n = pairs) => {
    setPairs(n);
    setS(newGame(n));
    setFinished(false);
  };

  const tap = async (key: number) => {
    const next = flipCard(s, key);
    if (next === s) return;
    setS(next);
    const newlyMatched = next.deck.filter((c) => c.matched).length > s.deck.filter((c) => c.matched).length;
    sfx(newlyMatched ? "correct" : "flip");
    if (memoryDone(next)) {
      setFinished(true);
      await finish();
    }
  };

  const pairOpen = s.open.length === 2;

  return (
    <GameFrame game={game} progress={finished ? undefined : `${matchedPairs} of ${pairs} pairs found`} dayId={day?.id} onRestart={() => restart()}>
      {finished ? (
        <GameDone message={`You found all ${pairs} pairs in ${s.moves} tries. Great memory!`} onReplay={() => restart()} dayId={day?.id} />
      ) : (
        <div className="stack">
          <HowToPlay game={game} />
          <div className="row" role="group" aria-label="Number of cards">
            {[4, 6, 8].map((n) => (
              <button key={n} className="choice" style={{ flex: 1, fontSize: "0.95rem" }} aria-pressed={pairs === n} onClick={() => restart(n)}>
                {n * 2} cards
              </button>
            ))}
          </div>
          <div className="grid-3 wide-4" style={{ gridTemplateColumns: pairs === 8 ? "repeat(4, minmax(0,1fr))" : undefined }}>
            {s.deck.map((c, idx) => {
              const faceUp = c.matched || s.open.includes(c.key);
              const it = info(c.pairId);
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => tap(c.key)}
                  className="tile"
                  style={{ minHeight: 92, padding: 6, background: faceUp ? (c.matched ? "var(--success-bg)" : "#fff") : "var(--teal)", boxShadow: c.matched ? "none" : undefined }}
                  aria-label={faceUp ? `${it.label}${c.matched ? ", matched" : ""}` : `Card ${idx + 1}, face down`}
                  aria-pressed={faceUp}
                >
                  {faceUp ? (
                    <>
                      <Illustration name={it.illustration} size={48} />
                      <span style={{ fontSize: "0.75rem" }}>
                        {c.matched && "✓ "}
                        {it.label}
                      </span>
                    </>
                  ) : (
                    <span aria-hidden="true" style={{ fontSize: "1.8rem", color: "var(--gold)" }}>
                      ☾
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {pairOpen && <Feedback kind="retry">Not a match this time. Tap another card to keep going.</Feedback>}
        </div>
      )}
    </GameFrame>
  );
}
