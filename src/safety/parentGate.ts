/**
 * Parent gate helpers.
 * The arithmetic challenge is a low-friction gate to keep young children out
 * of settings — it is NOT authentication. The optional parent PIN is stored
 * only as a salted PBKDF2-SHA-256 hash, never in plain text.
 */
const WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];

export interface GateChallenge {
  prompt: string;
  answer: number;
}

export function makeChallenge(rand: () => number = Math.random): GateChallenge {
  const a = 6 + Math.floor(rand() * 7); // 6..12
  const b = 3 + Math.floor(rand() * 7); // 3..9
  return { prompt: `What is ${WORDS[a]} times ${WORDS[b]}?`, answer: a * b };
}

export function checkChallenge(c: GateChallenge, input: string): boolean {
  return input.trim() !== "" && Number(input.trim()) === c.answer;
}

const toHex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
const fromHex = (hex: string) => new Uint8Array(hex.match(/.{2}/g)!.map((h) => parseInt(h, 16)));

export const PIN_PATTERN = /^\d{4,6}$/;

export async function hashPin(pin: string, saltHex?: string): Promise<{ hash: string; salt: string }> {
  const salt = saltHex ? fromHex(saltHex) : crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(pin), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: 150_000 }, key, 256);
  return { hash: toHex(bits), salt: toHex(salt.buffer as ArrayBuffer) };
}

export async function verifyPin(pin: string, stored: { hash: string; salt: string }): Promise<boolean> {
  const { hash } = await hashPin(pin, stored.salt);
  // constant-time-ish comparison
  if (hash.length !== stored.hash.length) return false;
  let diff = 0;
  for (let i = 0; i < hash.length; i++) diff |= hash.charCodeAt(i) ^ stored.hash.charCodeAt(i);
  return diff === 0;
}
