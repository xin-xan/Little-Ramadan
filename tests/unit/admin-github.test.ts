/** Admin publishing: one commit with exactly the changed files; edits by someone else are not overwritten. */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { encodeUtf8Base64, publish, serialise, type Repo } from "../../admin/github";

const repo: Repo = { owner: "o", name: "r", branch: "main", token: "t" };

function fakeFetch(state: { head: string; tree: { path: string; sha: string }[] }) {
  const calls: { method: string; path: string; body?: unknown }[] = [];
  vi.stubGlobal("fetch", async (url: string, init: RequestInit = {}) => {
    const path = new URL(url).pathname.replace("/repos/o/r", "");
    const method = init.method ?? "GET";
    const body = init.body ? JSON.parse(String(init.body)) : undefined;
    calls.push({ method, path, body });
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer t");
    const json = (v: unknown) => new Response(JSON.stringify(v), { status: 200 });
    if (path === "/git/ref/heads/main") return json({ object: { sha: state.head } });
    if (path.startsWith("/git/commits/") && method === "GET") return json({ tree: { sha: "tree0" } });
    if (path.startsWith("/git/trees/") && method === "GET") return json({ tree: state.tree.map((t) => ({ ...t, type: "blob" })), truncated: false });
    if (path === "/git/blobs") return json({ sha: `blob-${calls.length}` });
    if (path === "/git/trees") return json({ sha: "tree1" });
    if (path === "/git/commits") return json({ sha: "commit1" });
    if (path === "/git/refs/heads/main") return json({});
    return new Response("{}", { status: 404 });
  });
  return calls;
}

afterEach(() => vi.unstubAllGlobals());

describe("publish", () => {
  it("makes one commit on top of the branch with the changed files", async () => {
    const calls = fakeFetch({ head: "h1", tree: [{ path: "src/content/data/stories.json", sha: "s1" }] });
    const res = await publish(repo, { headSha: "h1", shas: { "stories.json": "s1" } }, [{ path: "src/content/data/stories.json", base64: encodeUtf8Base64(serialise([{ title: "Ramaḍān ✨" }])) }], "Update stories");
    expect(res.sha).toBe("commit1");
    const commit = calls.find((c) => c.method === "POST" && c.path === "/git/commits")!.body as { parents: string[]; message: string };
    expect(commit).toMatchObject({ parents: ["h1"], message: "Update stories" });
    const ref = calls.find((c) => c.method === "PATCH")!.body as { force: boolean };
    expect(ref.force).toBe(false);
    const blob = calls.find((c) => c.path === "/git/blobs")!.body as { content: string };
    expect(Buffer.from(blob.content, "base64").toString("utf8")).toBe('[\n  {\n    "title": "Ramaḍān ✨"\n  }\n]\n');
  });

  it("refuses to overwrite a file someone else changed since it was loaded", async () => {
    const calls = fakeFetch({ head: "h2", tree: [{ path: "src/content/data/stories.json", sha: "s-someone-else" }] });
    await expect(publish(repo, { headSha: "h1", shas: { "stories.json": "s1" } }, [{ path: "src/content/data/stories.json", base64: "e30=" }], "x")).rejects.toThrow(/changed by someone else/);
    expect(calls.some((c) => c.method === "PATCH")).toBe(false);
  });

  it("still publishes when others changed different files", async () => {
    fakeFetch({ head: "h2", tree: [{ path: "src/content/data/stories.json", sha: "s1" }, { path: "src/content/data/lessons.json", sha: "l-new" }] });
    await expect(publish(repo, { headSha: "h1", shas: { "stories.json": "s1", "lessons.json": "l-old" } }, [{ path: "src/content/data/stories.json", base64: "e30=" }], "x")).resolves.toMatchObject({ sha: "commit1" });
  });
});

describe("admin privacy", () => {
  const files = readdirSync(join(__dirname, "../../admin")).filter((f) => /\.(ts|tsx)$/.test(f));
  it("only ever contacts api.github.com", () => {
    for (const f of files) {
      const text = readFileSync(join(__dirname, "../../admin", f), "utf8");
      const urls = (text.match(/https?:\/\/[^\s"'`)]+/g) ?? []).filter((u) => !u.startsWith("https://github.com/"));
      expect(urls.every((u) => u.startsWith("https://api.github.com")), f).toBe(true);
    }
  });
  it("the children's app never includes the admin code", () => {
    const walk = (d: string): string[] => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(d, e.name)) : /\.(ts|tsx)$/.test(e.name) ? [join(d, e.name)] : []));
    for (const f of walk(join(__dirname, "../../src"))) expect(readFileSync(f, "utf8"), f).not.toMatch(/from ["'](\.\.\/)+admin|from ["']@\/\.\.\/admin/);
  });
});
