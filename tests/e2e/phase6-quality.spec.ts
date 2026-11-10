import { expect, test } from "@playwright/test";
import { gzipSync } from "node:zlib";
import { onboard } from "./helpers";

const ROUTES = ["/home/", "/journey/", "/journey/d01/", "/learn/", "/learn/lesson/salah/", "/learn/story/harbour-wait/", "/kindness/", "/kindness/give-food/", "/games/", "/games/quiz/", "/games/quiz/manners/", "/games/match-words/", "/games/missing-lantern/", "/games/mosque-puzzle/", "/games/sort-deeds/", "/games/memory-cards/", "/games/vocab-match/", "/rewards/", "/rewards/room/", "/rewards/certificate/", "/rewards/eid/", "/goals/", "/first-fast/", "/safety/", "/dhivehi/", "/dhivehi/day/1/", "/dhivehi/day/30/", "/dhivehi/play/fili/", "/dhivehi/play/build-word/", "/dhivehi/play/letters/"];

test("every screen loads without errors and every internal link works", async ({ page, request }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await onboard(page);
  const links = new Set<string>();
  for (const r of ROUTES) {
    await page.goto(r);
    await expect(page.locator("h1").first()).toBeVisible();
    for (const href of await page.locator("a[href^='/']").evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).getAttribute("href")!))) links.add(href.split("?")[0].split("#")[0]);
    const external = await page.locator("main a[href^='http']").count();
    expect(external, `external link on ${r}`).toBe(0);
  }
  for (const l of links) expect((await request.get(l)).status(), l).toBe(200);
  expect(errors).toEqual([]);
});

test("touch targets are at least 44×44 CSS pixels", async ({ page }) => {
  await onboard(page);
  for (const r of ["/home/", "/journey/", "/journey/d05/", "/games/", "/games/memory-cards/", "/games/mosque-puzzle/", "/rewards/room/", "/first-fast/"]) {
    await page.goto(r);
    await expect(page.locator("h1").first()).toBeVisible();
    const small = await page.locator("main button:visible, main a:visible, nav a:visible, main [role=switch]:visible, main input:visible, main textarea:visible").evaluateAll((els) =>
      els
        .filter((e) => !e.closest("p, li.small, .small") && !e.classList.contains("skip-link") && (e as HTMLInputElement).type !== "checkbox")
        .map((e) => ({ e: (e.textContent || e.getAttribute("aria-label") || e.tagName).trim().slice(0, 30), r: e.getBoundingClientRect() }))
        .filter(({ r }) => r.width < 44 || r.height < 44)
        .map(({ e, r }) => `${e} ${Math.round(r.width)}x${Math.round(r.height)}`),
    );
    expect(small, r).toEqual([]);
  }
});

test("app updates (new service worker / cleared caches) keep local progress", async ({ page }) => {
  await onboard(page, "Update Kid");
  await page.goto("/kindness/tidy-toys/");
  await page.getByRole("button", { name: /I did it!/ }).click();
  await page.getByRole("button", { name: "Yay! Continue" }).click();
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await page.evaluate(async () => {
    for (const r of await navigator.serviceWorker.getRegistrations()) await r.unregister();
    for (const k of await caches.keys()) await caches.delete(k);
  });
  await page.goto("/rewards/");
  await expect(page.getByRole("region", { name: "3 stars collected" })).toBeVisible();
  await page.goto("/home/");
  await expect(page.getByText(/Update Kid/).first()).toBeVisible();
});

test("small initial download", async ({ page }) => {
  let bytes = 0;
  page.on("response", async (res) => {
    if (res.url().startsWith("http://localhost") && !res.url().endsWith("sw.js")) {
      try {
        bytes += gzipSync(await res.body()).length; // what a compressing host actually sends
      } catch {
        /* redirects */
      }
    }
  });
  await page.goto("/welcome/");
  await expect(page.getByRole("button", { name: "Start" })).toBeVisible();
  await page.waitForLoadState("networkidle");
  console.log(`first screen transfer (gzip): ${Math.round(bytes / 1024)} KB`);
  expect(bytes).toBeLessThan(500 * 1024);
});
