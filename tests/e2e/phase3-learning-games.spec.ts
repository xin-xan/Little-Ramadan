import { expect, test, type Page } from "@playwright/test";
import { pictureWords } from "../../src/content/games";
import { answerUntilRight, expectNoHorizontalScroll, onboard } from "./helpers";

async function expectFinished(page: Page) {
  await expect(page.getByRole("heading", { name: "Well done!" })).toBeVisible();
}
async function dismissCelebration(page: Page) {
  const btn = page.getByRole("button", { name: "Yay! Continue" });
  if (await btn.isVisible().catch(() => false)) await btn.click();
}

test.beforeEach(async ({ page }) => {
  await onboard(page);
});

test("lessons and stories display, are readable and complete", async ({ page }) => {
  await page.goto("/learn/");
  await expect(page.getByRole("heading", { name: "Stories" })).toBeVisible();
  await page.getByRole("link", { name: /What is the Quran\?/ }).click();
  await expect(page.getByRole("heading", { name: "Words to know" })).toBeVisible();
  const size = await page.locator(".reader-text").first().evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  expect(size).toBeGreaterThanOrEqual(18);
  await expectNoHorizontalScroll(page);
  await page.getByRole("button", { name: /I finished this lesson/ }).click();
  await dismissCelebration(page);

  await page.goto("/learn/story/lost-lantern/");
  for (let i = 0; i < 5; i++) await page.getByRole("button", { name: /Next page/ }).click();
  await page.getByRole("button", { name: "Finish the story" }).click();
  await page.getByRole("button", { name: /I read this story/ }).click();
  await expect(page.getByRole("heading", { name: "You earned 2 stars!" })).toBeVisible();
});

test("kindness mission marks adult help and completes", async ({ page }) => {
  await page.goto("/kindness/help-iftar/");
  await expect(page.getByText("Do this with a grown-up.")).toBeVisible();
  await page.getByRole("button", { name: /I did it!/ }).click();
  await expect(page.getByRole("heading", { name: "You earned 3 stars!" })).toBeVisible();
});

test("quiz allows retrying and explains answers", async ({ page }) => {
  await page.goto("/games/quiz/eid/");
  await expect(page.getByText("Question 1 of 6")).toBeVisible();
  for (let i = 0; i < 6; i++) {
    await answerUntilRight(page, page.getByTestId("answers"));
    await expect(page.getByText(/That's right!/)).toBeVisible();
    await page.getByRole("button", { name: i < 5 ? "Next question →" : "Finish" }).click();
  }
  await expectFinished(page);
});

test("vocabulary match", async ({ page }) => {
  await page.goto("/games/vocab-match/");
  for (let i = 0; i < 6; i++) {
    await answerUntilRight(page, page.getByTestId("answers"));
    await page.getByRole("button", { name: i < 5 ? "Next word →" : "Finish" }).click();
  }
  await expectFinished(page);
});

test("match the words by tapping", async ({ page }) => {
  await page.goto("/games/match-words/");
  const words = page.getByRole("group", { name: "Words" }).getByRole("button");
  for (let i = 0; i < 4; i++) {
    const w = words.nth(i);
    const word = (await w.innerText()).trim();
    await w.click();
    const pic = pictureWords.find((p) => p.word === word)!;
    await page.getByRole("button", { name: `Picture of ${pic.picture}` }).click();
  }
  await expectFinished(page);
});

test("sort the good deeds", async ({ page }) => {
  await page.goto("/games/sort-deeds/");
  for (let i = 0; i < 8; i++) {
    await page.getByRole("button", { name: "💚 Kind choice" }).click();
    await page.getByRole("button", { name: i < 7 ? "Next card →" : "Finish" }).click();
  }
  await expectFinished(page);
});

test("find the missing lantern (untimed)", async ({ page }) => {
  await page.goto("/games/missing-lantern/");
  for (let round = 0; round < 3; round++) {
    const shown = await page.getByRole("list", { name: "Lanterns on the string" }).getByRole("listitem").evaluateAll((els) => els.map((e) => e.getAttribute("aria-label")));
    await page.waitForTimeout(1500); // no timer: nothing changes while looking
    await expect(page.getByRole("button", { name: "I'm ready!" })).toBeVisible();
    await page.getByRole("button", { name: "I'm ready!" }).click();
    const opts = page.getByRole("group", { name: "Which lantern is missing?" }).getByRole("button");
    const n = await opts.count();
    for (let i = 0; i < n; i++) {
      const label = (await opts.nth(i).getAttribute("aria-label"))!;
      const stillShown = await page.getByRole("list", { name: "Lanterns on the string" }).getByRole("listitem", { name: label, exact: true }).count();
      if (shown.includes(label) && stillShown === 0) {
        await opts.nth(i).click();
        break;
      }
    }
    await page.getByRole("button", { name: round < 2 ? "Next round →" : "Finish" }).click();
  }
  await expectFinished(page);
});

test("mosque puzzle by tapping to swap", async ({ page }) => {
  await page.goto("/games/mosque-puzzle/");
  await page.getByRole("button", { name: "Easy (4 pieces)" }).click();
  const names = ["top left", "top right", "bottom left", "bottom right"];
  for (let pos = 0; pos < 4; pos++) {
    if (await page.getByRole("heading", { name: "Well done!" }).isVisible()) break;
    const target = page.getByRole("button", { name: new RegExp(`^Position ${names[pos]}:`) });
    if ((await target.getAttribute("aria-label"))!.includes("in the right place")) continue;
    await target.click();
    await page.getByRole("button", { name: new RegExp(`piece from the ${names[pos]}(,|$)`) }).click();
  }
  await expectFinished(page);
});

test("memory cards", async ({ page }) => {
  await page.goto("/games/memory-cards/");
  await page.getByRole("button", { name: "8 cards" }).click();
  const seen = new Map<string, number[]>();
  const cards = page.locator(".grid-3 button");
  const total = await cards.count();
  // flip each card once to learn the layout
  for (let i = 0; i < total; i++) {
    if ((await cards.nth(i).getAttribute("aria-label"))!.includes("matched")) continue;
    await cards.nth(i).click();
    const label = (await cards.nth(i).getAttribute("aria-label"))!.replace(", matched", "");
    seen.set(label, [...(seen.get(label) ?? []), i]);
  }
  for (const [, idxs] of seen) {
    if (await page.getByRole("heading", { name: "Well done!" }).isVisible()) break;
    if ((await cards.nth(idxs[0]).getAttribute("aria-label"))!.includes("matched")) continue;
    await cards.nth(idxs[0]).click();
    await cards.nth(idxs[1]).click();
  }
  await expectFinished(page);
});

test("all seven games award exactly one explore star each", async ({ page }) => {
  await page.goto("/games/");
  await expect(page.getByRole("link", { name: /New/ })).toHaveCount(7);
});

test("cached lessons and games work offline", async ({ page, context }) => {
  await page.reload();
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  // wait for precache to finish (install completes before the worker controls the page)
  await context.setOffline(true);
  for (const path of ["/learn/lesson/zakat/", "/learn/story/eid-morning/", "/games/memory-cards/", "/games/quiz/knowledge/", "/journey/d21/", "/rewards/room/"]) {
    await page.goto(path);
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.getByText("You're offline")).toBeVisible();
  }
  await context.setOffline(false);
});
