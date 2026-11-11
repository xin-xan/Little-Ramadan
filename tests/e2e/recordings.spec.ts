import { expect, test, type Page } from "@playwright/test";
import { expectNoHorizontalScroll, onboard, openParentZone } from "./helpers";

// A simulated microphone (Chromium's fake audio device) so recording can be tested automatically.
test.use({
  launchOptions: { args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream", "--autoplay-policy=no-user-gesture-required"] },
  permissions: ["microphone"],
});

async function openRecordings(page: Page) {
  await openParentZone(page);
  await page.getByRole("tab", { name: "Voice recordings" }).click();
  await expect(page.getByRole("heading", { name: "Record your voice" })).toBeVisible();
}

async function recordItem(page: Page, label: string, fullText?: string) {
  // Record opens a full-screen view with the whole text to read from.
  await page.getByRole("button", { name: `Record ${label}`, exact: true }).click();
  const studio = page.getByRole("dialog", { name: label });
  await expect(studio).toBeVisible();
  if (fullText) await expect(studio.getByTestId("studio-text")).toContainText(fullText);
  await studio.getByRole("button", { name: `Start recording ${label}` }).click();
  const stop = studio.getByRole("button", { name: `Stop recording ${label}` });
  await expect(stop).toBeVisible();
  await page.waitForTimeout(1500);
  await stop.click();
  await expect(studio.getByRole("button", { name: `Play your recording of ${label}` })).toBeVisible();
  await studio.getByRole("button", { name: "Close" }).click();
  await expect(studio).toHaveCount(0);
  await expect(page.getByRole("button", { name: `Play your recording of ${label}` })).toBeVisible();
}

test("a parent records a story page and the child hears it; backup and delete work", async ({ page }) => {
  test.setTimeout(120_000);
  await onboard(page);
  await openRecordings(page);
  await expectNoHorizontalScroll(page);

  // Children see nothing before anything is recorded.
  await page.goto("/learn/story/noor-first-suhoor/");
  await expect(page.getByText(/Mum gently woke Noor/)).toBeVisible();
  await expect(page.getByTestId("voice-button")).toHaveCount(0);

  await openRecordings(page);
  await page.getByText("Noor's First Suhoor").click();
  await recordItem(page, "Page 1", "It was still dark outside when Mum gently woke Noor. \"It's time for Suhoor,\" she whispered.");

  // The full-screen view steps through the story: Next shows page 2's whole text.
  await page.getByRole("button", { name: "Record Page 2", exact: true }).click();
  const studio = page.getByRole("dialog", { name: "Page 2" });
  await expect(studio.getByTestId("studio-text")).toContainText("The kitchen smelled of warm roshi and tea.");
  await studio.getByRole("button", { name: /Next/ }).click();
  await expect(page.getByRole("dialog", { name: "Page 3" }).getByTestId("studio-text")).toContainText("Can I try fasting today?");
  await page.getByRole("dialog", { name: "Page 3" }).getByRole("button", { name: "Close" }).click();
  await expect(page.getByText(/^1$/).first()).toBeVisible();

  // Dhivehi letter sounds, like the parent's "Letter sounds" list.
  await page.getByRole("tab", { name: /Dhivehi/ }).click();
  await page.getByText("Letter sounds").click();
  await recordItem(page, "haa");

  // The child now sees Listen on page 1 only.
  await page.goto("/learn/story/noor-first-suhoor/");
  const listen = page.getByTestId("voice-button");
  await expect(listen).toBeVisible();
  await listen.click();
  await expect(listen).toHaveAttribute("aria-pressed", "true");
  await expect(listen).toHaveAttribute("aria-pressed", "false", { timeout: 15_000 });
  await page.getByRole("button", { name: /Next page/ }).click();
  await expect(page.getByTestId("voice-button")).toHaveCount(0);

  // Backup, delete all, restore.
  await openRecordings(page);
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Save a backup" }).click();
  const file = await (await download).path();
  await page.getByRole("button", { name: "Delete all recordings" }).first().click();
  await page.getByRole("dialog").getByRole("button", { name: "Delete all recordings" }).click();
  await expect(page.getByText("All recordings deleted.")).toBeVisible();
  await page.getByTestId("rec-import").setInputFiles(file!);
  await expect(page.getByText("2 recordings loaded.")).toBeVisible();
  await page.goto("/learn/story/noor-first-suhoor/");
  await expect(page.getByTestId("voice-button")).toBeVisible();

  // Reset progress keeps recordings; Delete everything removes them.
  await openParentZone(page);
  await page.getByRole("tab", { name: "Reset & delete" }).click();
  await page.getByRole("button", { name: "Delete all data" }).click();
  await page.getByRole("button", { name: "Yes, delete everything" }).click();
  await onboard(page, "Moon Explorer");
  await page.goto("/learn/story/noor-first-suhoor/");
  await expect(page.getByText(/Mum gently woke Noor/)).toBeVisible();
  await expect(page.getByTestId("voice-button")).toHaveCount(0);
});
