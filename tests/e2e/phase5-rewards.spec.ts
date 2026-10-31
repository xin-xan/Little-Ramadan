import { expect, test } from "@playwright/test";
import { isoDaysFromToday, onboard, openParentZone, seedCompletions } from "./helpers";

test("decorations unlock from activities and room choices persist", async ({ page }) => {
  await onboard(page);
  await page.goto("/rewards/room/");
  await page.getByRole("tab", { name: "Lantern" }).click();
  await expect(page.getByRole("radio", { name: /Gold lantern, locked/ })).toBeVisible();

  await page.goto("/kindness/tidy-toys/");
  await page.getByRole("button", { name: /I did it!/ }).click();
  await expect(page.getByText("New decoration: Gold lantern")).toBeVisible();
  await page.getByRole("link", { name: "Decorate my room" }).click();
  await page.getByRole("tab", { name: "Lantern" }).click();
  await page.getByRole("radio", { name: "Gold lantern", exact: true }).click();
  await expect(page.getByRole("radio", { name: "Gold lantern", exact: true })).toHaveAttribute("aria-checked", "true");
  await page.getByRole("tab", { name: "Wall" }).click();
  await page.getByRole("radio", { name: "Empty" }).click();
  await page.reload();
  await page.getByRole("tab", { name: "Lantern" }).click();
  await expect(page.getByRole("radio", { name: "Gold lantern", exact: true })).toHaveAttribute("aria-checked", "true");
  await page.getByRole("tab", { name: "Wall" }).click();
  await expect(page.getByRole("radio", { name: "Empty" })).toHaveAttribute("aria-checked", "true");
});

test("locked decorations cannot be selected", async ({ page }) => {
  await onboard(page);
  await page.goto("/rewards/room/");
  await page.getByRole("tab", { name: "Plant" }).click();
  await page.getByRole("radio", { name: /Little palm, locked/ }).click({ force: true });
  await expect(page.getByRole("radio", { name: /Little palm, locked/ })).toHaveAttribute("aria-checked", "false");
});

test("badge gallery and star-based decorations reflect seeded progress", async ({ page }) => {
  await onboard(page);
  await seedCompletions(page, [
    ...["tidy-toys", "say-thank-you", "set-table", "share-sibling", "help-family", "kind-card", "family-time", "water-plants"].map((id) => ({ kind: "kindness", contentId: id })),
  ]);
  await page.goto("/rewards/");
  await expect(page.getByText("★ 24")).toBeVisible();
  await expect(page.getByRole("listitem").filter({ hasText: "Kindness Hero" }).getByText("✓ Earned")).toBeVisible();
  await expect(page.getByRole("listitem").filter({ hasText: "Star garland" }).getByText("✓ Unlocked")).toBeVisible();
  await expect(page.getByRole("listitem").filter({ hasText: "Little Scholar" }).getByText(/% there/)).toBeVisible();
});

test("no purchase, ad or random reward mechanics anywhere in rewards", async ({ page }) => {
  await onboard(page);
  for (const path of ["/rewards/", "/rewards/room/", "/games/", "/home/"]) {
    await page.goto(path);
    const text = await page.locator("body").innerText();
    expect(text).not.toMatch(/\bbuy\b|purchase|\bprice\b|\$\d|coins?\b|loot|mystery box|spin|upgrade|premium|advert/i);
  }
});

test("certificate shows nickname, can be saved, and never claims proof of fasting", async ({ page }) => {
  await onboard(page, "Coral Star");
  await page.goto("/rewards/certificate/");
  const cert = page.getByRole("img", { name: /Certificate: Little Ramadan Journey, celebrating Coral Star/ });
  await expect(cert).toBeVisible();
  await expect(cert).toContainText("Coral Star");
  await expect(cert).toContainText("LITTLE RAMADAN JOURNEY");
  const certText = (await cert.textContent())!;
  expect(certText).not.toMatch(/fast|proof|certif(y|ies) that/i);
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: /Save as picture/ }).click();
  const d = await download;
  expect(d.suggestedFilename()).toBe("little-ramadan-certificate-coral-star.png");
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

test("the experience works without sound (sound is off by default)", async ({ page }) => {
  await onboard(page);
  await page.goto("/kindness/say-thank-you/");
  await page.getByRole("button", { name: /I did it!/ }).click();
  await expect(page.getByRole("heading", { name: "You earned 3 stars!" })).toBeVisible(); // visual feedback carries all info
});
