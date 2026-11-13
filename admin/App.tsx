import { useEffect, useMemo, useState } from "react";
import { BUNDLED_CONTENT } from "@/content/bundle";
import { CONTENT_FILES, validateContent, type ContentBundle, type ContentKey, type Issue } from "@/content/validate";
import { FieldEditor, PicturePreview, setKey, slug, type Ctx } from "./fields";
import { DATA_DIR, encodeUtf8Base64, getSession, GitHubError, IMAGE_DIR, loadFromGitHub, publish, serialise, signIn, signOutSession, type AdminSession, type Loaded, type Repo } from "./github";
import { prepareImage } from "./images";
import { COLLECTIONS, type Collection, type Obj } from "./schema";

const DEFAULT_REPO = { owner: "xin-xan", name: "Little-Ramadan", branch: "main" };
const STORE_KEY = "lr-admin-connection";

type Uploads = Record<string, { base64: string; dataUrl: string }>;
type View = { coll?: string; item?: number };

const getAt = (b: ContentBundle, c: Collection): unknown => c.path.reduce<unknown>((v, k) => (v && typeof v === "object" ? (v as Obj)[k] : undefined), b[c.file]);
function setAt(b: ContentBundle, c: Collection, value: unknown): ContentBundle {
  const write = (cur: unknown, path: string[]): unknown => (path.length === 0 ? value : { ...(cur as Obj), [path[0]]: write((cur as Obj)?.[path[0]], path.slice(1)) });
  return { ...b, [c.file]: write(b[c.file], c.path) };
}
const prefixOf = (c: Collection) => [c.file, ...c.path].join(".");
const issuesFor = (issues: Issue[], c: Collection, index?: number) => {
  const p = prefixOf(c);
  return issues.filter((i) => i.file === c.file && (index === undefined ? i.path === p || i.path.startsWith(`${p}[`) || i.path.startsWith(`${p}.`) || (c.kind === "object" && i.path === c.file) : i.path.startsWith(`${p}[${index}]`)));
};
function collectIds(v: unknown, out = new Set<string>()): Set<string> {
  if (Array.isArray(v)) v.forEach((x) => collectIds(x, out));
  else if (v && typeof v === "object")
    for (const [k, x] of Object.entries(v as Obj)) {
      if (k === "id" && typeof x === "string") out.add(x);
      else collectIds(x, out);
    }
  return out;
}

/** Where an item is used elsewhere (it can't be deleted while it is). */
function usedBy(b: ContentBundle, c: Collection, item: Obj): string[] {
  const id = item.id;
  const days = (b.days as Obj[]) ?? [];
  const at = (pred: (d: Obj) => boolean) => days.map((d, i) => (pred(d) ? `Journey day ${i + 1}` : "")).filter(Boolean);
  if (c.id === "lessons") return at((d) => (d.learn as Obj)?.kind === "lesson" && (d.learn as Obj)?.id === id);
  if (c.id === "stories") return at((d) => (d.learn as Obj)?.kind === "story" && (d.learn as Obj)?.id === id);
  if (c.id === "missions") return at((d) => d.kindnessId === id);
  if (c.id === "quizzes") return at((d) => (d.play as Obj)?.quizSetId === id);
  if (c.id === "dvWords") return (((b.dhivehi as Obj)?.letters as Obj[]) ?? []).filter((l) => (l.example as Obj)?.wordId === id).map((l) => `Letter ${String(l.name)}`);
  return [];
}

function loadSaved(): { repo: typeof DEFAULT_REPO; token: string; remember: boolean } {
  try {
    const raw = localStorage.getItem(STORE_KEY) ?? sessionStorage.getItem(STORE_KEY);
    if (raw) return { ...JSON.parse(raw), remember: !!localStorage.getItem(STORE_KEY) };
  } catch {
    /* storage unavailable */
  }
  return { repo: DEFAULT_REPO, token: "", remember: false };
}

