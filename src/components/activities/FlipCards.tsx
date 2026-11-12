"use client";

import { useState } from "react";
import { playSound } from "@/accessibility/sound";
import { useApp } from "@/state/AppState";

/** "Words to know" as flip cards: tap a word to see its meaning, tap again to flip back. */
export function FlipCards({ words }: { words: { word: string; meaning: string }[] }) {
  const { data } = useApp();
  const [open, setOpen] = useState<number[]>([]);
  return (
    <div className="flip-grid">
      {words.map((w, i) => {
        const on = open.includes(i);
        return (
          <button
            key={w.word}
            type="button"
            className={`flip-card${on ? " flipped" : ""}`}
            aria-pressed={on}
            aria-label={on ? `${w.word}: ${w.meaning}` : `${w.word}. Tap to see what it means`}
            onClick={() => {
              setOpen(on ? open.filter((x) => x !== i) : [...open, i]);
              if (data.settings.soundOn) playSound("flip");
            }}
            data-sound="none"
          >
            <span className="flip-inner" aria-hidden="true">
              <span className="flip-front">
                <strong>{w.word}</strong>
                <span className="small">Tap to flip</span>
              </span>
              <span className="flip-back">{w.meaning}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
