/**
 * Content validation: stable IDs, valid references, child-safe wording,
 * no unverified religious quotations, and review status.
 * Set RELEASE_CONTENT_CHECK=1 to require every religious/safety item to be reviewed (launch gate).
 */
import { describe, expect, it } from "vitest";
import { ILLUSTRATION_KEYS } from "@/components/art/illustrationKeys";
import { badges } from "@/content/badges";
import * as copy from "@/content/copy";
import { allDays } from "@/content/days";
import { decorations, ROOM_SLOTS } from "@/content/decorations";
import { firstFastPages, JOURNAL_OPTIONS } from "@/content/firstFast";
import { games, memoryCards, pictureWords, sortCards, vocabulary } from "@/content/games";
import { goals } from "@/content/goals";
import { lessons } from "@/content/lessons";
import { missions } from "@/content/missions";
import { quizSets } from "@/content/quizzes";
import { reviewItems } from "@/content/review";
import * as safety from "@/content/safety";
import { stories } from "@/content/stories";

const ALL = { lessons, stories, missions, quizSets, vocabulary, sortCards, goals, badges, decorations, firstFastPages, allDays, games, pictureWords, memoryCards, JOURNAL_OPTIONS, copy, safety };
const allText = JSON.stringify(ALL);
const illus = new Set<string>(ILLUSTRATION_KEYS);

function unique(ids: string[], label: string) {
  expect(new Set(ids).size, `${label} ids must be unique`).toBe(ids.length);
}

