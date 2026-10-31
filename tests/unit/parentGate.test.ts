import { describe, expect, it } from "vitest";
import { checkChallenge, hashPin, makeChallenge, verifyPin } from "@/safety/parentGate";

describe("parent gate", () => {
  it("creates a word-based multiplication challenge", () => {
    const c = makeChallenge(() => 0);
    expect(c.prompt).toBe("What is six times three?");
    expect(c.answer).toBe(18);
    expect(checkChallenge(c, "18")).toBe(true);
    expect(checkChallenge(c, " 18 ")).toBe(true);
    expect(checkChallenge(c, "17")).toBe(false);
    expect(checkChallenge(c, "")).toBe(false);
  });

  it("answers are always two-digit adult-level products", () => {
    for (let i = 0; i < 50; i++) {
      const c = makeChallenge();
      expect(c.answer).toBeGreaterThanOrEqual(18);
      expect(c.prompt).not.toMatch(/\d/); // numbers written as words
    }
  });

  it("stores PINs only as salted hashes", async () => {
    const stored = await hashPin("4321");
    expect(stored.hash).not.toContain("4321");
    expect(stored.hash).toHaveLength(64);
    expect(stored.salt).toHaveLength(32);
    expect(await verifyPin("4321", stored)).toBe(true);
    expect(await verifyPin("1234", stored)).toBe(false);
    const other = await hashPin("4321");
    expect(other.hash).not.toBe(stored.hash); // different salt
  });
});
