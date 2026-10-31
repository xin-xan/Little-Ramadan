// Renders the Little Ramadan logo mark (same artwork as src/components/Logo.tsx) to PNG icons.
// Usage: node scripts/make-icons.mjs   (needs Playwright's Chromium; run once, PNGs are committed)
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const mark = (pad) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-pad} ${-pad} ${64 + pad * 2} ${64 + pad * 2}">
  <rect x="${-pad}" y="${-pad}" width="${64 + pad * 2}" height="${64 + pad * 2}" fill="#123C35"/>
  <path d="M30 10 A22 22 0 1 0 30 54 A28 28 0 0 1 30 10 Z" fill="#E9C66B"/>
  <line x1="40" y1="14" x2="40" y2="22" stroke="#E9C66B" stroke-width="2"/>
  <path d="M33 24 Q32 38 36 44 L44 44 Q48 38 47 24 Z" fill="#F2CF6B"/>
  <path d="M36 27 Q36 37 38.5 41 L41.5 41 Q44 37 44 27 Z" fill="#FFF1C2"/>
  <path d="M34 22 L46 22 L44 25 L36 25 Z" fill="#C99A2E"/>
  <circle cx="50" cy="14" r="2" fill="#FFF7E8"/>
  <circle cx="54" cy="24" r="1.4" fill="#FFF7E8"/>
</svg>`;

const out = "public/icons";
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage();
for (const [name, size, pad] of [
  ["icon-192.png", 192, 4],
  ["icon-512.png", 512, 4],
  ["icon-maskable-512.png", 512, 14],
  ["apple-touch-icon.png", 180, 6],
  ["favicon-32.png", 32, 2],
]) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<html><body style="margin:0">${mark(pad).replace("<svg ", `<svg width="${size}" height="${size}" `)}</body></html>`);
  await page.screenshot({ path: `${out}/${name}`, omitBackground: false });
  console.log("wrote", name);
}
await browser.close();
