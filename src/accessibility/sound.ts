/**
 * Premium sound design, synthesised on the device with the Web Audio API — no audio
 * files, nothing downloaded, works offline. Bell and marimba tones use FM synthesis,
 * sparkles and page sounds use shaped noise, and everything passes through a gentle
 * room reverb and a limiter so nothing is ever harsh or loud.
 * Sound is optional (Parents → Settings, or the speaker button) and never carries
 * information that isn't also shown on screen.
 */
export type SoundName =
  | "tap"
  | "nav"
  | "toggle"
  | "open"
  | "close"
  | "page"
  | "flip"
  | "swap"
  | "correct"
  | "try-again"
  | "star"
  | "badge"
  | "celebrate"
  | "giggle"
  | "chime";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let wet: GainNode | null = null;
let noiseBuf: AudioBuffer | null = null;
let lastPlay = 0;
let enabled = true;

/** Global switch, kept in sync with the family's sound setting. */
export function setSoundEnabled(on: boolean) {
  enabled = on;
}

function audio() {
  if (ctx) return ctx;
  const AC = typeof window !== "undefined" ? (window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext) : undefined;
  if (!AC) return null;
  ctx = new AC();
  const limiter = ctx.createDynamicsCompressor();
  limiter.threshold.value = -14;
  limiter.ratio.value = 8;
  limiter.attack.value = 0.003;
  limiter.release.value = 0.2;
  master = ctx.createGain();
  master.gain.value = 0.55;
  master.connect(limiter).connect(ctx.destination);
  // Small, warm room reverb from a generated impulse response.
  const len = Math.floor(ctx.sampleRate * 1.6);
  const ir = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = ir.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2);
  }
  const conv = ctx.createConvolver();
  conv.buffer = ir;
  const tone = ctx.createBiquadFilter();
  tone.type = "lowpass";
  tone.frequency.value = 5200;
  wet = ctx.createGain();
  wet.gain.value = 0.22;
  wet.connect(conv).connect(tone).connect(master);
  noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const nd = noiseBuf.getChannelData(0);
  for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
  return ctx;
}

function out(dest: AudioNode, reverb = 1) {
  dest.connect(master!);
  if (reverb > 0) {
    const send = ctx!.createGain();
    send.gain.value = reverb;
    dest.connect(send).connect(wet!);
  }
}

function env(g: GainNode, t: number, peak: number, attack: number, decay: number) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
}

/** FM bell / marimba voice. ratio and index shape the timbre. */
function bell(freq: number, t: number, { gain = 0.18, decay = 1.2, ratio = 3.5, index = 2.2, reverb = 1, type = "sine" as OscillatorType } = {}) {
  const c = ctx!;
  const car = c.createOscillator();
  const mod = c.createOscillator();
  const modGain = c.createGain();
  const g = c.createGain();
  car.type = type;
  car.frequency.value = freq;
  mod.frequency.value = freq * ratio;
  modGain.gain.setValueAtTime(freq * index, t);
  modGain.gain.exponentialRampToValueAtTime(freq * 0.05, t + decay * 0.6);
  mod.connect(modGain).connect(car.frequency);
  car.connect(g);
  env(g, t, gain, 0.004, decay);
  out(g, reverb);
  car.start(t);
  mod.start(t);
  car.stop(t + decay + 0.1);
  mod.stop(t + decay + 0.1);
}

function noise(t: number, { gain = 0.08, dur = 0.2, from = 800, to = 4000, q = 1.2, type = "bandpass" as BiquadFilterType, reverb = 0.4 } = {}) {
  const c = ctx!;
  const src = c.createBufferSource();
  src.buffer = noiseBuf;
  const f = c.createBiquadFilter();
  f.type = type;
  f.Q.value = q;
  f.frequency.setValueAtTime(from, t);
  f.frequency.exponentialRampToValueAtTime(to, t + dur);
  const g = c.createGain();
  env(g, t, gain, dur * 0.3, dur * 0.7);
  src.connect(f).connect(g);
  out(g, reverb);
  src.start(t, Math.random() * 0.5);
  src.stop(t + dur + 0.05);
}

function blip(t: number, f1: number, f2: number, dur: number, gain = 0.12, type: OscillatorType = "sine", reverb = 0.3) {
  const c = ctx!;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f1, t);
  o.frequency.exponentialRampToValueAtTime(f2, t + dur);
  env(g, t, gain, 0.006, dur);
  o.connect(g);
  out(g, reverb);
  o.start(t);
  o.stop(t + dur + 0.05);
}

// Pentatonic notes keep every combination pleasant. (D major pentatonic)
const N = { D5: 587.3, E5: 659.3, Fs5: 740, A5: 880, B5: 987.8, D6: 1174.7, E6: 1318.5, Fs6: 1480, A6: 1760, A4: 440, D4: 293.7, Fs4: 370, B4: 493.9 };

