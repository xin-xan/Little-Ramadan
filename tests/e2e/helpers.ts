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

/** Writes completion records straight into IndexedDB (to set up reward states quickly), then reloads. */
export async function seedCompletions(page: Page, items: { kind: string; contentId: string }[]) {
  await page.evaluate(async (items) => {
    const db: IDBDatabase = await new Promise((res, rej) => {
      const r = indexedDB.open("little-ramadan");
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
    const tx = db.transaction("completions", "readwrite");
    for (const it of items) tx.objectStore("completions").put({ id: `${it.kind}:${it.contentId}`, ...it, completedAt: new Date().toISOString() });
    await new Promise((res) => (tx.oncomplete = res));
    db.close();
  }, items);
  await page.reload();
}

export async function starCount(page: Page) {
  await page.goto("/rewards/");
  const t = await page.getByText("stars collected").locator("..").innerText();
  return Number(t.match(/★\s*(\d+)/)![1]);
}

/** Answer a 3-option question by trying each option until it is marked correct (exercises retry). */
export async function answerUntilRight(page: Page, group: ReturnType<Page["getByTestId"]>) {
  const success = page.getByText(/That's right!|means “/);
  await expect(success).toHaveCount(0); // previous question's feedback has gone
  const n = await group.getByRole("button").count();
  for (let i = 0; i < n; i++) {
    const b = group.getByRole("button").nth(i);
    if ((await b.getAttribute("aria-disabled")) === "true") continue;
    await b.click();
    // wait until the click is processed: either solved, or this option marked wrong
    await expect.poll(async () => (await success.count()) > 0 || (await b.getAttribute("aria-disabled")) === "true").toBe(true);
    if ((await success.count()) > 0) return;
  }
}

export function isoDaysFromToday(offset: number) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