describe("structure", () => {
  it("ids are unique and kebab-case", () => {
    for (const [label, list] of Object.entries({ lessons, stories, missions, quizSets, vocabulary, sortCards, goals, badges, decorations, firstFastPages })) {
      const ids = (list as { id: string }[]).map((x) => x.id);
      unique(ids, label);
      for (const id of ids) expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
    unique(quizSets.flatMap((q) => q.questions.map((x) => x.id)), "quiz questions");
  });

  it("has the planned amount of content", () => {
    expect(lessons.length).toBeGreaterThanOrEqual(20);
    expect(allDays).toHaveLength(30);
    expect(games).toHaveLength(7);
    expect(missions.length).toBeGreaterThanOrEqual(20);
  });

  it("every journey day references real content", () => {
    allDays.forEach((d, i) => {
      expect(d.id).toBe(`d${String(i + 1).padStart(2, "0")}`);
      const learnList = d.learn.kind === "lesson" ? lessons : stories;
      expect(learnList.some((x) => x.id === d.learn.id), `${d.id} learn`).toBe(true);
      expect(missions.some((m) => m.id === d.kindnessId), `${d.id} kindness`).toBe(true);
      expect(games.some((g) => g.id === d.play.game), `${d.id} game`).toBe(true);
      if (d.play.game === "quiz") expect(quizSets.some((q) => q.id === d.play.quizSetId), `${d.id} quiz`).toBe(true);
      expect(d.reflection.length).toBeGreaterThan(5);
    });
  });

  it("every illustration key exists", () => {
    const keys = [...lessons, ...stories, ...missions, ...quizSets, ...vocabulary, ...sortCards, ...goals, ...firstFastPages, ...allDays, ...games, ...pictureWords, ...memoryCards, ...JOURNAL_OPTIONS].map((x) => x.illustration);
    keys.push(...stories.flatMap((s) => s.pages.map((p) => p.illustration)));
    for (const k of keys) expect(illus.has(k), k).toBe(true);
  });

  it("quiz questions have 3 options, a valid answer and an explanation", () => {
    for (const q of quizSets.flatMap((s) => s.questions)) {
      expect(q.options).toHaveLength(3);
      expect(new Set(q.options).size).toBe(3);
      expect([0, 1, 2]).toContain(q.answer);
      expect(q.explanation.length).toBeGreaterThan(15);
    }
  });

  it("lessons are short (2–4 minutes) and stories have pages", () => {
    for (const l of lessons) {
      expect(l.minutes).toBeGreaterThanOrEqual(2);
      expect(l.minutes).toBeLessThanOrEqual(4);
      const words = l.sections.map((s) => s.text).join(" ").split(/\s+/).length;
      expect(words, l.id).toBeLessThan(420);
    }
    for (const s of stories) expect(s.pages.length).toBeGreaterThanOrEqual(5);
  });

  it("every decoration slot exists and every badge has a hint", () => {
    const slots = new Set(ROOM_SLOTS.map((s) => s.id));
    for (const d of decorations) expect(slots.has(d.slot)).toBe(true);
    for (const b of badges) expect(b.hint.length).toBeGreaterThan(3);
  });
});

describe("child safety wording", () => {
  const banned = [/you failed/i, /lost your streak/i, /\bstreak\b(?!s? for)/i, /real champions/i, /must finish/i, /you must fast/i, /don't tell/i, /shame/i, /naughty/i, /\bbad (boy|girl|child)\b/i, /hell(fire)?\b/i, /punish/i, /buy\b/i, /purchase/i, /\bshop\b/i];

  it("no shame, pressure, fear or purchase wording in child content", () => {
    const childText = JSON.stringify({ lessons, stories, missions, quizSets, vocabulary, sortCards, goals, badges, decorations, firstFastPages, allDays, games, JOURNAL_OPTIONS });
    for (const re of banned) expect(childText, String(re)).not.toMatch(re);
  });

  it("the quiz option 'Keep it a secret' only appears as the wrong answer", () => {
    const q = quizSets.flatMap((s) => s.questions).find((x) => x.options.some((o) => /secret/i.test(o)));
    if (q) expect(/secret/i.test(q.options[q.answer])).toBe(false);
  });

  it("the health message matches the specification", () => {
    expect(safety.CHILD_HEALTH_MESSAGE).toContain("Your health comes first!");
    expect(safety.CHILD_HEALTH_MESSAGE).toContain("tell your parent or another trusted adult straight away");
    expect(safety.CHILD_HEALTH_MESSAGE).toContain("You can stop fasting whenever you need to");
  });

  it("missions involving food, heat, giving, visiting or calling require an adult", () => {
    for (const m of missions) {
      const t = `${m.title} ${m.description}`.toLowerCase();
      if (/iftar|cook|scissor|give food|in need|visit|call|neighbour|mosque/.test(t)) expect(m.adultHelpRequired, m.id).toBe(true);
      if (m.adultHelpRequired) expect(m.safetyNote, m.id).toBeTruthy();
    }
  });

  it("no mission asks children to photograph or identify people", () => {
    expect(JSON.stringify(missions)).not.toMatch(/photo|camera|picture of (them|someone)|name of|post online|share online/i);
  });

  it("no medical promises", () => {
    expect(allText).not.toMatch(/safe for (all|every) child|guarantee|cure|healthy to fast/i);
  });
});

describe("religious content rules", () => {
  it("contains no Quran or hadith quotations or attributions", () => {
    expect(allText).not.toMatch(/\b(surah|sura)\s+[A-Z][a-z-]+\s*\(?\d|\b\d{1,3}\s*:\s*\d{1,3}\b|narrated by|hadith|sahih|bukhari|muslim reported|the prophet said|allah says/i);
  });

  it("does not claim which night is Laylatul Qadr or show prayer/fasting times", () => {
    expect(allText).not.toMatch(/laylatul qadr is (on )?the \d|27th night is/i);
    expect(allText).not.toMatch(/\b\d{1,2}:\d{2}\s?(am|pm)?\b/i);
  });

  it("every religious and safety item has a review status", () => {
    for (const r of reviewItems()) expect(["draft", "in_review", "reviewed"]).toContain(r.review.status);
  });

  it.runIf(process.env.RELEASE_CONTENT_CHECK === "1")("RELEASE GATE: every item has been reviewed", () => {
    const pending = reviewItems().filter((r) => r.review.status !== "reviewed");
    expect(pending.map((p) => `${p.type}: ${p.title}`)).toEqual([]);
  });
});

describe("product identity", () => {
  it("never uses the retired working name", () => {
    expect(allText).not.toMatch(/my first ramadan/i);
    expect(copy.APP_NAME).toBe("Little Ramadan");
    expect(copy.TAGLINE).toBe("My Little Journey of Faith, Kindness & Discovery.");
  });
});
