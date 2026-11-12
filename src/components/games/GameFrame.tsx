"use client";

import { VoiceButton } from "@/components/VoiceButton";
import { rid } from "@/recordings/ids";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { Hilmy, HilmyFlat } from "@/characters/Characters";
import { BackToDay } from "@/components/activities/BackToDay";
import { Sheet } from "@/components/ui";
import type { GameId, GameInfo } from "@/content/types";
import { useApp } from "@/state/AppState";
import { playSound, type SoundName } from "@/accessibility/sound";
import { Icon } from "../Icon";

/** Shared frame: title, progress, Pause (resume / how to play / start again / exit). No timers. */
export function GameFrame({ game, title, progress, dayId, onRestart, children }: { game: GameInfo; title?: string; progress?: string; dayId?: string; onRestart(): void; children: ReactNode }) {
  const [paused, setPaused] = useState(false);
  const exitHref = dayId ? `/journey/${dayId}/` : "/games/";
  return (
    <div className="stack-lg">
      <header className="page-header">
        <Link href={exitHref} className="icon-btn" aria-label={dayId ? "Exit game, back to today's mission" : "Exit game, back to Puzzle Palace"}>
          <Icon name="close" />
        </Link>
        <h1>{title ?? game.title}</h1>
        <VoiceButton compact id={rid.howToPlay(game.id)} label="Hear how to play" />
        <button type="button" className="icon-btn" onClick={() => setPaused(true)} aria-label="Pause">
          <Icon name="pause" />
        </button>
      </header>
      <GameCompanion />
      {progress && (
        <p className="small muted center" aria-live="polite" style={{ margin: "-8px 0 0" }}>
          {progress}
        </p>
      )}
      {children}
      <Sheet open={paused} onClose={() => setPaused(false)} labelledBy="pause-title">
        <div className="stack">
          <h2 id="pause-title">Paused</h2>
          <p className="muted">Take your time. There&apos;s no timer!</p>
          <h3>How to play</h3>
          <VoiceButton id={rid.howToPlay(game.id)} />
          <ol style={{ margin: 0 }}>
            {game.howToPlay.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ol>
          <button className="btn block" onClick={() => setPaused(false)} data-autofocus>
            <Icon name="play" /> Keep playing
          </button>
          <button
            className="btn ghost block"
            onClick={() => {
              onRestart();
              setPaused(false);
            }}
          >
            <Icon name="refresh" /> Start again
          </button>
          <Link className="btn ghost block" href={exitHref}>
            Exit game
          </Link>
        </div>
      </Sheet>
    </div>
  );
}

export function HowToPlay({ game }: { game: GameInfo }) {
  return (
    <details className="card sky">
      <summary style={{ fontWeight: 700, cursor: "pointer", minHeight: 32 }}>How to play</summary>
      <VoiceButton id={rid.howToPlay(game.id)} className="mt" />
      <ol style={{ marginBottom: 0 }}>
        {game.howToPlay.map((h) => (
          <li key={h}>{h}</li>
        ))}
      </ol>
    </details>
  );
}

/** Records finishing a game: explore-a-new-game star, quiz stars and the journey day's play step. */
export function useFinishGame(gameId: GameId, opts: { quizSetId?: string; day?: { id: string; day: number } | null }) {
  const { completeMany } = useApp();
  return () =>
    completeMany([
      { kind: "game", contentId: gameId, day: opts.day?.day },
      ...(opts.quizSetId ? [{ kind: "quiz" as const, contentId: opts.quizSetId, day: opts.day?.day }] : []),
      ...(opts.day ? [{ kind: "dayplay" as const, contentId: opts.day.id, day: opts.day.day }] : []),
    ]);
}

export function useSfx() {
  const { data } = useApp();
  return (name: SoundName) => {
    if (data.settings.soundOn) playSound(name);
    // Lets the game companion react to right and wrong answers in every game.
    if (name === "correct" || name === "try-again") window.dispatchEvent(new CustomEvent("lr-game-feedback", { detail: name }));
  };
}

const CHEERS = ["Brilliant!", "MashaAllah, well done!", "You got it!", "Super!", "Great thinking!", "Yes! Keep going!"];
const NUDGES = ["Nice try! Have another go.", "Almost! You can do it.", "Keep trying, you're learning!", "Good guess! Try again."];

/** Hilmy pops up to cheer right answers and encourage after a wrong one (every game, sound or not). */
export function GameCompanion() {
  const [say, setSay] = useState<{ text: string; good: boolean; n: number } | null>(null);
  useEffect(() => {
    let n = 0;
    let timer = 0;
    const onFeedback = (e: Event) => {
      const good = (e as CustomEvent<string>).detail === "correct";
      n++;
      const list = good ? CHEERS : NUDGES;
      setSay({ text: list[n % list.length], good, n });
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setSay(null), 1800);
    };
    window.addEventListener("lr-game-feedback", onFeedback);
    return () => {
      window.removeEventListener("lr-game-feedback", onFeedback);
      window.clearTimeout(timer);
    };
  }, []);
  if (!say) return null;
  return (
    <div key={say.n} className={`companion${say.good ? "" : " retry"}`} role="status" aria-live="polite" data-testid="game-companion">
      <HilmyFlat size={40} expression={say.good ? "cheer" : "happy"} title="" />
      {say.text}
    </div>
  );
}

export function GameDone({ message, onReplay, dayId, children }: { message: string; onReplay(): void; dayId?: string; children?: ReactNode }) {
  return (
    <div className="card gold stack center" role="status">
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Hilmy size={90} expression="cheer" />
      </div>
      <h2>Well done!</h2>
      <p>{message}</p>
      {children}
      <button className="btn block" onClick={onReplay}>
        <Icon name="refresh" /> Play again
      </button>
      {dayId ? (
        <BackToDay dayId={dayId} className="btn gold block" />
      ) : (
        <Link href="/games/" className="btn gold block">
          More games
        </Link>
      )}
    </div>
  );
}

/** Text + icon feedback (never colour alone). */
export function Feedback({ kind, children }: { kind: "good" | "retry" | "info"; children: ReactNode }) {
  const style = kind === "good" ? { background: "var(--success-bg)", color: "var(--success-text)" } : kind === "retry" ? { background: "#fff1cc", color: "#5b4300" } : { background: "#e5f0f7" };
  return (
    <div role="status" aria-live="polite" className="notice" style={{ ...style, borderLeftColor: "currentColor" }}>
      <Icon name={kind === "good" ? "check" : kind === "retry" ? "refresh" : "info"} size={18} strokeWidth={2.6} />{" "}
      {children}
    </div>
  );
}
