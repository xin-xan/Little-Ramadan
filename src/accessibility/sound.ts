/**
 * Gentle sound effects synthesised on the device (no audio files, nothing
 * downloaded). Sound is off by default and never carries information that
 * isn't also shown on screen.
 */
type SoundName = "tap" | "star" | "badge" | "flip" | "correct" | "try-again";

const TONES: Record<SoundName, { f: number; d: number }[]> = {
  tap: [{ f: 660, d: 0.06 }],
  flip: [{ f: 520, d: 0.07 }],
  star: [{ f: 784, d: 0.1 }, { f: 1046, d: 0.16 }],
  badge: [{ f: 659, d: 0.1 }, { f: 784, d: 0.1 }, { f: 1046, d: 0.22 }],
  correct: [{ f: 698, d: 0.09 }, { f: 880, d: 0.14 }],
  "try-again": [{ f: 440, d: 0.12 }, { f: 392, d: 0.16 }],
};

let ctx: AudioContext | null = null;

export function playSound(name: SoundName) {
  try {
    const AC = typeof window !== "undefined" ? window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext : undefined;
    if (!AC) return;
    ctx ??= new AC();
    if (ctx.state === "suspended") void ctx.resume();
    let t = ctx.currentTime;
    for (const { f, d } of TONES[name]) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.12, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + d);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + d + 0.02);
      t += d * 0.9;
    }
  } catch {
    /* sound is optional */
  }
}

export type { SoundName };
