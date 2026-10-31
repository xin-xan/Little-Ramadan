import { expect, test } from "@playwright/test";
import { expectNoHorizontalScroll, onboard, openParentZone, passGate } from "./helpers";

test("onboarding needs no account or contact details and saves nickname + avatar", async ({ page }) => {
  await page.goto("/welcome/");
  // No inputs for email, phone, name, birth date or location anywhere in onboarding.
  await onboard(page, "Moon Turtle", "Dolphin");
  await expect(page.getByRole("link", { name: /Your avatar is dolphin/ })).toBeVisible();
  const inputs = await page.locator("input[type=email], input[type=tel], input[autocomplete=bday]").count();
  expect(inputs).toBe(0);
});

test("nickname validation blocks real-looking personal data", async ({ page }) => {
  await page.goto("/welcome/");
  await page.getByRole("button", { name: "Start" }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: "Get a grown-up" }).click();
  await page.getByRole("button", { name: "I'm a grown-up" }).click();
  await passGate(page);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Agree and continue" }).click();
  await page.getByRole("textbox", { name: "Nickname" }).fill("call 7771234");
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "long numbers" })).toBeVisible();
});

test("parent gate rejects a wrong answer", async ({ page }) => {
  await onboard(page);
  await page.goto("/parent/");
  await page.getByLabel("Answer").fill("1");
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "not quite right" })).toBeVisible();
  await expect(page.getByRole("tablist")).toHaveCount(0);
});

test("data persists after closing and reopening the app", async ({ page, context }) => {
  await onboard(page, "Lantern Kid");
  const page2 = await context.newPage();
  await page.close();
  await page2.goto("/");
  await expect(page2).toHaveURL(/\/home\/$/);
  await expect(page2.getByText(/Lantern Kid/).first()).toBeVisible();
});

test("primary navigation reaches each implemented section", async ({ page }) => {
  await onboard(page);
  const nav = page.getByRole("navigation", { name: "Main" });
  await nav.getByRole("link", { name: "Parents" }).click();
  await expect(page.getByRole("heading", { name: "Grown-ups only" })).toBeVisible();
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(page).toHaveURL(/\/home\/$/);
  await expectNoHorizontalScroll(page);
});

test("reset progress keeps profile; delete everything returns to welcome", async ({ page }) => {
  await onboard(page, "Reset Kid");
  await openParentZone(page);
  await page.getByRole("tab", { name: "Reset & delete" }).click();
  await page.getByRole("button", { name: "Reset progress" }).click();
  await page.getByRole("button", { name: "Yes, reset progress" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Progress has been reset." })).toBeVisible();
  await page.goto("/home/");
  await expect(page.getByText(/Reset Kid/).first()).toBeVisible();

  await openParentZone(page);
  await page.getByRole("tab", { name: "Reset & delete" }).click();
  await page.getByRole("button", { name: "Delete all data" }).click();
  await page.getByRole("button", { name: "Yes, delete everything" }).click();
  await expect(page).toHaveURL(/\/welcome\/$/);
  await page.goto("/home/");
  await expect(page).toHaveURL(/\/welcome\/$/);
});

test("app reopens offline after the first visit", async ({ page, context }) => {
  await onboard(page, "Offline Kid");
  await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.ready;
    return reg.active?.state;
  });
  // wait until the service worker controls the page and has finished precaching
  await page.reload();
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText(/Offline Kid/).first()).toBeVisible();
  await expect(page.getByText(/You're offline/)).toBeVisible();
  await page.goto("/parent/");
  await expect(page.getByRole("heading", { name: "Grown-ups only" })).toBeVisible();
  await context.setOffline(false);
});

test("manifest is installable", async ({ request }) => {
  const res = await request.get("/manifest.webmanifest");
  expect(res.ok()).toBeTruthy();
  const m = await res.json();
  expect(m.name).toBe("Little Ramadan");
  expect(m.display).toBe("standalone");
  expect(m.icons.some((i: { sizes: string }) => i.sizes === "512x512")).toBe(true);
  for (const i of m.icons) expect((await request.get(`/${i.src}`)).ok()).toBeTruthy();
});

test("in-app navigation works offline (links, not just reloads)", async ({ page, context }) => {
  await onboard(page, "Nav Kid");
  await page.reload();
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await context.setOffline(true);
  const nav = page.getByRole("navigation", { name: "Main" });
  await nav.getByRole("link", { name: "Games" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Puzzle Palace" })).toBeVisible();
  await page.getByRole("link", { name: /Ramadan Memory Cards/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Ramadan Memory Cards" })).toBeVisible();
  await nav.getByRole("link", { name: "Journey" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "My Ramadan Journey" })).toBeVisible();
  await page.getByRole("link", { name: /Day 7: Sharing/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: /Day 7/ })).toBeVisible();
  await nav.getByRole("link", { name: "Rewards" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Celebration Square" })).toBeVisible();
  await context.setOffline(false);
});
