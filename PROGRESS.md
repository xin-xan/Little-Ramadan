# Progress checklist

Status key: ✅ done and tested · 🟡 done, needs owner/real-device action · ⬜ not started

## Phase 0 — Discovery, content planning and design approval
- ✅ PRD, user journeys, MVP scope and exclusions — `docs/phase-0/01-product-requirements.md`
- ✅ Screen map and wireframes — `02-screen-map-and-wireframes.md`
- 🟡 Character guide (original vector art; owner approval pending) — `03-character-guide.md`
- 🟡 Design system and palette (contrast-checked; owner approval pending) — `04-design-system.md`
- ✅ Safety and privacy checklist — `05-safety-and-privacy-checklist.md`
- 🟡 Content inventory and review plan (reviewers not yet appointed) — `06-content-inventory-and-review-plan.md`
- ✅ Architecture decision record — `07-architecture-decision-record.md`
- ✅ Asset inventory and licence record — `08-asset-inventory.md`

## Phase 1 — Foundation and working mobile app
- ✅ Next.js 16 + React 19 + TypeScript (strict), static export
- ✅ Design tokens, responsive layout, reusable components
- ✅ Welcome/onboarding (10 steps), parent gate, consent & privacy, nickname, avatar, preferences, safety intro
- ✅ Home dashboard, bottom navigation, Parent Zone entry
- ✅ IndexedDB storage with versioned schema, validation, memory fallback
- ✅ PWA manifest + icons, generated service worker (precache all), offline banner
- ✅ Loading, error and storage-unavailable states
- ✅ Tests: unit (storage, validation, parent gate), e2e (onboarding, persistence, offline reopen, reset/delete, manifest)
