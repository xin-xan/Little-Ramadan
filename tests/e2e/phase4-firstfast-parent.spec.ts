import { expect, test } from "@playwright/test";

test.use({ timezoneId: "Indian/Maldives" });
import { onboard, openParentZone, starCount } from "./helpers";

test("fasting journal is off by default and private; a fast earns 2 stars once a day, not fasting earns none", async ({ page }) => {
  // After Iftar in Malé, when a day's fast can be recorded.
  await page.clock.setFixedTime(new Date("2027-01-01T19:00:00+05:00"));
  await onboard(page);
  await page.goto("/first-fast/");
  await expect(page.getByText(/Your health comes first!/).first()).toBeVisible();
  await expect(page.getByText("The journal is switched off.")).toBeVisible();
  const before = await starCount(page);

  await openParentZone(page);
  await page.getByRole("tab", { name: /fasting journal/i }).click();
  await page.getByRole("switch", { name: "Show the journal to my child" }).click();
  // The switch flips once the setting is saved on the device.
  await expect(page.getByRole("switch", { name: "Show the journal to my child" })).toHaveAttribute("aria-checked", "true");

  await page.goto("/first-fast/");
  // A fast earns 2 stars (owner decision), with the health reminder alongside.
  await page.getByRole("radio", { name: "I completed a fast with family guidance" }).click();
  await page.getByRole("button", { name: "Save to my journal" }).click();
  await expect(page.getByRole("heading", { name: "You earned 2 stars!" })).toBeVisible();
  await expect(page.getByRole("dialog")).toContainText("Your health always comes first");
  await page.getByRole("button", { name: "Yay! Continue" }).click();
  // Not fasting: no stars, no celebration.
  await page.getByRole("radio", { name: "I did not fast today" }).click();
  await page.getByRole("button", { name: "Save to my journal" }).click();
  await expect(page.getByText(/Every Ramadan day is special/)).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  // A second fast entry the same day does not earn again (never more for more fasting).
  await page.getByRole("radio", { name: "I tried fasting for part of the day" }).click();
  await page.getByRole("button", { name: "Save to my journal" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(await starCount(page)).toBe(before + 2);
  await page.goto("/rewards/");
  await expect(page.getByText(/streak/i)).toHaveCount(0);

  await openParentZone(page);
  await page.getByRole("tab", { name: /fasting journal/i }).click();
  await expect(page.getByText("Entries (3)")).toBeVisible();
  await page.getByRole("button", { name: "Delete all journal entries" }).click();
  await page.getByRole("button", { name: "Delete entries" }).click();
  await expect(page.getByText("Entries (0)")).toBeVisible();
});

test("a child-facing safety message is easy to find from home", async ({ page }) => {
  await onboard(page);
  await page.getByRole("link", { name: /Your health comes first/ }).click();
  await expect(page.getByText(/tell your parent or another trusted adult straight away/)).toBeVisible();
  await expect(page.getByText("Stopping a fast is okay!", { exact: false })).toBeVisible();
});

test("every non-fasting feature works without using the journal", async ({ page }) => {
  await onboard(page);
  for (const path of ["/journey/", "/learn/", "/kindness/", "/games/", "/rewards/", "/goals/", "/rewards/trophy/", "/rewards/eid/"]) {
    await page.goto(path);
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.getByText(/fast(ing)? (to|before) (unlock|earn)/i)).toHaveCount(0);
  }
});

test("parent settings are behind the gate and a PIN replaces the question", async ({ page }) => {
  await onboard(page);
  await page.goto("/parent/");
  await expect(page.getByRole("tab")).toHaveCount(0);
  await openParentZone(page);
  await page.getByRole("tab", { name: "Settings" }).click();
  await page.getByLabel("Set a PIN").fill("2468");
  await page.getByRole("button", { name: "Save PIN" }).click();
  await expect(page.getByText(/PIN saved/)).toBeVisible();
  // PIN is never stored in plain text
  const raw = await page.evaluate(
    () =>
      new Promise<string>((res) => {
        const r = indexedDB.open("little-ramadan");
        r.onsuccess = () => {
          const g = r.result.transaction("kv").objectStore("kv").get("settings");
          g.onsuccess = () => res(JSON.stringify(g.result));
        };
      }),
  );
  expect(raw).not.toContain("2468");
  expect(raw).toContain('"hash"');

  await page.goto("/parent/");
  await expect(page.getByTestId("gate-question")).toHaveCount(0);
  await page.getByLabel("Parent PIN").fill("1111");
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "PIN isn't right" })).toBeVisible();
  await page.getByLabel("Parent PIN").fill("2468");
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByRole("tablist", { name: "Parent Zone sections" })).toBeVisible();
});

test("parent can change sound, nickname and see progress, privacy and review status", async ({ page }) => {
  await onboard(page, "Old Name");
  await openParentZone(page);
  await page.getByRole("tab", { name: "Settings" }).click();
  const sound = page.getByRole("switch", { name: "Sound effects" });
  await expect(sound).toHaveAttribute("aria-checked", "true"); // on by default (chosen during setup)
  await sound.click();
  await expect(sound).toHaveAttribute("aria-checked", "false");
  await page.getByLabel("Nickname").fill("New Name");
  await page.getByRole("button", { name: "Save nickname" }).click();
  await page.getByRole("tab", { name: "Progress" }).click();
  await expect(page.getByRole("heading", { name: "New Name" })).toBeVisible();
  await page.getByRole("tab", { name: "Privacy" }).click();
  await expect(page.getByText(/What leaves the device:/)).toBeVisible();
  await page.getByRole("tab", { name: "Content & review" }).click();
  await expect(page.getByText(/draft \(of \d+ items\)/)).toBeVisible();
  await page.getByRole("tab", { name: "Safety guide" }).click();
  await expect(page.getByText(/not a medical service/)).toBeVisible();
  await page.reload();
  await openParentZone(page);
  await page.getByRole("tab", { name: "Settings" }).click();
  await expect(page.getByRole("switch", { name: "Sound effects" })).toHaveAttribute("aria-checked", "false");
});

test("Parent Zone is not linked inside child activity screens", async ({ page }) => {
  await onboard(page);
  for (const path of ["/games/memory-cards/", "/learn/story/eid-morning/", "/kindness/tidy-toys/"]) {
    await page.goto(path);
    await expect(page.getByRole("main").getByRole("link", { name: /parent/i })).toHaveCount(0);
  }
});
