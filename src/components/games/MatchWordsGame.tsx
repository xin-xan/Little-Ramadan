"use client";

import { useState } from "react";
import { Illustration } from "@/components/art/Illustration";
import { gameById, pictureWords } from "@/content/games";
import { pick, shuffle } from "@/game-engine/engine";
import { Feedback, GameDone, GameFrame, HowToPlay, useFinishGame, useSfx } from "./GameFrame";

const PAIRS = 4;
type Item = (typeof pictureWords)[number];

function newRound() {
  const items = pick(pictureWords, PAIRS);
  return { words: shuffle(items), pictures: shuffle(items) };
}

/** Tap a word, then tap its picture. Tap-only — no dragging needed. */
export function MatchWordsGame({ day }: { day: { id: string; day: number } | null }) {
  const game = gameById("match-words")!;
  const [round, setRound] = useState(newRound);
  const [selected, setSelected] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [msg, setMsg] = useState<{ kind: "good" | "retry" | "info"; text: string } | null>(null);
  const [done, setDone] = useState(false);
  const finish = useFinishGame("match-words", { day });
  const sfx = useSfx();

  const restart = () => {
    setRound(newRound());
    setSelected(null);
    setMatched([]);
    setMsg(null);
    setDone(false);
  };

  const tapPicture = async (p: Item) => {
    if (matched.includes(p.id)) return;
    if (!selected) return setMsg({ kind: "info", text: "First tap a word, then tap its picture." });
    if (selected === p.id) {
      const m = [...matched, p.id];
      setMatched(m);
      setSelected(null);
      setMsg({ kind: "good", text: `${p.word}! ${p.hint}` });
      sfx("correct");
      if (m.length === PAIRS) {
        setDone(true);
        await finish();
      }
    } else {
      setMsg({ kind: "retry", text: "Not that one — try another picture!" });
      sfx("try-again");
    }
  };

  return (
    <GameFrame game={game} progress={done ? undefined : `${matched.length} of ${PAIRS} matched`} dayId={day?.id} onRestart={restart}>
      {done ? (
        <GameDone message="You matched all the words to their pictures!" onReplay={restart} dayId={day?.id} />
      ) : (
        <div className="stack">
          <HowToPlay game={game} />
          <div className="grid-2" style={{ alignItems: "start" }}>
            <div className="stack" role="group" aria-label="Words">
              <strong className="center">Words</strong>
              {round.words.map((w) => {
                const isDone = matched.includes(w.id);
                return (
                  <button
                    key={w.id}
                    className="btn block"
                    style={{ background: isDone ? "var(--success-bg)" : selected === w.id ? "var(--gold)" : "var(--teal)", color: isDone ? "var(--success-text)" : selected === w.id ? "var(--emerald)" : "#fff", minHeight: 88 }}
                    aria-pressed={selected === w.id}
                    aria-disabled={isDone}
                    onClick={() => {
                      if (isDone) return;
                      setSelected(w.id);
                      setMsg(null);
                      sfx("tap");
                    }}
                  >
                    {isDone && "✓ "}
                    {w.word}
                  </button>
                );
              })}
            </div>
            <div className="stack" role="group" aria-label="Pictures">
              <strong className="center">Pictures</strong>
              {round.pictures.map((p) => {
                const isDone = matched.includes(p.id);
                return (
                  <button key={p.id} className="tile" style={{ minHeight: 88, padding: 4, background: isDone ? "var(--success-bg)" : undefined }} onClick={() => tapPicture(p)} aria-label={isDone ? `${p.picture}, matched with ${p.word}` : `Picture of ${p.picture}`} aria-disabled={isDone}>
                    <Illustration name={p.illustration} size={60} />
                    {isDone && <span className="small">✓ {p.word}</span>}
                  </button>
                );
              })}
            </div>
          </div>
          {msg && <Feedback kind={msg.kind}>{msg.text}</Feedback>}
        </div>
      )}
    </GameFrame>
  );
}
