import { describe, expect, it } from "vitest";
import { createDeck, flipCard, isSolved, makeChoiceRounds, makeLanternRound, memoryDone, prepareQuiz, scrambleTiles, seeded, swapTiles, type MemoryState } from "@/game-engine/engine";
import { lanternDesigns, vocabulary } from "@/content/games";
import { quizSets } from "@/content/quizzes";

describe("quiz", () => {
  it("shuffles options but keeps the correct answer", () => {
    for (const set of quizSets) {
      for (const q of prepareQuiz(set.questions, seeded(7))) {
        expect(q.shown).toHaveLength(3);
        expect(q.shown[q.correct]).toBe(q.options[q.answer]);
      }
    }
  });
});

describe("memory cards", () => {
  it("matches pairs and finishes", () => {
    let s: MemoryState = { deck: createDeck(["a", "b"], seeded(1)), open: [], moves: 0 };
    for (const id of ["a", "b"]) {
      const [x, y] = s.deck.filter((c) => c.pairId === id);
      s = flipCard(s, x.key);
      s = flipCard(s, y.key);
    }
    expect(memoryDone(s)).toBe(true);
    expect(s.moves).toBe(2);
  });

  it("a mismatch stays open until the next tap (no timers)", () => {
    let s: MemoryState = { deck: createDeck(["a", "b"], seeded(2)), open: [], moves: 0 };
    const a = s.deck.find((c) => c.pairId === "a")!;
    const b = s.deck.find((c) => c.pairId === "b")!;
    s = flipCard(s, a.key);
    s = flipCard(s, b.key);
    expect(s.open).toEqual([a.key, b.key]);
    const other = s.deck.find((c) => c.pairId === "a" && c.key !== a.key)!;
    s = flipCard(s, other.key);
    expect(s.open).toEqual([other.key]);
  });
});

describe("puzzle", () => {
  it("scramble is never already solved and swaps work", () => {
    for (let i = 0; i < 30; i++) expect(isSolved(scrambleTiles(4, seeded(i)))).toBe(false);
    expect(isSolved(swapTiles([1, 0, 2, 3], 0, 1))).toBe(true);
  });
});

describe("missing lantern", () => {
  it("options always include the missing lantern exactly once", () => {
    for (let i = 0; i < 30; i++) {
      const r = makeLanternRound(lanternDesigns, 5, 3, seeded(i));
      const missing = r.shown[r.missingIndex];
      expect(r.options.filter((o) => o === missing)).toHaveLength(1);
      expect(new Set(r.options).size).toBe(3);
    }
  });
});

describe("vocabulary", () => {
  it("each round has the target and distinct distractors", () => {
    for (const r of makeChoiceRounds(vocabulary, 6, 3, seeded(3))) {
      expect(r.options).toContain(r.target);
      expect(new Set(r.options).size).toBe(3);
    }
  });
});
