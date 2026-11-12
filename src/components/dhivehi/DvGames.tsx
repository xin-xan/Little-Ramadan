"use client";

import { VoiceButton } from "@/components/VoiceButton";
import { rid } from "@/recordings/ids";
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { Amina, Hilmy } from "@/characters/Characters";
import { Feedback, useSfx } from "@/components/games/GameFrame";
import { Icon } from "@/components/Icon";
import { LETTERS, WORDS, wordById, type DvGameId, type DvLetter } from "@/content/dhivehi";
import { bubbleRound, buildWordRounds, colourQuestions, countQuestions, filiQuestions, findWordQuestions, firstLetterQuestions, memoryCards, ramadanWordQuestions, sumQuestions, type DvQuestion } from "@/game-engine/dhivehi";
import { shuffle } from "@/game-engine/engine";
import { ColourSwatch, DvPicture } from "./DvPicture";

/** Thaana text: right-to-left, in the Thaana font, and skipped by the English voice. */
export function Dv({ children, size, className = "" }: { children: ReactNode; size?: string; className?: string }) {
  // A Thaana letter on its own is small for its font size, so single letters are drawn larger.
  const single = typeof children === "string" && [...children].length === 1;
  const fontSize = size ? (single ? `calc(${size} * 1.7)` : size) : single ? "1.7em" : undefined;
  return (
    <span lang="dv" dir="rtl" className={`thaana${single ? " thaana-letter" : ""} ${className}`} style={fontSize ? { fontSize } : undefined}>
      {children}
    </span>
  );
}

/** Dhivehi font for canvas drawing (the same as the .thaana CSS class). */
const DV_FONT = `"Faruma Thaana", "Noto Sans Thaana", sans-serif`;
const noop = () => () => {};
/** Games are shuffled on the device, so they render only after the page has loaded. */
function useClient() {
  return useSyncExternalStore(noop, () => true, () => false);
}

