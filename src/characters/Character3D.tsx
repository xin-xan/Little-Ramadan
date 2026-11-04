"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { CharacterHandle } from "@/three/engine";
import type { CharacterId, Pose } from "@/three/characters";
import { useApp } from "@/state/AppState";
import { playSound } from "@/accessibility/sound";

function prefersReducedMotion() {
  return typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

/**
 * A real-time 3D character. Three.js loads lazily after first paint; until then (and on
 * devices without WebGL) the flat vector version is shown in exactly the same space, so
 * nothing jumps. Tap the character for a little hop and giggle.
 */
export function Character3D({ who, pose, width, height, title, className, flat }: { who: CharacterId; pose: Pose; width: number; height: number; title: string; className?: string; flat: ReactNode }) {
  const { data } = useApp();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handleRef = useRef<CharacterHandle | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "fallback">("loading");
  const reduced = data.settings.reducedMotion || prefersReducedMotion();
  const initial = useRef({ pose, reduced });

  useEffect(() => {
    let cancelled = false;
    import("@/three/engine")
      .then((m) => {
        if (cancelled || !canvasRef.current) return;
        if (!m.webglAvailable()) return setState("fallback");
        const h = m.mountCharacter(canvasRef.current, who, initial.current.pose, !initial.current.reduced);
        if (!h) return setState("fallback");
        handleRef.current = h;
        setState("ready");
      })
      .catch(() => !cancelled && setState("fallback"));
    return () => {
      cancelled = true;
      handleRef.current?.dispose();
      handleRef.current = null;
    };
  }, [who]);

  useEffect(() => handleRef.current?.setPose(pose), [pose, state]);
  useEffect(() => handleRef.current?.setAnimate(!reduced), [reduced, state]);

  return (
    <span className={`character ${className ?? ""}`} style={{ width, height }} data-state={state}>
      {state !== "ready" && (
        <span className="character-flat" aria-hidden={state === "loading" || undefined}>
          {flat}
        </span>
      )}
      {state !== "fallback" && (
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={title}
          style={{ opacity: state === "ready" ? 1 : 0 }}
          onClick={() => {
            if (!reduced) handleRef.current?.poke();
            if (data.settings.soundOn) playSound(who === "hilmy" ? "chime" : "giggle");
          }}
        />
      )}
    </span>
  );
}
