# Deployment

Little Ramadan builds to a static site (`out/`) with no server code, so it can run on free static hosting.

```bash
npm ci
npm run check    # lint, typecheck, unit tests, build, e2e
```

## Option A — Cloudflare Pages / Netlify (recommended: free tier, HTTPS, compression)
- Build command: `npm run build`
- Output directory: `out`
- Node version: 20 or newer
- Optional headers (`public/_headers` works on both): `Cache-Control: no-cache` for `/sw.js`.

## Option B — GitHub Pages
A project site lives under `/<repo-name>/`, so build with the base path:
```bash
BASE_PATH=/Little-Ramadan npm run build
```
Then publish `out/` (for example with the `actions/deploy-pages` action). Add an empty `out/.nojekyll` file so `_next/` is served.

## After deploying
1. Open the URL on a real iPhone and a real Android phone; complete onboarding.
2. Install to the home screen, turn on airplane mode, reopen: it should open and work.
3. Only then announce the URL. Record it in `PROGRESS.md`.

## Updating safely
Every build generates a new `sw.js` version. Returning users get the update on their next launch. Progress lives in IndexedDB, which the service worker never touches, so updates do not erase progress. If you change record shapes, bump `SCHEMA_VERSION` and add a migration in `src/storage/schema.ts`.

## Backups
The source and content live in git; push to GitHub and keep a second remote or a periodic zip. Children's data is never on a server, so there is nothing server-side to back up.

## Costs
No paid services are used. Free hosting tiers have limits that can change; check them periodically (CLAUDE.md §16).
