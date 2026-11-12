# Content review record

**Status at handover: NOT YET REVIEWED.** All religious-learning and fasting-safety content is a draft written for review. It must be reviewed before public launch (CLAUDE.md §11.3, Phase 6).

The live, per-item status is in the app (Parent Zone → Content & review) and in the `review` field of each item in `src/content/`. To record a review, edit the item:

```ts
review: { status: "reviewed", reviewer: "Name, role", reviewedOn: "2027-01-15", notes: "Changed wording of section 2" }
```

Then run `RELEASE_CONTENT_CHECK=1 npm test`. This test fails until every item is reviewed.

## What needs reviewing

| Area | Files | Reviewer type | Status |
|---|---|---|---|
| 24 lessons | `src/content/lessons.ts` | Qualified Islamic studies teacher + educator | Draft |
| 8 stories (fiction) | `src/content/stories.ts` | Educator; Islamic reviewer for respectful portrayal | Draft |
| 7 quiz sets (42 questions + explanations) | `src/content/quizzes.ts` | Islamic studies teacher | Draft |
| 14 vocabulary terms | `src/content/games.ts` | Islamic studies teacher | Draft |
| 30-day plan, reflection prompts | `src/content/days.ts` | Educator | Draft |
| First Fast pages | `src/content/firstFast.ts` | Islamic teacher **and** health professional | Draft |
| Child health message and parent guidance | `src/content/safety.ts` | Health professional (paediatric if possible) | Draft |
| Kindness missions and safety notes | `src/content/missions.ts` | Educator / child-safety | Draft |
| Learn Dhivehi: 24 letters, fili, 46 words, numbers 1–10, Ramadan words, spoken re-spellings | `src/content/dhivehi.ts` | Dhivehi language teacher. Check especially: ރޯދަ ވީލުން (Iftar), letter-sound descriptions, romanisations such as *bai* (ބަތް) and *ai* (އަތް) | Draft |

## Items flagged for specific checking
- "Bismillah" = "In the name of Allah"; "Alhamdulillah" = "All praise is for Allah"; "Assalamu alaikum" = "Peace be upon you"; "Eid Mubarak" = "Blessed Eid" — translations to verify.
- Laylatul Qadr lesson: wording on the last ten nights and the revelation of the Quran; no specific night is ever claimed.
- Five pillars: summary wording of the Shahada.
- Zakat / Zakat al-Fitr: simplified, no amounts given.
- "Kuda Eid" as a local name for Eid al-Fitr in the Maldives.
- Maldivian foods named: masroshi, gulha, bajiya, roshi, and the "joali" swing seat.
- Reviewers may add verified Quran/hadith references; none are quoted now by design.

## Owner request (November 2026): gentle encouragement to pray on time and to fast when well
- New First Fast page **"Growing up with Salah and fasting"** (`ff-growing-up`): states that the five daily prayers and fasting in Ramadan become a duty after puberty for those who are healthy; invites children to practise step by step, to try to pray on time, and to try fasting (even part of a day) only if they feel well and their family agrees; ends with the health message. **Needs Islamic content review** (wording of the duty after puberty) and **health-professional review**.
- Home Salah & fasting card: "Try to pray each prayer on time…" and "If you feel well and your family says it is okay, you could try fasting…".
- Parent fasting guidance, first point, updated to match.
- Unchanged by design (CLAUDE.md non-negotiables): no stars, badges, streaks or status for praying or fasting; children who don't fast are never made to feel bad; stopping is always okay.

## November 2026: new draft wording to review
- **Quick check questions** (one per lesson, 24) and **Story check questions** (two per story, 16): written only from facts already in each lesson or story; editable in the admin dashboard. Islamic reviewer to check the lesson questions.
- **Salah reminders** (home card): "Salah is how Muslims talk to Allah and thank Him, five times every day… it is not too late: pray now…", "MashaAllah! You prayed … on time." Islamic reviewer to check.
- **Fasting reminder** on a day without a fast: "Fasting in Ramadan is one of the five pillars of Islam, and when Muslims grow up it becomes a duty for everyone who is healthy… Your health always comes first." Islamic and health reviewers to check.