export function AdminApp() {
  const saved = useState(loadSaved)[0];
  const [repoForm, setRepoForm] = useState(saved.repo);
  const [token, setToken] = useState(saved.token);
  const [remember, setRemember] = useState(saved.remember);
  const [repo, setRepo] = useState<Repo | null>(null);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [original, setOriginal] = useState<ContentBundle | null>(null);
  const [work, setWork] = useState<ContentBundle | null>(null);
  const [uploads, setUploads] = useState<Uploads>({});
  const [view, setView] = useState<View>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [search, setSearch] = useState("");
  /** undefined while checking; "unavailable" when the website has no sign-in set up. */
  const [session, setSession] = useState<AdminSession | null | "unavailable" | undefined>(undefined);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const images = useMemo(() => [...new Set([...(loaded?.images ?? []), ...Object.keys(uploads)])].sort(), [loaded, uploads]);
  const issues = useMemo(() => (work ? validateContent(work, { images: repo ? new Set(images) : undefined }) : []), [work, images, repo]);
  const changedFiles = useMemo(() => (work && original ? (Object.keys(CONTENT_FILES) as ContentKey[]).filter((k) => serialise(work[k]) !== serialise(original[k])) : []), [work, original]);
  const changeCount = changedFiles.length + Object.keys(uploads).length;

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (changeCount > 0) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [changeCount]);

  const open = async (r: Repo) => {
    const l = await loadFromGitHub(r);
    setRepo(r);
    setLoaded(l);
    setOriginal(l.bundle);
    setWork(structuredClone(l.bundle));
    setUploads({});
    setView({});
  };

  // Already signed in (the sign-in lasts a few hours): go straight to the dashboard.
  useEffect(() => {
    let live = true;
    void getSession().then(async (s) => {
      if (!live) return;
      setSession(s);
      if (s && s !== "unavailable") {
        setBusy("Loading content…");
        try {
          await open({ owner: s.owner, name: s.name, branch: s.branch, token: "", proxy: true });
        } catch (e) {
          setError((e as Error).message);
        } finally {
          setBusy(null);
        }
      }
    });
    return () => {
      live = false;
    };
  }, []);

  const login = async () => {
    setBusy("Signing in…");
    setError(null);
    try {
      const s = await signIn(username.trim(), password);
      setPassword("");
      setSession(s);
      setBusy("Loading content…");
      await open({ owner: s.owner, name: s.name, branch: s.branch, token: "", proxy: true });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const retry = async () => {
    if (!session || session === "unavailable") return;
    setBusy("Loading content…");
    setError(null);
    try {
      await open({ owner: session.owner, name: session.name, branch: session.branch, token: "", proxy: true });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const connect = async () => {
    setBusy("Loading content from GitHub…");
    setError(null);
    const r: Repo = { ...repoForm, token: token.trim() };
    try {
      const l = await loadFromGitHub(r);
      try {
        const store = remember ? localStorage : sessionStorage;
        (remember ? sessionStorage : localStorage).removeItem(STORE_KEY);
        store.setItem(STORE_KEY, JSON.stringify({ repo: repoForm, token: r.token }));
      } catch {
        /* storage unavailable: stay signed in for this page only */
      }
      setRepo(r);
      setLoaded(l);
      setOriginal(l.bundle);
      setWork(structuredClone(l.bundle));
      setUploads({});
      setView({});
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const workOffline = () => {
    setRepo(null);
    setLoaded(null);
    setOriginal(BUNDLED_CONTENT);
    setWork(structuredClone(BUNDLED_CONTENT));
    setUploads({});
    setView({});
  };

  const signOut = () => {
    if (changeCount > 0 && !confirm("You have changes that are not published. Sign out and lose them?")) return;
    if (repo?.proxy) {
      void signOutSession();
      setSession(null);
    }
    try {
      localStorage.removeItem(STORE_KEY);
      sessionStorage.removeItem(STORE_KEY);
    } catch {
      /* ignore */
    }
    setToken("");
    setRepo(null);
    setWork(null);
    setOriginal(null);
    setLoaded(null);
    setUploads({});
  };

  // ------------------------------------------------------------------ connect screen
  if (!work || !original) {
    return (
      <main className="admin connect">
        <h1>Little Ramadan · Content admin</h1>
        <p>Edit stories, lessons, quizzes, missions, Dhivehi letters and every other piece of content, then publish. Publishing saves your changes to the app&apos;s GitHub repository; Cloudflare then rebuilds the app, and families get the update within a few minutes.</p>
        <section className="card">
          <h2>Sign in</h2>
          {session === undefined ? (
            <p className="help" role="status">
              {busy ?? "Checking sign-in…"}
            </p>
          ) : session === "unavailable" ? (
            <p className="help">
              Sign-in is not set up on this website yet (the owner adds a username and password on Cloudflare; see the admin guide). You can still connect with a GitHub key below, or work without connecting.
            </p>
          ) : session ? (
            <div className="row">
              <span>
                Signed in as <strong>{session.user}</strong>
              </span>
              <button className="btn primary" disabled={!!busy} onClick={() => void retry()}>
                {busy ?? "Load content"}
              </button>
              <button className="btn" disabled={!!busy} onClick={() => { void signOutSession(); setSession(null); setError(null); }}>
                Sign out
              </button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void login();
              }}
            >
              <label>
                Username
                <input className="input" autoComplete="username" autoCapitalize="none" spellCheck={false} value={username} onChange={(e) => setUsername(e.target.value)} />
              </label>
              <label>
                Password
                <input className="input" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </label>
              <button className="btn primary" type="submit" disabled={!username.trim() || !password || !!busy}>
                {busy ?? "Sign in"}
              </button>
            </form>
          )}
        </section>
        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}
        <details className="card advanced">
          <summary>Advanced: connect with your own GitHub key</summary>
          <p className="help">
            You need a GitHub <strong>fine-grained access token</strong> for this repository with <strong>Contents: Read and write</strong> permission. It stays in this browser and is only ever sent to GitHub.
          </p>
          <div className="grid2">
            <label>
              Owner
              <input className="input" value={repoForm.owner} onChange={(e) => setRepoForm({ ...repoForm, owner: e.target.value.trim() })} />
            </label>
            <label>
              Repository
              <input className="input" value={repoForm.name} onChange={(e) => setRepoForm({ ...repoForm, name: e.target.value.trim() })} />
            </label>
            <label>
              Branch
              <input className="input" value={repoForm.branch} onChange={(e) => setRepoForm({ ...repoForm, branch: e.target.value.trim() })} />
            </label>
          </div>
          <label>
            Access token
            <input className="input" type="password" autoComplete="off" value={token} onChange={(e) => setToken(e.target.value)} placeholder="github_pat_…" />
          </label>
          <label className="check">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Remember on this device (only on a private device)
          </label>
                    <button className="btn primary" disabled={!token.trim() || !!busy} onClick={connect}>
            {busy ?? "Connect and load content"}
          </button>
        </details>
        <section className="card">
          <h2>Or work without connecting</h2>
          <p className="help">Edit the content that came with this version of the app and download your changes as a file. Someone with access can load that file here later and publish it.</p>
          <button className="btn" onClick={workOffline}>
            Edit without connecting
          </button>
        </section>
      </main>
    );
  }

  const ctxBase = {
    bundle: work,
    images,
    previews: Object.fromEntries(Object.entries(uploads).map(([k, v]) => [k, v.dataUrl])),
    onUpload: async (file: File) => {
      const img = await prepareImage(file);
      setUploads((u) => ({ ...u, [img.name]: { base64: img.base64, dataUrl: img.dataUrl } }));
      return img.name;
    },
  };

  const coll = COLLECTIONS.find((c) => c.id === view.coll);
  const update = (c: Collection, value: unknown) => setWork((w) => (w ? setAt(w, c, value) : w));

  const download = () => {
    const file = { app: "little-ramadan-content", version: 1, savedAt: new Date().toISOString(), files: Object.fromEntries(changedFiles.map((k) => [k, work[k]])), images: Object.fromEntries(Object.entries(uploads).map(([k, v]) => [k, v.base64])) };
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(file)], { type: "application/json" }));
    a.download = `little-ramadan-content-changes-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  };
  const loadChanges = async (f: File) => {
    try {
      const parsed = JSON.parse(await f.text());
      if (parsed?.app !== "little-ramadan-content" || typeof parsed.files !== "object") throw new Error();
      let w = work;
      for (const [k, v] of Object.entries(parsed.files as Obj)) if (k in CONTENT_FILES) w = { ...w, [k]: v };
      setWork(w);
      const imgs: Uploads = {};
      for (const [k, v] of Object.entries((parsed.images ?? {}) as Record<string, string>)) if (/^[a-z0-9][a-z0-9._-]*\.(webp|png|jpe?g)$/i.test(k) && typeof v === "string") imgs[k] = { base64: v, dataUrl: `data:image/${k.endsWith(".png") ? "png" : k.endsWith(".webp") ? "webp" : "jpeg"};base64,${v}` };
      setUploads((u) => ({ ...u, ...imgs }));
      setNotice(`Loaded changes from ${f.name}. Check them, then publish.`);
    } catch {
      setError("That file is not a Little Ramadan content changes file.");
    }
  };

  return (
    <div className="admin">
      <header className="topbar">
        <button className="brand" onClick={() => setView({})}>
          Little Ramadan admin
        </button>
        <span className="muted small">{repo ? `${repo.proxy && session && session !== "unavailable" ? `Signed in as ${session.user} · ` : ""}${repo.owner}/${repo.name} · ${repo.branch}` : "Not connected (download changes to share them)"}</span>
        <div className="top-actions">
          <button className="btn primary" disabled={changeCount === 0} onClick={() => setPublishing(true)} data-testid="open-publish">
            {repo ? "Publish" : "Review changes"} {changeCount > 0 ? `(${changeCount})` : ""}
          </button>
          <details className="menu">
            <summary className="btn">More</summary>
            <div className="menu-panel">
              <button className="btn ghost" disabled={changeCount === 0} onClick={download}>
                Download my changes
              </button>
              <label className="btn ghost">
                Load a changes file
                <input type="file" accept="application/json,.json" hidden onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) void loadChanges(f); }} />
              </label>
              <button className="btn ghost danger" disabled={changeCount === 0} onClick={() => { if (confirm("Throw away all changes that are not published?")) { setWork(structuredClone(original)); setUploads({}); } }}>
                Discard all changes
              </button>
              <button className="btn ghost" onClick={signOut}>
                {repo ? "Sign out" : "Back to start"}
              </button>
            </div>
          </details>
        </div>
      </header>

      {(notice || error) && (
        <p className={`banner${error ? " error" : ""}`} role="status">
          {error ?? notice}{" "}
          <button className="link" onClick={() => { setNotice(null); setError(null); }}>
            Dismiss
          </button>
        </p>
      )}

      <main className="admin-main">
        {!coll && (
          <Dashboard
            work={work}
            original={original}
            issues={issues}
            onOpen={(c) => {
              setSearch("");
              setView({ coll: c.id, item: c.kind === "object" ? 0 : undefined });
            }}
          />
        )}
        {coll && coll.kind === "list" && view.item === undefined && (
          <ItemList
            coll={coll}
            items={(getAt(work, coll) as Obj[]) ?? []}
            originalItems={(getAt(original, coll) as Obj[]) ?? []}
            issues={issues}
            search={search}
            setSearch={setSearch}
            ctx={{ ...ctxBase, lockedIds: new Set() }}
            onBack={() => setView({})}
            onOpen={(i) => setView({ coll: coll.id, item: i })}
            onChange={(items) => update(coll, items)}
            usedBy={(item) => usedBy(work, coll, item)}
          />
        )}
        {coll && view.item !== undefined && (
          <ItemEditor
            coll={coll}
            value={coll.kind === "object" ? (getAt(work, coll) as Obj) : ((getAt(work, coll) as Obj[]) ?? [])[view.item]}
            index={view.item}
            issues={issuesFor(issues, coll, coll.kind === "object" ? undefined : view.item)}
            ctx={{ ...ctxBase, lockedIds: collectIds(getAt(original, coll)) }}
            onBack={() => setView(coll.kind === "object" ? {} : { coll: coll.id })}
            onChange={(v) => {
              if (coll.kind === "object") update(coll, v);
              else update(coll, ((getAt(work, coll) as Obj[]) ?? []).map((x, i) => (i === view.item ? v : x)));
            }}
          />
        )}
      </main>

      {publishing && (
        <PublishSheet
          repo={repo}
          changedFiles={changedFiles}
          uploads={uploads}
          issues={issues}
          onGo={(c, index) => {
            setPublishing(false);
            setView({ coll: c.id, item: c.kind === "object" ? 0 : index });
          }}
          onClose={() => setPublishing(false)}
          onDownload={download}
          onPublish={async (message) => {
            if (!repo || !loaded) return;
            const changes = [
              ...changedFiles.map((k) => ({ path: `${DATA_DIR}/${CONTENT_FILES[k]}`, base64: encodeUtf8Base64(serialise(work[k])) })),
              ...Object.entries(uploads).map(([name, v]) => ({ path: `${IMAGE_DIR}/${name}`, base64: v.base64 })),
            ];
            const res = await publish(repo, loaded, changes, message);
            const fresh = await loadFromGitHub(repo).catch(() => null);
            if (fresh) {
              setLoaded(fresh);
              setOriginal(fresh.bundle);
              setWork(structuredClone(fresh.bundle));
            } else {
              setOriginal(work);
              setLoaded({ ...loaded, headSha: res.sha });
            }
            setUploads({});
            return res;
          }}
        />
      )}
    </div>
  );
}

// ------------------------------------------------------------------ dashboard
function Dashboard({ work, original, issues, onOpen }: { work: ContentBundle; original: ContentBundle; issues: Issue[]; onOpen(c: Collection): void }) {
  const groups = [...new Set(COLLECTIONS.map((c) => c.group))];
  return (
    <div className="stack">
      <h1>Content</h1>
      <p className="muted">Choose what to edit. Changed sections are marked; nothing goes live until you publish.</p>
      {groups.map((g) => (
        <section key={g}>
          <h2>{g}</h2>
          <div className="tiles">
            {COLLECTIONS.filter((c) => c.group === g).map((c) => {
              const v = getAt(work, c);
              const changed = serialise(v) !== serialise(getAt(original, c));
              const n = issuesFor(issues, c).length;
              return (
                <button key={c.id} className="tile" onClick={() => onOpen(c)}>
                  <strong>{c.title}</strong>
                  <span className="muted small">{Array.isArray(v) ? `${v.length} item${v.length === 1 ? "" : "s"}` : "Text"}</span>
                  <span className="tile-flags">
                    {changed && <span className="chip changed">Changed</span>}
                    {n > 0 && <span className="chip error">{n} to fix</span>}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

// ------------------------------------------------------------------ list of items
function ItemList({ coll, items, originalItems, issues, search, setSearch, ctx, onBack, onOpen, onChange, usedBy: used }: { coll: Collection; items: Obj[]; originalItems: Obj[]; issues: Issue[]; search: string; setSearch(s: string): void; ctx: Ctx; onBack(): void; onOpen(i: number): void; onChange(items: Obj[]): void; usedBy(item: Obj): string[] }) {
  const [msg, setMsg] = useState<string | null>(null);
  const title = (x: Obj, i: number) => (coll.itemTitle ? coll.itemTitle(x, i) : String(x.id ?? `Item ${i + 1}`));
  const shown = items.map((x, i) => ({ x, i })).filter(({ x, i }) => !search || JSON.stringify(x).toLowerCase().includes(search.toLowerCase()) || title(x, i).toLowerCase().includes(search.toLowerCase()));
  const swap = (i: number, j: number) => {
    const a = [...items];
    [a[i], a[j]] = [a[j], a[i]];
    onChange(a);
  };
  const thumb = (x: Obj) => (typeof x.illustration === "string" ? x.illustration : typeof x.picture === "string" ? x.picture : null);
  return (
    <div className="stack">
      <button className="back" onClick={onBack}>
        ← All content
      </button>
      <h1>{coll.title}</h1>
      <p className="muted">{coll.description}</p>
      <div className="row">
        {coll.canAdd && coll.newItem && (
          <button
            className="btn primary"
            onClick={() => {
              onChange([...items, coll.newItem!(items)]);
              onOpen(items.length);
            }}
          >
            + Add new
          </button>
        )}
        <input className="input grow" type="search" placeholder="Search…" aria-label={`Search ${coll.title}`} value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      {msg && <p className="banner error" role="alert">{msg}</p>}
      <ol className="items" dir={coll.id === "dvLetters" ? "auto" : undefined}>
        {shown.map(({ x, i }) => {
          const n = issuesFor(issues, coll, i).length;
          const isNew = typeof x.id === "string" ? !originalItems.some((o) => o.id === x.id) : i >= originalItems.length;
          const changed = !isNew && JSON.stringify(x) !== JSON.stringify(originalItems[i]);
          const t = thumb(x);
          return (
            <li key={i} className="item-row">
              <button className="item-open" onClick={() => onOpen(i)}>
                {t && <PicturePreview value={t} ctx={ctx} dhivehi={coll.file === "dhivehi"} size={40} />}
                <span className="item-text">
                  <strong className={coll.file === "dhivehi" ? "thaana-mix" : undefined}>{title(x, i) || "(untitled)"}</strong>
                  {coll.itemSubtitle && <span className="muted small">{coll.itemSubtitle(x, i)}</span>}
                </span>
                <span className="tile-flags">
                  {isNew && <span className="chip new">New</span>}
                  {changed && <span className="chip changed">Changed</span>}
                  {n > 0 && <span className="chip error">{n} to fix</span>}
                </span>
              </button>
              <div className="row-actions">
                {coll.canReorder && !search && (
                  <>
                    <button className="icon" disabled={i === 0} onClick={() => swap(i, i - 1)} aria-label={`Move ${title(x, i)} up`}>↑</button>
                    <button className="icon" disabled={i === items.length - 1} onClick={() => swap(i, i + 1)} aria-label={`Move ${title(x, i)} down`}>↓</button>
                  </>
                )}
                {coll.canAdd && (
                  <button
                    className="icon"
                    aria-label={`Duplicate ${title(x, i)}`}
                    onClick={() => {
                      const copy = structuredClone(x);
                      if (typeof copy.id === "string") copy.id = slug(`${copy.id}-copy`);
                      if (typeof copy.title === "string") copy.title = `${copy.title} (copy)`;
                      onChange([...items.slice(0, i + 1), copy, ...items.slice(i + 1)]);
                    }}
                  >
                    ⧉
                  </button>
                )}
                {coll.canDelete && (
                  <button
                    className="icon danger"
                    aria-label={`Delete ${title(x, i)}`}
                    onClick={() => {
                      const refs = used(x);
                      if (refs.length) return setMsg(`"${title(x, i)}" can't be deleted because it is used by: ${refs.join(", ")}. Change those first.`);
                      if (!isNew && !confirm(`Delete "${title(x, i)}"? Children who already completed it keep their stars.`)) return;
                      setMsg(null);
                      onChange(items.filter((_, j) => j !== i));
                    }}
                  >
                    🗑
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ol>
      {shown.length === 0 && <p className="muted">Nothing matches your search.</p>}
    </div>
  );
}

