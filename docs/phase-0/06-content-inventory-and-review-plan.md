# Content inventory & review plan (Phase 0)

All content is data in `src/content/*.ts`, with stable IDs, so reviewers' corrections never require UI changes. Every religious-learning item carries:

```ts
review: { status: 'draft' | 'in_review' | 'reviewed'; reviewer?: string; reviewedOn?: string; notes?: string }
```

The Parent Zone → “Content & review” page lists every item and its status. `docs/content-review-record.md` is the human-readable record.

## Inventory (MVP)
| Type | Count | File |
|---|---|---|
| Journey days (theme, lesson/story, kindness mission, game, reflection) | 30 (+ final-day adaptation for 29-day months) | `days.ts` |
| Lessons (all 20 CLAUDE.md §6.6 topics + cleanliness, good words, forgiveness, respect) | 24 | `lessons.ts` |
| Illustrated stories (original fiction with Noor & Amina, clearly marked as stories) | 8 | `stories.ts` |
| Kindness missions | 32 | `missions.ts` |
| Quiz sets / questions | 7 sets / 42 questions | `quizzes.ts` |
| Vocabulary terms | 14 | `vocabulary.ts` |
| Good-deed sorting cards | 14 | `games.ts` |
| Picture-word pairs / memory cards / lantern designs | 10 / 8 / 8 | `games.ts` |
| Personal goals | 7 | `goals.ts` |
| Badges | 8 | `badges.ts` |
| Room decorations | 18 | `decorations.ts` |
| First Fast learn pages | 6 | `firstFast.ts` |

## Writing rules applied to the draft
- Only widely-established, non-contested basics (e.g. Ramadan is the ninth month of the Islamic calendar; the five pillars; Suhoor/Iftar; Eid al-Fitr follows Ramadan).
- **No Quran verses, hadith, translations or attributions are quoted.** Where a lesson would benefit from a quotation, the text says “Ask a parent or teacher to share…” and the reviewer may add a verified quotation later with its reference.
- Stories are labelled “A story” and are fictional illustrations of values, not religious teachings.
- Avoid sectarian differences; where practice varies, say “families and communities may do this differently”.
- Laylatul Qadr: learning theme only; never claims which night it is.
- Dates/times: none claimed; parents set the calendar from local official announcements.

## Review plan
1. **Islamic content reviewer** (owner to appoint — e.g. a qualified Islamic studies teacher in the Maldives): reviews `lessons.ts`, `stories.ts`, `quizzes.ts`, `vocabulary.ts`, `days.ts`, `firstFast.ts`. Marks each item `reviewed` with name/date.
2. **Educator / child-development reviewer:** reading level and tone for all child-facing text.
3. **Health professional:** fasting safety wording in `firstFast.ts`, `safety.ts`.
4. Changes are made only in content files; the validator test must pass.
5. Launch gate (Phase 6): validator in “release mode” (`RELEASE_CONTENT_CHECK=1`) fails if any religious item is not `reviewed`.
