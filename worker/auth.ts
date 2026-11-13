/** Password hashing and signed sign-in sessions for the admin Worker (Web Crypto only). */
export const SESSION_HOURS = 8;

export const enc = new TextEncoder();
const b64url = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const fromB64 = (s: string): Uint8Array<ArrayBuffer> => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));

export function json(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", ...headers } });
}

/** Constant-time comparison of two byte arrays. */
export function sameBytes(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

async function pbkdf2(password: string, salt: Uint8Array<ArrayBuffer>, iterations: number, length: number) {
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, key, length * 8));
}

/** Makes a stored hash: "pbkdf2-sha256$<iterations>$<salt>$<hash>" (base64url). */
export async function hashPassword(password: string, iterations = 100_000) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return `pbkdf2-sha256$${iterations}$${b64url(salt)}$${b64url(await pbkdf2(password, salt, iterations, 32))}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [scheme, iter, salt, hash] = stored.split("$");
  const iterations = Number(iter);
  if (scheme !== "pbkdf2-sha256" || !salt || !hash || !Number.isInteger(iterations) || iterations < 10_000 || iterations > 100_000) return false;
  const expected = fromB64(hash);
  return sameBytes(await pbkdf2(password, fromB64(salt), iterations, expected.length), expected);
}

async function hmac(secret: string, data: string) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(data)));
}

export async function makeSession(secret: string, user: string, now = Date.now()) {
  const payload = b64url(enc.encode(JSON.stringify({ u: user, exp: now + SESSION_HOURS * 3600_000 })));
  return `${payload}.${b64url(await hmac(secret, payload))}`;
}

export async function readSession(secret: string, token: string | undefined, now = Date.now()): Promise<string | null> {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  try {
    if (!sameBytes(fromB64(sig), await hmac(secret, payload))) return null;
    const { u, exp } = JSON.parse(new TextDecoder().decode(fromB64(payload)));
    return typeof u === "string" && typeof exp === "number" && exp > now ? u : null;
  } catch {
    return null;
  }
}

