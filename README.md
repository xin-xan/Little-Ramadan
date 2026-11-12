# Little Ramadan

**My Little Journey of Faith, Kindness & Discovery.**

A free, child-safe, offline-first Ramadan learning adventure for children aged 7–9 (initial market: the Maldives, English).
Mobile-first Progressive Web App. No accounts, no backend, no ads, no purchases, no analytics — all progress stays on the device.

The product specification and source of truth is [`CLAUDE.md`](CLAUDE.md). Phase 0 design documents are in [`docs/phase-0/`](docs/phase-0). Build progress is tracked in [`PROGRESS.md`](PROGRESS.md). Content is edited in the admin dashboard at `/admin/` — see [`docs/admin-guide.md`](docs/admin-guide.md).

## Quick start

Requirements: Node.js 20+ and npm.

```bash
npm install
npm run dev          # development server at http://localhost:3000 (service worker disabled in dev)
npm run build        # static export to ./out and generates out/sw.js (offline cache)
npm start            # serves ./out at http://localhost:4173
```

## Checks

```bash
npm run lint         # ESLint (Next.js + TypeScript rules)
npm run typecheck    # TypeScript, strict mode
npm test             # unit/component tests (Vitest + fake-indexeddb)
npm run test:e2e     # end-to-end tests (Playwright; iPhone, Android and 320px viewports). Run `npm run build` first.
npm run check        # all of the above in order
```

Content validation (stable IDs, references, safety wording, review status) runs as part of `npm test`.
Before public launch, run `RELEASE_CONTENT_CHECK=1 npm test` — it fails until every religious and safety item is marked `reviewed`.

## Deploying (free static hosting)

`npm run build` produces a fully static site in `out/`. Any static HTTPS host works, for example:

- **Cloudflare Pages / Netlify:** build command `npm run build`, output directory `out`.
- **GitHub Pages (project site):** build with `BASE_PATH=/<repo-name> npm run build` and publish `out/`.

The service worker requires HTTPS (or localhost). See `docs/deployment.md` once Phase 6 is complete.

## Project structure

```
src/app/            Routes (welcome, home, journey, learn, kindness, games, rewards, goals, first-fast, safety, parent)
src/components/     UI components, village scene, room, games, art
src/characters/     Noor, Amina, Hilmy and avatars (original SVG art)
src/content/        All stories, lessons, missions, quizzes, badges (data, with review status)
src/storage/        IndexedDB wrapper, versioned schema + validation, rewards engine, calendar logic
src/state/          App state provider
src/safety/         Parent gate and PIN hashing
src/accessibility/  Sound (Web Audio, muted by default)
scripts/            Service-worker generator, static server, icon renderer
tests/unit, tests/e2e
docs/               Specification, Phase 0 deliverables, review records
```
