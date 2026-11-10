/** Parent voice recordings: catalog coverage and stable IDs, storage, backup and delete. */
import { beforeEach, describe, expect, it } from "vitest";
import { lessons } from "@/content/lessons";
import { LETTERS } from "@/content/dhivehi";
import { quizSets } from "@/content/quizzes";
import { stories } from "@/content/stories";
import { ALL_RECORDING_ITEMS, RECORDING_SECTIONS, rid } from "@/recordings/catalog";
import { deleteAllRecordings, deleteRecording, exportRecordings, getRecording, importRecordings, recordedIdsSnapshot, refreshRecordingIds, saveRecording } from "@/recordings/store";

const audio = (n: number) => new Uint8Array(Array.from({ length: n }, (_, i) => i % 256)).buffer;

describe("recording catalog", () => {
  it("has unique IDs", () => {
    const ids = ALL_RECORDING_ITEMS.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it("covers every story page, lesson section, quiz question and Dhivehi letter", () => {
    const ids = new Set(ALL_RECORDING_ITEMS.map((i) => i.id));
    for (const s of stories) s.pages.forEach((_, i) => expect(ids.has(rid.storyPage(s.id, i))).toBe(true));
    for (const l of lessons) l.sections.forEach((_, i) => expect(ids.has(rid.lessonSection(l.id, i))).toBe(true));
    for (const q of quizSets) for (const x of q.questions) expect(ids.has(rid.quizQuestion(q.id, x.id)) && ids.has(rid.quizAnswer(q.id, x.id))).toBe(true);
    for (const l of LETTERS) expect(ids.has(rid.dvLetter(l.name))).toBe(true);
  });
  it("gives every item a script to read", () => {
    for (const s of RECORDING_SECTIONS) for (const g of s.groups) for (const i of g.items) expect(i.script.trim().length, i.id).toBeGreaterThan(0);
  });
  it("keeps IDs stable", () => {
    expect(rid.storyPage("noor-first-suhoor", 0)).toBe("story:noor-first-suhoor:p1");
    expect(rid.dvLetter("haa")).toBe("dv-letter:haa");
  });
});

describe("recording storage", () => {
  beforeEach(async () => {
    await deleteAllRecordings();
  });

  it("saves, lists, plays back and deletes recordings", async () => {
    await saveRecording({ id: "story:a:p1", data: audio(500), mime: "audio/mp4", durationMs: 1200, createdAt: "2026-01-01T00:00:00Z" });
    await refreshRecordingIds();
    expect(recordedIdsSnapshot()?.has("story:a:p1")).toBe(true);
    const r = await getRecording("story:a:p1");
    expect(r?.mime).toBe("audio/mp4");
    expect(new Uint8Array(r!.data)[10]).toBe(10);
    await deleteRecording("story:a:p1");
    await refreshRecordingIds();
    expect(recordedIdsSnapshot()?.has("story:a:p1")).toBe(false);
  });

  it("backs up and restores recordings, ignoring unknown items", async () => {
    const known = rid.storyPage("noor-first-suhoor", 0);
    await saveRecording({ id: known, data: audio(70000), mime: "audio/webm", durationMs: 3000, createdAt: "2026-01-01T00:00:00Z" });
    await saveRecording({ id: "unknown:item", data: audio(300), mime: "audio/webm", durationMs: 900, createdAt: "2026-01-01T00:00:00Z" });
    const backup = await (await exportRecordings()).text();
    await deleteAllRecordings();
    expect((await getRecording(known))).toBeUndefined();
    const n = await importRecordings(backup, new Set(ALL_RECORDING_ITEMS.map((i) => i.id)));
    expect(n).toBe(1);
    const back = await getRecording(known);
    expect(back?.data.byteLength).toBe(70000);
    expect(new Uint8Array(back!.data)[300]).toBe(300 % 256);
    await expect(importRecordings("not json", new Set())).rejects.toThrow(/not a Little Ramadan recordings backup/);
  });
});
