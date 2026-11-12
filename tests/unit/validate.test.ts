/* eslint-disable @typescript-eslint/no-explicit-any -- tests deliberately break content */
/** The shared content validator: the shipped content passes, and common editing mistakes are caught. */
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { BUNDLED_CONTENT } from "@/content/bundle";
import { validateContent, type ContentBundle } from "@/content/validate";

const clone = (): ContentBundle => structuredClone(BUNDLED_CONTENT);
const messages = (c: ContentBundle, images?: Set<string>) => validateContent(c, { images }).map((i) => `${i.path}: ${i.message}`);

describe("validateContent", () => {
  it("passes for the shipped content", () => {
    expect(messages(clone())).toEqual([]);
  });

  it("catches broken references, duplicate IDs and bad quiz answers", () => {
    const c = clone() as any;
    c.days[0].learn.id = "no-such-lesson";
    c.stories[1].id = c.stories[0].id;
    c.quizzes[0].questions[0].answer = 5;
    c.quizzes[0].questions[1].options = ["a", "a", "b"];
    const m = messages(c);
    expect(m.some((x) => x.startsWith("days[0].learn.id"))).toBe(true);
    expect(m.some((x) => /stories\[1\]\.id: ID ".*" is used twice/.test(x))).toBe(true);
    expect(m.some((x) => x.startsWith("quizzes[0].questions[0].answer"))).toBe(true);
    expect(m.some((x) => /answers must all be different/.test(x))).toBe(true);
  });

  it("enforces child-safety and religious content rules", () => {
    const c = clone() as any;
    c.stories[0].pages[0].text = "You failed and lost your streak.";
    c.lessons[0].sections[0].text = "The Prophet said something (2:183).";
    c.safety.childHealthMessage = "Keep going!";
    c.badges[0].rule = { type: "count", kind: "journal", atLeast: 1 };
    c.missions[0].description = "Take a photo of someone you helped.";
    const m = messages(c).join("\n");
    expect(m).toMatch(/stories\[0\].*not allowed for children/);
    expect(m).toMatch(/quotations and references need a qualified reviewer/);
    expect(m).toMatch(/health message must include/);
    expect(m).toMatch(/badges\[0\]\.rule/);
    expect(m).toMatch(/photograph/);
  });

  it("keeps fixed parts fixed: 30 days, the seven games, journal choices", () => {
    const c = clone() as any;
    c.days.pop();
    c.games.pop();
    c.firstFast.journalOptions.pop();
    const m = messages(c).join("\n");
    expect(m).toMatch(/exactly 30 days/);
    expect(m).toMatch(/Games can be edited but not added/);
    expect(m).toMatch(/Journal choices can be reworded/);
  });

  it("accepts uploaded pictures only when the file exists", () => {
    const c = clone() as any;
    c.stories[0].pages[0].illustration = "img:boat.webp";
    const uploaded = readdirSync(join(__dirname, "../../public/content-images"));
    expect(messages(c, new Set([...uploaded, "boat.webp"]))).toEqual([]);
    expect(messages(c, new Set(uploaded)).join()).toMatch(/boat\.webp" has not been uploaded/);
    c.stories[0].pages[0].illustration = "img:../../evil.svg";
    expect(messages(c).join()).toMatch(/not a valid picture name/);
  });

  it("checks Dhivehi letters and words", () => {
    const c = clone() as any;
    c.dhivehi.letters[0].char = "h";
    c.dhivehi.words[0].dv = "moon";
    const m = messages(c).join("\n");
    expect(m).toMatch(/letters\[0\]\.char: Must be one Thaana letter/);
    expect(m).toMatch(/words\[0\]\.dv: Write the word in Thaana/);
  });
});
