import type { Review } from "./types";

/**
 * Learn Dhivehi: letters (Thaana), vowel signs (fili), first words, numbers, colours and
 * Ramadan words, spread across the days of Ramadan.
 *
 * Original content, inspired by the kinds of games families enjoy on akurufili.com
 * (letters, fili, picture words, counting, tracing, bubbles, build-the-word, memory).
 * DRAFT until checked by a Dhivehi teacher (see docs/content-review-record.md).
 */
export const dhivehiReview: Review = { status: "draft", notes: "Awaiting review by a Dhivehi language teacher (spellings, letter names, romanisation)." };

export type PictureKey =
  | "moon" | "sun" | "star" | "sea" | "island" | "coconut" | "fish" | "turtle" | "crab" | "cat" | "bird" | "cow"
  | "boat" | "house" | "tree" | "flower" | "water" | "tea" | "milk" | "bread" | "rice" | "banana" | "watermelon"
  | "egg" | "dates" | "book" | "eye" | "hand" | "cloud" | "rain" | "drum" | "giraffe" | "mosque" | "prayer"
  | "fasting" | "suhoor" | "iftar" | "eid" | "thanks" | "ramadan";

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
export const LETTERS: DvLetter[] = [
  { char: "ހ", name: "haa", sound: "h", example: { wordId: "moon" } },
  { char: "ށ", name: "shaviyani", sound: "sh", example: { wordId: "coconut", contains: true } },
  { char: "ނ", name: "noonu", sound: "n", example: { wordId: "c-blue" } },
  { char: "ރ", name: "raa", sound: "r", example: { wordId: "island" } },
  { char: "ބ", name: "baa", sound: "b", example: { wordId: "cat" } },
  { char: "ޅ", name: "lhaviyani", sound: "lh", example: { wordId: "cat", contains: true } },
  { char: "ކ", name: "kaafu", sound: "k", example: { wordId: "coconut" } },
  { char: "އ", name: "alifu", sound: "a (it carries a vowel)", example: { wordId: "sun" } },
  { char: "ވ", name: "vaavu", sound: "v", example: { wordId: "turtle" } },
  { char: "މ", name: "meemu", sound: "m", example: { wordId: "fish" } },
  { char: "ފ", name: "faafu", sound: "f", example: { wordId: "water" } },
  { char: "ދ", name: "dhaalu", sound: "dh", example: { wordId: "boat" } },
  { char: "ތ", name: "thaa", sound: "th", example: { wordId: "star" } },
  { char: "ލ", name: "laamu", sound: "l", example: { wordId: "eye" } },
  { char: "ގ", name: "gaafu", sound: "g", example: { wordId: "house" } },
  { char: "ޏ", name: "gnaviyani", sound: "gn" },
  { char: "ސ", name: "seenu", sound: "s", example: { wordId: "tea" } },
  { char: "ޑ", name: "daviyani", sound: "d", example: { wordId: "sea", contains: true } },
  { char: "ޒ", name: "zaviyani", sound: "z", example: { wordId: "giraffe" } },
  { char: "ޓ", name: "taviyani", sound: "t" },
  { char: "ޔ", name: "yaa", sound: "y", example: { wordId: "banana", contains: true } },
  { char: "ޕ", name: "paviyani", sound: "p", example: { wordId: "bread" } },
  { char: "ޖ", name: "javiyani", sound: "j" },
  { char: "ޗ", name: "chaviyani", sound: "ch" },
];

export interface DvFili {
  char: string;
  name: string;
  /** The vowel sound it adds. */
  vowel: string;
}

/** Vowel signs (fili). Thaana letters need a fili to make a sound like "ba" or "bu". */
export const FILI: DvFili[] = [
  { char: "ަ", name: "abafili", vowel: "a" },
  { char: "ާ", name: "aabaafili", vowel: "aa" },
  { char: "ި", name: "ibifili", vowel: "i" },
  { char: "ީ", name: "eebeefili", vowel: "ee" },
  { char: "ު", name: "ubufili", vowel: "u" },
  { char: "ޫ", name: "ooboofili", vowel: "oo" },
  { char: "ެ", name: "ebefili", vowel: "e" },
  { char: "ޭ", name: "eybeyfili", vowel: "ey" },
  { char: "ޮ", name: "obofili", vowel: "o" },
  { char: "ޯ", name: "oaboafili", vowel: "oa" },
];
export const SUKUN = "ް";

/** Letters with a clear sound used in the fili game, with their romanised consonant. */
export const FILI_CONSONANTS: { char: string; roman: string }[] = [
  { char: "ބ", roman: "b" },
  { char: "ކ", roman: "k" },
  { char: "މ", roman: "m" },
  { char: "ނ", roman: "n" },
  { char: "ތ", roman: "th" },
  { char: "ދ", roman: "dh" },
  { char: "ފ", roman: "f" },
  { char: "ލ", roman: "l" },
  { char: "ސ", roman: "s" },
  { char: "ހ", roman: "h" },
  { char: "ރ", roman: "r" },
  { char: "ވ", roman: "v" },
  { char: "ގ", roman: "g" },
];

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

