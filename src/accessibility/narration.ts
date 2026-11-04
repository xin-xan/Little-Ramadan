/**
 * Voice narration ("Read to me") using the device's built-in speech voices (Web Speech API).
 *
 * - Free, needs no download and works offline: only voices that run ON the device are used
 *   (`localService`), so no text ever leaves the device.
 * - Text is spoken one sentence at a time. That avoids engines that cut off long utterances,
 *   and lets the screen highlight the sentence being read.
 * - Ramadan words are re-spelled for the voice so they are pronounced kindly (see PRONOUNCE).
 * - Recorded human narration can replace this later without changing the screens that use it.
 */

export interface Segment {
  /** The words shown on screen. */
  text: string;
  /** What the voice should say (pronunciation-adjusted). */
  spoken: string;
  /** Where the sentence is on screen, for highlighting. */
  range?: Range;
}

/**
 * Spoken re-spellings for words most voices get wrong. Shown text is never changed.
 * Reviewers: please check these with a native speaker.
 */
export const PRONOUNCE: [RegExp, string][] = [
  [/\bSuhoor\b/gi, "Su-hoor"],
  [/\bIftar\b/gi, "Iff-taar"],
  [/\bLaylatul Qadr\b/gi, "Lay-la-tul Kadr"],
  [/\bQadr\b/gi, "Kadr"],
  [/\bZakat\b/gi, "Za-kaat"],
  [/\bSadaqah\b/gi, "Sa-da-ka"],
  [/\bduas\b/gi, "doo-aahs"],
  [/\bdua\b/gi, "doo-aah"],
  [/\bSalah\b/gi, "Sa-laah"],
  [/\bFajr\b/gi, "Fudger"],
  [/\bMaghrib\b/gi, "Mug-rib"],
  [/\bQuran\b/gi, "Kur-aan"],
  [/\bEid al-Fitr\b/gi, "Eed al Fitter"],
  [/\bEid\b/gi, "Eed"],
  [/\bKuda Eid\b/gi, "Kuda Eed"],
  [/\bmasroshi\b/gi, "mass-roshi"],
  [/\bgulha\b/gi, "gul-ha"],
  [/\bbajiya\b/gi, "ba-jiya"],
  [/\brihaakuru\b/gi, "ree-haa-kuru"],
  [/\broshi\b/gi, "roshi"],
  [/\bHilmy\b/g, "Hill-mee"],
  [/\bAmina\b/g, "Aa-mina"],
  [/\bAisha\b/g, "Aa-isha"],
  [/\bMariyam\b/g, "Mar-yam"],
  [/\bAssalamu alaikum\b/gi, "As-salaamu alay-kum"],
  [/\bInsha'?Allah\b/gi, "In-sha-Allah"],
  [/\bAlhamdulillah\b/gi, "Al-ham-du-lil-lah"],
  [/\bBismillah\b/gi, "Bis-mil-lah"],
  [/\bRamadan\b/g, "Ramadaan"],
  [/—|–/g, ", "],
  [/…/g, "."],
];

export function toSpoken(text: string): string {
  let s = text;
  for (const [re, rep] of PRONOUNCE) s = s.replace(re, rep);
  return s.replace(/\s+/g, " ").trim();
}

/** Splits text into sentences, keeping closing quotes with their sentence. */
export function splitSentences(text: string): { start: number; end: number }[] {
  const out: { start: number; end: number }[] = [];
  const re = /[^.!?]*(?:[.!?]+["'”’)]*|$)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m[0].length === 0) {
      re.lastIndex++;
      if (re.lastIndex > text.length) break;
      continue;
    }
    const raw = m[0];
    const lead = raw.length - raw.trimStart().length;
    const trimmed = raw.trim();
    if (/[A-Za-z0-9]/.test(trimmed)) out.push({ start: m.index + lead, end: m.index + lead + trimmed.length });
  }
  return out;
}

const SKIP = "button, a, input, textarea, select, nav, svg, canvas, [aria-hidden='true'], [hidden], .sr-only, [data-narrate='skip'], details:not([open]) > :not(summary)";

function isBlock(el: Element) {
  const d = getComputedStyle(el).display;
  return !(d === "inline" || d === "inline-block" || d === "contents");
}

/** Builds sentence segments (with on-screen ranges) from the readable text inside an element. */
export function segmentsFrom(root: Element): Segment[] {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(n) {
      const p = n.parentElement;
      if (!p || !n.textContent?.trim()) return NodeFilter.FILTER_REJECT;
      const skipped = p.closest(SKIP);
      const keep = p.closest("[data-narrate='read']");
      if (skipped && root.contains(skipped) && !(keep && skipped.contains(keep))) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  // Group text nodes by their nearest block-level ancestor (a paragraph, heading, list item…).
  const groups: { block: Element; nodes: Text[] }[] = [];
  for (let n = walker.nextNode() as Text | null; n; n = walker.nextNode() as Text | null) {
    let b: Element | null = n.parentElement;
    while (b && b !== root && !isBlock(b)) b = b.parentElement;
    const block = b ?? root;
    const g = groups[groups.length - 1];
    if (g && g.block === block) g.nodes.push(n);
    else groups.push({ block, nodes: [n] });
  }
  const segs: Segment[] = [];
  for (const g of groups) {
    const offsets: { node: Text; start: number }[] = [];
    let full = "";
    for (const node of g.nodes) {
      offsets.push({ node, start: full.length });
      full += node.textContent ?? "";
    }
    const locate = (i: number) => {
      let k = offsets.length - 1;
      while (k > 0 && offsets[k].start > i) k--;
      return { node: offsets[k].node, offset: Math.min(i - offsets[k].start, offsets[k].node.length) };
    };
    for (const s of splitSentences(full)) {
      const text = full.slice(s.start, s.end).replace(/\s+/g, " ");
      let range: Range | undefined;
      try {
        range = document.createRange();
        const a = locate(s.start);
        const b = locate(s.end);
        range.setStart(a.node, a.offset);
        range.setEnd(b.node, b.offset);
      } catch {
        range = undefined;
      }
      segs.push({ text, spoken: toSpoken(text), range });
    }
  }
  return segs;
}

/** Plain text (no screen element) as segments. */
export function segmentsFromText(text: string): Segment[] {
  return splitSentences(text).map((s) => {
    const t = text.slice(s.start, s.end);
    return { text: t, spoken: toSpoken(t) };
  });
}

// ---------------------------------------------------------------------------------------------
// Speaking

function synth(): SpeechSynthesis | null {
  return typeof window !== "undefined" && "speechSynthesis" in window && typeof window.SpeechSynthesisUtterance === "function" ? window.speechSynthesis : null;
}

let voice: SpeechSynthesisVoice | null = null;
let voicesKnown = false;

/** Prefers clear, natural on-device English voices. Never chooses a network voice. */
export function pickVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const local = voices.filter((v) => v.localService && /^en(-|_|$)/i.test(v.lang));
  if (!local.length) return null;
  const score = (v: SpeechSynthesisVoice) => {
    let s = 0;
    const n = v.name.toLowerCase();
    if (/premium|enhanced|natural|neural/.test(n)) s += 40;
    if (/samantha|karen|daniel|moira|serena|kate|martha|tessa|ava|zoe|allison|google uk english female|google us english/.test(n)) s += 15;
    if (/en[-_]gb/i.test(v.lang)) s += 6;
    if (/en[-_](us|au|ie|in)/i.test(v.lang)) s += 4;
    if (v.default) s += 3;
    // Novelty / robotic voices are not suitable for children's stories.
    if (/albert|bad news|bahh|bells|boing|bubbles|cellos|deranged|good news|hysterical|jester|organ|superstar|trinoids|whisper|wobble|zarvox|junior|ralph|fred|grandma|grandpa|eddy|flo|reed|rocko|sandy|shelley|espeak/.test(n)) s -= 100;
    return s;
  };
  return [...local].sort((a, b) => score(b) - score(a))[0];
}

function loadVoice() {
  const s = synth();
  if (!s) return;
  const v = s.getVoices();
  if (v.length) {
    voicesKnown = true;
    voice = pickVoice(v);
  }
}

const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}
export function onNarrationChange(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

if (typeof window !== "undefined") {
  const s = synth();
  if (s) {
    loadVoice();
    s.addEventListener?.("voiceschanged", () => {
      loadVoice();
      emit();
    });
  }
}

/** True when this device has an on-device English voice we can use. */
export function narrationAvailable(): boolean {
  if (!synth()) return false;
  if (!voicesKnown) loadVoice();
  return !!voice;
}

let unlocked = false;
/** iOS only allows speech that starts from a tap. Call from any tap to allow later auto-reading. */
export function unlockNarration() {
  const s = synth();
  if (unlocked || !s) return;
  unlocked = true;
  try {
    const u = new SpeechSynthesisUtterance(" ");
    u.volume = 0;
    s.speak(u);
  } catch {
    /* ignore */
  }
}

const HIGHLIGHT = "narration";
function highlight(range?: Range) {
  const css = (typeof CSS !== "undefined" ? CSS : null) as (typeof CSS & { highlights?: Map<string, unknown> }) | null;
  const H = (window as unknown as { Highlight?: new (...r: Range[]) => unknown }).Highlight;
  if (!css?.highlights || !H) return;
  if (!range) {
    css.highlights.delete(HIGHLIGHT);
    return;
  }
  css.highlights.set(HIGHLIGHT, new H(range));
  // Keep the sentence being read on screen.
  const r = range.getBoundingClientRect();
  if (r.height && (r.top < 70 || r.bottom > window.innerHeight - 110)) {
    const reduce = document.documentElement.dataset.reducedMotion === "true" || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    window.scrollBy({ top: r.top - window.innerHeight / 3, behavior: reduce ? "auto" : "smooth" });
  }
}

let session = 0;
let activeKey: string | null = null;
let rate = 0.92;

export function setNarrationRate(r: number) {
  rate = Math.min(1.2, Math.max(0.6, r));
}

/** Which "Listen" control is currently speaking (null if none). */
export function narratingKey() {
  return activeKey;
}

export function stopNarration() {
  session++;
  const was = activeKey;
  activeKey = null;
  synth()?.cancel();
  if (typeof window !== "undefined") highlight();
  if (was) emit();
}

/**
 * Reads segments aloud one by one. Resolves true when finished, false if stopped.
 * `key` identifies the control that started it so it can show "Stop".
 */
export function narrate(segments: Segment[], key = "default", onSegment?: (i: number) => void): Promise<boolean> {
  const s = synth();
  if (!s || !segments.length || !narrationAvailable()) return Promise.resolve(false);
  stopNarration();
  const my = ++session;
  activeKey = key;
  emit();
  return new Promise((resolve) => {
    let i = 0;
    const finish = (ok: boolean) => {
      if (my !== session) return resolve(false);
      highlight();
      activeKey = null;
      emit();
      resolve(ok);
    };
    const next = () => {
      if (my !== session) return resolve(false);
      if (i >= segments.length) return finish(true);
      const seg = segments[i];
      const u = new SpeechSynthesisUtterance(seg.spoken);
      if (voice) {
        u.voice = voice;
        u.lang = voice.lang;
      }
      u.rate = rate;
      u.pitch = 1.05;
      let ended = false;
      // Some engines occasionally never fire "end": move on after a generous estimate.
      const guard = window.setTimeout(() => done(), 4000 + (seg.spoken.length * 140) / rate);
      function done() {
        if (ended) return;
        ended = true;
        window.clearTimeout(guard);
        i++;
        next();
      }
      u.onend = done;
      u.onerror = (e) => {
        window.clearTimeout(guard);
        ended = true;
        if ((e as SpeechSynthesisErrorEvent).error === "interrupted" || (e as SpeechSynthesisErrorEvent).error === "canceled") return resolve(false);
        i++;
        next();
      };
      highlight(seg.range);
      onSegment?.(i);
      s.speak(u);
    };
    // Safari can drop a speak() made in the same tick as cancel().
    window.setTimeout(next, 60);
  });
}

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") stopNarration();
  });
}
