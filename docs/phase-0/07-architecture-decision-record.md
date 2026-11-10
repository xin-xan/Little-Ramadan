# Architecture decision record (Phase 0)

## ADR-1 Next.js + React + TypeScript, static export
Matches CLAUDE.md §9.1. `output: 'export'` produces plain static files (`out/`) that run on any free static host (GitHub Pages, Cloudflare Pages, Netlify). No server code, no API routes, no backend cost.

## ADR-2 Local-first IndexedDB with a versioned schema
Small hand-written wrapper (`src/storage/db.ts`) — no dependency. Object stores: `kv` (profile, settings, room, meta), `completions`, `journal`, `goals`. `DB_VERSION` + an ordered `migrations` list; every record is validated on read and corrupted records are dropped/repaired rather than crashing. If IndexedDB is unavailable (some private modes), the app runs from memory and shows a parent-visible warning that progress won't be saved.

Rewards (stars, badges, decorations) are **derived** from `completions` by pure functions, never stored as counters, so they cannot drift and are trivially testable. Each activity can be rewarded only once (completion key = `kind:contentId`).

## ADR-3 Real-time 3D characters and village with Three.js, loaded lazily (revised)
*Revised at the owner's request: characters must be 3D and animated.*
Noor, Amina, Hilmy and the Ramadan Village are real-time 3D scenes built from geometry in code (`src/three/`), so there are no model files to download and all artwork stays original. Three.js (MIT licence) is loaded with a dynamic `import()` after the page has painted, so the first screen stays light.
- **Characters:** one shared WebGL renderer draws every on-screen character into its own canvas (phones limit GPU contexts). It renders only visible characters, pauses when the app is hidden, caps at 30 fps, and draws a single still frame when motion is reduced. The flat vector characters show instantly while 3D loads, and remain as the fallback without WebGL.
- **Village:** its own renderer, with soft shadows switched off on low-powered devices. Destinations are real links (pins) positioned over the 3D buildings, so keyboard and screen-reader users are not dependent on the canvas. Fallbacks: flat illustrated village (no WebGL) and the simple list (low-power devices, data saver, or chosen in settings).

## ADR-4 Hand-written service worker generated at build
`scripts/generate-sw.mjs` lists every file in `out/`, writes `sw.js` with a content-hash cache version, precaches the full app (all pages, content and art — a few MB), serves cache-first, and cleans old caches on activate. IndexedDB is never touched by the service worker, so updates cannot erase progress. A new version activates on the next launch.

## ADR-5 No network at runtime
No `fetch` calls, no analytics, no fonts/CDNs. A CSP meta tag restricts `connect-src` to `'self'`. Tests scan the source for network APIs and external URLs.

## ADR-6 Premium sound via Web Audio synthesis (revised)
FM bell and marimba tones, shaped-noise sparkles and page sounds, a generated room reverb and a limiter (`src/accessibility/sound.ts`). No audio files, nothing downloaded, works offline. Every button and link gives a soft tactile tap. Sound is offered **on** during setup (the owner asked for a premium feel) and can be switched off on the setup screen, with the speaker button on the home screen, or in Parents → Settings. No information is conveyed only by sound.

## ADR-9 Parent voice recordings (owner-approved microphone exception)
Parents can record their own voice for any story page, lesson part, quiz question and explanation, kindness mission, game instructions, health message, First Fast page, and Dhivehi letter or word (`src/recordings/catalog.ts`, stable IDs in `src/recordings/ids.ts`). Recording uses `MediaRecorder` (Opus/WebM where the browser can play it, otherwise AAC/MP4 on iPhone) and is only started from the Parent Zone, behind the parent gate; the microphone is released when recording stops. Audio is stored as ArrayBuffers in a separate IndexedDB database (`little-ramadan-voices`) so it can never affect progress data. Children see a Listen button only where a recording exists; playback uses prepared blob URLs so iPhone allows it from a tap (CSP adds `media-src 'self' blob:`). Backups are a JSON file with base64 audio kept by the parent. A unit test enforces that only `src/recordings/recorder.ts` touches the microphone and only the Parent Zone panel starts recording.

## ADR-7 Testing
Vitest + Testing Library + fake-indexeddb for unit/component tests; Playwright (Chromium, iPhone/Android viewports) for end-to-end, including offline reopen and persistence. Real-device testing is a Phase 6 owner task.

## ADR-8 i18n-ready content
All child-facing strings live in content/copy modules keyed by stable IDs, so Dhivehi can be added later by adding a parallel locale file.
