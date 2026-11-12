import type { Review } from "./types";
import data from "./data/dhivehi.json";

/**
 * Learn Dhivehi: letters (Thaana), vowel signs (fili), first words, numbers, colours and
 * Ramadan words, spread across the days of Ramadan.
 *
 * Original content, inspired by the kinds of games families enjoy on akurufili.com
 * (letters, fili, picture words, counting, tracing, bubbles, build-the-word, memory).
 * DRAFT until checked by a Dhivehi teacher (see docs/content-review-record.md).
 */
export const dhivehiReview = data.review as Review;

/** Built-in pictures for Dhivehi words. */
export const PICTURE_KEYS = [
  "moon", "sun", "star", "sea", "island", "coconut", "fish", "turtle", "crab", "cat", "bird", "cow",
  "boat", "house", "tree", "flower", "water", "tea", "milk", "bread", "rice", "banana", "watermelon",
  "egg", "dates", "book", "eye", "hand", "cloud", "rain", "drum", "giraffe", "mosque", "prayer",
  "fasting", "suhoor", "iftar", "eid", "thanks", "ramadan",
] as const;

/** A built-in picture, or "img:<file>" for a picture uploaded in the admin dashboard. */
export type PictureKey = (typeof PICTURE_KEYS)[number] | `img:${string}`;

export interface DvLetter {
  /** Thaana letter (Unicode). */
  char: string;
  name: string;
  /** Approximate English sound, for children. */
  sound: string;
  /** A word that starts with (or, for letters rarely used first, contains) this letter. */
  example?: { wordId: string; contains?: boolean };
}

/** The 24 letters of the Thaana alphabet, in the traditional order. */
export const LETTERS: DvLetter[] = data.letters;

export interface DvFili {
  char: string;
  name: string;
  /** The vowel sound it adds. */
  vowel: string;
}

/** Vowel signs (fili). Thaana letters need a fili to make a sound like "ba" or "bu". */
export const FILI: DvFili[] = data.fili;
export const SUKUN = "ް";

/** Letters with a clear sound used in the fili game, with their romanised consonant. */
export const FILI_CONSONANTS: { char: string; roman: string }[] = data.filiConsonants;

export type WordTopic = "nature" | "animals" | "home" | "food" | "body" | "colours" | "ramadan";

export interface DvWord {
  id: string;
  /** Written in Thaana. */
  dv: string;
  /** Romanised, as Maldivians commonly write it in Latin letters. */
  roman: string;
  en: string;
  picture?: PictureKey;
  /** For colour words: the colour shown instead of a picture. */
  colour?: string;
  topic: WordTopic;
}

export const WORDS = data.words as DvWord[];

export const wordById = (id: string) => WORDS.find((w) => w.id === id);
export const pictureWords = WORDS.filter((w) => w.picture && w.topic !== "ramadan");
export const colourWords = WORDS.filter((w) => w.topic === "colours");
export const ramadanWords = WORDS.filter((w) => w.topic === "ramadan");

/** Numbers 1–10 in Dhivehi. */
export const NUMBERS: { n: number; dv: string; roman: string }[] = data.numbers;

const THAANA_CONSONANT = /[ހ-ޥ]/;
/** Splits a Thaana word into written pieces: each letter with its fili or sukun. */
export function splitAkuru(word: string): string[] {
  const out: string[] = [];
  for (const ch of word.replace(/\s+/g, "")) {
    if (THAANA_CONSONANT.test(ch) || out.length === 0) out.push(ch);
    else out[out.length - 1] += ch;
  }
  return out;
}

/** The first letter of a word (Thaana words that start with a vowel are written with alifu). */
export const firstLetter = (w: DvWord) => [...w.dv][0];

// ---------------------------------------------------------------------------------------------
// Games

export type DvGameId = "letters" | "trace" | "bubbles" | "find-word" | "first-letter" | "count" | "colours" | "fili" | "memory" | "build-word" | "sums" | "ramadan-words";

export interface DvGameInfo {
  id: DvGameId;
  title: string;
  description: string;
  howToPlay: string[];
  picture: PictureKey;
  tone: "sky" | "lavender" | "rose" | "gold" | "emerald" | "mint";
}

export const DV_GAMES = data.games as DvGameInfo[];
export const dvGameById = (id: string) => DV_GAMES.find((g) => g.id === id);

// ---------------------------------------------------------------------------------------------
// Ramadan plan: one Dhivehi activity for every day of Ramadan, built automatically.

export interface DvDay {
  day: number;
  /** Letter of the day (days 1–24). */
  letter?: DvLetter;
  game: DvGameId;
  title: string;
}

const ROTATION: DvGameId[] = ["bubbles", "find-word", "count", "first-letter", "colours", "memory", "fili", "sums", "build-word", "ramadan-words"];
const REVIEW: DvGameId[] = ["fili", "build-word", "memory", "sums", "find-word"];

/**
 * Builds the Dhivehi plan for a 29- or 30-day Ramadan: one new letter a day for the
 * first 24 days (each with a game), then review days, ending with Ramadan and Eid words.
 */
export function dhivehiPlan(length: 29 | 30): DvDay[] {
  const days: DvDay[] = [];
  for (let d = 1; d <= length; d++) {
    if (d <= LETTERS.length) {
      const letter = LETTERS[d - 1];
      const game = ROTATION[(d - 1) % ROTATION.length];
      days.push({ day: d, letter, game, title: `Letter ${letter.name}` });
    } else if (d === length) {
      days.push({ day: d, game: "ramadan-words", title: "Eid words" });
    } else {
      const game = REVIEW[(d - LETTERS.length - 1) % REVIEW.length];
      days.push({ day: d, game, title: `Review: ${dvGameById(game)!.title}` });
    }
  }
  return days;
}

/** Completion content ids: one per plan day, one per game played freely. */
export const dvDayId = (day: number) => `day-${String(day).padStart(2, "0")}`;
export const dvPlayId = (game: DvGameId) => `play-${game}`;
