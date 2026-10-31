# Architecture decision record (Phase 0)

## ADR-1 Next.js + React + TypeScript, static export
Matches CLAUDE.md §9.1. `output: 'export'` produces plain static files (`out/`) that run on any free static host (GitHub Pages, Cloudflare Pages, Netlify). No server code, no API routes, no backend cost.

## ADR-2 Local-first IndexedDB with a versioned schema
Small hand-written wrapper (`src/storage/db.ts`) — no dependency. Object stores: `kv` (profile, settings, room, meta), `completions`, `journal`, `goals`. `DB_VERSION` + an ordered `migrations` list; every record is validated on read and corrupted records are dropped/repaired rather than crashing. If IndexedDB is unavailable (some private modes), the app runs from memory and shows a parent-visible warning that progress won't be saved.

Rewards (stars, badges, decorations) are **derived** from `completions` by pure functions, never stored as counters, so they cannot drift and are trivially testable. Each activity can be rewarded only once (completion key = `kind:contentId`).

## ADR-3 Vector “3D-cartoon” art instead of a WebGL engine
CLAUDE.md §10.2 says not to make the app depend on a heavy 3D engine and to provide fallbacks. The village and characters are SVG with gradient shading (≈ tens of KB, instant on low-end phones, works offline, accessible as buttons). A “Simple village” list view is used automatically when the device reports ≤ 2 GB memory or ≤ 2 CPU cores, and can be toggled in settings. A Three.js scene can be added later as progressive enhancement without changing navigation.

## ADR-4 Hand-written service worker generated at build
`scripts/generate-sw.mjs` lists every file in `out/`, writes `sw.js` with a content-hash cache version, precaches the full app (all pages, content and art — a few MB), serves cache-first, and cleans old caches on activate. IndexedDB is never touched by the service worker, so updates cannot erase progress. A new version activates on the next launch.

## ADR-5 No network at runtime
No `fetch` calls, no analytics, no fonts/CDNs. A CSP meta tag restricts `connect-src` to `'self'`. Tests scan the source for network APIs and external URLs.

## ADR-6 Sound via Web Audio synthesis
Short, gentle tones generated on the device (no audio files). Muted by default. No information is conveyed only by sound.

## ADR-7 Testing
Vitest + Testing Library + fake-indexeddb for unit/component tests; Playwright (Chromium, iPhone/Android viewports) for end-to-end, including offline reopen and persistence. Real-device testing is a Phase 6 owner task.

## ADR-8 i18n-ready content
All child-facing strings live in content/copy modules keyed by stable IDs, so Dhivehi can be added later by adding a parallel locale file.
