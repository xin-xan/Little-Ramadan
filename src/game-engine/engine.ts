/**
 * Pure game logic, kept separate from UI so it can be unit-tested.
 * No timers anywhere: every game is untimed by design.
 */
export type Rand = () => number;

export function shuffle<T>(items: readonly T[], rand: Rand = Math.random): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pick<T>(items: readonly T[], n: number, rand: Rand = Math.random): T[] {
  return shuffle(items, rand).slice(0, n);
}

/** Seeded PRNG (mulberry32) for repeatable tests. */
export function seeded(seed: number): Rand {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- quiz ----------
export interface QuizQ {
  id: string;
  question: string;
  options: readonly string[];
  answer: number;
  explanation: string;
}
export interface PlayableQuestion extends QuizQ {
  /** options in display order */
  shown: string[];
  /** index of the correct answer within `shown` */
  correct: number;
}
export function prepareQuiz(qs: readonly QuizQ[], rand: Rand = Math.random): PlayableQuestion[] {
  return qs.map((q) => {
    const shown = shuffle(q.options, rand);
    return { ...q, shown, correct: shown.indexOf(q.options[q.answer]) };
  });
}

// ---------- memory cards ----------
export interface MemoryCard {
  key: number; // unique per card
  pairId: string;
  matched: boolean;
}
export function createDeck(pairIds: readonly string[], rand: Rand = Math.random): MemoryCard[] {
  return shuffle(
    pairIds.flatMap((id, i) => [
      { key: i * 2, pairId: id, matched: false },
      { key: i * 2 + 1, pairId: id, matched: false },
    ]),
    rand,
  );
}
export interface MemoryState {
  deck: MemoryCard[];
  open: number[]; // keys of face-up unmatched cards (max 2)
  moves: number;
}
/** Tap a card. If two unmatched cards are already open, they close first (no timer needed). */
export function flipCard(s: MemoryState, key: number): MemoryState {
  const card = s.deck.find((c) => c.key === key);
  if (!card || card.matched || s.open.includes(key)) return s;
  const open = s.open.length >= 2 ? [key] : [...s.open, key];
  let deck = s.deck;
  let moves = s.moves;
  if (open.length === 2) {
    moves += 1;
    const [a, b] = open.map((k) => s.deck.find((c) => c.key === k)!);
    if (a.pairId === b.pairId) {
      deck = s.deck.map((c) => (c.pairId === a.pairId ? { ...c, matched: true } : c));
      return { deck, open: [], moves };
    }
  }
  return { deck, open, moves };
}
export const memoryDone = (s: MemoryState) => s.deck.every((c) => c.matched);

// ---------- tile puzzle ----------
/** tiles[position] = piece number. Solved when tiles[i] === i. */
export function scrambleTiles(n: number, rand: Rand = Math.random): number[] {
  const solved = Array.from({ length: n }, (_, i) => i);
  let t = shuffle(solved, rand);
  while (isSolved(t)) t = shuffle(solved, rand);
  return t;
}
export function swapTiles(tiles: readonly number[], a: number, b: number): number[] {
  const t = [...tiles];
  [t[a], t[b]] = [t[b], t[a]];
  return t;
}
export const isSolved = (tiles: readonly number[]) => tiles.every((p, i) => p === i);

// ---------- missing lantern ----------
export interface LanternRound<T> {
  shown: T[]; // in order
  missingIndex: number;
  options: T[]; // includes the missing one
}
export function makeLanternRound<T>(designs: readonly T[], count: number, optionCount: number, rand: Rand = Math.random): LanternRound<T> {
  const shown = pick(designs, count, rand);
  const missingIndex = Math.floor(rand() * count);
  const missing = shown[missingIndex];
  const others = pick(
    designs.filter((d) => d !== missing),
    optionCount - 1,
    rand,
  );
  return { shown, missingIndex, options: shuffle([missing, ...others], rand) };
}

// ---------- multiple choice rounds (vocabulary) ----------
export interface ChoiceRound<T> {
  target: T;
  options: T[];
}
export function makeChoiceRounds<T>(pool: readonly T[], rounds: number, optionCount: number, rand: Rand = Math.random): ChoiceRound<T>[] {
  return pick(pool, rounds, rand).map((target) => ({
    target,
    options: shuffle([target, ...pick(pool.filter((p) => p !== target), optionCount - 1, rand)], rand),
  }));
}
