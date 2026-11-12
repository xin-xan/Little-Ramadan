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

## Design v2 — professional redesign (owner request)
- ✅ Real-time 3D characters (Noor, Amina, Hilmy) with idle, wave, cheer, think, calm and talk animations, blinking, and tap-to-hop; flat fallback without WebGL
- ✅ Interactive 3D Ramadan Village (island, sea, mosque landmark, five destinations, lanterns that light up with progress, flowers for kindness); drag to look around; accessible link pins; simple-list fallback
- ✅ New design system: Fredoka/Nunito (self-hosted), custom icon set replacing all emoji, hero banners, metallic badge medals, floating tab bar, page transitions, confetti
- ✅ Premium synthesised sound design (taps, chimes, sparkles, page turns, celebrations); on by default with an explicit setup choice, quick mute on home
- ✅ RYSE credit with logo at the bottom of every page
- 🟡 Owner to review the new look on real phones (3D performance on older devices especially)

## Voice narration — removed (owner request)
- Device-voice narration ("Read to me") was added and then removed at the owner's request. All information stays on screen as text; sound effects remain optional.

## Learn Dhivehi (owner request, inspired by akurufili.com)
- ✅ New "Learn Dhivehi" area (Home shortcut, Puzzle Palace entry, and an optional bonus on every journey day)
- ✅ 12 original games: Meet the letters, Trace the letter, Letter bubbles, Find the word, First letter, Let's count, Colours, Fili sounds, Memory match, Build the word, Add and take away, Ramadan words — all untimed, tap-only, with retries and gentle feedback
- ✅ Automatic Ramadan plan: one new Thaana letter a day for days 1–24, then review days, ending with Eid words; follows the 29/30-day setting and the parent's calendar (missed days stay open)
- ✅ Content: 24 letters, 10 fili, 46 words with original pictures, numbers 1–10, 6 colours, 8 Ramadan words; Thaana shown right-to-left in Noto Sans Thaana (self-hosted, OFL)
- ✅ Rewards: 1 star per Dhivehi day and per game tried; new "Akuru Explorer" badge (10 Dhivehi activities)
- ✅ Narration reads instructions and romanised words; Thaana itself is not read by English voices
- 🟡 Dhivehi teacher to review spellings, letter sounds and romanisation (`docs/content-review-record.md`)
- 🟡 Optional: recorded Dhivehi letter and word sounds by a native speaker
Tests: `tests/unit/dhivehi.test.ts`, `tests/e2e/dhivehi.spec.ts`.

## Parent voice recordings (owner request, microphone exception approved)
- ✅ Parent Zone → Voice recordings: record, play, re-record and delete your own voice for 422 items (story pages, lesson parts, quiz questions and explanations, kindness missions, game instructions, health and First Fast, Dhivehi letters and words), with progress per section
- ✅ Children see a Listen button only on recorded items (stories, lessons, quizzes, games, missions, safety, First Fast, Dhivehi letter cards and words)
- ✅ Recordings stay on the device in a separate database; backup/restore file; "Delete all recordings"; "Delete everything" removes them; "Reset progress" keeps them
- ✅ Microphone used only in the Parent Zone recorder (enforced by a unit test); spec 11.1 updated with the approved exception; privacy notice and parent guide updated
- 🟡 Owner: test recording and playback on a real iPhone and Android phone
Tests: `tests/unit/recordings.test.ts`, `tests/unit/no-network.test.ts`, `tests/e2e/recordings.spec.ts`.

## Content admin dashboard (owner request)
- ✅ All content moved to `src/content/data/*.json` (18 files); the app reads it unchanged
- ✅ `/admin/`: edit every field of every content type; add, duplicate, delete (blocked while in use) and reorder; upload pictures; review status; Dhivehi letters in alphabet order
- ✅ Publishing = one GitHub commit (fine-grained token, Contents read/write); Cloudflare rebuilds; conflict protection for simultaneous editors; download/load changes file without a token
- ✅ Shared content checks (`src/content/validate.ts`) run in the admin, in tests and as a build gate — bad content never deploys
- ✅ Fixed: hosting header blocked the microphone for Voice recordings (`microphone=(self)` now)
- 🟡 Owner: confirm Cloudflare builds from `main`, create a token, try a small edit (see `docs/admin-guide.md`)
Tests: `tests/unit/validate.test.ts`, `tests/unit/admin-github.test.ts`, `tests/e2e/admin.spec.ts`.

## Salah & fasting tracker on home (owner request)
- ✅ Home card: tap today's five prayers (private; no stars, scores, counts, streaks or "missed" marks; every day starts fresh); saved on the device for 60 days
- ✅ "Fasting today?" on the same card only when a parent has switched on the fasting journal (spec §6.4); saves a private journal entry, never rewarded, always with the health message
- ✅ Parent Zone → Salah & fasting journal: switch the tracker on/off, 7-day view for parents only, clear the log
Tests: `tests/unit/salah.test.ts`, `tests/e2e/salah-tracker.spec.ts`.
- ✅ Gentle encouragement (owner request): try to pray on time; try fasting when well and the family agrees; new First Fast page "Growing up with Salah and fasting" (draft, needs Islamic and health review)
