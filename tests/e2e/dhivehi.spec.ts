import { expect, test, type Page } from "@playwright/test";
import { onboard, openParentZone, starCount } from "./helpers";

async function popAll(page: Page) {
  for (let round = 0; round < 3; round++) {
    const name = await page.getByTestId("dv-target").getAttribute("data-name");
    const bubbles = page.getByRole("button", { name: `Bubble ${name}`, exact: true });
    await expect(bubbles).toHaveCount(4);
    for (let k = 0; k < 4; k++) await bubbles.first().click();
    if (round < 2) await expect(page.getByTestId("dv-target")).not.toHaveAttribute("data-name", name!);
  }
}

async function answerAll(page: Page) {
  for (;;) {
    const answers = page.getByTestId("dv-answers");
    if (!(await answers.isVisible().catch(() => false))) break;
    const n = await answers.getByRole("button").count();
    for (let k = 0; k < n; k++) {
      const b = answers.getByRole("button").nth(k);
      if ((await b.getAttribute("aria-disabled")) === "true") continue;
      await b.click();
      if (await page.getByRole("button", { name: /^(Next|Finish)/ }).isVisible()) break;
    }
    const next = page.getByRole("button", { name: /^(Next|Finish)/ });
    const label = await next.innerText();
    await next.click();
    if (label.startsWith("Finish")) break;
  }
}

test("Learn Dhivehi: a day for every day of Ramadan, letter of the day, and games that save progress", async ({ page }) => {
  test.setTimeout(120000);
  await onboard(page);
  await page.getByRole("link", { name: /Learn Dhivehi/ }).first().click();
  await expect(page.getByRole("heading", { name: "Learn Dhivehi" })).toBeVisible();
  await expect(page.getByTestId("dv-days").getByRole("listitem")).toHaveCount(30);
  const before = await starCount(page);
  await page.goto("/dhivehi/");

  // Day 1: meet haa, then pop the letter bubbles.
  await page.getByRole("link", { name: /^Day 1:/ }).click();
  await expect(page.getByTestId("dv-letter-card")).toContainText("haa");
  await expect(page.getByTestId("dv-letter-card")).toContainText("handhu");
  await popAll(page);
  await expect(page.getByRole("heading", { name: "Well done!" })).toBeVisible();
  await page.getByRole("button", { name: /Yay! Continue/ }).click();
  await expect(page.getByText("Done").first()).toBeVisible();

  // Day 2 is a word game.
  await page.goto("/dhivehi/day/2/");
  await expect(page.getByTestId("dv-letter-card")).toContainText("shaviyani");
  await answerAll(page);
  await expect(page.getByRole("heading", { name: "Well done!" })).toBeVisible();
  await page.getByRole("button", { name: /Yay! Continue/ }).click();

  // Build the word (free play): tap the pieces in order.
  await page.goto("/dhivehi/play/build-word/");
  for (let w = 0; w < 4; w++) {
    const pieces = page.getByTestId("dv-pieces").getByRole("button");
    const n = await pieces.count();
    for (let k = 0; k < n; k++) await page.locator(`[data-index="${k}"]`).click();
    await page.getByRole("button", { name: /^(Next word|Finish)/ }).click();
  }
  await expect(page.getByRole("heading", { name: "Well done!" })).toBeVisible();
  await page.getByRole("button", { name: /Yay! Continue/ }).click();

  await page.goto("/dhivehi/");
  await expect(page.getByText("2 of 30 done")).toBeVisible();
  expect(await starCount(page)).toBe(before + 3);

  // Progress survives a reload.
  await page.goto("/dhivehi/");
  await page.reload();
  await expect(page.getByText("2 of 30 done")).toBeVisible();
});

test("Learn Dhivehi follows a 29-day Ramadan, and day 1 is linked from the journey", async ({ page }) => {
  await onboard(page);
  await page.goto("/journey/d01/");
  await page.getByRole("link", { name: /Letter haa/ }).click();
  await expect(page).toHaveURL(/\/dhivehi\/day\/1\/$/);
  await openParentZone(page);
  await page.getByRole("tab", { name: "Calendar" }).click();
  await page.getByRole("button", { name: "29 days" }).click();
  await expect(page.getByRole("button", { name: "29 days" })).toHaveAttribute("aria-pressed", "true");
  await page.goto("/dhivehi/");
  await expect(page.getByTestId("dv-days").getByRole("listitem")).toHaveCount(29);
  await page.goto("/dhivehi/day/29/");
  await expect(page.getByRole("heading", { name: /Day 29 · Eid words/ })).toBeVisible();
});

test("Dhivehi is shown in Thaana, right to left, and every game opens", async ({ page }) => {
  await onboard(page);
  await page.goto("/dhivehi/play/letters/");
  const grid = page.getByTestId("dv-letter-grid");
  await expect(grid.getByRole("button")).toHaveCount(24);
  await expect(grid).toHaveAttribute("dir", "rtl");
  const font = await page.locator(".thaana").first().evaluate((el) => getComputedStyle(el).fontFamily);
  expect(font).toContain("Noto Sans Thaana");
  for (const g of ["trace", "bubbles", "find-word", "first-letter", "count", "colours", "fili", "memory", "build-word", "sums", "ramadan-words"]) {
    await page.goto(`/dhivehi/play/${g}/`);
    await expect(page.locator("main")).not.toContainText("Something went wrong");
    await expect(page.locator(".dv-trace, [data-testid=dv-bubbles], [data-testid=dv-answers], [data-testid=dv-memory], [data-testid=dv-pieces]").first()).toBeVisible();
  }
});
