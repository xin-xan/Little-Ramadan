/**
 * Learn Dhivehi: content validity, the automatic Ramadan plan, and the question generators.
 */
import { describe, expect, it } from "vitest";
import { DV_GAMES, dhivehiPlan, FILI, LETTERS, NUMBERS, splitAkuru, WORDS, wordById } from "@/content/dhivehi";
import { bubbleRound, buildWordRounds, colourQuestions, countQuestions, filiQuestions, findWordQuestions, firstLetterQuestions, memoryCards, ramadanWordQuestions, sumQuestions } from "@/game-engine/dhivehi";
import { seeded } from "@/game-engine/engine";

const THAANA_ONLY = /^[ހ-޿ ]+$/;

describe("Dhivehi content", () => {
  it("has the 24 Thaana letters, in order, each a single Thaana consonant", () => {
    expect(LETTERS).toHaveLength(24);
    expect(new Set(LETTERS.map((l) => l.char)).size).toBe(24);
    LETTERS.forEach((l, i) => expect(l.char.codePointAt(0)).toBe(0x0780 + i));
  });
  it("has ten fili (vowel signs)", () => {
    expect(FILI.map((f) => f.char.codePointAt(0))).toEqual(Array.from({ length: 10 }, (_, i) => 0x07a6 + i));
  });
  it("writes every word and number in Thaana only, with unique ids", () => {
    for (const w of WORDS) {
      expect(w.dv, w.id).toMatch(THAANA_ONLY);
      expect(w.roman).toMatch(/^[a-z ]+$/);
      expect(!!w.picture || !!w.colour, w.id).toBe(true);
    }
    for (const n of NUMBERS) expect(n.dv).toMatch(THAANA_ONLY);
    expect(new Set(WORDS.map((w) => w.id)).size).toBe(WORDS.length);
  });
  it("gives each letter example a real word that really uses that letter", () => {
    for (const l of LETTERS) {
      if (!l.example) continue;
      const w = wordById(l.example.wordId);
      expect(w, l.name).toBeTruthy();
      if (l.example.contains) expect(w!.dv.includes(l.char), l.name).toBe(true);
      else expect([...w!.dv][0], l.name).toBe(l.char);
    }
  });
  it("splits words into letters with their fili", () => {
    expect(splitAkuru("ކަނޑު")).toEqual(["ކަ", "ނ", "ޑު"]);
    expect(splitAkuru("ފޮތް")).toEqual(["ފޮ", "ތް"]);
    for (const w of WORDS) expect(splitAkuru(w.dv).join("")).toBe(w.dv.replace(/\s+/g, ""));
  });
});

describe("Ramadan plan", () => {
  for (const len of [29, 30] as const) {
    it(`covers all ${len} days, all 24 letters, and ends with Eid words`, () => {
      const plan = dhivehiPlan(len);
      expect(plan).toHaveLength(len);
      expect(plan.map((d) => d.day)).toEqual(Array.from({ length: len }, (_, i) => i + 1));
      expect(plan.filter((d) => d.letter).map((d) => d.letter!.char)).toEqual(LETTERS.map((l) => l.char));
      expect(plan[len - 1].game).toBe("ramadan-words");
      for (const d of plan) expect(DV_GAMES.some((g) => g.id === d.game)).toBe(true);
    });
  }
});

describe("question generators", () => {
  const gens = { findWordQuestions, ramadanWordQuestions, colourQuestions, firstLetterQuestions, countQuestions, sumQuestions, filiQuestions };
  for (const [name, gen] of Object.entries(gens)) {
    it(`${name}: one right answer, no duplicate options`, () => {
      for (let seed = 1; seed < 40; seed++) {
        const qs = gen(seeded(seed), LETTERS[seed % 24]);
        expect(qs.length).toBeGreaterThan(2);
        for (const q of qs) {
          expect(q.options.filter((o) => o.correct)).toHaveLength(1);
          expect(new Set(q.options.map((o) => o.key)).size).toBe(q.options.length);
        }
      }
    });
  }
  it("sums stay between 1 and 10", () => {
    for (let seed = 1; seed < 60; seed++)
      for (const q of sumQuestions(seeded(seed))) {
        const right = Number(q.options.find((o) => o.correct)!.key);
        expect(right).toBeGreaterThanOrEqual(1);
        expect(right).toBeLessThanOrEqual(10);
      }
  });
  it("a day's games practise its letter", () => {
    const baa = LETTERS[4];
    expect(firstLetterQuestions(seeded(3), baa)[0].options.find((o) => o.correct)!.key).toBe(baa.char);
    expect(bubbleRound(baa.char, seeded(2)).filter((b) => b.char === baa.char)).toHaveLength(4);
    expect(findWordQuestions(seeded(5), baa)[0].picture).toBeTruthy();
  });
  it("build-the-word never starts solved, and memory has 4 pairs", () => {
    for (let seed = 1; seed < 30; seed++) {
      for (const r of buildWordRounds(seeded(seed))) expect(r.shuffled.map((p) => p.id)).not.toEqual(r.pieces.map((_, i) => i));
      const cards = memoryCards(seeded(seed));
      expect(cards).toHaveLength(8);
      expect(new Set(cards.map((c) => c.pair)).size).toBe(4);
    }
  });
});
