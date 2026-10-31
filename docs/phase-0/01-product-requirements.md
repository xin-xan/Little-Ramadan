# Little Ramadan — Product Requirements (Phase 0)

**Name:** Little Ramadan · **Tagline:** “My Little Journey of Faith, Kindness & Discovery.”
**Audience:** children aged 7–9 (primary) and their parents/guardians (secondary). Initial market: Maldives, English only.
**Price:** free for everyone, permanently. No ads, purchases, subscriptions, paywalls or data sale.

## Status of Phase 0 decisions

| Decision | Status |
|---|---|
| Name, tagline, audience | Confirmed by CLAUDE.md (source of truth) |
| MVP scope (below) | Proposed; follows CLAUDE.md §6 and §13 exactly. **Owner approval needed.** |
| Visual style & palette | Implemented from CLAUDE.md §4.2. **Owner approval needed** (see `04-design-system.md`) |
| Character art | In-house original vector art (see `03-character-guide.md`). **Owner approval needed**; commissioned 3D art is an optional later upgrade |
| Islamic content reviewers | **Not yet identified — owner action required** (see `06-content-inventory-and-review-plan.md`) |
| Fasting safety wording review | **Health-professional reviewer not yet identified — owner action required** |

## MVP — in scope
1. Onboarding: splash, Noor welcome, explanation, parent gate, parent consent/privacy, nickname, avatar, sound/motion preferences, child safety intro, enter village.
2. Home dashboard (Noor's House) with greeting, nickname, Ramadan day (only if parent configured a calendar), today's mission, journey progress, stars, shortcuts, Parent Zone entry.
3. Ramadan Village with five destinations + My Little Ramadan Room; simple list fallback for low-powered devices / reduced motion.
4. My Ramadan Journey: 29- or 30-day calendar, parent-configured start date, no punishment for missed days, revisitable days.
5. Learning Library: 20 lessons + illustrated stories, content-driven, review status recorded.
6. Kindness Missions: rotating library with adult-help safety notes, “I did it!” and optional reflection.
7. Seven mini-games: Ramadan Quiz, Match the Words, Find the Missing Lantern, Mosque Puzzle, Sort the Good Deeds, Memory Cards, Vocabulary Match. All tap-based, untimed, pausable/exit-able.
8. My First Fast: education pages + optional private journal, **disabled by default**, no rewards of any kind.
9. My Ramadan Goals: optional, private, adjustable, no shame.
10. Rewards: stars (fixed values from §6.11), badges, decorations, room customisation, badge gallery, certificate (print / download image), Eid celebration screen.
11. Parent Zone behind a parent gate (+ optional hashed parent PIN): progress review, journal toggle, calendar, sound/motion, screen-time reminder, safety & fasting guidance, privacy, content sources & review status, reset progress, delete all data.
12. PWA: installable, offline after first load, local-only IndexedDB storage with versioned schema.

## Explicitly excluded from MVP (CLAUDE.md §2.2)
Accounts, cloud sync, backend, analytics, ads, payments/donations, chat/comments, public profiles or leaderboards, location, camera/microphone, user-generated public content, AI chatbots, medical advice, Quran reader, prayer/Imsak/Iftar times, multiplayer, push notifications.

## User journeys

### Parent (first run)
Open link → splash → Noor welcome → “what this app is” → **parent gate** → parent consent & privacy (what is stored, where, nothing leaves device, how to delete, not medical/religious authority) → child chooses nickname → avatar → sound/motion → safety intro (“your health comes first”) → village.
Later: Parent Zone (via gate) → set Ramadan start date & 29/30 days, optionally enable fasting journal, set screen-time reminder, review progress, reset/delete.

### Child (daily)
Open app → Noor greets by nickname → see today's mission (or “Explore Ramadan” when no calendar) → read the day's lesson/story → do the kindness mission (“I did it!”) → play the day's game → optional reflection → stars + maybe a new decoration/badge → decorate room → natural stopping point (“See you next time!”).

### Child who does not fast
Identical to the above. The only fasting-related element is the optional First Fast journal, which earns nothing and can be turned off by the parent.
