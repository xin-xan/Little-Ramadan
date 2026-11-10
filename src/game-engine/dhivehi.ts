/**
 * Learn Dhivehi question generators. Pure and seedable, so they can be unit-tested.
 * Every question has exactly one correct option and no duplicate options.
 */
import { colourWords, FILI, FILI_CONSONANTS, firstLetter, LETTERS, NUMBERS, pictureWords, ramadanWords, splitAkuru, type DvLetter, type DvWord, type PictureKey } from "@/content/dhivehi";
import { pick, shuffle, type Rand } from "./engine";

export interface DvOption {
  key: string;
  /** Main text (Thaana) shown big. */
  dv?: string;
  /** Small line under it (romanised, a letter name, or a digit). */
  sub?: string;
  /** What the voice says for this option. */
  speak: string;
  correct: boolean;
}

export interface DvQuestion {
  id: string;
  /** English instruction shown and read aloud. */
  ask: string;
  picture?: PictureKey;
  colour?: string;
  /** How many pictures to show (counting and sums). */
  count?: number;
  /** A sum like "3 + 2". */
  sum?: string;
  /** Big Thaana text in the prompt (a word, or a letter with its fili). */
  dv?: string;
  dvSub?: string;
  options: DvOption[];
  /** Said after a correct answer. */
  explain: string;
}

const ROUNDS = 6;

function choices<T>(correct: T, pool: T[], key: (x: T) => string, n: number, rand: Rand): T[] {
  const others = shuffle(pool.filter((x) => key(x) !== key(correct)), rand);
  const out: T[] = [correct];
  for (const o of others) {
    if (out.length >= n) break;
    if (!out.some((x) => key(x) === key(o))) out.push(o);
  }
  return shuffle(out, rand);
}

/** Puts words that use the focus letter first, so a day's game practises its letter. */
function focusFirst(words: DvWord[], focus: DvLetter | undefined, rand: Rand) {
  const s = shuffle(words, rand);
  if (!focus) return s;
  return [...s.filter((w) => w.dv.includes(focus.char)), ...s.filter((w) => !w.dv.includes(focus.char))];
}

const wordOption = (w: DvWord, correct: boolean): DvOption => ({ key: w.id, dv: w.dv, sub: w.roman, speak: w.roman, correct });

export function findWordQuestions(rand: Rand = Math.random, focus?: DvLetter): DvQuestion[] {
  return focusFirst(pictureWords, focus, rand)
    .slice(0, ROUNDS)
    .map((w) => ({
      id: `fw-${w.id}`,
      ask: `What is this in Dhivehi?`,
      picture: w.picture,
      options: choices(w, pictureWords, (x) => x.id, 4, rand).map((o) => wordOption(o, o.id === w.id)),
      explain: `${w.roman} means ${w.en}.`,
    }));
}

export function ramadanWordQuestions(rand: Rand = Math.random): DvQuestion[] {
  return shuffle(ramadanWords, rand)
    .slice(0, ROUNDS)
    .map((w) => ({
      id: `rw-${w.id}`,
      ask: `Which word means ${w.en}?`,
      picture: w.picture,
      options: choices(w, ramadanWords, (x) => x.id, 3, rand).map((o) => wordOption(o, o.id === w.id)),
      explain: `${w.roman} means ${w.en}.`,
    }));
}

export function colourQuestions(rand: Rand = Math.random): DvQuestion[] {
  return shuffle(colourWords, rand)
    .slice(0, ROUNDS)
    .map((w) => ({
      id: `c-${w.id}`,
      ask: "What colour is this?",
      colour: w.colour,
      options: choices(w, colourWords, (x) => x.id, 4, rand).map((o) => wordOption(o, o.id === w.id)),
      explain: `${w.roman} means ${w.en}.`,
    }));
}

export function firstLetterQuestions(rand: Rand = Math.random, focus?: DvLetter): DvQuestion[] {
  const usable = pictureWords.filter((w) => LETTERS.some((l) => l.char === firstLetter(w)));
  let list = shuffle(usable, rand);
  if (focus) list = [...list.filter((w) => firstLetter(w) === focus.char), ...list.filter((w) => firstLetter(w) !== focus.char)];
  return list.slice(0, ROUNDS).map((w) => {
    const right = LETTERS.find((l) => l.char === firstLetter(w))!;
    return {
      id: `fl-${w.id}`,
      ask: `Which letter does ${w.roman} start with?`,
      picture: w.picture,
      dv: w.dv,
      dvSub: w.roman,
      options: choices(right, LETTERS, (l) => l.char, 4, rand).map((l) => ({ key: l.char, dv: l.char, sub: l.name, speak: l.name, correct: l.char === right.char })),
      explain: `${w.roman} starts with ${right.name}.`,
    };
  });
}