export const WORDS: DvWord[] = [
  // Nature
  { id: "moon", dv: "ހަނދު", roman: "handhu", en: "moon", picture: "moon", topic: "nature" },
  { id: "sun", dv: "އިރު", roman: "iru", en: "sun", picture: "sun", topic: "nature" },
  { id: "star", dv: "ތަރި", roman: "thari", en: "star", picture: "star", topic: "nature" },
  { id: "sea", dv: "ކަނޑު", roman: "kandu", en: "sea", picture: "sea", topic: "nature" },
  { id: "island", dv: "ރަށް", roman: "rah", en: "island", picture: "island", topic: "nature" },
  { id: "tree", dv: "ގަސް", roman: "gas", en: "tree", picture: "tree", topic: "nature" },
  { id: "flower", dv: "މާ", roman: "maa", en: "flower", picture: "flower", topic: "nature" },
  { id: "cloud", dv: "ވިލާ", roman: "vilaa", en: "cloud", picture: "cloud", topic: "nature" },
  { id: "rain", dv: "ވާރޭ", roman: "vaarey", en: "rain", picture: "rain", topic: "nature" },
  // Animals
  { id: "fish", dv: "މަސް", roman: "mas", en: "fish", picture: "fish", topic: "animals" },
  { id: "turtle", dv: "ވެލާ", roman: "velaa", en: "turtle", picture: "turtle", topic: "animals" },
  { id: "crab", dv: "ކަކުނި", roman: "kakuni", en: "crab", picture: "crab", topic: "animals" },
  { id: "cat", dv: "ބުޅާ", roman: "bulhaa", en: "cat", picture: "cat", topic: "animals" },
  { id: "bird", dv: "ދޫނި", roman: "dhooni", en: "bird", picture: "bird", topic: "animals" },
  { id: "cow", dv: "ގެރި", roman: "geri", en: "cow", picture: "cow", topic: "animals" },
  { id: "giraffe", dv: "ޒަރާފާ", roman: "zaraafaa", en: "giraffe", picture: "giraffe", topic: "animals" },
  // Home and things
  { id: "boat", dv: "ދޯނި", roman: "dhoani", en: "boat", picture: "boat", topic: "home" },
  { id: "house", dv: "ގެ", roman: "ge", en: "house", picture: "house", topic: "home" },
  { id: "book", dv: "ފޮތް", roman: "foiy", en: "book", picture: "book", topic: "home" },
  { id: "drum", dv: "ބެރު", roman: "beru", en: "drum", picture: "drum", topic: "home" },
  // Food and drink
  { id: "coconut", dv: "ކާށި", roman: "kaashi", en: "coconut", picture: "coconut", topic: "food" },
  { id: "water", dv: "ފެން", roman: "fen", en: "water", picture: "water", topic: "food" },
  { id: "tea", dv: "ސައި", roman: "sai", en: "tea", picture: "tea", topic: "food" },
  { id: "milk", dv: "ކިރު", roman: "kiru", en: "milk", picture: "milk", topic: "food" },
  { id: "bread", dv: "ޕާން", roman: "paan", en: "bread", picture: "bread", topic: "food" },
  { id: "rice", dv: "ބަތް", roman: "bai", en: "rice", picture: "rice", topic: "food" },
  { id: "banana", dv: "ދޮންކެޔޮ", roman: "dhonkeyo", en: "banana", picture: "banana", topic: "food" },
  { id: "watermelon", dv: "ކަރާ", roman: "karaa", en: "watermelon", picture: "watermelon", topic: "food" },
  { id: "egg", dv: "ބިސް", roman: "bis", en: "egg", picture: "egg", topic: "food" },
  { id: "dates", dv: "ކަދުރު", roman: "kadhuru", en: "dates", picture: "dates", topic: "food" },
  // Body
  { id: "eye", dv: "ލޯ", roman: "loa", en: "eye", picture: "eye", topic: "body" },
  { id: "hand", dv: "އަތް", roman: "ai", en: "hand", picture: "hand", topic: "body" },
  // Colours
  { id: "c-red", dv: "ރަތު", roman: "rathu", en: "red", colour: "#e0483e", topic: "colours" },
  { id: "c-blue", dv: "ނޫ", roman: "noo", en: "blue", colour: "#3b7fd9", topic: "colours" },
  { id: "c-green", dv: "ފެހި", roman: "fehi", en: "green", colour: "#3fa65a", topic: "colours" },
  { id: "c-yellow", dv: "ރީނދޫ", roman: "reendhoo", en: "yellow", colour: "#f2c230", topic: "colours" },
  { id: "c-black", dv: "ކަޅު", roman: "kalhu", en: "black", colour: "#25272b", topic: "colours" },
  { id: "c-white", dv: "ހުދު", roman: "hudhu", en: "white", colour: "#ffffff", topic: "colours" },
  // Ramadan words
  { id: "r-ramadan", dv: "ރޯދަމަސް", roman: "roadhamas", en: "the month of Ramadan", picture: "ramadan", topic: "ramadan" },
  { id: "r-fast", dv: "ރޯދަ", roman: "roadha", en: "fasting", picture: "fasting", topic: "ramadan" },
  { id: "r-suhoor", dv: "ހާރު", roman: "haaru", en: "Suhoor (the meal before dawn)", picture: "suhoor", topic: "ramadan" },
  { id: "r-iftar", dv: "ރޯދަ ވީލުން", roman: "roadha veelun", en: "Iftar (breaking the fast)", picture: "iftar", topic: "ramadan" },
  { id: "r-mosque", dv: "މިސްކިތް", roman: "miskiy", en: "mosque", picture: "mosque", topic: "ramadan" },
  { id: "r-prayer", dv: "ނަމާދު", roman: "namaadhu", en: "prayer", picture: "prayer", topic: "ramadan" },
  { id: "r-eid", dv: "ޢީދު", roman: "eid", en: "Eid", picture: "eid", topic: "ramadan" },
  { id: "r-thanks", dv: "ޝުކުރިއްޔާ", roman: "shukuriyaa", en: "thank you", picture: "thanks", topic: "ramadan" },
];

