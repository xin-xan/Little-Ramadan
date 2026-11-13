/**
 * Little Ramadan's Cloudflare Worker. Almost everything is the static app, served from ./out.
 * The Worker only handles /api/admin/*: a username-and-password sign-in for the content admin
 * dashboard, and a narrow proxy that lets a signed-in admin read and publish content through
 * GitHub with a key kept on the server (so admins never handle a GitHub key).
 *
 * Secrets (set with `npx wrangler secret put NAME`, never committed):
 *   ADMIN_USERNAME       the admin's username
 *   ADMIN_PASSWORD_HASH  made with `node scripts/hash-password.mjs` (the password itself is never stored)
 *   SESSION_SECRET       a long random string used to sign the sign-in cookie
 *   GITHUB_TOKEN         fine-grained token for the repository with Contents: Read and write
 * Variables (wrangler.jsonc): GITHUB_REPO ("owner/name"), GITHUB_BRANCH.
 * Optional binding: LOGIN_LIMITER (Workers rate limiting) slows down password guessing.
 */

import { enc, json, makeSession, readSession, sameBytes, SESSION_HOURS, verifyPassword } from "./auth";

export interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  ADMIN_USERNAME?: string;
  ADMIN_PASSWORD_HASH?: string;
  SESSION_SECRET?: string;
  GITHUB_TOKEN?: string;
  GITHUB_REPO?: string;
  GITHUB_BRANCH?: string;
  LOGIN_LIMITER?: { limit(options: { key: string }): Promise<{ success: boolean }> };
}

const COOKIE = "lr_admin";
const GITHUB_API = "https://api.github.com";
/** Only the git-data calls the admin needs, on the configured repository. */
const ALLOWED_GITHUB = /^\/git\/(ref\/heads\/[A-Za-z0-9._/-]+|refs\/heads\/[A-Za-z0-9._/-]+|commits(\/[0-9a-f]{40})?|trees(\/[0-9a-f]{40})?|blobs(\/[0-9a-f]{40})?)$/;

function cookieValue(request: Request, name: string) {
  for (const part of (request.headers.get("Cookie") ?? "").split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return v.join("=");
  }
  return undefined;
}

const sessionCookie = (value: string, maxAge: number) => `${COOKIE}=${value}; Path=/api/admin; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;

const configured = (env: Env) => !!(env.ADMIN_USERNAME && env.ADMIN_PASSWORD_HASH && env.SESSION_SECRET && env.SESSION_SECRET.length >= 32 && env.GITHUB_TOKEN);

function repoOf(env: Env) {
  const [owner, name] = (env.GITHUB_REPO ?? "").split("/");
  return { owner, name, branch: env.GITHUB_BRANCH || "main" };
}

/** Blocks cross-site requests that change things (the cookie is SameSite=Strict as well). */
function sameOrigin(request: Request) {
  const origin = request.headers.get("Origin");
  return !origin || origin === new URL(request.url).origin;
}

async function handleAdmin(request: Request, env: Env, path: string): Promise<Response> {
  if (!configured(env)) return json({ error: "not-configured" }, 503);
  if (request.method !== "GET" && !sameOrigin(request)) return json({ error: "forbidden" }, 403);
  const secret = env.SESSION_SECRET!;

  if (path === "/login") {
    if (request.method !== "POST") return json({ error: "method" }, 405);
    if (env.LOGIN_LIMITER) {
      const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
      if (!(await env.LOGIN_LIMITER.limit({ key: `login:${ip}` })).success) return json({ error: "too-many" }, 429);
    }
    let body: { username?: unknown; password?: unknown };
    try {
      body = await request.json();
    } catch {
      return json({ error: "bad-request" }, 400);
    }
    const username = typeof body.username === "string" ? body.username.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    // Always run the slow hash so a wrong username takes as long as a wrong password.
    const passwordOk = password.length > 0 && password.length <= 256 && (await verifyPassword(password, env.ADMIN_PASSWORD_HASH!));
    const userOk = sameBytes(enc.encode(username.toLowerCase()), enc.encode(env.ADMIN_USERNAME!.toLowerCase()));
    if (!passwordOk || !userOk) return json({ error: "wrong-login" }, 401);
    return json({ user: env.ADMIN_USERNAME, ...repoOf(env) }, 200, { "Set-Cookie": sessionCookie(await makeSession(secret, env.ADMIN_USERNAME!), SESSION_HOURS * 3600) });
  }

  if (path === "/logout") {
    if (request.method !== "POST") return json({ error: "method" }, 405);
    return json({ ok: true }, 200, { "Set-Cookie": sessionCookie("", 0) });
  }

  const user = await readSession(secret, cookieValue(request, COOKIE));
  if (!user) return json({ error: "signed-out" }, 401);

  if (path === "/session") return json({ user, ...repoOf(env) });

  if (path.startsWith("/github/")) {
    const ghPath = path.slice("/github".length);
    if (!["GET", "POST", "PATCH"].includes(request.method) || !ALLOWED_GITHUB.test(ghPath)) return json({ error: "not-allowed" }, 403);
    const { owner, name } = repoOf(env);
    const url = new URL(request.url);
    const res = await fetch(`${GITHUB_API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}${ghPath}${url.search}`, {
      method: request.method,
      headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${env.GITHUB_TOKEN}`, "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "little-ramadan-admin", ...(request.method !== "GET" ? { "Content-Type": "application/json" } : {}) },
      body: request.method === "GET" ? undefined : await request.text(),
    });
    // GitHub refusing the server's key is a server problem, not the admin's sign-in.
    const status = res.status === 401 ? 502 : res.status;
    return new Response(res.body, { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
  }

  return json({ error: "not-found" }, 404);
}

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/admin/")) return handleAdmin(request, env, url.pathname.slice("/api/admin".length));
    if (url.pathname.startsWith("/api/")) return json({ error: "not-found" }, 404);
    return env.ASSETS.fetch(request);
  },
};

export default worker;
