# Content admin guide

The content admin is at **`/admin/`** on the app's website (for example `https://<your-app>/admin/`). It is not linked from the children's app and is hidden from search engines.

From it you can change **every piece of content** and add new content:

| Section | Edit | Add / delete | Reorder |
|---|---|---|---|
| Stories (title, summary, pages, pictures, review) | ✅ | ✅ | ✅ |
| Lessons (parts, words to know, try this, source note, review) | ✅ | ✅ | ✅ |
| Quizzes (questions, 3 answers, right answer, explanation) | ✅ | ✅ | ✅ |
| Word meanings, Match the Words, Sort the Good Deeds, Memory cards, Lanterns | ✅ | ✅ | ✅ |
| Kindness missions, Ramadan goals, Badges | ✅ | ✅ | ✅ |
| Journey days 1–30 (theme, mission, which lesson/story/game/quiz) | ✅ | — (always 30) | — |
| Game names and instructions; Journal choices | ✅ | — (each has its own screen or artwork in code) | ✅ |
| My First Fast pages | ✅ | ✅ | ✅ |
| Health & safety messages, app messages, journal saved message | ✅ | — | — |
| Dhivehi letters (alphabet order), words, fili, numbers, games, review status | ✅ | ✅ (not numbers or games) | ✅ |

New pictures can be uploaded for any content. They are shrunk on your device (max 800 px, WebP) before publishing.

Star values (lesson 2, story 2, kindness 3…) and the rule that nothing ever rewards fasting are product rules from the specification, so they are not editable here.

## How publishing works

The only server code is a small Cloudflare Worker that checks the admin's sign-in (the children's app never uses it). When you press **Publish**, your changes are saved as one commit to the app's GitHub repository (`src/content/data/*.json`, and pictures in `public/content-images/`). Cloudflare sees the new commit, rebuilds the app, and families get the update **within a few minutes** (the app updates itself the next time it is opened online).

Before every build, the content is checked automatically (`npm run validate:content`). If anything is wrong, the build stops and **the live app keeps the last good version**. The dashboard runs the same checks before letting you publish, so this should never happen.

The checks include: required text, unique IDs, every journey day pointing to real content, quizzes with exactly 3 different answers and a right one, lessons of 2–4 minutes, missions with food/cooking/giving/visiting/calling marked "with a grown-up" and given a safety note, no wording that shames or pressures children, no rewards that depend on fasting, no Quran/hadith quotations or references, no prayer or fasting times, and the health message keeping its three key sentences.

## First-time setup (once)

1. **Cloudflare must build from the `main` branch** of `xin-xan/Little-Ramadan` (Workers & Pages → your project → Settings → Build → Git repository / Production branch = `main`). The build command is `npm run build` and the deploy command `npx wrangler deploy`.
2. **Create one GitHub access token for the server:**
   - GitHub → Settings → Developer settings → **Fine-grained personal access tokens** → *Generate new token*.
   - Repository access: **Only select repositories** → `xin-xan/Little-Ramadan`.
   - Permissions → Repository permissions → **Contents: Read and write**. Nothing else is needed.
   - Choose an expiry date (for example 1 year) and copy the token (`github_pat_…`).
3. **Set the sign-in secrets on Cloudflare.** Either use Workers & Pages → *little-ramadan* → Settings → **Variables and Secrets** → *Add* → type **Secret**, or the terminal:

   | Secret | Value |
   |---|---|
   | `ADMIN_USERNAME` | the admin username, e.g. `admin` |
   | `ADMIN_PASSWORD_HASH` | run `node scripts/hash-password.mjs`, type the password (at least 12 characters), and paste the line it prints. The password itself is never stored. |
   | `SESSION_SECRET` | a long random string; make one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
   | `GITHUB_TOKEN` | the token from step 2 |

   From a terminal: `npx wrangler secret put ADMIN_USERNAME` (and the same for the others). For the password hash you can run `node scripts/hash-password.mjs | npx wrangler secret put ADMIN_PASSWORD_HASH`.
4. Open `/admin/`, enter the username and password and press **Sign in**.

### Signing in

- The sign-in lasts **8 hours** on that browser, then asks again. **More → Sign out** ends it at once.
- Too many wrong tries from one place are paused for a minute.
- **To change the password**, make a new hash and replace `ADMIN_PASSWORD_HASH`. **To sign everyone out**, replace `SESSION_SECRET`.
- Everyone who edits shares this one login. Give it only to people you trust to change the app; every publish is still recorded as a commit on GitHub.
- If GitHub's token expires, signing in still works but loading shows "The server's GitHub key was not accepted". Make a new token and replace `GITHUB_TOKEN`.

### Advanced: your own GitHub key

Under **Advanced: connect with your own GitHub key** a developer can still use a personal fine-grained token (as in step 2) instead of signing in. That key stays in the browser and is sent only to `api.github.com`; anyone with it can change the content, so never share it.

## Everyday editing

1. Choose a section (e.g. **Stories**), then an item, or **+ Add new**.
2. Edit the fields. Problems are shown in red at the top of the item and next to each field.
3. **Done** returns to the list. Changed items are marked *Changed*, new ones *New*.
4. Press **Publish (n)** at the top, check the list of changes, write a short note, and press **Publish now**.

Tips:
- **IDs** are made from the title with *Make from title*. Once published, an ID can't change, because children's saved progress uses it.
- **Delete** is blocked while something uses the item (for example a story used by a journey day). Change the day first.
- New religious, educational or safety content starts as **Draft**. When a qualified reviewer approves it, set the review status to *Reviewed and approved* with their name and the date. The Parent Zone shows this status.
- **Dhivehi letters** are in alphabet order (haa first); Dhivehi day 1, 2, 3… follow this order and the letter grids read right to left.
- **Two editors at once:** if someone else published the same section after you loaded it, publishing stops and tells you. Use **More → Download my changes**, reload, and make your edits again. Changes to different sections are combined automatically.

## Without signing in

**Edit without connecting** lets anyone draft changes on the content that shipped with the app and **download** them as a file. Someone who can sign in opens `/admin/`, signs in, uses **More → Load a changes file**, checks, and publishes.

## For developers

- Content lives in `src/content/data/*.json`; `src/content/*.ts` adds types and helpers. The admin's forms come from `admin/schema.ts`; the checks are in `src/content/validate.ts` (shared by tests, the build and the admin).
- The admin is a separate bundle (`scripts/build-admin.mjs` → `out/admin/`) with its own Content-Security-Policy; it is the only page allowed to contact `api.github.com`, it is not precached by the service worker, and the children's app never imports it (unit-tested).
- Sign-in: `worker/index.ts` (Cloudflare Worker, runs only for `/api/*`; see `wrangler.jsonc`) and `worker/auth.ts`. Passwords are checked against a PBKDF2-SHA256 hash; the session is an HMAC-signed, `HttpOnly`, `Secure`, `SameSite=Strict` cookie limited to `/api/admin`; requests that change things must come from the same site. The GitHub proxy only allows the git-data calls the admin uses (refs, commits, trees, blobs) on the configured repository, and never sends the token to the browser.
- Local testing of the Worker: put the four secrets in `.dev.vars` (git-ignored), run `npm run build`, then `npx wrangler dev`.
- Tests: `tests/unit/validate.test.ts`, `tests/unit/admin-github.test.ts`, `tests/unit/worker.test.ts`, `tests/e2e/admin.spec.ts` (uses a simulated GitHub API and sign-in server).