export const wordById = (id: string) => WORDS.find((w) => w.id === id);
export const pictureWords = WORDS.filter((w) => w.picture && w.topic !== "ramadan");
export const colourWords = WORDS.filter((w) => w.topic === "colours");
export const ramadanWords = WORDS.filter((w) => w.topic === "ramadan");

/** Numbers 1–10 in Dhivehi. */
export const NUMBERS: { n: number; dv: string; roman: string }[] = [
  { n: 1, dv: "އެކެއް", roman: "eke" },
  { n: 2, dv: "ދޭއް", roman: "dheyh" },
  { n: 3, dv: "ތިނެއް", roman: "thineh" },
  { n: 4, dv: "ހަތަރެއް", roman: "hathareh" },
  { n: 5, dv: "ފަހެއް", roman: "faheh" },
  { n: 6, dv: "ހައެއް", roman: "haeh" },
  { n: 7, dv: "ހަތެއް", roman: "hatheh" },
  { n: 8, dv: "އަށެއް", roman: "asheh" },
  { n: 9, dv: "ނުވައެއް", roman: "nuvaeh" },
  { n: 10, dv: "ދިހައެއް", roman: "dhihaeh" },
];

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

export const DV_GAMES: DvGameInfo[] = [
  { id: "letters", title: "Meet the letters", description: "All 24 Thaana letters, with a word for each.", howToPlay: ["Tap a letter.", "See its name, its sound and a word that uses it."], picture: "book", tone: "gold" },
  { id: "trace", title: "Trace the letter", description: "Write each letter with your finger.", howToPlay: ["Follow the grey letter with your finger.", "Thaana is written from right to left.", "Keep going until the letter turns green."], picture: "hand", tone: "sky" },
  { id: "bubbles", title: "Letter bubbles", description: "Pop every bubble with the right letter.", howToPlay: ["Look at the letter at the top.", "Tap each bubble that has the same letter.", "Find them all!"], picture: "sea", tone: "mint" },
  { id: "find-word", title: "Find the word", description: "Which word goes with the picture?", howToPlay: ["Look at the picture.", "Tap the Dhivehi word that matches it."], picture: "fish", tone: "rose" },
  { id: "first-letter", title: "First letter", description: "Which letter does the word start with?", howToPlay: ["Look at the picture and its word.", "Tap the letter the word starts with."], picture: "turtle", tone: "lavender" },
  { id: "count", title: "Let's count", description: "Count the pictures and pick the number word.", howToPlay: ["Count the pictures. Take your time!", "Tap the Dhivehi number word."], picture: "coconut", tone: "gold" },
  { id: "colours", title: "Colours", description: "Learn the colours in Dhivehi.", howToPlay: ["Look at the colour.", "Tap its Dhivehi name."], picture: "flower", tone: "rose" },
  { id: "fili", title: "Fili sounds", description: "Letters plus fili make sounds like ba, bi, bu.", howToPlay: ["Look at the letter and its fili (the little mark).", "Tap the sound they make together."], picture: "star", tone: "emerald" },
  { id: "memory", title: "Memory match", description: "Match each picture with its word.", howToPlay: ["Tap a card to turn it over.", "Find the picture and the word that go together."], picture: "cat", tone: "lavender" },
  { id: "build-word", title: "Build the word", description: "Put the pieces in order to write a word.", howToPlay: ["Look at the picture.", "Tap the pieces in order. Thaana starts on the right!"], picture: "house", tone: "sky" },
  { id: "sums", title: "Add and take away", description: "Little sums with Dhivehi number words.", howToPlay: ["Look at the sum.", "Count if you like, then tap the answer."], picture: "dates", tone: "mint" },
  { id: "ramadan-words", title: "Ramadan words", description: "Say Ramadan words in Dhivehi.", howToPlay: ["Look at the picture.", "Tap the Dhivehi word that matches it."], picture: "ramadan", tone: "emerald" },
];
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
