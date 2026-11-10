/** Privacy guard: the shipped source has no network calls, trackers, ads, payments or external links. */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? files(p) : /\.(tsx?|css)$/.test(n) ? [p] : [];
  });
}

const src = files(join(__dirname, "../../src")).map((f) => ({ f, text: readFileSync(f, "utf8") }));

describe("no network, tracking or monetisation", () => {
  it("does not call the network", () => {
    for (const { f, text } of src) expect(text, f).not.toMatch(/\bfetch\(|XMLHttpRequest|WebSocket|sendBeacon|EventSource|navigator\.geolocation/);
  });

  it("uses the microphone only in the Parent Zone recorder, and never the camera", () => {
    const users = src.filter(({ text }) => /getUserMedia|MediaRecorder\(/.test(text)).map(({ f }) => f.replace(/\\/g, "/").split("/src/")[1]);
    expect(users).toEqual(["recordings/recorder.ts"]);
    const recorder = src.find(({ f }) => f.replace(/\\/g, "/").endsWith("recordings/recorder.ts"))!.text;
    expect(recorder).not.toMatch(/video\s*:/);
    // Only the Parent Zone's recordings panel starts a recording.
    const starters = src.filter(({ text }) => /startRecording\(/.test(text)).map(({ f }) => f.replace(/\\/g, "/").split("/src/")[1]);
    expect(starters.sort()).toEqual(["components/parent/RecordingsPanel.tsx", "recordings/recorder.ts"]);
  });

  it("has no external URLs (other than the SVG namespace)", () => {
    for (const { f, text } of src) {
      const urls = text.match(/https?:\/\/[^\s"'`)]+/g) ?? [];
      expect(urls.filter((u) => !u.startsWith("http://www.w3.org/")), f).toEqual([]);
    }
  });

  it("has no analytics, ads or payment integrations", () => {
    for (const { f, text } of src) expect(text, f).not.toMatch(/google-analytics|gtag\(|adsbygoogle|stripe|paypal|in-app purchase|subscription plan|localStorage\.setItem\(["']ad/i);
  });

  it("asks for no sensitive permissions", () => {
    for (const { f, text } of src) expect(text, f).not.toMatch(/type=["'](email|tel)["']|autoComplete=["'](bday|email|tel|street-address|name)["']|Notification\.requestPermission|contacts\.select/);
  });
});
