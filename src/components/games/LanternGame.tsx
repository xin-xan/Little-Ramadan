"use client";

import { useState } from "react";
import { LanternArt } from "@/components/art/Illustration";
import { gameById, lanternDesigns } from "@/content/games";
import { makeLanternRound, type LanternRound } from "@/game-engine/engine";
import { Feedback, GameDone, GameFrame, HowToPlay, useFinishGame, useSfx } from "./GameFrame";
import { Icon } from "../Icon";

type Design = (typeof lanternDesigns)[number];
const LEVELS = [3, 4, 5]; // lanterns per round — grows gently
const OPTIONS = 3;

function LanternPic({ d, size = 64 }: { d: Design; size?: number }) {
  return (
    <svg viewBox="-24 -20 48 80" width={size * 0.7} height={size} aria-hidden="true">
      <LanternArt x={0} y={0} s={1} body={d.body} glow={d.glow} />
      {d.shape === "star" && <polygon points="0,14 3,22 11,22 5,27 7,35 0,30 -7,35 -5,27 -11,22 -3,22" fill="#fff" opacity="0.85" />}
      {d.shape === "diamond" && <polygon points="0,14 8,26 0,38 -8,26" fill="#fff" opacity="0.8" />}
      {d.shape === "round" && <circle cx="0" cy="26" r="8" fill="#fff" opacity="0.8" />}
      {d.shape === "tall" && <rect x="-3" y="12" width="6" height="28" rx="3" fill="#fff" opacity="0.8" />}
    </svg>
  );
}

export function LanternGame({ day }: { day: { id: string; day: number } | null }) {
  const game = gameById("missing-lantern")!;
  const [level, setLevel] = useState(0);
  const [round, setRound] = useState<LanternRound<Design>>(() => makeLanternRound(lanternDesigns, LEVELS[0], OPTIONS));
  const [phase, setPhase] = useState<"look" | "guess" | "right">("look");
  const [wrong, setWrong] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const finish = useFinishGame("missing-lantern", { day });
  const sfx = useSfx();
  const missing = round.shown[round.missingIndex];

  const start = (lv: number) => {
    setLevel(lv);
    setRound(makeLanternRound(lanternDesigns, LEVELS[lv], OPTIONS));
    setPhase("look");
    setWrong([]);
  };
  const restart = () => {
    setDone(false);
    start(0);
  };

  return (
    <GameFrame game={game} progress={done ? undefined : `Round ${level + 1} of ${LEVELS.length}`} dayId={day?.id} onRestart={restart}>
      {done ? (
        <GameDone message="You found every missing lantern. What sharp eyes!" onReplay={restart} dayId={day?.id} />
      ) : (
        <div className="stack">
          <HowToPlay game={game} />
          <p className="center" style={{ fontWeight: 700, fontSize: "1.1rem" }}>
            {phase === "look" ? "Look carefully at these lanterns. Take your time!" : phase === "guess" ? "One lantern has gone! Which one is missing?" : "You found it!"}
          </p>
          <ol className="card emerald" style={{ display: "flex", justifyContent: "center", gap: 8, listStyle: "none", margin: 0, padding: 16, minHeight: 130, flexWrap: "wrap" }} aria-label="Lanterns on the string">
            {round.shown.map((d, idx) => {
              const gone = phase === "guess" && idx === round.missingIndex;
              return (
                <li key={d.id} style={{ width: 60, display: "flex", flexDirection: "column", alignItems: "center" }} aria-label={gone ? "Empty space — a lantern is missing here" : d.name}>
                  {gone ? (
                    <div style={{ width: 44, height: 64, border: "3px dashed var(--gold)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gold)", fontSize: "1.5rem" }} aria-hidden="true">
                      ?
                    </div>
                  ) : (
                    <LanternPic d={d} />
                  )}
                </li>
              );
            })}
          </ol>
          {phase === "look" && (
            <button className="btn gold block" onClick={() => setPhase("guess")}>
              I&apos;m ready!
            </button>
          )}
          {phase !== "look" && (
            <div className="grid-3" role="group" aria-label="Which lantern is missing?">
              {round.options.map((d) => {
                const isWrong = wrong.includes(d.id);
                const isRight = phase === "right" && d.id === missing.id;
                return (
                  <button
                    key={d.id}
                    className="tile"
                    style={{ minHeight: 120, background: isRight ? "var(--success-bg)" : isWrong ? "#f3f0ea" : undefined }}
                    aria-label={`${d.name}${isWrong ? ", not this one" : isRight ? ", correct" : ""}`}
                    aria-disabled={isWrong || phase === "right"}
                    onClick={() => {
                      if (phase === "right" || isWrong) return;
                      if (d.id === missing.id) {
                        setPhase("right");
                        sfx("correct");
                      } else {
                        setWrong((w) => [...w, d.id]);
                        sfx("try-again");
                      }
                    }}
                  >
                    <LanternPic d={d} size={64} />
                    <span className="small">
                      {isRight ? <Icon name="check" size={14} strokeWidth={3} /> : isWrong ? <Icon name="close" size={14} strokeWidth={3} /> : null}{" "}
                      {d.name}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          {phase === "guess" && wrong.length > 0 && (
            <Feedback kind="retry">
              Not that one. Have another look!{" "}
              <button className="btn ghost small" onClick={() => { setPhase("look"); }}>
                Peek again
              </button>
            </Feedback>
          )}
          {phase === "right" && (
            <>
              <Feedback kind="good">Yes! The {missing.name} was missing.</Feedback>
              <button
                className="btn block"
                data-autofocus
                onClick={async () => {
                  if (level + 1 < LEVELS.length) start(level + 1);
                  else {
                    setDone(true);
                    await finish();
                  }
                }}
              >
                {level + 1 < LEVELS.length ? "Next round" : "Finish"} <Icon name="arrowRight" size={20} />
              </button>
            </>
          )}
        </div>
      )}
    </GameFrame>
  );
}
