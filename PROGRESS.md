# Progress checklist

Status key: ✅ done and tested in code · 🟡 done in code, needs owner / real-device / reviewer action · ⬜ not started

## Phase 0 — Discovery, content planning and design approval
- ✅ PRD, user journeys, MVP scope and exclusions — `docs/phase-0/01-product-requirements.md`
- ✅ Screen map and wireframes — `02-screen-map-and-wireframes.md`
- 🟡 Character guide + live reference sheet at `/style-guide` (owner approval pending; side/back views not drawn) — `03-character-guide.md`
- 🟡 Design system and palette (WCAG-checked; owner approval pending) — `04-design-system.md`
- ✅ Safety and privacy checklist — `05-safety-and-privacy-checklist.md`
- 🟡 Content inventory and review plan (reviewers not yet appointed) — `06-content-inventory-and-review-plan.md`
- ✅ Architecture decision record — `07-architecture-decision-record.md`
- ✅ Asset inventory and licence record (all original) — `08-asset-inventory.md`

## Phase 1 — Foundation ✅
Next.js 16 / React 19 / strict TypeScript static export · design tokens and components · 10-step onboarding with parent gate and consent · nickname + avatar · home · bottom nav · IndexedDB (versioned, validated, memory fallback) · manifest, icons, generated service worker · loading/error/offline states.
Tests: `tests/unit/storage.test.ts`, `parentGate.test.ts`, `tests/e2e/phase1-foundation.spec.ts`.

## Phase 2 — Village and journey ✅
Interactive SVG Ramadan Village (5 destinations, lanterns/flowers/stars grow with progress) · simple-list fallback (automatic on low-power devices) · 29/30-day calendar with parent dates, explore mode, open-all option · daily mission view (learn, kindness, play, reflection) · stars, badges, decorations · missed days stay open · reduced motion.
Tests: `rewards.test.ts`, `calendar.test.ts`, `tests/e2e/phase2-journey.spec.ts`.

## Phase 3 — Learning and games ✅ (content 🟡 awaiting review)
24 lessons, 8 stories, 32 kindness missions, 7 quiz sets (42 questions), 14 vocabulary terms · 7 games: quiz, match the words, missing lantern, mosque puzzle, sort the good deeds, memory cards, word meanings — all tap-only, untimed, pausable, with explanations · content validation tests.
Tests: `content.test.ts`, `gameEngine.test.ts`, `no-network.test.ts`, `tests/e2e/phase3-learning-games.spec.ts`.

## Phase 4 — First Fast and Parent Zone ✅ (safety wording 🟡 awaiting health review)
First Fast learning pages · optional private journal (off by default, no rewards) · health message on home, safety page, First Fast, onboarding · Parent Zone: progress, settings, calendar, journal, safety guide, privacy, content & review status, reset & delete · optional hashed PIN.
Tests: `tests/e2e/phase4-firstfast-parent.spec.ts`.

## Phase 5 — Rewards and celebration ✅
My Little Ramadan Room (8 slots, 18 earned decorations) · badge gallery with progress · achievement summary · certificate (print + save as PNG; celebrates participation, not fasting) · Eid screen for 29/30-day and explore modes · optional synthesised sounds (muted by default) · reduced motion.
Tests: `tests/e2e/phase5-rewards.spec.ts`.

## Phase 6 — Testing, review and launch
- ✅ Automated: every route loads without console errors; all internal links return 200; no external links in child area; touch targets ≥ 44 px; updates/cleared caches keep progress; offline navigation; 3 viewports (iPhone 13, Pixel 7, 320 px) — `tests/e2e/phase6-quality.spec.ts`
- ✅ Docs: `docs/deployment.md`, `install.md`, `parent-guide.md`, `privacy-notice.md` (draft), `data-model.md`, `content-review-record.md`, `known-limitations.md`
- 🟡 Real iPhone and Android device testing (install, offline, storage) — owner
- 🟡 Islamic content review, educator review, health-professional review — owner to appoint reviewers
- 🟡 Supervised usability testing with families (with consent) — owner
- 🟡 Legal/privacy review for the Maldives; parent support contact route — owner
- ⬜ Deploy to free HTTPS hosting and verify the public URL — awaiting owner approval and hosting choice
