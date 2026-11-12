import { expect, test } from "@playwright/test";
import { answerUntilRight, expectNoHorizontalScroll, isoDaysFromToday, onboard, openParentZone, starCount } from "./helpers";

test("every village destination opens the correct screen", async ({ page }) => {
  test.setTimeout(180_000); // loads the 3D home five times (software rendering in CI is slow)
  await onboard(page);
  const dest: [string, RegExp, string][] = [
    ["Noor's House", /\/journey\/$/, "My Ramadan Journey"],
    ["Knowledge Garden", /\/learn\/$/, "Knowledge Garden"],
    ["Kindness Street", /\/kindness\/$/, "Kindness Street"],
    ["Puzzle Palace", /\/games\/$/, "Puzzle Palace"],
    ["Celebration Square", /\/rewards\/$/, "Celebration Square"],
  ];
  for (const [name, url, heading] of dest) {
    await page.goto("/home/");
    await page.getByRole("navigation", { name: "Village places" }).getByRole("link", { name }).click();
    await expect(page).toHaveURL(url);
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    await expectNoHorizontalScroll(page);
  }
});

test("simple village fallback works and is remembered", async ({ page }) => {
  await onboard(page);
  await page.getByRole("button", { name: "Show simple list" }).click();
  await expect(page.getByRole("list", { name: "Village places" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("list", { name: "Village places" })).toBeVisible();
  await page.getByRole("list", { name: "Village places" }).getByRole("link", { name: /Puzzle Palace/ }).click();
  await expect(page).toHaveURL(/\/games\/$/);
});

test("explore mode shows 30 open days without inventing a current day", async ({ page }) => {
  await onboard(page);
  await expect(page.getByRole("heading", { name: "Explore Ramadan" })).toBeVisible();
  await page.goto("/journey/");
  await expect(page.getByRole("list", { name: "30 journey days" }).getByRole("link")).toHaveCount(30);
});

test("parent calendar: current day, locked future days, open missed days, 29-day month", async ({ page }) => {
  await onboard(page);
  await page.goto("/journey/");
  await expect(page.getByTestId("calendar-hint")).toContainText("no Ramadan start date is set");
  await openParentZone(page);
  await page.getByRole("tab", { name: "Calendar" }).click();
  await page.getByLabel("First day of Ramadan").fill(isoDaysFromToday(-4));
  await page.getByRole("button", { name: "Save start date" }).click();
  await expect(page.getByText("Calendar saved.")).toBeVisible();
  await page.goto("/home/");
  await expect(page.getByRole("heading", { name: "Ramadan Day 5" })).toBeVisible();
  await page.goto("/journey/");
  await expect(page.getByRole("link", { name: /Day 1: Welcome Ramadan/ })).toBeVisible(); // missed day still open
  await expect(page.getByRole("link", { name: /Day 5: Patience.*today/ })).toBeVisible();
  await expect(page.getByRole("group", { name: /Day 6: Kindness, opens/ })).toBeVisible();
  await expect(page.getByTestId("calendar-hint")).toHaveCount(0);

  await openParentZone(page);
  await page.getByRole("tab", { name: "Calendar" }).click();
  await page.getByRole("button", { name: "29 days" }).click();
  await expect(page.getByRole("button", { name: "29 days" })).toHaveAttribute("aria-pressed", "true");
  await page.goto("/journey/");
  await expect(page.getByRole("list", { name: "29 journey days" }).getByRole("listitem")).toHaveCount(29);
  await expect(page.getByRole("group", { name: /Day 29: Eid Celebration/ })).toBeVisible();
});

test("completing a day earns the right stars and badge, and persists", async ({ page }) => {
  await onboard(page);
  await page.goto("/journey/d02/");
  // 1. lesson (+2)
  await page.getByRole("link", { name: /Why do Muslims fast\?/ }).click();
  await page.getByRole("button", { name: /I finished this lesson/ }).click();
  await expect(page.getByRole("heading", { name: "You earned 2 stars!" })).toBeVisible();
  await expect(page.getByText("New badge: Ramadan Explorer")).toBeVisible();
  await page.getByRole("button", { name: "Yay! Continue" }).click();
  await page.getByRole("link", { name: "Back to Day 2" }).click();
  // 2. kindness (+3)
  await page.getByLabel(/How did people feel/).fill("They smiled");
  await page.getByRole("button", { name: /I did it!/ }).click();
  await page.getByRole("button", { name: "Yay! Continue" }).click();
  await expect(page.getByText("You did it!")).toBeVisible();
  // 3. quiz (+2 quiz, +1 new game)
  await page.getByRole("link", { name: /Ramadan Quiz: Ramadan Basics/ }).click();
  for (let i = 0; i < 6; i++) {
    await answerUntilRight(page, page.getByTestId("answers"));
    await page.getByRole("button", { name: i < 5 ? "Next question" : "Finish" }).click();
  }
  await expect(page.getByRole("heading", { name: "You earned 3 stars!" })).toBeVisible();
  await page.getByRole("button", { name: "Yay! Continue" }).click();
  await page.getByRole("link", { name: "Back to Day 2" }).click();
  await expect(page.getByText("Day 2 complete!")).toBeVisible();

  // revisiting does not double-award
  await page.goto("/learn/lesson/why-fast/");
  await expect(page.getByText("Lesson complete.")).toBeVisible();

  await page.reload();
  expect(await starCount(page)).toBe(8);
  await page.goto("/journey/");
  await expect(page.getByRole("link", { name: /Day 2: What is Ramadan\?, all done/ })).toBeVisible();
});

test("reduced motion setting applies to the whole app", async ({ page }) => {
  await onboard(page);
  await openParentZone(page);
  await page.getByRole("tab", { name: "Settings" }).click();
  await page.getByRole("switch", { name: "Reduce motion" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-reduced-motion", "true");
  await page.goto("/home/");
  await expect(page.locator("html")).toHaveAttribute("data-reduced-motion", "true");
  // Animated decorations are not rendered, and any animation class is neutralised by CSS.
  await expect(page.locator(".float, .twinkle, .sway")).toHaveCount(0);
  const anim = await page.evaluate(() => {
    const el = document.createElement("div");
    el.className = "float";
    document.body.appendChild(el);
    return getComputedStyle(el).animationName;
  });
  expect(anim).toBe("none");
});
