import { expect, test, type Page, type Route } from "@playwright/test";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

/**
 * Content admin, against a simulated GitHub API (no real repository is touched).
 * The fake keeps an in-memory git repository: refs, commits, trees and blobs.
 */
const TOKEN = "github_pat_test";
const DATA = path.join(__dirname, "../../src/content/data");

class FakeGitHub {
  blobs = new Map<string, string>(); // sha -> base64
  trees = new Map<string, { path: string; sha: string }[]>();
  commits = new Map<string, { tree: string; message: string; parents: string[] }>();
  head = "c0";
  n = 0;
  published: { message: string; files: Record<string, string> }[] = [];
  constructor() {
    const entries = readdirSync(DATA).map((f) => ({ path: `src/content/data/${f}`, sha: this.blob(readFileSync(path.join(DATA, f)).toString("base64")) }));
    const IMAGES = path.join(__dirname, "../../public/content-images");
    for (const f of readdirSync(IMAGES)) entries.push({ path: `public/content-images/${f}`, sha: this.blob(readFileSync(path.join(IMAGES, f)).toString("base64")) });
    this.trees.set("t0", entries);
    this.commits.set("c0", { tree: "t0", message: "initial", parents: [] });
  }
  blob(b64: string) {
    const sha = `b${++this.n}`;
    this.blobs.set(sha, b64);
    return sha;
  }
  file(p: string) {
    const tree = this.trees.get(this.commits.get(this.head)!.tree)!;
    const e = tree.find((x) => x.path === p);
    return e ? Buffer.from(this.blobs.get(e.sha)!, "base64").toString("utf8") : undefined;
  }
  async handle(route: Route) {
    const req = route.request();
    if (req.headers().authorization !== `Bearer ${TOKEN}`) return route.fulfill({ status: 401, json: { message: "Bad credentials" } });
    const url = new URL(req.url());
    const m = url.pathname.match(/^\/repos\/xin-xan\/Little-Ramadan(\/.*)$/);
    if (!m) return route.fulfill({ status: 404, json: {} });
    return this.answer(route, m[1]);
  }
  /** The repository API itself (reached directly with a key, or through the app's signed-in proxy). */
  async answer(route: Route, p: string) {
    const req = route.request();
    const body = req.postData() ? JSON.parse(req.postData()!) : null;
    if (req.method() === "GET" && p === "/git/ref/heads/main") return route.fulfill({ json: { object: { sha: this.head } } });
    if (req.method() === "GET" && p.startsWith("/git/commits/")) return route.fulfill({ json: { tree: { sha: this.commits.get(p.split("/").pop()!)!.tree } } });
    if (req.method() === "GET" && p.startsWith("/git/trees/")) return route.fulfill({ json: { tree: this.trees.get(p.split("/").pop()!)!.map((e) => ({ ...e, type: "blob" })), truncated: false } });
    if (req.method() === "GET" && p.startsWith("/git/blobs/")) return route.fulfill({ json: { content: this.blobs.get(p.split("/").pop()!) } });
    if (req.method() === "POST" && p === "/git/blobs") return route.fulfill({ status: 201, json: { sha: this.blob(body.content) } });
    if (req.method() === "POST" && p === "/git/trees") {
      const base = this.trees.get(body.base_tree)!.filter((e) => !body.tree.some((t: { path: string }) => t.path === e.path));
      const sha = `t${++this.n}`;
      this.trees.set(sha, [...base, ...body.tree.map((t: { path: string; sha: string }) => ({ path: t.path, sha: t.sha }))]);
      return route.fulfill({ status: 201, json: { sha } });
    }
    if (req.method() === "POST" && p === "/git/commits") {
      const sha = `c${++this.n}`;
      this.commits.set(sha, { tree: body.tree, message: body.message, parents: body.parents });
      return route.fulfill({ status: 201, json: { sha, html_url: `https://github.com/xin-xan/Little-Ramadan/commit/${sha}` } });
    }
    if (req.method() === "PATCH" && p === "/git/refs/heads/main") {
      if (this.commits.get(body.sha)!.parents[0] !== this.head) return route.fulfill({ status: 422, json: { message: "not fast forward" } });
      this.head = body.sha;
      const tree = this.trees.get(this.commits.get(body.sha)!.tree)!;
      this.published.push({ message: this.commits.get(body.sha)!.message, files: Object.fromEntries(tree.map((e) => [e.path, e.sha])) });
      return route.fulfill({ json: { object: { sha: body.sha } } });
    }
    return route.fulfill({ status: 404, json: {} });
  }
}

async function connect(page: Page, gh: FakeGitHub, token = TOKEN) {
  await page.route("https://api.github.com/**", (r) => gh.handle(r));
  await page.goto("/admin/");
  await page.getByText("Advanced: connect with your own GitHub key").click();
  await page.getByLabel("Access token").fill(token);
  await page.getByRole("button", { name: "Connect and load content" }).click();
}

