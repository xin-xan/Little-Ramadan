import { expect, test } from "@playwright/test";
import { expectNoHorizontalScroll, onboard, openParentZone, starCount } from "./helpers";

test("Salah tracker on home: private, persistent, no stars; fasting only when a parent enables the journal", async ({ page }) => {
  test.setTimeout(120_000);
  await onboard(page);
  const card = page.getByRole("region", { name: "My Salah today" });
  await expect(card).toBeVisible();
  await expectNoHorizontalScroll(page);
  // Gentle encouragement to pray on time, with a link to learn why.
  await expect(card).toContainText("Try to pray each prayer on time");
  // Fasting is not shown until a parent switches the journal on.
  await expect(page.getByRole("radiogroup", { name: "Fasting today" })).toHaveCount(0);

  const before = await starCount(page); // (opens Rewards)
  await page.goto("/home/");
  const fajr = card.getByRole("button", { name: "Fajr" });
  await fajr.click();
  await expect(fajr).toHaveAttribute("aria-pressed", "true");
  await card.getByRole("button", { name: "Maghrib" }).click();
  await expect(card.getByText("Lovely! Every prayer is special.")).toBeVisible();
  // No rewards, counts or scores.
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(card).not.toContainText(/\d+\s*(of|\/)\s*5|streak|missed/i);
  expect(await starCount(page)).toBe(before);

  // Saved on the device.
  await page.goto("/home/");
  await expect(page.getByRole("region", { name: "My Salah today" }).getByRole("button", { name: "Fajr" })).toHaveAttribute("aria-pressed", "true");
  // Tapping again unmarks.
  await page.getByRole("region", { name: "My Salah today" }).getByRole("button", { name: "Maghrib" }).click();
  await expect(page.getByRole("region", { name: "My Salah today" }).getByRole("button", { name: "Maghrib" })).toHaveAttribute("aria-pressed", "false");

  // Parent: week view, journal on.
  await openParentZone(page);
  await page.getByRole("tab", { name: /Salah & fasting/ }).click();
  await expect(page.getByRole("table", { name: "Prayers marked in the last 7 days" }).getByRole("cell", { name: "Fajr marked" })).toHaveCount(1);
  const journal = page.getByRole("switch", { name: "Show the journal to my child" });
  await journal.click();
  await expect(journal).toHaveAttribute("aria-checked", "true");

  await page.goto("/home/");
  const both = page.getByRole("region", { name: "My Salah & fasting today" });
  await expect(both).toBeVisible();
  await expect(both).toContainText("If you feel well and your family says it is okay, you could try fasting");
  await both.getByRole("radio", { name: "I tried fasting for part of the day" }).click();
  await expect(both.getByText(/Saved in your private journal/)).toBeVisible();
  await expect(both.getByText(/tell a grown-up/i)).toBeVisible();
  await both.getByRole("radio", { name: "I did not fast today" }).click();
  await expect(both.getByRole("radio", { name: "I did not fast today" })).toHaveAttribute("aria-checked", "true");
  expect(await starCount(page)).toBe(before);

  // The quick choice replaced the earlier one: one journal entry for today.
  await openParentZone(page);
  await page.getByRole("tab", { name: /Salah & fasting/ }).click();
  await expect(page.getByText("I did not fast today", { exact: false }).first()).toBeVisible();
  await expect(page.getByText("I tried fasting for part of the day")).toHaveCount(0);

  // "Why do Muslims pray and fast?" opens the new First Fast page, which keeps health first.
  await page.goto("/home/");
  await page.getByRole("link", { name: "Why do Muslims pray and fast?" }).click();
  const growing = page.getByRole("region", { name: "Growing up with Salah and fasting" });
  await expect(growing).toBeVisible();
  await expect(growing).toContainText("Your health always comes first");
  await openParentZone(page);
  await page.getByRole("tab", { name: /Salah & fasting/ }).click();

  // Parent can hide the Salah tracker.
  const salahSwitch = page.getByRole("switch", { name: "Show the Salah tracker on the home screen" });
  await salahSwitch.click();
  await expect(salahSwitch).toHaveAttribute("aria-checked", "false");
  await page.goto("/home/");
  await expect(page.getByRole("region", { name: "My fasting today" })).toBeVisible();
  await expect(page.getByRole("group", { name: "Today's prayers" })).toHaveCount(0);
});