const RECIPES: Record<SoundName, (t: number) => void> = {
  tap: (t) => {
    bell(N.A5, t, { gain: 0.07, decay: 0.12, ratio: 2.01, index: 1.2, reverb: 0.15 });
    noise(t, { gain: 0.03, dur: 0.03, from: 3000, to: 2500, q: 2, reverb: 0 });
  },
  nav: (t) => {
    blip(t, 520, 760, 0.09, 0.07, "sine", 0.2);
  },
  toggle: (t) => {
    bell(N.E5, t, { gain: 0.07, decay: 0.1, ratio: 2, index: 1, reverb: 0.1 });
    bell(N.B5, t + 0.06, { gain: 0.06, decay: 0.14, ratio: 2, index: 1, reverb: 0.1 });
  },
  open: (t) => {
    noise(t, { gain: 0.05, dur: 0.22, from: 500, to: 3200, q: 0.9, reverb: 0.5 });
    bell(N.D6, t + 0.08, { gain: 0.05, decay: 0.5, reverb: 1 });
  },
  close: (t) => noise(t, { gain: 0.04, dur: 0.18, from: 2800, to: 500, q: 0.9, reverb: 0.4 }),
  page: (t) => {
    noise(t, { gain: 0.06, dur: 0.28, from: 1200, to: 5000, q: 0.6, type: "highpass", reverb: 0.3 });
  },
  flip: (t) => {
    noise(t, { gain: 0.05, dur: 0.12, from: 1800, to: 4200, q: 1.4, reverb: 0.2 });
    bell(N.Fs5, t + 0.05, { gain: 0.05, decay: 0.15, ratio: 2, index: 0.8, reverb: 0.2 });
  },
  swap: (t) => {
    bell(N.D5, t, { gain: 0.09, decay: 0.18, ratio: 3.98, index: 2.5, reverb: 0.2 });
    bell(N.A5, t + 0.07, { gain: 0.07, decay: 0.2, ratio: 3.98, index: 2.5, reverb: 0.2 });
  },
  correct: (t) => {
    [N.D5, N.Fs5, N.A5, N.D6].forEach((f, i) => bell(f, t + i * 0.07, { gain: 0.11, decay: 0.7, ratio: 3.98, index: 1.8 }));
  },
  "try-again": (t) => {
    // Soft and friendly, never a buzzer.
    bell(N.B4, t, { gain: 0.09, decay: 0.35, ratio: 2, index: 0.7 });
    bell(N.A4, t + 0.14, { gain: 0.08, decay: 0.45, ratio: 2, index: 0.7 });
  },
  star: (t) => {
    [N.A5, N.D6, N.Fs6, N.A6].forEach((f, i) => bell(f, t + i * 0.06, { gain: 0.09, decay: 1.1, ratio: 3.5, index: 2.4 }));
    noise(t + 0.05, { gain: 0.035, dur: 0.6, from: 6000, to: 9000, q: 3, type: "bandpass", reverb: 1 });
  },
  badge: (t) => {
    [N.D4, N.Fs4, N.A4].forEach((f) => bell(f, t, { gain: 0.07, decay: 1.6, ratio: 2, index: 1.2, type: "triangle" }));
    [N.D5, N.Fs5, N.A5, N.D6, N.Fs6, N.A6].forEach((f, i) => bell(f, t + 0.12 + i * 0.07, { gain: 0.08, decay: 1.3, ratio: 3.5, index: 2.2 }));
    noise(t + 0.3, { gain: 0.04, dur: 0.9, from: 5000, to: 10000, q: 2.5, reverb: 1 });
  },
  celebrate: (t) => {
    RECIPES.badge(t);
    [N.D6, N.A5, N.Fs6, N.E6, N.A6].forEach((f, i) => bell(f, t + 0.7 + i * 0.09, { gain: 0.06, decay: 0.9, ratio: 3.5, index: 2 }));
  },
  giggle: (t) => {
    [0, 0.09, 0.18, 0.26].forEach((d, i) => blip(t + d, 700 + i * 60, 950 + i * 80, 0.07, 0.07, "triangle", 0.25));
  },
  chime: (t) => {
    [N.Fs6, N.D6, N.A6].forEach((f, i) => bell(f, t + i * 0.09, { gain: 0.07, decay: 1.4, ratio: 3.5, index: 2.4 }));
  },
};

export function playSound(name: SoundName) {
  if (!enabled) return;
  try {
    const c = audio();
    if (!c) return;
    if (c.state === "suspended") void c.resume();
    // Avoid stacking identical taps when several handlers fire at once.
    const now = c.currentTime;
    if ((name === "tap" || name === "nav") && now - lastPlay < 0.05) return;
    lastPlay = now;
    RECIPES[name](now + 0.01);
  } catch {
    /* sound is optional */
  }
}
