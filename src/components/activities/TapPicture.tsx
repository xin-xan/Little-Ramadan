"use client";

import { useState } from "react";
import { playSound } from "@/accessibility/sound";
import { Illustration } from "@/components/art/Illustration";
import type { IllustrationKey } from "@/components/art/illustrationKeys";
import { useApp } from "@/state/AppState";

/** A story picture you can tap: it bounces with a sparkle and a happy sound. */
export function TapPicture({ name, size = 170, label }: { name: IllustrationKey; size?: number; label?: string }) {
  const { data } = useApp();
  const [n, setN] = useState(0);
  return (
    <button
      type="button"
      className={`tap-picture${n ? " boing" : ""}`}
      key={n}
      aria-label={label ? `${label}. Tap the picture!` : "Tap the picture!"}
      onClick={() => {
        setN(n + 1);
        if (data.settings.soundOn) playSound(n % 2 ? "giggle" : "chime");
      }}
      data-sound="none"
    >
      <Illustration name={name} size={size} />
      {n > 0 && (
        <span className="tap-sparkles" aria-hidden="true">
          {Array.from({ length: 6 }, (_, i) => (
            <i key={i} style={{ transform: `rotate(${i * 60}deg) translateY(-${size * 0.55}px)` }} />
          ))}
        </span>
      )}
    </button>
  );
}
