/**
 * Voice narration: sentence splitting, pronunciation, on-device-only voice choice,
 * and reading text from the screen (skipping buttons, links and hidden text).
 */
import { describe, expect, it } from "vitest";
import { pickVoice, segmentsFrom, splitSentences, toSpoken } from "@/accessibility/narration";
import { lessons } from "@/content/lessons";
import { stories } from "@/content/stories";

const v = (name: string, lang: string, localService: boolean, isDefault = false) => ({ name, lang, localService, default: isDefault, voiceURI: name }) as SpeechSynthesisVoice;

describe("splitSentences", () => {
  it("splits sentences and keeps closing quotes", () => {
    const t = `"It's time for Suhoor," she whispered. Noor smiled! "Can I try?" asked Noor`;
    const parts = splitSentences(t).map((s) => t.slice(s.start, s.end));
    expect(parts).toEqual([`"It's time for Suhoor," she whispered.`, "Noor smiled!", `"Can I try?"`, "asked Noor"]);
  });
  it("covers every story page without losing words", () => {
    for (const s of stories)
      for (const p of s.pages) {
        const joined = splitSentences(p.text).map((x) => p.text.slice(x.start, x.end)).join(" ");
        expect(joined.replace(/\s+/g, " ")).toBe(p.text.replace(/\s+/g, " ").trim());
      }
  });
});

describe("toSpoken", () => {
  it("re-spells Ramadan words for the voice without changing the screen text", () => {
    expect(toSpoken("Suhoor and Iftar")).toBe("Suhoor and Iftar");
    expect(toSpoken("Laylatul Qadr")).toBe("Laylatul Kadder");
    expect(toSpoken("Eid al-Fitr")).toBe("Eed al Fitter");
    expect(toSpoken("a dua")).toBe("a dooah");
    expect(toSpoken("Day 3 · Suhoor — the meal")).toBe("Day 3, Suhoor, the meal");
  });
  it("never adds hyphens, which make voices sound choppy", () => {
    for (const s of stories) for (const p of s.pages) expect(toSpoken(p.text)).not.toMatch(/[a-z]-[a-z]/i.test(p.text) ? /^$/ : /[a-z]-[a-z]/i);
  });
  it("produces speakable text for every lesson section", () => {
    for (const l of lessons) for (const s of l.sections) expect(toSpoken(s.text).length).toBeGreaterThan(10);
  });
});

describe("pickVoice", () => {
  it("never chooses a network voice (text must not leave the device)", () => {
    expect(pickVoice([v("Google UK English Female", "en-GB", false)])).toBeNull();
  });
  it("prefers natural English on-device voices and avoids novelty voices", () => {
    const chosen = pickVoice([v("Zarvox", "en-US", true), v("Thomas", "fr-FR", true), v("Samantha", "en-US", true), v("Daniel (Enhanced)", "en-GB", true)]);
    expect(chosen?.name).toBe("Daniel (Enhanced)");
  });
});

describe("segmentsFrom", () => {
  it("reads headings and paragraphs, skipping buttons, links and hidden text", () => {
    document.body.innerHTML = `<main id="m"><span class="pill">To do</span><h2>Iftar</h2><p>Iftar is the meal at sunset. Families eat <strong>dates</strong> first.</p>
      <button>Next</button><a href="#">Back</a><span aria-hidden="true">decor</span><p class="sr-only">hidden</p>
      <button><span data-narrate="read">Answer one</span></button></main>`;
    const segs = segmentsFrom(document.getElementById("m")!);
    expect(segs.map((s) => s.text)).toEqual(["Iftar", "Iftar is the meal at sunset.", "Families eat dates first.", "Answer one"]);
    expect(segs[1].spoken).toBe("Iftar is the meal at sunset.");
    expect(segs[1].block).toBe(segs[2].block);
    expect(segs[0].block).not.toBe(segs[1].block);
    expect(segs[2].range?.toString()).toBe("Families eat dates first.");
  });
});
