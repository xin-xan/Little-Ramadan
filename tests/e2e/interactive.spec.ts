import { expect, test } from "@playwright/test";
import { onboard } from "./helpers";

test("stories: tap the picture, story check questions and a feelings check-in", async ({ page }) => {
  await onboard(page);
  await page.goto("/learn/story/harbour-wait/");
  const pic = page.getByRole("button", { name: /Picture for page 1\. Tap the picture!/ });
  await pic.click();
  await expect(page.locator(".tap-picture.boing")).toHaveCount(1);
  for (let i = 0; i < 8; i++) {
    const next = page.getByRole("button", { name: /Next page|Finish the story/ });
    if (!(await next.isVisible())) break;
    await next.click();
  }
  const check = page.getByTestId("story-check");
  await expect(check).toContainText("What helped Noor feel calm while waiting?");
  await check.getByRole("button", { name: "Shouting" }).click();
  await expect(check.getByText("Not quite! Have another go.")).toBeVisible();
  await check.getByRole("button", { name: "Taking three slow breaths" }).click();
  await expect(check.getByText(/That's right!/)).toBeVisible();
  await check.getByRole("button", { name: /Next question/ }).click();
  await check.getByRole("button", { name: "Fish, crabs and a turtle" }).click();
  await check.getByRole("button", { name: /Done/ }).click();
  await expect(check.getByText("Well done! You remembered so much.")).toBeVisible();
  await page.getByRole("radio", { name: "Proud" }).click();
  await expect(page.getByText(/Feeling proud is lovely/)).toBeVisible();
  await page.getByRole("button", { name: /I read this story/ }).click();
  await expect(page.getByText(/New sticker: Waiting at the Harbour/)).toBeVisible();
});

test("lessons: learn one part at a time, flip word cards and a quick check", async ({ page }) => {
  await onboard(page);
  await page.goto("/learn/lesson/salah/");
  await expect(page.getByRole("heading", { name: "Talking to Allah" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Five prayers" })).toHaveCount(0);
  await page.getByRole("button", { name: /Tap to learn more \(1 of 4\)/ }).click();
  await expect(page.getByRole("heading", { name: "Five prayers" })).toBeVisible();
  await page.getByRole("button", { name: "Show the whole lesson" }).click();
  await expect(page.getByRole("heading", { name: "In Ramadan" })).toBeVisible();
  const card = page.getByRole("button", { name: /Tap to see what it means/ }).first();
  await card.click();
  await expect(page.locator(".flip-card.flipped")).toHaveCount(1);
  const qc = page.getByTestId("quick-check");
  await qc.getByRole("button", { name: "Five times" }).click();
  await expect(qc.getByText(/Muslims pray five times a day/)).toBeVisible();
});

test("games: Hilmy reacts to answers, the quiz has a free hint and memory has a peek", async ({ page }) => {
  await onboard(page);
  await page.goto("/games/quiz/ramadan-basics/");
  const answers = page.getByTestId("answers");
  await page.getByRole("button", { name: /Help me: take away a wrong answer/ }).click();
  await expect(answers.locator("[aria-disabled=true]")).toHaveCount(1);
  await expect(page.getByRole("button", { name: /Help me/ })).toHaveCount(0);
  for (const b of await answers.getByRole("button").all()) {
    if ((await b.getAttribute("aria-disabled")) === "true") continue;
    await b.click();
    if (await page.getByText(/That's right!/).isVisible()) break;
  }
  await expect(page.getByTestId("game-companion")).toBeVisible();

  await page.goto("/games/memory-cards/");
  await page.getByRole("button", { name: "8 cards" }).click();
  await page.getByRole("button", { name: /Peek at all the cards/ }).click();
  await expect(page.getByRole("button", { name: /face down/ })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /face down/ })).toHaveCount(8, { timeout: 5000 });
  await expect(page.getByRole("button", { name: /Peek at all the cards/ })).toHaveCount(0);
});
