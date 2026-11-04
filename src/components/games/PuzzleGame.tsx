"use client";

import { useState } from "react";
import { MosqueArt, PalmArt, StarArt, CrescentArt } from "@/components/art/Illustration";
import { gameById } from "@/content/games";
import { isSolved, scrambleTiles, swapTiles } from "@/game-engine/engine";
import { Feedback, GameDone, GameFrame, HowToPlay, useFinishGame, useSfx } from "./GameFrame";
import { Icon } from "../Icon";

/** The puzzle picture: the fictional village mosque at sunset. No sacred text is used. */
function PuzzlePicture() {
  return (
    <>
      <rect width="100" height="100" fill="#F59E6B" />
      <rect width="100" height="45" fill="#C86B8A" opacity="0.55" />
      <circle cx="80" cy="30" r="10" fill="#FFD27A" />
      <CrescentArt x={18} y={16} r={7} fill="#FFF1C2" />
      <StarArt x={36} y={10} r={3} fill="#fff" />
      <rect y="82" width="100" height="18" fill="#3A8FA8" />
      <g transform="translate(4 -2)">
        <MosqueArt ground={false} />
      </g>
      <rect y="84" width="100" height="16" fill="#F3DFB3" />
      <PalmArt x={92} y={86} s={0.55} />
      <PalmArt x={6} y={88} s={0.45} />
    </>
  );
}

function Tile({ piece, size }: { piece: number; size: number }) {
  const cell = 100 / size;
  const x = (piece % size) * cell;
  const y = Math.floor(piece / size) * cell;
  return (
    <svg viewBox={`${x} ${y} ${cell} ${cell}`} width="100%" height="100%" preserveAspectRatio="none" aria-hidden="true" style={{ display: "block" }}>
      <PuzzlePicture />
    </svg>
  );
}

const POSITION_NAMES: Record<number, string[]> = {
  2: ["top left", "top right", "bottom left", "bottom right"],
  3: ["top left", "top middle", "top right", "middle left", "centre", "middle right", "bottom left", "bottom middle", "bottom right"],
};

/** Tap one piece, then another, to swap them. Fully tap-based. */
export function PuzzleGame({ day }: { day: { id: string; day: number } | null }) {
  const game = gameById("mosque-puzzle")!;
  const [size, setSize] = useState(3);
  const [tiles, setTiles] = useState(() => scrambleTiles(9));
  const [sel, setSel] = useState<number | null>(null);
  const [peek, setPeek] = useState(false);
  const [done, setDone] = useState(false);
  const [moves, setMoves] = useState(0);
  const finish = useFinishGame("mosque-puzzle", { day });
  const sfx = useSfx();
  const names = POSITION_NAMES[size];
  const correct = tiles.filter((p, i) => p === i).length;

  const restart = (n = size) => {
    setSize(n);
    setTiles(scrambleTiles(n * n));
    setSel(null);
    setDone(false);
    setMoves(0);
  };

  const tap = async (pos: number) => {
    if (sel === null) {
      setSel(pos);
      sfx("tap");
      return;
    }
    if (sel === pos) return setSel(null);
    const next = swapTiles(tiles, sel, pos);
    setTiles(next);
    setSel(null);
    setMoves((m) => m + 1);
    sfx("flip");
    if (isSolved(next)) {
      sfx("correct");
      setDone(true);
      await finish();
    }
  };

  return (
    <GameFrame game={game} progress={done ? undefined : `${correct} of ${size * size} pieces in the right place`} dayId={day?.id} onRestart={() => restart()}>
      {done ? (
        <GameDone message={`You finished the mosque picture in ${moves} swaps!`} onReplay={() => restart()} dayId={day?.id}>
          <svg viewBox="0 0 100 100" width="100%" style={{ maxWidth: 260, alignSelf: "center", borderRadius: 16 }} role="img" aria-label="The finished picture: the village mosque at sunset">
            <PuzzlePicture />
          </svg>
        </GameDone>
      ) : (
        <div className="stack">
          <HowToPlay game={game} />
          <div className="row" role="group" aria-label="Puzzle size">
            {[2, 3].map((n) => (
              <button key={n} className="choice" style={{ flex: 1, fontSize: "0.95rem" }} aria-pressed={size === n} onClick={() => restart(n)}>
                {n === 2 ? "Easy (4 pieces)" : "Harder (9 pieces)"}
              </button>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${size}, 1fr)`, gap: 4, maxWidth: 420, width: "100%", margin: "0 auto", aspectRatio: "1" }} role="group" aria-label="Puzzle board">
            {tiles.map((piece, pos) => {
              const inPlace = piece === pos;
              return (
                <button
                  key={pos}
                  onClick={() => tap(pos)}
                  aria-pressed={sel === pos}
                  aria-label={`Position ${names[pos]}: piece from the ${names[piece]}${inPlace ? ", in the right place" : ""}${sel === pos ? ", selected" : ""}`}
                  style={{ position: "relative", padding: 0, border: sel === pos ? "4px solid var(--gold)" : "2px solid #fff", borderRadius: 8, overflow: "hidden", cursor: "pointer", background: "#fff", minHeight: 48 }}
                >
                  <Tile piece={piece} size={size} />
                  {inPlace && (
                    <span aria-hidden="true" style={{ position: "absolute", right: 4, bottom: 4, background: "var(--success-bg)", color: "var(--success-text)", borderRadius: 999, fontSize: "0.75rem", fontWeight: 800, padding: "0 6px" }}>
                      <Icon name="check" size={14} strokeWidth={3} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {sel !== null && <Feedback kind="info">Now tap the piece you want to swap with.</Feedback>}
          <button className="btn ghost block" onClick={() => setPeek((p) => !p)} aria-expanded={peek}>
            <Icon name="eye" /> {peek ? "Hide the picture" : "Peek at the finished picture"}
          </button>
          {peek && (
            <svg viewBox="0 0 100 100" width="100%" style={{ maxWidth: 220, alignSelf: "center", borderRadius: 12 }} role="img" aria-label="The finished picture: the village mosque at sunset">
              <PuzzlePicture />
            </svg>
          )}
        </div>
      )}
    </GameFrame>
  );
}