const COUNT_PICTURES: PictureKey[] = ["fish", "coconut", "star", "flower", "egg", "banana", "turtle", "crab"];

export function countQuestions(rand: Rand = Math.random): DvQuestion[] {
  const ns = pick(NUMBERS, ROUNDS, rand);
  return ns.map((num, i) => ({
    id: `n-${num.n}-${i}`,
    ask: "How many can you count?",
    picture: COUNT_PICTURES[Math.floor(rand() * COUNT_PICTURES.length)],
    count: num.n,
    options: choices(num, NUMBERS, (x) => String(x.n), 4, rand).map((o) => ({ key: String(o.n), dv: o.dv, sub: `${o.n} · ${o.roman}`, speak: o.roman, correct: o.n === num.n })),
    explain: `${num.n} is ${num.roman}.`,
  }));
}

export function sumQuestions(rand: Rand = Math.random): DvQuestion[] {
  const out: DvQuestion[] = [];
  for (let i = 0; i < ROUNDS; i++) {
    const add = i % 2 === 0;
    let a: number, b: number, ans: number;
    if (add) {
      a = 1 + Math.floor(rand() * 6);
      b = 1 + Math.floor(rand() * (10 - a));
      ans = a + b;
    } else {
      a = 2 + Math.floor(rand() * 9);
      b = 1 + Math.floor(rand() * (a - 1));
      ans = a - b;
    }
    const num = NUMBERS[ans - 1];
    out.push({
      id: `s-${i}-${a}${add ? "+" : "-"}${b}`,
      ask: add ? `What is ${a} plus ${b}?` : `What is ${a} take away ${b}?`,
      picture: add ? "coconut" : "dates",
      sum: `${a} ${add ? "+" : "−"} ${b}`,
      count: a,
      options: choices(num, NUMBERS, (x) => String(x.n), 4, rand).map((o) => ({ key: String(o.n), dv: o.dv, sub: `${o.n} · ${o.roman}`, speak: o.roman, correct: o.n === ans })),
      explain: `${a} ${add ? "plus" : "take away"} ${b} is ${ans}, ${num.roman}.`,
    });
  }
  return out;
}

export function filiQuestions(rand: Rand = Math.random, focus?: DvLetter): DvQuestion[] {
  const basic = FILI.filter((f) => ["a", "i", "u", "e", "o", "aa", "ee", "oo"].includes(f.vowel));
  const focusCons = focus && FILI_CONSONANTS.find((c) => c.char === focus.char);
  const out: DvQuestion[] = [];
  for (let i = 0; i < ROUNDS; i++) {
    const c = focusCons && i < 3 ? focusCons : FILI_CONSONANTS[Math.floor(rand() * FILI_CONSONANTS.length)];
    const f = basic[Math.floor(rand() * basic.length)];
    const sound = c.roman + f.vowel;
    out.push({
      id: `f-${i}-${sound}`,
      ask: "What sound do the letter and the fili make together?",
      dv: c.char + f.char,
      dvSub: f.name,
      options: choices(f, basic, (x) => x.vowel, 4, rand).map((o) => ({ key: o.vowel, sub: c.roman + o.vowel, speak: c.roman + o.vowel, correct: o.vowel === f.vowel })),
      explain: `With ${f.name}, it says ${sound}.`,
    });
  }
  return out;
}

/** Words for "build the word": 2 to 4 pieces. */
export function buildWordRounds(rand: Rand = Math.random, focus?: DvLetter): { word: DvWord; pieces: string[]; shuffled: { id: number; text: string }[] }[] {
  const words = focusFirst(
    pictureWords.filter((w) => {
      const n = splitAkuru(w.dv).length;
      return n >= 2 && n <= 4;
    }),
    focus,
    rand,
  ).slice(0, 4);
  return words.map((w) => {
    const pieces = splitAkuru(w.dv);
    let shuffled = shuffle(pieces.map((text, id) => ({ id, text })), rand);
    // Never start already solved.
    if (shuffled.every((p, i) => p.id === i)) shuffled = [...shuffled.slice(1), shuffled[0]];
    return { word: w, pieces, shuffled };
  });
}

export function bubbleRound(target: string, rand: Rand = Math.random): { id: number; char: string }[] {
  const others = LETTERS.map((l) => l.char).filter((c) => c !== target);
  const list = [...Array(4).fill(target), ...pick(others, 8, rand)];
  return shuffle(list, rand).map((char, id) => ({ id, char }));
}

export function memoryCards(rand: Rand = Math.random, focus?: DvLetter) {
  const words = focusFirst(pictureWords, focus, rand).slice(0, 4);
  return shuffle(
    words.flatMap((w) => [
      { id: `${w.id}-p`, pair: w.id, kind: "picture" as const, word: w },
      { id: `${w.id}-w`, pair: w.id, kind: "word" as const, word: w },
    ]),
    rand,
  );
}
