import { expect, test } from "@playwright/test";
import { isoDaysFromToday, onboard, openParentZone, seedCompletions } from "./helpers";

test("finishing lessons and missions earns stickers for the Sticker Album (no room or decorations)", async ({ page }) => {
  await onboard(page);
  await page.goto("/rewards/stickers/");
  const locked = page.getByRole("link", { name: /What is Ramadan\?: not collected yet/ });
  await expect(locked).toBeVisible();
  await locked.click();
  await expect(page).toHaveURL(/\/learn\/lesson\/what-is-ramadan\/$/);
  await page.getByRole("button", { name: /I finished this lesson/ }).click();
  await expect(page.getByText("New sticker: What is Ramadan?")).toBeVisible();
  await expect(page.getByText(/New decoration|Decorate my room/)).toHaveCount(0);
  await page.getByRole("link", { name: "See my Sticker Album" }).click();
  await expect(page).toHaveURL(/\/rewards\/stickers\/$/);
  await page.getByRole("button", { name: "What is Ramadan? sticker" }).click();
  await expect(page.getByRole("dialog")).toContainText("Ramadan is a special month");
  await page.getByRole("button", { name: "Back to my album" }).click();

  // Kindness page of the album.
  await page.goto("/kindness/tidy-toys/");
  await page.getByRole("button", { name: /I did it!/ }).click();
  await expect(page.getByText(/New sticker:/)).toBeVisible();
  await page.getByRole("button", { name: "Yay! Continue" }).click();
  await page.goto("/rewards/stickers/");
  await page.getByRole("tab", { name: "Kindness" }).click();
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "1");
  await page.reload();
  await page.goto("/rewards/");
  await expect(page.getByRole("region", { name: "My stickers" })).toContainText("2 of");

  const res = await page.goto("/rewards/room/");
  expect(res?.status()).toBe(404);
});

test("badge gallery reflects seeded progress", async ({ page }) => {
  await onboard(page);
  await seedCompletions(page, [
    ...["tidy-toys", "say-thank-you", "set-table", "share-sibling", "help-family", "kind-card", "family-time", "water-plants"].map((id) => ({ kind: "kindness", contentId: id })),
  ]);
  await page.goto("/rewards/");
  await expect(page.getByRole("region", { name: "24 stars collected" })).toBeVisible();
  await expect(page.getByRole("listitem").filter({ hasText: "Kindness Hero" }).getByText("Earned", { exact: true })).toBeVisible();
  await expect(page.getByRole("listitem").filter({ hasText: "Little Scholar" }).getByText(/% there/)).toBeVisible();
});

test("no purchase, ad or random reward mechanics anywhere in rewards", async ({ page }) => {
  await onboard(page);
  for (const path of ["/rewards/", "/games/", "/home/"]) {
    await page.goto(path);
    const text = await page.locator("body").innerText();
    expect(text).not.toMatch(/\bbuy\b|purchase|\bprice\b|\$\d|coins?\b|loot|mystery box|spin|upgrade|premium|advert/i);
  }
});

test("the Ramadan trophy shows the nickname with Noor and Amina, can be saved, and never claims proof of fasting", async ({ page }) => {
  await onboard(page, "Coral Star");
  await page.goto("/rewards/trophy/");
  const scene = page.getByRole("img", { name: "Trophy for Coral Star, held up by Noor and Amina" });
  await expect(scene).toBeVisible();
  await expect(scene).toContainText("Coral Star");
  await expect(page.getByRole("heading", { name: "Well done, Coral Star!" })).toBeVisible();
  const text = await page.locator("main").innerText();
  expect(text).not.toMatch(/proof|certif(y|ies) that/i);
  await expect(page.getByText("It is not a record of fasting.")).toBeVisible();
  await page.getByRole("button", { name: "Tap the trophy!" }).click();
  await expect(page.locator(".trophy-button .tap-sparkles")).toHaveCount(1);
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: /Save as picture/ }).click();
  const d = await download;
  expect(d.suggestedFilename()).toBe("little-ramadan-trophy-coral-star.png");
  expect((await page.goto("/rewards/certificate/"))?.status()).toBe(404);
});

test("Eid works with a 29-day calendar and with no calendar", async ({ page }) => {
  await onboard(page, "Eid Kid");
  await page.goto("/rewards/eid/");
  await expect(page.getByRole("heading", { name: "Eid Mubarak, Eid Kid!" })).toBeVisible(); // explore mode

  await openParentZone(page);
  await page.getByRole("tab", { name: "Calendar" }).click();
  await page.getByLabel("First day of Ramadan").fill(isoDaysFromToday(-10));
  await page.getByRole("button", { name: "Save start date" }).click();
  await page.getByRole("button", { name: "29 days" }).click();
  await page.goto("/rewards/eid/");
  await expect(page.getByRole("heading", { name: "Eid is coming!" })).toBeVisible();
  await expect(page.getByText(/Day 29/)).toBeVisible();

  await openParentZone(page);
  await page.getByRole("tab", { name: "Calendar" }).click();
  await page.getByLabel("First day of Ramadan").fill(isoDaysFromToday(-28)); // today is day 29 = final day
  await page.getByRole("button", { name: "Save start date" }).click();
  await page.goto("/rewards/eid/");
  await expect(page.getByRole("heading", { name: "Eid Mubarak, Eid Kid!" })).toBeVisible();
  await page.goto("/journey/d30/");
  await expect(page.getByRole("heading", { level: 1, name: "Day 29 · Eid Celebration" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /end of your Ramadan journey/ })).toBeVisible();
});

test("the experience works without sound", async ({ page }) => {
  await onboard(page);
  await page.getByRole("button", { name: /Turn sound off/ }).click();
  await expect(page.getByRole("button", { name: /Turn sound on/ })).toBeVisible();
  await page.goto("/kindness/say-thank-you/");
  await page.getByRole("button", { name: /I did it!/ }).click();
  await expect(page.getByRole("heading", { name: "You earned 3 stars!" })).toBeVisible(); // visual feedback carries all info
});
