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
| Game names and instructions; Room decorations; Journal choices | ✅ | — (each has its own screen or artwork in code) | ✅ |
| My First Fast pages | ✅ | ✅ | ✅ |
| Health & safety messages, app messages, journal saved message | ✅ | — | — |
| Dhivehi letters (alphabet order), words, fili, numbers, games, review status | ✅ | ✅ (not numbers or games) | ✅ |

New pictures can be uploaded for any content. They are shrunk on your device (max 800 px, WebP) before publishing.

Star values (lesson 2, story 2, kindness 3…) and the rule that nothing ever rewards fasting are product rules from the specification, so they are not editable here.

## How publishing works

There is no server. When you press **Publish**, your changes are saved as one commit to the app's GitHub repository (`src/content/data/*.json`, and pictures in `public/content-images/`). Cloudflare sees the new commit, rebuilds the app, and families get the update **within a few minutes** (the app updates itself the next time it is opened online).

Before every build, the content is checked automatically (`npm run validate:content`). If anything is wrong, the build stops and **the live app keeps the last good version**. The dashboard runs the same checks before letting you publish, so this should never happen.

The checks include: required text, unique IDs, every journey day pointing to real content, quizzes with exactly 3 different answers and a right one, lessons of 2–4 minutes, missions with food/cooking/giving/visiting/calling marked "with a grown-up" and given a safety note, no wording that shames or pressures children, no rewards that depend on fasting, no Quran/hadith quotations or references, no prayer or fasting times, and the health message keeping its three key sentences.

## First-time setup (once)

1. **Cloudflare must build from the `main` branch** of `xin-xan/Little-Ramadan` (Workers & Pages → your project → Settings → Build → Git repository / Production branch = `main`). The build command is `npm run build`.
2. **Create a GitHub access token** (each editor creates their own):
   - GitHub → Settings → Developer settings → **Fine-grained personal access tokens** → *Generate new token*.
   - Repository access: **Only select repositories** → `xin-xan/Little-Ramadan`.
   - Permissions → Repository permissions → **Contents: Read and write**. Nothing else is needed.
   - Choose an expiry date (e.g. 90 days) and copy the token (`github_pat_…`).
3. Open `/admin/`, paste the token and press **Connect and load content**. Tick *Remember on this device* only on your own private device.

The token is kept in that browser only and is sent only to `api.github.com`. Anyone with the token can change the app's content, so never share it; revoke it on GitHub if a device is lost.

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

## Without a token

**Edit without connecting** lets anyone draft changes on the content that shipped with the app and **download** them as a file. Someone with a token can open `/admin/`, connect, use **More → Load a changes file**, check, and publish.

## For developers

- Content lives in `src/content/data/*.json`; `src/content/*.ts` adds types and helpers. The admin's forms come from `admin/schema.ts`; the checks are in `src/content/validate.ts` (shared by tests, the build and the admin).
- The admin is a separate bundle (`scripts/build-admin.mjs` → `out/admin/`) with its own Content-Security-Policy; it is the only page allowed to contact `api.github.com`, it is not precached by the service worker, and the children's app never imports it (unit-tested).
- Tests: `tests/unit/validate.test.ts`, `tests/unit/admin-github.test.ts`, `tests/e2e/admin.spec.ts` (uses a simulated GitHub API).