test("edit, add and publish a story; the commit contains exactly the change", async ({ page }) => {
  const gh = new FakeGitHub();
  await connect(page, gh);
  await expect(page.getByRole("heading", { name: "Content", exact: true })).toBeVisible();

  await page.getByRole("button", { name: /^Stories/ }).click();
  await page.getByRole("button", { name: /^Noor's First Suhoor/ }).click();
  await page.getByLabel("Title", { exact: true }).fill("Noor's Very First Suhoor");
  await page.locator("details.sub-item").nth(0).locator("summary").click();
  const page1 = page.locator("details.sub-item").nth(0).getByLabel("Text");
  await page1.fill("It was still dark when Mum gently woke Noor.");
  await page.getByRole("button", { name: "Done" }).click();

  // Add a brand-new story.
  await page.getByRole("button", { name: "+ Add new" }).click();
  await page.getByLabel("Title", { exact: true }).fill("The Kind Fisherman");
  await page.getByRole("button", { name: "Make from title" }).click();
  await expect(page.getByLabel("ID")).toHaveValue("the-kind-fisherman");
  await page.getByLabel("Summary").fill("A fisherman shares his catch.");
  await page.getByLabel("What the story is about").fill("sharing");
  await expect(page.getByTestId("item-issues")).toBeVisible(); // empty pages still need text
  for (let i = 1; i <= 3; i++) {
    await page.locator("details.sub-item").nth(i - 1).getByLabel("Text").fill(`Page ${i} of the fisherman story.`);
  }
  await expect(page.getByTestId("item-issues")).toHaveCount(0);
  await page.getByRole("button", { name: "Done" }).click();
  await expect(page.getByText("New", { exact: true })).toBeVisible();

  await page.getByTestId("open-publish").click();
  await page.getByLabel("Note about this change").fill("New fisherman story");
  await page.getByRole("button", { name: "Publish now" }).click();
  await expect(page.getByText(/Published!/)).toBeVisible();

  expect(gh.published).toHaveLength(1);
  expect(gh.published[0].message).toBe("New fisherman story");
  const stories = JSON.parse(gh.file("src/content/data/stories.json")!);
  expect(stories[0].title).toBe("Noor's Very First Suhoor");
  expect(stories[0].pages[0].text).toBe("It was still dark when Mum gently woke Noor.");
  expect(stories.at(-1)).toMatchObject({ id: "the-kind-fisherman", title: "The Kind Fisherman", review: { status: "draft" } });
  // Formatting matches the repository (2-space JSON + newline), and nothing else changed.
  expect(gh.file("src/content/data/stories.json")!.endsWith("}\n]\n")).toBe(true);
  expect(gh.file("src/content/data/lessons.json")).toBe(readFileSync(path.join(DATA, "lessons.json"), "utf8"));
});

test("problems block publishing, and items in use can't be deleted", async ({ page }) => {
  const gh = new FakeGitHub();
  await connect(page, gh);
  await page.getByRole("button", { name: /^Quizzes/ }).click();
  await page.getByRole("button", { name: /^Ramadan Basics/ }).click();
  const q1 = page.locator("details.sub-item").first();
  await q1.locator("summary").click();
  await q1.getByLabel("Question", { exact: true }).fill("");
  await expect(page.getByTestId("item-issues")).toContainText("Can't be empty");
  await page.getByTestId("open-publish").click();
  await expect(page.getByTestId("publish-issues")).toBeVisible();
  await expect(page.getByRole("button", { name: "Publish now" })).toBeDisabled();
  await page.getByTestId("publish-issues").getByRole("button").first().click();
  await expect(page.getByTestId("item-issues")).toBeVisible();

  await page.getByRole("button", { name: "← Quizzes" }).click();
  await page.getByRole("button", { name: "← All content" }).click();
  await page.getByRole("button", { name: /^Stories/ }).click();
  await page.getByRole("button", { name: /Delete Noor's First Suhoor/ }).click();
  await expect(page.getByRole("alert")).toContainText("Journey day 3");
  expect(gh.published).toHaveLength(0);
});

test("Dhivehi letters can be reordered and pictures uploaded", async ({ page }) => {
  const gh = new FakeGitHub();
  await connect(page, gh);
  await page.getByRole("button", { name: /^Letters \(alphabet order\)/ }).click();
  await page.getByRole("button", { name: "Move ހ  haa down" }).click();
  await page.getByRole("button", { name: "← All content" }).click();

  await page.getByRole("button", { name: /^Memory cards/ }).click();
  await page.getByRole("button", { name: /^Lantern/ }).click();
  await page.getByRole("button", { name: "Change picture" }).click();
  // A tiny PNG made on the fly.
  const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFklEQVQI12P8z8Dwn4GBgYGJAQoYAQBEBgIBQo2T0gAAAABJRU5ErkJggg==", "base64");
  await page.getByTestId("upload-picture").setInputFiles({ name: "My Lantern.png", mimeType: "image/png", buffer: png });
  await expect(page.locator("img.pic").first()).toBeVisible();
  await page.getByRole("button", { name: "Done" }).click();

  await page.getByTestId("open-publish").click();
  await expect(page.getByText(/New picture: my-lantern-/)).toBeVisible();
  await page.getByRole("button", { name: "Publish now" }).click();
  await expect(page.getByText(/Published!/)).toBeVisible();

  const dv = JSON.parse(gh.file("src/content/data/dhivehi.json")!);
  expect(dv.letters[0].name).toBe("shaviyani");
  expect(dv.letters[1].name).toBe("haa");
  const cards = JSON.parse(gh.file("src/content/data/memory-cards.json")!);
  expect(cards[0].illustration).toMatch(/^img:my-lantern-[a-z0-9]+\.(webp|png)$/);
  const files = Object.keys(gh.published[0].files);
  expect(files).toContain(`public/content-images/${cards[0].illustration.slice(4)}`);
});

test("a wrong access key shows a clear message; editing without connecting can download changes", async ({ page }) => {
  const gh = new FakeGitHub();
  await connect(page, gh, "wrong");
  await expect(page.getByRole("alert")).toContainText("did not accept the access key");

  await page.getByRole("button", { name: "Edit without connecting" }).click();
  await page.getByRole("button", { name: /^App messages/ }).click();
  await page.getByLabel("Break / stopping message").fill("Lovely work today. Time for a rest!");
  await page.getByRole("button", { name: "Done" }).click();
  await page.getByTestId("open-publish").click();
  const dl = page.waitForEvent("download");
  await page.getByRole("dialog").getByRole("button", { name: "Download changes" }).click();
  const file = JSON.parse(readFileSync((await (await dl).path())!, "utf8"));
  expect(file.files.copy.stoppingMessage).toBe("Lovely work today. Time for a rest!");
});

/**
 * Username-and-password sign-in. The real check runs in the Cloudflare Worker (worker/index.ts,
 * unit-tested in tests/unit/worker.test.ts); here a stand-in plays that server so the page's flow is tested.
 */
function fakeSignInServer(page: Page, gh: FakeGitHub) {
  let signedIn = false;
  const seen: string[] = [];
  return {
    seen,
    install: () =>
      page.route("**/api/admin/**", async (route) => {
        const req = route.request();
        const p = new URL(req.url()).pathname.replace(/^.*\/api\/admin/, "");
        seen.push(`${req.method()} ${p}${req.headers().authorization ? " (has authorization header)" : ""}`);
        if (p === "/login") {
          const { username, password } = JSON.parse(req.postData()!);
          if (username !== "admin" || password !== "a-long-password") return route.fulfill({ status: 401, json: { error: "wrong-login" } });
          signedIn = true;
          return route.fulfill({ json: { user: "admin", owner: "xin-xan", name: "Little-Ramadan", branch: "main" } });
        }
        if (p === "/logout") {
          signedIn = false;
          return route.fulfill({ json: { ok: true } });
        }
        if (!signedIn) return route.fulfill({ status: 401, json: { error: "signed-out" } });
        if (p === "/session") return route.fulfill({ json: { user: "admin", owner: "xin-xan", name: "Little-Ramadan", branch: "main" } });
        if (p.startsWith("/github/")) return gh.answer(route, p.slice("/github".length));
        return route.fulfill({ status: 404, json: {} });
      }),
  };
}

test("sign in with a username and password, publish without a GitHub key, stay signed in, sign out", async ({ page }) => {
  const gh = new FakeGitHub();
  const server = fakeSignInServer(page, gh);
  await server.install();
  await page.route("https://api.github.com/**", (r) => r.abort());
  await page.goto("/admin/");

  await page.getByLabel("Username").fill("admin");
  await page.getByLabel("Password", { exact: true }).fill("wrong");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("alert")).toContainText("username or password is not right");

  await page.getByLabel("Password", { exact: true }).fill("a-long-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByText("Signed in as admin")).toBeVisible();

  await page.getByRole("button", { name: /^App messages/ }).click();
  await page.getByLabel("Break / stopping message").fill("Well done today. Time for a little rest!");
  await page.getByRole("button", { name: "Done" }).click();
  await page.getByTestId("open-publish").click();
  await page.getByRole("button", { name: "Publish now" }).click();
  await expect.poll(() => gh.published.length).toBe(1);
  expect(JSON.parse(gh.file("src/content/data/copy.json")!).stoppingMessage).toBe("Well done today. Time for a little rest!");
  // The page never handled a GitHub key: every call went to the app's own server, without one.
  expect(server.seen.filter((s) => s.includes("authorization"))).toEqual([]);

  // Reopening the page keeps the sign-in.
  await page.reload();
  await expect(page.getByText("Signed in as admin")).toBeVisible();

  await page.getByText("More").click();
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  expect(server.seen).toContain("POST /logout");
});

test("without a sign-in server, the page says so and the other ways still work", async ({ page }) => {
  await page.goto("/admin/");
  await expect(page.getByText("Sign-in is not set up on this website yet")).toBeVisible();
  await expect(page.getByRole("button", { name: "Edit without connecting" })).toBeVisible();
});
