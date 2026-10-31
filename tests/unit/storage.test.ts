import { IDBFactory } from "fake-indexeddb";
import { beforeEach, describe, expect, it } from "vitest";
import { MemoryStorage, openStorage } from "@/storage/db";
import { DEFAULT_SETTINGS, KV_KEYS, STORES, nicknameProblem, normalise, validateSettings } from "@/storage/schema";

beforeEach(() => {
  // fresh database for every test
  globalThis.indexedDB = new IDBFactory();
});

describe("nickname rules (data minimisation)", () => {
  it("accepts simple nicknames", () => {
    expect(nicknameProblem("Star Explorer")).toBeNull();
    expect(nicknameProblem("Turtle 7")).toBeNull();
  });
  it("rejects too short / too long / unsafe nicknames", () => {
    expect(nicknameProblem("A")).toMatch(/at least/);
    expect(nicknameProblem("A".repeat(17))).toMatch(/or fewer/);
    expect(nicknameProblem("me@mail.com")).not.toBeNull();
    expect(nicknameProblem("Call 7771234")).toMatch(/long numbers/);
    expect(nicknameProblem("<script>")).not.toBeNull();
  });
});

describe("IndexedDB storage", () => {
  it("opens IndexedDB storage and persists across re-open", async () => {
    const s = await openStorage();
    expect(s.kind).toBe("indexeddb");
    await s.putKv(KV_KEYS.profile, { nickname: "Star", avatar: "turtle", createdAt: "2026-01-01T00:00:00Z" });
    await s.put(STORES.completions, { id: "lesson:quran", kind: "lesson", contentId: "quran", completedAt: "x" });
    const again = await openStorage();
    const data = await again.loadAll();
    expect(data.profile?.nickname).toBe("Star");
    expect(data.completions.map((c) => c.id)).toEqual(["lesson:quran"]);
  });

  it("recovers when the browser closes the connection (iOS Safari behaviour)", async () => {
    const s = await openStorage();
    await s.putKv(KV_KEYS.profile, { nickname: "Zain", avatar: "dolphin", createdAt: "x" });
    // Simulate Safari closing the connection underneath us.
    (s as unknown as { db: IDBDatabase }).db.close();
    await s.putKv(KV_KEYS.settings, { soundOn: true });
    await s.put(STORES.completions, { id: "story:a", kind: "story", contentId: "a", completedAt: "x" });
    const d = await s.loadAll();
    expect(d.profile?.nickname).toBe("Zain");
    expect(d.settings.soundOn).toBe(true);
    expect(d.completions).toHaveLength(1);
  });

  it("destroy removes everything", async () => {
    const s = await openStorage();
    await s.putKv(KV_KEYS.profile, { nickname: "Star", avatar: "turtle", createdAt: "x" });
    await s.destroy();
    const fresh = await (await openStorage()).loadAll();
    expect(fresh.profile).toBeNull();
    expect(fresh.completions).toEqual([]);
  });

  it("clear empties one store only", async () => {
    const s = await openStorage();
    await s.put(STORES.completions, { id: "story:a", kind: "story", contentId: "a", completedAt: "x" });
    await s.put(STORES.journal, { id: "j1", date: "2026-03-01", experience: "not_fast", createdAt: "x" });
    await s.clear(STORES.completions);
    const d = await s.loadAll();
    expect(d.completions).toEqual([]);
    expect(d.journal).toHaveLength(1);
  });

  it("falls back to memory when IndexedDB is missing", async () => {
    // @ts-expect-error simulate unsupported browser
    delete globalThis.indexedDB;
    const s = await openStorage();
    expect(s.kind).toBe("memory");
    globalThis.indexedDB = new IDBFactory();
  });
});

describe("validation of stored data", () => {
  it("repairs corrupted settings with safe defaults", () => {
    const s = validateSettings({ soundOn: "yes", calendar: { startDate: "not-a-date", length: 31 }, screenTime: { minutes: 9999 } });
    expect(s.soundOn).toBe(DEFAULT_SETTINGS.soundOn);
    expect(s.calendar.startDate).toBeNull();
    expect(s.calendar.length).toBe(30);
    expect(s.screenTime.minutes).toBe(20);
    expect(s.journalEnabled).toBe(false); // journal off by default
  });

  it("drops invalid records and de-duplicates", () => {
    const d = normalise({
      profile: { nickname: "x" }, // invalid
      settings: undefined,
      room: { slots: { wall: "banner-ramadan", bad: 3 } },
      completions: [
        { kind: "lesson", contentId: "quran" },
        { kind: "lesson", contentId: "quran" },
        { kind: "journal", contentId: "x" }, // journal can never be a reward-bearing completion
        null,
        "garbage",
      ],
      journal: [{ id: "a", date: "2026-03-01", experience: "full" }, { id: "b", date: "bad", experience: "full" }],
      goals: [{ id: "goal-share" }, {}],
    });
    expect(d.profile).toBeNull();
    expect(d.completions.map((c) => c.id)).toEqual(["lesson:quran"]);
    expect(d.journal.map((j) => j.id)).toEqual(["a"]);
    expect(d.goals.map((g) => g.id)).toEqual(["goal-share"]);
    expect(d.room.slots).toEqual({ wall: "banner-ramadan" });
  });

  it("memory storage behaves like IndexedDB storage", async () => {
    const m = new MemoryStorage();
    await m.putKv(KV_KEYS.profile, { nickname: "Moon", avatar: "cat", createdAt: "x" });
    expect((await m.loadAll()).profile?.nickname).toBe("Moon");
    await m.destroy();
    expect((await m.loadAll()).profile).toBeNull();
  });
});