function Done({ message, onAgain, children }: { message: string; onAgain(): void; children?: ReactNode }) {
  return (
    <div className="card gold stack center" role="status">
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Hilmy size={84} expression="cheer" />
      </div>
      <h2>Well done!</h2>
      <p>{message}</p>
      {children}
      <button className="btn ghost block" onClick={onAgain}>
        <Icon name="refresh" /> Play again
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Multiple-choice games (find the word, first letter, count, colours, fili, sums, Ramadan words)

function questionsFor(game: DvGameId, focus?: DvLetter): DvQuestion[] {
  switch (game) {
    case "find-word":
      return findWordQuestions(Math.random, focus);
    case "first-letter":
      return firstLetterQuestions(Math.random, focus);
    case "count":
      return countQuestions();
    case "colours":
      return colourQuestions();
    case "fili":
      return filiQuestions(Math.random, focus);
    case "sums":
      return sumQuestions();
    default:
      return ramadanWordQuestions();
  }
}

function ChoiceGame({ game, focus, onFinish }: { game: DvGameId; focus?: DvLetter; onFinish(): void }) {
  const [qs, setQs] = useState(() => questionsFor(game, focus));
  const [i, setI] = useState(0);
  const [wrong, setWrong] = useState<string[]>([]);
  const [solved, setSolved] = useState(false);
  const [done, setDone] = useState(false);
  const sfx = useSfx();
  const q = qs[i];

  const restart = () => {
    setQs(questionsFor(game, focus));
    setI(0);
    setWrong([]);
    setSolved(false);
    setDone(false);
  };
  if (done) return <Done message={`You answered all ${qs.length}. You are learning Dhivehi!`} onAgain={restart} />;

  return (
    <div className="stack">
      <p className="small muted center" aria-live="polite" style={{ margin: 0 }}>
        Question {i + 1} of {qs.length}
      </p>
      <div className="card stack center dv-prompt">
        {q.colour ? <ColourSwatch colour={q.colour} size={110} label="the colour to name" /> : null}
        {q.count ? (
          <div className="dv-count" aria-label={q.sum ? q.sum : `${q.count} pictures`}>
            {Array.from({ length: q.count }, (_, k) => (
              <span key={k} className="pop" style={{ animationDelay: `${k * 50}ms` }}>
                <DvPicture name={q.picture!} size={(q.count ?? 0) > 6 ? 36 : 44} />
              </span>
            ))}
          </div>
        ) : q.picture ? (
          <DvPicture name={q.picture} size={120} />
        ) : null}
        {q.sum && <p className="dv-sum">{q.sum} = ?</p>}
        {q.dv && (
          <p style={{ margin: 0 }}>
            <Dv size={q.options[0].dv ? "2.4rem" : "4rem"}>{q.dv}</Dv>
            {q.dvSub && <span className="small muted" style={{ display: "block" }}>{q.dvSub}</span>}
          </p>
        )}
        {q.dv && WORDS.some((w) => w.dv === q.dv) && <VoiceButton id={rid.dvWord(WORDS.find((w) => w.dv === q.dv)!.id)} label="Hear the word" />}
        <div className="row" style={{ justifyContent: "center", gap: 8 }}>
          <p style={{ margin: 0, fontWeight: 800, fontSize: "1.1rem" }} id="dv-ask">
            {q.ask}
          </p>
        </div>
      </div>
      <div className="dv-options" role="group" aria-labelledby="dv-ask" data-testid="dv-answers">
        {q.options.map((o) => {
          const isRight = solved && o.correct;
          const isWrong = wrong.includes(o.key);
          return (
            <button
              key={o.key}
              type="button"
              className={`dv-option${isRight ? " right" : ""}${isWrong ? " wrong" : ""}`}
              aria-disabled={isWrong || (solved && !isRight)}
              aria-label={`${o.speak}${isRight ? ", correct" : isWrong ? ", not this one" : ""}`}
              onClick={() => {
                if (solved || isWrong) return;
                if (o.correct) {
                  setSolved(true);
                  sfx("correct");
                } else {
                  setWrong((w) => [...w, o.key]);
                  sfx("try-again");
                }
              }}
            >
              {o.dv && <Dv size="1.7rem">{o.dv}</Dv>}
              {o.sub && <span className={o.dv ? "dv-sub" : "dv-sound"}>{o.sub}</span>}
            </button>
          );
        })}
      </div>
      <div>
        {wrong.length > 0 && !solved && <Feedback kind="retry">Not quite, that&apos;s okay! Have another go.</Feedback>}
        {solved && (
          <Feedback kind="good">
            <strong>That&apos;s right!</strong> {q.explain}
          </Feedback>
        )}
      </div>
      {solved && (
        <button
          className="btn block"
          data-autofocus
          onClick={() => {
            if (i + 1 < qs.length) {
              setI(i + 1);
              setWrong([]);
              setSolved(false);
            } else {
              setDone(true);
              onFinish();
            }
          }}
        >
          {i + 1 < qs.length ? "Next" : "Finish"} <Icon name="arrowRight" size={20} />
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Letter bubbles

function BubblesGame({ focus, onFinish }: { focus?: DvLetter; onFinish(): void }) {
  const [targets] = useState(() => {
    const others = shuffle(LETTERS.filter((l) => l !== focus));
    return focus ? [focus, others[0], others[1]] : others.slice(0, 3);
  });
  const [round, setRound] = useState(0);
  const [bubbles, setBubbles] = useState(() => bubbleRound(targets[0].char));
  const [popped, setPopped] = useState<number[]>([]);
  const [shake, setShake] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const sfx = useSfx();
  const target = targets[round];
  const found = bubbles.filter((b) => popped.includes(b.id) && b.char === target.char).length;
  const need = bubbles.filter((b) => b.char === target.char).length;
  const ask = `Pop every bubble with the letter ${target.name}.`;

  if (done)
    return (
      <Done
        message="You found every letter!"
        onAgain={() => {
          setRound(0);
          setBubbles(bubbleRound(targets[0].char));
          setPopped([]);
          setDone(false);
        }}
      />
    );
  return (
    <div className="stack">
      <div className="card stack center">
        <p className="small muted" style={{ margin: 0 }}>
          Round {round + 1} of {targets.length} · {found} of {need} found
        </p>
        <div className="row" style={{ justifyContent: "center" }} data-testid="dv-target" data-name={target.name}>
          <Dv size="3.4rem">{target.char}</Dv>
          <span style={{ fontWeight: 800, fontSize: "1.2rem" }}>{target.name}</span>
        </div>
        <p style={{ margin: 0 }}>{ask}</p>
      </div>
      <div className="dv-bubbles" data-testid="dv-bubbles">
        {bubbles.map((b, k) => {
          const isPopped = popped.includes(b.id);
          return (
            <button
              key={b.id}
              type="button"
              className={`dv-bubble tone-${k % 4}${isPopped ? " popped" : ""}${shake === b.id ? " shake" : ""}`}
              aria-label={isPopped ? "Popped" : `Bubble ${LETTERS.find((l) => l.char === b.char)?.name ?? ""}`}
              disabled={isPopped}
              onClick={() => {
                if (b.char === target.char) {
                  sfx("correct");
                  const next = [...popped, b.id];
                  setPopped(next);
                  if (bubbles.filter((x) => x.char === target.char).every((x) => next.includes(x.id))) {
                    window.setTimeout(() => {
                      if (round + 1 < targets.length) {
                        setRound(round + 1);
                        setBubbles(bubbleRound(targets[round + 1].char));
                        setPopped([]);
                      } else {
                        setDone(true);
                        onFinish();
                      }
                    }, 700);
                  }
                } else {
                  sfx("try-again");
                  setShake(b.id);
                  window.setTimeout(() => setShake(null), 450);
                }
              }}
            >
              {!isPopped && <Dv>{b.char}</Dv>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Memory match

function MemoryGame({ focus, onFinish }: { focus?: DvLetter; onFinish(): void }) {
  const [cards, setCards] = useState(() => memoryCards(Math.random, focus));
  const [open, setOpen] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const sfx = useSfx();
  const ask = "Turn over two cards. Find each picture and its Dhivehi word.";
  if (done)
    return (
      <Done
        message="You matched them all!"
        onAgain={() => {
          setCards(memoryCards(Math.random, focus));
          setOpen([]);
          setMatched([]);
          setDone(false);
        }}
      />
    );
  return (
    <div className="stack">
      <div className="row" style={{ justifyContent: "center" }}>
        <p style={{ margin: 0, fontWeight: 700 }}>{ask}</p>
      </div>
      <div className="dv-memory" data-testid="dv-memory">
        {cards.map((c) => {
          const shown = open.includes(c.id) || matched.includes(c.pair);
          return (
            <button
              key={c.id}
              type="button"
              className={`dv-card${shown ? " shown" : ""}${matched.includes(c.pair) ? " matched" : ""}`}
              aria-label={shown ? (c.kind === "picture" ? `Picture: ${c.word.en}` : `Word: ${c.word.roman}`) : "Hidden card"}
              data-pair={c.pair}
              onClick={() => {
                if (shown || open.length >= 2) return;
                sfx("flip");
                const next = [...open, c.id];
                setOpen(next);
                if (next.length === 2) {
                  const [a, b] = next.map((id) => cards.find((x) => x.id === id)!);
                  window.setTimeout(() => {
                    if (a.pair === b.pair) {
                      sfx("correct");
                      const m = [...matched, a.pair];
                      setMatched(m);
                      if (m.length === cards.length / 2) {
                        setDone(true);
                        onFinish();
                      }
                    }
                    setOpen([]);
                  }, a.pair === b.pair ? 350 : 900);
                }
              }}
            >
              {shown ? (
                c.kind === "picture" ? (
                  <DvPicture name={c.word.picture!} size={54} />
                ) : (
                  <span className="stack center" style={{ gap: 0 }}>
                    <Dv size="1.4rem">{c.word.dv}</Dv>
                    <span className="dv-sub">{c.word.roman}</span>
                  </span>
                )
              ) : (
                <span aria-hidden="true" className="dv-card-back">
                  ?
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Build the word

function BuildWordGame({ focus, onFinish }: { focus?: DvLetter; onFinish(): void }) {
  const [rounds, setRounds] = useState(() => buildWordRounds(Math.random, focus));
  const [r, setR] = useState(0);
  const [placed, setPlaced] = useState<number[]>([]);
  const [shakeId, setShakeId] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const sfx = useSfx();
  const round = rounds[r];
  const complete = placed.length === round.pieces.length;
  if (done)
    return (
      <Done
        message="You built every word!"
        onAgain={() => {
          setRounds(buildWordRounds(Math.random, focus));
          setR(0);
          setPlaced([]);
          setDone(false);
        }}
      />
    );
  return (
    <div className="stack">
      <p className="small muted center" style={{ margin: 0 }}>
        Word {r + 1} of {rounds.length}
      </p>
      <div className="card stack center">
        <DvPicture name={round.word.picture!} size={104} />
        <div className="row" style={{ justifyContent: "center" }}>
          <p style={{ margin: 0, fontWeight: 800 }}>
            Write “{round.word.roman}” ({round.word.en})
          </p>
        </div>
        <p className="small muted" style={{ margin: 0 }}>
          Tap the pieces in order, starting on the right.
        </p>
        <div className="dv-slots" dir="rtl" aria-label={`${placed.length} of ${round.pieces.length} pieces placed`}>
          {round.pieces.map((p, k) => (
            <span key={k} className={`dv-slot${k < placed.length ? " filled" : ""}`}>
              {k < placed.length ? <Dv>{p}</Dv> : null}
            </span>
          ))}
        </div>
        <p className="small muted" style={{ margin: 0 }}>
          Thaana is written from right to left.
        </p>
      </div>
      {!complete ? (
        <div className="dv-pieces" dir="rtl" data-testid="dv-pieces">
          {round.shuffled.map((p) => {
            const used = placed.includes(p.id);
            return (
              <button
                key={p.id}
                type="button"
                className={`dv-piece${used ? " used" : ""}${shakeId === p.id ? " shake" : ""}`}
                disabled={used}
                aria-label={`Piece ${p.text}`}
                data-index={p.id}
                onClick={() => {
                  const want = placed.length;
                  // Pieces that look the same are interchangeable.
                  if (round.pieces[want] === p.text) {
                    sfx("tap");
                    setPlaced([...placed, p.id]);
                    if (want + 1 === round.pieces.length) sfx("correct");
                  } else {
                    sfx("try-again");
                    setShakeId(p.id);
                    window.setTimeout(() => setShakeId(null), 450);
                  }
                }}
              >
                <Dv>{p.text}</Dv>
              </button>
            );
          })}
        </div>
      ) : (
        <>
          <Feedback kind="good">
            <strong>You wrote it!</strong> <Dv>{round.word.dv}</Dv> ({round.word.roman}) means {round.word.en}.
          </Feedback>
          <button
            className="btn block"
            data-autofocus
            onClick={() => {
              if (r + 1 < rounds.length) {
                setR(r + 1);
                setPlaced([]);
              } else {
                setDone(true);
                onFinish();
              }
            }}
          >
            {r + 1 < rounds.length ? "Next word" : "Finish"} <Icon name="arrowRight" size={20} />
          </button>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Trace the letter

/** A drawing pad with a grey letter to trace. Calls onTraced once most of the letter is covered. */
export function TraceBoard({ letter, onTraced }: { letter: DvLetter; onTraced(): void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskRef = useRef<{ data: Uint8ClampedArray; total: number; w: number; h: number } | null>(null);
  const [progress, setProgress] = useState(0);
  const [traced, setTraced] = useState(false);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const firedRef = useRef(false);
  const sfx = useSfx();

  // A fresh pad when the letter changes or Clear is tapped.
  const [tick, setTick] = useState(0);
  const [shownFor, setShownFor] = useState(letter.char);
  if (shownFor !== letter.char) {
    setShownFor(letter.char);
    setProgress(0);
    setTraced(false);
  }

  useEffect(() => {
    firedRef.current = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    const paintGuide = async () => {
      try {
        await document.fonts?.load(`700 200px ${DV_FONT}`, letter.char);
      } catch {
        /* the system font is used */
      }
      if (cancelled) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      // Size the letter so it fills most of the pad, whatever its shape.
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      ctx.font = `700 100px ${DV_FONT}`;
      const m0 = ctx.measureText(letter.char);
      const gw = Math.max(1, m0.actualBoundingBoxLeft + m0.actualBoundingBoxRight);
      const gh = Math.max(1, m0.actualBoundingBoxAscent + m0.actualBoundingBoxDescent);
      const scale = Math.min((w * 0.7) / gw, (h * 0.7) / gh);
      const px = Math.round(100 * scale);
      const font = `700 ${px}px ${DV_FONT}`;
      const x = w / 2 - ((m0.actualBoundingBoxRight - m0.actualBoundingBoxLeft) / 2) * scale;
      const y = h / 2 + ((m0.actualBoundingBoxAscent - m0.actualBoundingBoxDescent) / 2) * scale;
      ctx.font = font;
      ctx.fillStyle = "#e6dcc6";
      ctx.fillText(letter.char, x, y);
      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = "#b9a97f";
      ctx.lineWidth = 1.5;
      ctx.strokeText(letter.char, x, y);
      ctx.setLineDash([]);
      // Mask of the letter (slightly thinned) to measure how much has been traced.
      const m = document.createElement("canvas");
      m.width = w;
      m.height = h;
      const mc = m.getContext("2d");
      if (!mc) return;
      mc.font = font;
      mc.textAlign = "left";
      mc.textBaseline = "alphabetic";
      mc.fillStyle = "#000";
      mc.fillText(letter.char, x, y);
      const data = mc.getImageData(0, 0, w, h).data;
      let total = 0;
      for (let i = 3; i < data.length; i += 4 * 3) if (data[i] > 128) total++;
      maskRef.current = { data, total: Math.max(1, total), w, h };
    };
    void paintGuide();
    return () => {
      cancelled = true;
    };
  }, [letter.char, tick]);

  const measure = () => {
    const canvas = canvasRef.current;
    const mask = maskRef.current;
    if (!canvas || !mask) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = canvas.width / mask.w;
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let hit = 0;
    let ink = 0;
    let stray = 0;
    for (let i = 3; i < mask.data.length; i += 4 * 3) {
      const p = (i - 3) / 4;
      const x = p % mask.w;
      const y = Math.floor(p / mask.w);
      const j = (Math.floor(y * dpr) * canvas.width + Math.floor(x * dpr)) * 4;
      // Child's ink is green: high G, low R.
      const inked = img[j + 1] > 140 && img[j] < 120;
      if (!inked) continue;
      ink++;
      if (mask.data[i] > 128) hit++;
      else stray++;
    }
    // Most of the letter covered, and not just scribbled all over the pad.
    const tidy = ink === 0 || stray <= mask.total * 4;
    const pct = tidy ? Math.min(1, hit / mask.total / 0.7) : Math.min(0.9, hit / mask.total / 0.7);
    setProgress(pct);
    if (pct >= 1 && !firedRef.current) {
      firedRef.current = true;
      setTraced(true);
      sfx("correct");
      onTraced();
    }
  };

  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const stroke = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = "#2fae5f";
    ctx.lineWidth = Math.max(20, (canvasRef.current?.clientHeight ?? 260) * 0.1);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  };

  const clear = () => {
    setProgress(0);
    setTraced(false);
    firedRef.current = false;
    setTick((t) => t + 1);
  };

  return (
    <div className="stack">
      <canvas
        key={`${letter.char}-${tick}`}
        ref={canvasRef}
        className={`dv-trace${traced ? " traced" : ""}`}
        aria-label={`Drawing pad. Trace the letter ${letter.name} with your finger.`}
        role="img"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          drawing.current = true;
          const p = point(e);
          last.current = p;
          stroke(p, { x: p.x + 0.1, y: p.y + 0.1 });
        }}
        onPointerMove={(e) => {
          if (!drawing.current || !last.current) return;
          const p = point(e);
          stroke(last.current, p);
          last.current = p;
        }}
        onPointerUp={() => {
          drawing.current = false;
          last.current = null;
          measure();
        }}
        onPointerCancel={() => {
          drawing.current = false;
          last.current = null;
        }}
      />
      <div className="dv-trace-bar" aria-hidden="true">
        <span style={{ width: `${Math.round(progress * 100)}%` }} />
      </div>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <span className="small muted" role="status">
          {traced ? "Beautiful writing!" : progress >= 0.9 ? "Nearly! Try to stay on the letter." : "Trace the letter with your finger."}
        </span>
        <button type="button" className="btn ghost small" onClick={clear}>
          <Icon name="refresh" size={18} /> Clear
        </button>
      </div>
    </div>
  );
}

function TraceGame({ focus, onFinish }: { focus?: DvLetter; onFinish(): void }) {
  const start = focus ? LETTERS.indexOf(focus) : 0;
  const [idx, setIdx] = useState(start);
  const [count, setCount] = useState(0);
  const [traced, setTraced] = useState(false);
  const [done, setDone] = useState(false);
  const letter = LETTERS[idx];
  const goal = 3;
  if (done)
    return (
      <Done
        message={`You traced ${goal} letters. Beautiful writing!`}
        onAgain={() => {
          setCount(0);
          setTraced(false);
          setDone(false);
        }}
      />
    );
  return (
    <div className="stack">
      <div className="row" style={{ justifyContent: "space-between" }}>
        {/* Thaana reads right to left, so the next letter is on the left. */}
        <button type="button" className="icon-btn" aria-label="Next letter" onClick={() => { setIdx((idx + 1) % LETTERS.length); setTraced(false); }}>
          <Icon name="back" />
        </button>
        <div className="stack center" style={{ gap: 0 }}>
          <Dv size="2rem">{letter.char}</Dv>
          <strong>{letter.name}</strong>
        </div>
        <button type="button" className="icon-btn" aria-label="Previous letter" onClick={() => { setIdx((idx + LETTERS.length - 1) % LETTERS.length); setTraced(false); }}>
          <Icon name="next" />
        </button>
      </div>
      <p className="center" style={{ margin: 0 }}>
        Thaana letters are written from right to left.
      </p>
      <p className="small muted center" style={{ margin: 0 }}>
        {Math.min(count, goal)} of {goal} letters traced
      </p>
      <TraceBoard
        letter={letter}
        onTraced={() => {
          setTraced(true);
          setCount((c) => c + 1);
        }}
      />
      {traced && (
        <button
          className="btn block"
          data-autofocus
          onClick={() => {
            if (count >= goal) {
              setDone(true);
              onFinish();
            } else {
              setIdx((idx + 1) % LETTERS.length);
              setTraced(false);
            }
          }}
        >
          {count >= goal ? "Finish" : "Next letter"} <Icon name="arrowRight" size={20} />
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Meet the letters

/** A letter card: the letter, its name, its sound and a word that uses it. */
export function LetterCard({ letter }: { letter: DvLetter }) {
  const ex = letter.example ? wordById(letter.example.wordId) : undefined;
  return (
    <div className="card stack center dv-letter-card" data-testid="dv-letter-card">
      <div className="row" style={{ justifyContent: "center", gap: 14 }}>
        <Dv size="5rem" className="dv-big">
          {letter.char}
        </Dv>
        <div className="stack" style={{ gap: 2, textAlign: "left" }}>
          <strong style={{ fontSize: "1.4rem" }}>{letter.name}</strong>
          <span className="muted">Sound: “{letter.sound}”</span>
        </div>
        <VoiceButton compact id={rid.dvLetter(letter.name)} label={`Hear ${letter.name}`} />
      </div>
      {ex ? (
        <div className="row" style={{ justifyContent: "center" }}>
          {ex.picture ? <DvPicture name={ex.picture} size={64} /> : ex.colour ? <ColourSwatch colour={ex.colour} size={64} /> : null}
          <div className="stack" style={{ gap: 0 }}>
            <Dv size="1.8rem">{ex.dv}</Dv>
            <span className="small">
              {ex.roman} · {ex.en}
            </span>
            {letter.example?.contains && <span className="small muted">({letter.name} is inside this word)</span>}
          </div>
          <VoiceButton compact id={rid.dvWord(ex.id)} label={`Hear ${ex.roman}`} />
        </div>
      ) : (
        <p className="small muted" style={{ margin: 0 }}>
          This letter is used in only a few words.
        </p>
      )}
    </div>
  );
}

function LettersGame({ onFinish }: { onFinish(): void }) {
  const [sel, setSel] = useState(0);
  const [seen, setSeen] = useState<number[]>([0]);
  const [finished, setFinished] = useState(false);
  const goal = 6;
  return (
    <div className="stack">
      <LetterCard letter={LETTERS[sel]} />
      <p className="small muted center" style={{ margin: 0 }}>
        {finished ? "You met lots of letters! Keep exploring." : `Tap ${Math.max(0, goal - seen.length)} more letters to finish.`}
      </p>
      <div className="dv-letter-grid" dir="rtl" data-testid="dv-letter-grid">
        {LETTERS.map((l, k) => (
          <button
            key={l.char}
            type="button"
            className={`dv-letter${k === sel ? " on" : ""}${seen.includes(k) ? " seen" : ""}`}
            aria-label={l.name}
            aria-pressed={k === sel}
            onClick={() => {
              setSel(k);
              if (!seen.includes(k)) {
                const next = [...seen, k];
                setSeen(next);
                if (next.length >= goal && !finished) {
                  setFinished(true);
                  onFinish();
                }
              }
            }}
          >
            <Dv>{l.char}</Dv>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------

/** Plays one Learn Dhivehi game. `focus` makes it practise the letter of the day. */
export function DvGamePlayer({ game, focus, onFinish }: { game: DvGameId; focus?: DvLetter; onFinish(): void }) {
  const client = useClient();
  if (!client)
    return (
      <div className="card center" style={{ minHeight: 200 }}>
        <Amina size={72} expression="think" />
      </div>
    );
  switch (game) {
    case "letters":
      return <LettersGame onFinish={onFinish} />;
    case "trace":
      return <TraceGame focus={focus} onFinish={onFinish} />;
    case "bubbles":
      return <BubblesGame focus={focus} onFinish={onFinish} />;
    case "memory":
      return <MemoryGame focus={focus} onFinish={onFinish} />;
    case "build-word":
      return <BuildWordGame focus={focus} onFinish={onFinish} />;
    default:
      return <ChoiceGame key={game} game={game} focus={focus} onFinish={onFinish} />;
  }
}
