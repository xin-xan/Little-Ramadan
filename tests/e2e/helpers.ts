import { expect, type Page } from "@playwright/test";

const WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];

/** Answers the parent gate's word multiplication question. */
export async function passGate(page: Page) {
  const q = await page.getByTestId("gate-question").innerText();
  const m = q.match(/What is (\w+) times (\w+)\?/);
  if (!m) throw new Error(`Unexpected gate question: ${q}`);
  const answer = WORDS.indexOf(m[1]) * WORDS.indexOf(m[2]);
  await page.getByLabel("Answer").fill(String(answer));
  await page.getByRole("button", { name: "OK" }).click();
}

/** Completes onboarding as a parent + child. */
export async function onboard(page: Page, nickname = "Star Explorer", avatar = "Dolphin") {
  await page.goto("/");
  await expect(page).toHaveURL(/\/welcome\/$/);
  await page.getByRole("button", { name: "Start" }).click();
  await page.getByRole("button", { name: "Next" }).click(); // Noor
  await page.getByRole("button", { name: "Get a grown-up" }).click();
  await page.getByRole("button", { name: "I'm a grown-up" }).click();
  await passGate(page);
  await expect(page.getByRole("heading", { name: "For parents and guardians" })).toBeVisible();
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Agree and continue" }).click();
  await page.getByRole("textbox", { name: "Nickname" }).fill(nickname);
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("radio", { name: new RegExp(avatar) }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: "Next" }).click(); // prefs
  await page.getByRole("button", { name: "I understand" }).click();
  await page.getByRole("button", { name: "Enter Ramadan Village" }).click();
  await expect(page).toHaveURL(/\/home\/$/);
  await expect(page.getByText(`Welcome to Ramadan Village, ${nickname}!`)).toBeVisible();
}

export async function openParentZone(page: Page) {
  await page.goto("/parent/");
  await passGate(page);
  await expect(page.getByRole("tablist", { name: "Parent Zone sections" })).toBeVisible();
}

/** Fails the test if the page has horizontal overflow (broken mobile layout). */
export async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, "page should not scroll sideways").toBeLessThanOrEqual(1);
}