// ------------------------------------------------------------------ editor
function ItemEditor({ coll, value, index, issues, ctx, onBack, onChange }: { coll: Collection; value: Obj; index: number; issues: Issue[]; ctx: Ctx; onBack(): void; onChange(v: Obj): void }) {
  if (!value) return null;
  const base = coll.kind === "object" ? prefixOf(coll) : `${prefixOf(coll)}[${index}]`;
  const errorFor = (rel: string) => issues.find((i) => i.path === `${base}.${rel}`)?.message;
  const title = coll.kind === "object" ? coll.title : coll.itemTitle ? coll.itemTitle(value, index) : `Item ${index + 1}`;
  return (
    <div className="stack editor">
      <button className="back" onClick={onBack}>
        ← {coll.kind === "object" ? "All content" : coll.title}
      </button>
      <h1>{title || "(untitled)"}</h1>
      {coll.kind === "object" && <p className="muted">{coll.description}</p>}
      {issues.length > 0 && (
        <div className="banner error" role="status" data-testid="item-issues">
          <strong>{issues.length} thing{issues.length === 1 ? "" : "s"} to fix before publishing:</strong>
          <ul>
            {issues.map((i, k) => (
              <li key={k}>
                {i.path.slice(base.length).replace(/^\./, "") || "This item"}: {i.message}
              </li>
            ))}
          </ul>
        </div>
      )}
      {coll.fields.map((f) => (
        <FieldEditor key={f.key} field={f} value={value[f.key]} parent={value} ctx={ctx} errorFor={errorFor} onChange={(v) => onChange(setKey(value, f.key, v))} />
      ))}
      <button className="btn primary" onClick={onBack}>
        Done
      </button>
    </div>
  );
}

