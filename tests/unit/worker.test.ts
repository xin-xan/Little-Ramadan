/** The admin sign-in Worker: password hashing, signed sessions, and the narrow GitHub proxy. */
import { afterEach, describe, expect, it, vi } from "vitest";
import { hashPassword, makeSession, readSession, verifyPassword } from "../../worker/auth";
import worker, { type Env } from "../../worker/index";

const SECRET = "x".repeat(40);
const ORIGIN = "https://little-ramadan.example";

async function env(extra: Partial<Env> = {}): Promise<Env> {
  return {
    ASSETS: { fetch: async () => new Response("asset") },
    ADMIN_USERNAME: "admin",
    ADMIN_PASSWORD_HASH: await hashPassword("correct horse battery", 20_000),
    SESSION_SECRET: SECRET,
    GITHUB_TOKEN: "server-token",
    GITHUB_REPO: "xin-xan/Little-Ramadan",
    GITHUB_BRANCH: "main",
    ...extra,
  };
}
const call = (e: Env, path: string, init: RequestInit = {}) => worker.fetch(new Request(`${ORIGIN}${path}`, init), e);
const login = (e: Env, username: string, password: string, headers: Record<string, string> = {}) =>
  call(e, "/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json", Origin: ORIGIN, ...headers }, body: JSON.stringify({ username, password }) });
const cookieOf = (res: Response) => res.headers.get("Set-Cookie")!.split(";")[0];

afterEach(() => vi.unstubAllGlobals());

describe("passwords and sessions", () => {
  it("hashes passwords and checks them", async () => {
    const h = await hashPassword("a long password", 20_000);
    expect(h).toMatch(/^pbkdf2-sha256\$20000\$/);
    expect(h).not.toContain("a long password");
    expect(await verifyPassword("a long password", h)).toBe(true);
    expect(await verifyPassword("a long passworD", h)).toBe(false);
    expect(await verifyPassword("x", "plain-text")).toBe(false);
  });

  it("signs sessions, rejects tampering and expires them", async () => {
    const t = await makeSession(SECRET, "admin", 1000);
    expect(await readSession(SECRET, t, 2000)).toBe("admin");
    expect(await readSession("y".repeat(40), t, 2000)).toBeNull();
    const [p, s] = t.split(".");
    const forged = btoa(JSON.stringify({ u: "admin", exp: 9e15 })).replace(/=+$/, "");
    expect(await readSession(SECRET, `${forged}.${s}`, 2000)).toBeNull();
    expect(await readSession(SECRET, `${p}.${s}`, 1000 + 9 * 3600_000)).toBeNull();
  });
});

describe("the Worker", () => {
  it("serves the static app for everything outside /api", async () => {
    expect(await (await call(await env(), "/journey/")).text()).toBe("asset");
  });

  it("says when sign-in is not set up", async () => {
    expect((await call(await env({ ADMIN_PASSWORD_HASH: undefined }), "/api/admin/session")).status).toBe(503);
    expect((await call(await env({ SESSION_SECRET: "short" }), "/api/admin/session")).status).toBe(503);
  });

  it("signs in with the right username and password only", async () => {
    const e = await env();
    expect((await login(e, "admin", "wrong password")).status).toBe(401);
    expect((await login(e, "someone", "correct horse battery")).status).toBe(401);
    const ok = await login(e, "Admin", "correct horse battery");
    expect(ok.status).toBe(200);
    expect(await ok.json()).toEqual({ user: "admin", owner: "xin-xan", name: "Little-Ramadan", branch: "main" });
    const cookie = ok.headers.get("Set-Cookie")!;
    expect(cookie).toMatch(/HttpOnly/);
    expect(cookie).toMatch(/Secure/);
    expect(cookie).toMatch(/SameSite=Strict/);
    expect(cookie).toMatch(/Path=\/api\/admin/);
    const session = await call(e, "/api/admin/session", { headers: { Cookie: cookieOf(ok) } });
    expect((await session.json()).user).toBe("admin");
  });

  it("refuses cross-site sign-in and rate-limits guessing", async () => {
    expect((await login(await env(), "admin", "correct horse battery", { Origin: "https://evil.example" })).status).toBe(403);
    const limited = await env({ LOGIN_LIMITER: { limit: async () => ({ success: false }) } });
    expect((await login(limited, "admin", "correct horse battery")).status).toBe(429);
  });

  it("needs a session for everything else, and signing out clears it", async () => {
    const e = await env();
    expect((await call(e, "/api/admin/session")).status).toBe(401);
    expect((await call(e, "/api/admin/github/git/ref/heads/main")).status).toBe(401);
    const out = await call(e, "/api/admin/logout", { method: "POST", headers: { Origin: ORIGIN } });
    expect(out.headers.get("Set-Cookie")).toMatch(/Max-Age=0/);
  });

  it("proxies only the admin's git calls, to the configured repository, with the server's key", async () => {
    const e = await env();
    const cookie = cookieOf(await login(e, "admin", "correct horse battery"));
    const seen: { url: string; method: string; auth: string | null }[] = [];
    vi.stubGlobal("fetch", async (url: string, init: RequestInit) => {
      seen.push({ url, method: init.method ?? "GET", auth: new Headers(init.headers).get("Authorization") });
      return new Response(JSON.stringify({ object: { sha: "abc" } }), { status: 200 });
    });
    const res = await call(e, "/api/admin/github/git/ref/heads/main", { headers: { Cookie: cookie } });
    expect(await res.json()).toEqual({ object: { sha: "abc" } });
    expect(seen[0]).toEqual({ url: "https://api.github.com/repos/xin-xan/Little-Ramadan/git/ref/heads/main", method: "GET", auth: "Bearer server-token" });

    // Not git-data calls, other methods, and path tricks are refused without contacting GitHub.
    for (const [path, method] of [["/api/admin/github/contents/README.md", "GET"], ["/api/admin/github/git/refs/heads/main", "DELETE"], ["/api/admin/github/git/../../../user", "GET"], ["/api/admin/github/actions/secrets", "GET"]] as const)
      expect((await call(e, path, { method, headers: { Cookie: cookie, Origin: ORIGIN } })).status, path).toBeGreaterThanOrEqual(403);
    expect(seen).toHaveLength(1);

    // A cross-site write is refused even with the cookie.
    expect((await call(e, "/api/admin/github/git/blobs", { method: "POST", headers: { Cookie: cookie, Origin: "https://evil.example" }, body: "{}" })).status).toBe(403);
  });

  it("reports GitHub refusing the server's key as a server problem, not a sign-in problem", async () => {
    const e = await env();
    const cookie = cookieOf(await login(e, "admin", "correct horse battery"));
    vi.stubGlobal("fetch", async () => new Response("{}", { status: 401 }));
    expect((await call(e, "/api/admin/github/git/ref/heads/main", { headers: { Cookie: cookie } })).status).toBe(502);
  });
});
