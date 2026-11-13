/**
 * Publishing through GitHub: the admin's changes become one commit on the repository's branch.
 * Cloudflare rebuilds the app from that branch, and the build's content check keeps the last
 * good version live if anything is wrong. Only api.github.com is ever contacted.
 */
import { CONTENT_FILES, type ContentBundle, type ContentKey } from "@/content/validate";

export const API = "https://api.github.com";
export const DATA_DIR = "src/content/data";
export const IMAGE_DIR = "public/content-images";

export interface Repo {
  owner: string;
  name: string;
  branch: string;
  /** A personal GitHub key (advanced). Not used when signed in: then `proxy` is true. */
  token: string;
  /** Signed in with a username and password: calls go through the app's own server, which holds the GitHub key. */
  proxy?: boolean;
}

/** The app's own sign-in endpoints (served by worker/index.ts). */
export const ADMIN_API = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/admin`;

export interface Loaded {
  headSha: string;
  bundle: ContentBundle;
  /** Blob SHA of each content file when loaded (to detect someone else's edits). */
  shas: Record<string, string>;
  images: string[];
}

export class GitHubError extends Error {
  constructor(
    message: string,
    public status = 0,
  ) {
    super(message);
  }
}

async function api<T>(repo: Repo, path: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = repo.proxy
      ? await fetch(`${ADMIN_API}/github${path}`, { ...init, credentials: "same-origin", headers: init.body ? { "Content-Type": "application/json" } : {} })
      : await fetch(`${API}/repos/${encodeURIComponent(repo.owner)}/${encodeURIComponent(repo.name)}${path}`, {
          ...init,
          headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${repo.token}`, "X-GitHub-Api-Version": "2022-11-28", ...(init.body ? { "Content-Type": "application/json" } : {}) },
        });
  } catch {
    throw new GitHubError("Could not reach GitHub. Check your internet connection.");
  }
  if (!res.ok) {
    const why =
      repo.proxy && res.status === 401 ? "Your sign-in has ended. Sign in again (download your changes first if you have any)." :
      repo.proxy && res.status === 502 ? "The server's GitHub key was not accepted. Ask the app owner to renew GITHUB_TOKEN." :
      repo.proxy && res.status === 403 ? "The server's GitHub key is not allowed to do that. It needs read and write access to the repository's Contents." :
      res.status === 401 ? "GitHub did not accept the access key. Check it has not expired." :
      res.status === 403 ? "This access key is not allowed to do that. It needs read and write access to the repository's Contents." :
      res.status === 404 ? "Repository or branch not found (or the key can't see it)." :
      res.status === 409 || res.status === 422 ? "Someone else published changes at the same time. Reload and try again." :
      `GitHub error ${res.status}.`;
    throw new GitHubError(why, res.status);
  }
  return (await res.json()) as T;
}

const decodeUtf8Base64 = (b64: string) => new TextDecoder().decode(Uint8Array.from(atob(b64.replace(/\n/g, "")), (c) => c.charCodeAt(0)));
export const encodeUtf8Base64 = (text: string) => {
  const bytes = new TextEncoder().encode(text);
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
};

/** The exact text written for a content file (2-space JSON and a final newline, like the repository). */
export const serialise = (data: unknown) => `${JSON.stringify(data, null, 2)}\n`;

interface TreeEntry {
  path: string;
  type: string;
  sha: string;
}
async function headAndTree(repo: Repo) {
  const ref = await api<{ object: { sha: string } }>(repo, `/git/ref/heads/${encodeURIComponent(repo.branch)}`);
  const commit = await api<{ tree: { sha: string } }>(repo, `/git/commits/${ref.object.sha}`);
  const tree = await api<{ tree: TreeEntry[]; truncated: boolean }>(repo, `/git/trees/${commit.tree.sha}?recursive=1`);
  return { headSha: ref.object.sha, treeSha: commit.tree.sha, entries: tree.tree };
}