// ------------------------------------------------------------------ publish
function PublishSheet({ repo, changedFiles, uploads, issues, onGo, onClose, onDownload, onPublish }: { repo: Repo | null; changedFiles: ContentKey[]; uploads: Uploads; issues: Issue[]; onGo(c: Collection, index?: number): void; onClose(): void; onDownload(): void; onPublish(message: string): Promise<{ url: string } | undefined> }) {
  const titles = [...new Set(changedFiles.flatMap((k) => COLLECTIONS.filter((c) => c.file === k).map((c) => c.title)))];
  const [message, setMessage] = useState(`Content update: ${titles.slice(0, 4).join(", ")}${titles.length > 4 ? "…" : ""}`);
  const [state, setState] = useState<{ busy?: boolean; error?: string; url?: string }>({});
  const locate = (i: Issue) => {
    const candidates = COLLECTIONS.filter((c) => c.file === i.file).sort((a, b) => b.path.length - a.path.length);
    for (const c of candidates) {
      const p = prefixOf(c);
      const m = i.path.match(new RegExp(`^${p.replace(/[.[\]]/g, "\\$&")}\\[(\\d+)\\]`));
      if (m) return { c, index: Number(m[1]) };
      if (c.kind === "object" && i.path.startsWith(p)) return { c, index: undefined };
    }
    return { c: candidates[candidates.length - 1], index: undefined };
  };
  return (
    <div className="sheet-backdrop" role="dialog" aria-modal="true" aria-labelledby="pub-title">
      <div className="sheet">
        <h2 id="pub-title">{repo ? "Publish changes" : "Your changes"}</h2>
        {state.url ? (
          <div className="stack" role="status">
            <p className="ok">Published! Cloudflare is rebuilding the app now. Families will see the changes in a few minutes, after the app checks the content and finishes building.</p>
            <a href={state.url} target="_blank" rel="noreferrer">
              See the change on GitHub
            </a>
            <button className="btn primary" onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <>
            <h3>Changed</h3>
            <ul>
              {changedFiles.map((k) => (
                <li key={k}>{COLLECTIONS.filter((c) => c.file === k).map((c) => c.title).join(" / ")}</li>
              ))}
              {Object.keys(uploads).map((n) => (
                <li key={n}>New picture: {n}</li>
              ))}
            </ul>
            {issues.length > 0 ? (
              <div className="banner error" data-testid="publish-issues">
                <strong>Fix {issues.length} thing{issues.length === 1 ? "" : "s"} before publishing:</strong>
                <ul>
                  {issues.slice(0, 30).map((i, k) => {
                    const { c, index } = locate(i);
                    return (
                      <li key={k}>
                        <button className="link" onClick={() => onGo(c, index)}>
                          {c.title}
                          {index !== undefined ? ` #${index + 1}` : ""}
                        </button>
                        : {i.message}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : repo ? (
              <>
                <label>
                  Note about this change
                  <input className="input" value={message} onChange={(e) => setMessage(e.target.value)} />
                </label>
                <p className="help">Religious and safety content you add stays marked as draft until a reviewer approves it.</p>
              </>
            ) : (
              <p className="help">You are not connected to GitHub. Download your changes and ask someone with access to load and publish them.</p>
            )}
            {state.error && <p className="field-error" role="alert">{state.error}</p>}
            <div className="row">
              <button className="btn" onClick={onClose} disabled={state.busy}>
                Keep editing
              </button>
              <button className="btn ghost" onClick={onDownload}>
                Download changes
              </button>
              {repo && (
                <button
                  className="btn primary"
                  disabled={issues.length > 0 || !message.trim() || state.busy}
                  onClick={async () => {
                    setState({ busy: true });
                    try {
                      const r = await onPublish(message.trim());
                      setState({ url: r?.url });
                    } catch (e) {
                      setState({ error: e instanceof GitHubError || e instanceof Error ? e.message : "Publishing failed." });
                    }
                  }}
                >
                  {state.busy ? "Publishing…" : "Publish now"}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
