# Data model (local only)

IndexedDB database `little-ramadan`, version `DB_VERSION` (1). Record shapes are versioned with `SCHEMA_VERSION` (1), stored in `kv/meta`. Source: `src/storage/schema.ts`.

| Store | Key | Contents |
|---|---|---|
| `kv` | `profile` | `{ nickname, avatar, createdAt }` |
| `kv` | `settings` | sound, reducedMotion, villageMode, journalEnabled, calendar `{startDate, length 29|30, openAllDays}`, screenTime `{enabled, minutes}`, parentPin `{hash, salt}` or null, consentAt, seenBadges |
| `kv` | `meta` | `{ schemaVersion }` |
| `completions` | `id` = `kind:contentId` | `{ kind, contentId, day?, completedAt, reflection? }`. Kinds: lesson, story, kindness, quiz, game, goal, reflection, dayplay |
| `journal` | `id` (UUID) | `{ date, experience: practice|partial|full|not_fast|memory, note?, createdAt }` |
| `goals` | `id` (goal id) | `{ chosenAt, completedAt? }` |

## Derived, never stored
Stars, badges and completed days are computed from `completions` (`src/storage/rewards.ts`). The journal is deliberately not an input. One completion per activity means rewards are given once, while activities can be revisited any number of times.

## Robustness
Every record is validated on load (`normalise`). Corrupt or unknown records are dropped, settings fall back to safe defaults, and duplicates are removed. If IndexedDB is unavailable, the app runs from memory and shows a banner saying progress won't be saved.

## Migrations
Add `{ to: N, migrate(raw) }` to `MIGRATIONS` and bump `SCHEMA_VERSION`. For structural changes (new stores), bump `DB_VERSION` and handle `oldVersion` in `openDatabase`.


## Salah log (KV key `salah`)
`Record<YYYY-MM-DD, ("fajr"|"dhuhr"|"asr"|"maghrib"|"isha")[]>` — prayers a child marked on the home screen. Validated on load (unknown values dropped, prayers kept in order), and days older than 60 days are forgotten. Shown to children for today only; parents see 7 days. Never read by rewards (unit-tested). Setting `salahTracker` (default on) shows or hides it; "Fasting today?" on the same card writes ordinary journal entries and only appears when `journalEnabled` is on.