/** Loads the latest content files and the list of uploaded pictures from the branch. */
export async function loadFromGitHub(repo: Repo): Promise<Loaded> {
  const { headSha, entries } = await headAndTree(repo);
  const bundle = {} as ContentBundle;
  const shas: Record<string, string> = {};
  for (const [key, file] of Object.entries(CONTENT_FILES) as [ContentKey, string][]) {
    const entry = entries.find((e) => e.path === `${DATA_DIR}/${file}`);
    if (!entry) throw new GitHubError(`${DATA_DIR}/${file} is missing from the repository.`);
    const blob = await api<{ content: string }>(repo, `/git/blobs/${entry.sha}`);
    bundle[key] = JSON.parse(decodeUtf8Base64(blob.content));
    shas[file] = entry.sha;
  }
  const images = entries.filter((e) => e.type === "blob" && e.path.startsWith(`${IMAGE_DIR}/`) && !e.path.endsWith(".txt")).map((e) => e.path.slice(IMAGE_DIR.length + 1));
  return { headSha, bundle, shas, images };
}

export interface FileChange {
  /** Repository path, e.g. "src/content/data/stories.json". */
  path: string;
  /** base64 content. */
  base64: string;
}

/**
 * Publishes changes as a single commit. If the branch moved since loading, the commit is still
 * made on top of the latest version unless one of the same files was changed by someone else.
 */
export async function publish(repo: Repo, loaded: Pick<Loaded, "headSha" | "shas">, changes: FileChange[], message: string): Promise<{ sha: string; url: string }> {
  const { headSha, treeSha, entries } = await headAndTree(repo);
  if (headSha !== loaded.headSha) {
    const clashes = changes.filter((c) => c.path.startsWith(`${DATA_DIR}/`)).filter((c) => {
      const now = entries.find((e) => e.path === c.path)?.sha;
      return now !== loaded.shas[c.path.slice(DATA_DIR.length + 1)];
    });
    if (clashes.length) throw new GitHubError(`These files were changed by someone else since you loaded them: ${clashes.map((c) => c.path.split("/").pop()).join(", ")}. Download your changes as a backup, reload, and make your edits again.`, 409);
  }
  const tree = [];
  for (const c of changes) {
    const blob = await api<{ sha: string }>(repo, "/git/blobs", { method: "POST", body: JSON.stringify({ content: c.base64, encoding: "base64" }) });
    tree.push({ path: c.path, mode: "100644", type: "blob", sha: blob.sha });
  }
  const newTree = await api<{ sha: string }>(repo, "/git/trees", { method: "POST", body: JSON.stringify({ base_tree: treeSha, tree }) });
  const commit = await api<{ sha: string; html_url?: string }>(repo, "/git/commits", { method: "POST", body: JSON.stringify({ message, tree: newTree.sha, parents: [headSha] }) });
  await api(repo, `/git/refs/heads/${encodeURIComponent(repo.branch)}`, { method: "PATCH", body: JSON.stringify({ sha: commit.sha, force: false }) });
  return { sha: commit.sha, url: commit.html_url ?? `https://github.com/${repo.owner}/${repo.name}/commit/${commit.sha}` };
}

export interface AdminSession {
  user: string;
  owner: string;
  name: string;
  branch: string;
}

async function adminCall(path: string, init?: RequestInit) {
  try {
    return await fetch(`${ADMIN_API}${path}`, { credentials: "same-origin", ...init });
  } catch {
    throw new GitHubError("Could not reach the server. Check your internet connection.");
  }
}

/** The signed-in admin, null when signed out, or "unavailable" when this website has no sign-in set up. */
export async function getSession(): Promise<AdminSession | null | "unavailable"> {
  const res = await adminCall("/session").catch(() => null);
  if (!res || res.status === 503 || res.status === 404 || !(res.headers.get("Content-Type") ?? "").includes("json")) return "unavailable";
  return res.ok ? ((await res.json()) as AdminSession) : null;
}

export async function signIn(username: string, password: string): Promise<AdminSession> {
  const res = await adminCall("/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
  if (res.ok) return (await res.json()) as AdminSession;
  throw new GitHubError(
    res.status === 401 ? "That username or password is not right." :
    res.status === 429 ? "Too many tries. Wait a minute and try again." :
    res.status === 503 || res.status === 404 ? "Sign-in is not set up on this website yet. See the admin guide." :
    `Could not sign in (error ${res.status}).`,
    res.status,
  );
}

export async function signOutSession() {
  await adminCall("/logout", { method: "POST" }).catch(() => undefined);
}
