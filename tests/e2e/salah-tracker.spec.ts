import { expect, test, type Page } from "@playwright/test";
import { expectNoHorizontalScroll, onboard, openParentZone } from "./helpers";

// Malé on 1 January 2027 (from the bundled timetable): Fajr 4:54–6:11, Dhuhr 12:13, Asr 3:34 pm.
test.use({ timezoneId: "Indian/Maldives" });

async function at(page: Page, iso: string) {
  await page.clock.setFixedTime(new Date(iso));
}
const card = (page: Page) => page.getByRole("region", { name: /^My (Salah|fasting)/ });
async function stars(page: Page) {
  await page.goto("/rewards/");
  return (await page.getByRole("region", { name: /stars collected/ }).getAttribute("aria-label"))!.replace(" stars collected", "");
}

test("Salah: 1 star on time, ½ star after its time, gentle reminders, nothing before its time", async ({ page }) => {
  test.setTimeout(150_000);
  await at(page, "2027-01-01T13:00:00+05:00");
  await onboard(page);
  const c = card(page);
  await expect(c.getByRole("button", { name: /^Dhuhr, 12:13 pm, time to pray now/ })).toBeVisible();
  await expect(c.getByText(/It's Dhuhr time now, until 3:34 pm/)).toBeVisible();
  await expect(c.getByTestId("prayer-reminder")).toContainText("Did you pray Fajr?");
  await expect(c.getByTestId("prayer-reminder")).toContainText("it is not too late");
  await expectNoHorizontalScroll(page);

  // Too early for Asr.
  await c.getByRole("button", { name: /^Asr/ }).click();
  await expect(c.getByText("It's not time for Asr yet. It starts at 3:34 pm.")).toBeVisible();

  // Dhuhr on time: 1 star.
  await c.getByRole("button", { name: /^Dhuhr/ }).click();
  await expect(page.getByRole("heading", { name: "You earned 1 star!" })).toBeVisible();
  await expect(page.getByRole("dialog")).toContainText("You prayed Dhuhr on time");
  await page.getByRole("button", { name: "Yay! Continue" }).click();

  // Fajr after its time: ½ star, reminder goes away.
  await c.getByRole("button", { name: /^Fajr/ }).click();
  await expect(page.getByRole("heading", { name: "You earned ½ star!" })).toBeVisible();
  await page.getByRole("button", { name: "Yay! Continue" }).click();
  await expect(c.getByTestId("prayer-reminder")).toHaveCount(0);
  await expect(c.getByRole("button", { name: /^Fajr.*prayed, half a star/ })).toBeVisible();
  expect(await stars(page)).toBe("1½");

  // Saved: still marked after reopening. Unmarking takes the star away (for mistakes).
  await page.goto("/home/");
  await card(page).getByRole("button", { name: /^Dhuhr/ }).click();
  await expect(card(page).getByRole("button", { name: /^Dhuhr/ })).toHaveAttribute("aria-pressed", "false");
  expect(await stars(page)).toBe("½");

  // Parent: island, today's times and the week view.
  await openParentZone(page);
  await page.getByRole("tab", { name: /Salah & fasting/ }).click();
  const times = page.getByRole("table", { name: "Today's prayer times" });
  await expect(times).toContainText("4:54 am");
  await page.getByLabel("Atoll").selectOption({ label: "Seenu (ސ)" });
  await expect(times).not.toContainText("4:54 am");
  await expect(page.getByRole("table", { name: "Prayers marked in the last 7 days" }).getByRole("cell", { name: "Fajr marked" })).toHaveCount(1);
});

test("Fasting (when a parent switches the journal on): 2 stars for a fast, a gentle reminder when not fasting", async ({ page }) => {
  test.setTimeout(150_000);
  await at(page, "2027-01-01T19:00:00+05:00");
  await onboard(page);
  await expect(page.getByRole("radiogroup", { name: "Fasting today" })).toHaveCount(0);
  await openParentZone(page);
  await page.getByRole("tab", { name: /Salah & fasting/ }).click();
  const journal = page.getByRole("switch", { name: "Show the journal to my child" });
  await journal.click();
  await expect(journal).toHaveAttribute("aria-checked", "true");

  await page.goto("/home/");
  const c = card(page);
  await c.getByRole("radio", { name: /I tried fasting for part of the day/ }).click();
  await expect(page.getByRole("heading", { name: "You earned 2 stars!" })).toBeVisible();
  await page.getByRole("button", { name: "Yay! Continue" }).click();
  // Switching between kinds of fast never earns more.
  await c.getByRole("radio", { name: /I completed a fast with family guidance/ }).click();
  await expect(c.getByRole("radio", { name: /I completed a fast/ })).toHaveAttribute("aria-checked", "true");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(await stars(page)).toBe("2");

  await page.goto("/home/");
  await card(page).getByRole("radio", { name: "I did not fast today" }).click();
  await expect(card(page).getByTestId("fast-reminder")).toContainText("one of the five pillars of Islam");
  await expect(card(page).getByTestId("fast-reminder")).toContainText("Your health always comes first");
  await expect(card(page).getByText(/tell a grown-up/i)).toBeVisible();
  expect(await stars(page)).toBe("0");

  // Parent can hide the Salah tracker; fasting stays.
  await openParentZone(page);
  await page.getByRole("tab", { name: /Salah & fasting/ }).click();
  const salahSwitch = page.getByRole("switch", { name: "Show the Salah tracker on the home screen" });
  await salahSwitch.click();
  await expect(salahSwitch).toHaveAttribute("aria-checked", "false");
  await page.goto("/home/");
  await expect(page.getByRole("region", { name: "My fasting today" })).toBeVisible();
  await expect(page.getByRole("group", { name: "Today's prayers" })).toHaveCount(0);
});
