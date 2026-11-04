import { expect, test, type Page } from "@playwright/test";
import { onboard } from "./helpers";

/**
 * Voice narration with a stand-in speech engine (test browsers have no voices).
 * It records what would be spoken, and only offers one on-device English voice.
 */
async function fakeVoices(page: Page, { local = true } = {}) {
  await page.addInitScript((isLocal) => {
    const spoken: string[] = [];
    (window as unknown as { __spoken: string[] }).__spoken = spoken;
    const voice = { name: "Test Voice", lang: "en-GB", localService: isLocal, default: true, voiceURI: "test" };
    let timer: number | undefined;
    let current: { onend?: () => void } | null = null;
    const synth = {
      speaking: false,
      getVoices: () => [voice],
      addEventListener() {},
      speak(u: SpeechSynthesisUtterance & { onend?: () => void }) {
        if (u.text.trim()) spoken.push(u.text);
        current = u;
        timer = window.setTimeout(() => current?.onend?.(), 40);
      },
      cancel() {
        window.clearTimeout(timer);
        current = null;
      },
    };
    Object.defineProperty(window, "speechSynthesis", { value: synth, configurable: true });
    (window as unknown as { SpeechSynthesisUtterance: unknown }).SpeechSynthesisUtterance = class {
      text: string;
      voice = null;
      lang = "";
      rate = 1;
      pitch = 1;
      volume = 1;
      onend = null;
      onerror = null;
      constructor(t: string) {
        this.text = t;
      }
    };
  }, local);
}

const spoken = (page: Page) => page.evaluate(() => (window as unknown as { __spoken: string[] }).__spoken.slice());

test("stories are read aloud page by page, with a Read to me switch", async ({ page }) => {
  await fakeVoices(page);
  await onboard(page);
  await page.goto("/learn/story/noor-first-suhoor/");
  // Read to me is on by default: the first page is read automatically.
  await expect.poll(async () => (await spoken(page)).join(" ")).toContain("Mum gently woke Noor.");
  await expect.poll(async () => (await spoken(page)).join(" ")).toContain("time for Suhoor");
  await page.getByRole("button", { name: /Next page/ }).click();
  await expect.poll(async () => (await spoken(page)).join(" ")).toContain("The kitchen smelled of warm roshi and tea.");

  // Turning Read to me off stops automatic reading; the Listen button still works.
  const toggle = page.getByRole("switch", { name: /Read to me/ });
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-checked", "false");
  const before = (await spoken(page)).length;
  await page.getByRole("button", { name: /Next page/ }).click();
  await page.waitForTimeout(800);
  expect((await spoken(page)).length).toBe(before);
  await page.getByRole("button", { name: "Read this page" }).click();
  await expect.poll(async () => (await spoken(page)).join(" ")).toContain("Can I try fasting today?");
});

test("lessons, quizzes and information pages can be listened to", async ({ page }) => {
  await fakeVoices(page);
  await onboard(page);
  await page.goto("/learn/lesson/what-is-ramadan/");
  await expect.poll(async () => (await spoken(page)).join(" ")).toContain("Ramadan is the ninth month of the Islamic calendar.");

  await page.goto("/games/quiz/");
  await page.getByRole("link").filter({ hasText: /questions|quiz/i }).first().click();
  const answers = page.getByTestId("answers");
  await expect(answers).toBeVisible();
  const question = (await page.locator("#quiz-question").innerText()).trim();
  const firstAnswer = (await answers.getByRole("button").first().innerText()).replace(/^[ABC]\s*/, "").trim();
  // Asked naturally: "...? Is it <a>, <b>, or <c>?" in one breath.
  await expect.poll(async () => (await spoken(page)).join(" | ").toLowerCase()).toContain(`is it ${firstAnswer.toLowerCase()}`);
  expect((await spoken(page)).join(" | ")).toMatch(/, or .+\?/);
  expect(question.length).toBeGreaterThan(3);

  await page.goto("/safety/");
  await page.getByRole("button", { name: /Listen to Your health comes first/ }).click();
  await expect.poll(async () => (await spoken(page)).join(" ")).toMatch(/trusted adult/i);
});

test("no Listen buttons appear without an on-device voice (nothing is sent online)", async ({ page }) => {
  await fakeVoices(page, { local: false });
  await onboard(page);
  await page.goto("/learn/story/noor-first-suhoor/");
  await expect(page.getByRole("heading", { name: "Noor's First Suhoor" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Read this page" })).toHaveCount(0);
  await page.waitForTimeout(800);
  expect(await spoken(page)).toEqual([]);
  // The story still works by reading.
  await expect(page.getByText(/Mum gently woke Noor/)).toBeVisible();
});
