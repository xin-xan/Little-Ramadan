# Safety & privacy checklist (Phase 0 → verified in each phase)

Each rule names where it is enforced in code and how it is tested.

| # | Rule | Enforcement | Test |
|---|---|---|---|
| S1 | No fasting-based stars, badges, streaks or status | Journal entries live in a separate store; reward engine (`src/storage/rewards.ts`) only reads `completions`, and `completions` cannot contain a `journal` kind (type + validator) | `tests/unit/rewards.test.ts` “journal never affects rewards” |
| S2 | Never shame / pressure; health first | All child copy lives in `src/content/`; banned-phrase scan (“failed”, “lost your streak”, “must finish”, “real champions” …) | `tests/unit/content.test.ts` |
| S3 | Wellbeing message easy to find | Health button on Home, First Fast page, `/safety`, onboarding step 9 | e2e `safety.spec.ts` |
| S4 | Non-fasting children get everything | No unlock rule references fasting; content validator rejects such rules | unit tests |
| S5 | No chat, social, public profiles, leaderboards | Not built; no network code | `tests/unit/no-network.test.ts` scans source for `fetch(`, `XMLHttpRequest`, `WebSocket`, `sendBeacon`, external URLs |
| S6 | No ads, purchases, paywalls | Not built; scan for payment/ads terms | same scan |
| S7 | Minimum data: nickname only | Nickname validated (letters/numbers/spaces, 2–16 chars, warns against real full names); no DOB, location, contacts, camera, mic | unit + e2e onboarding |
| S8 | Local-only storage | IndexedDB only; Content-Security-Policy `connect-src 'self'` | header in `public/_headers` + meta CSP |
| S9 | Parent gate before Parent Zone & settings | `ParentGate` component; optional PIN stored as PBKDF2-SHA-256 hash + salt, never plain text | unit + e2e |
| S10 | Reset & delete work | Parent Zone → Data: “Reset progress” (keeps profile/settings) and “Delete everything” (deletes the IndexedDB database) | unit + e2e |
| S11 | No external links in child navigation | Lint-style test: no `http` hrefs in child routes | `no-network.test.ts` |
| S12 | Religious content draft until reviewed | Every lesson/story/quiz item carries `review.status`; Parent Zone shows status; no Quran/hadith quotations in content; validator rejects quote markers (`Quran 2:`, `hadith`, `narrated`) unless status is `reviewed` | `content.test.ts` |
| S13 | No medical authority claims | Copy reviewed against list; “not medical advice” notice in First Fast parent text and Parent Zone | content test |
| S14 | No unverified dates/times | Ramadan day shown only if parent set start date; no Imsak/Iftar/prayer times anywhere; Laylatul Qadr presented as learning theme | content test |
| S15 | Screen-time wellbeing | No infinite scroll, no autoplay, no push notifications, optional in-app break reminder, natural stopping message after a day is done | manual + unit |
| S16 | Missions needing adults are marked | `adultHelpRequired` flag renders “👪 Do this with a grown-up” | content test: food/cooking/giving/visiting missions must be flagged |
| S17 | Children never asked to photograph / identify people they help | No camera; reflection prompts reviewed; journal hint “don't write names or addresses” | content test |

## Owner/legal actions before public launch (cannot be done in code)
- Review Maldives child-protection/privacy requirements (and any other launch market); obtain legal advice as appropriate.
- Identify qualified Islamic content reviewer(s), an educator, and a health professional for fasting wording.
- Choose a parent support/contact route that does not expose children to messaging (e.g. a parent-only email address shown in the Parent Zone).
