import { expect, test } from "@playwright/test";
import { onboard } from "./helpers";

// Regression: the parent gate sheet was trapped inside the animated page wrapper,
// so on phones it was cut off at the top with no backdrop.
test("parent gate sheet fits the phone screen and covers it with a backdrop", async ({ page }) => {
  await onboard(page);
  await page.goto("/parent/");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await page.waitForTimeout(500); // let the sheet's entry animation settle

  const vp = page.viewportSize()!;
  const box = (await dialog.boundingBox())!;
  expect(box.y, "sheet top is on screen").toBeGreaterThanOrEqual(0);
  expect(box.y + box.height, "sheet bottom is on screen").toBeLessThanOrEqual(vp.height + 1);
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(vp.width + 1);

  const backdrop = (await page.locator(".sheet-backdrop").boundingBox())!;
  expect(backdrop.width).toBeGreaterThanOrEqual(vp.width - 1);
  expect(backdrop.height).toBeGreaterThanOrEqual(vp.height - 1);

  // The heading and Cancel are reachable (Cancel may need a scroll inside the sheet on tiny phones).
  await expect(page.getByRole("heading", { name: "Grown-ups only" })).toBeInViewport();
  const cancel = page.getByRole("button", { name: "Cancel" });
  await cancel.scrollIntoViewIfNeeded();
  await expect(cancel).toBeInViewport();
});
