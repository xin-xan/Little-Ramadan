# Maldives prayer times

The Salah tracker uses the island prayer timetable bundled in `src/prayer/timetable.json` (about 12 KB compressed, loaded only when needed, works offline).

## Source and status: **unverified, owner to confirm**
- Format: the category-based perpetual timetable used by Maldivian prayer apps (42 timetable categories, 205 islands, a per-island minute adjustment, one row per day of a leap year), attributed to the **Ministry of Islamic Affairs (MoIA)**.
- Copied from the public repository `github.com/shaffan09/prayer-time-api` (`salat_mysql_dump.sql`). That repository has **no licence and does not state its source**.
- **Before public launch:** compare a sample of days/islands with MoIA's current published timetable, and confirm MoIA is happy for the app to include it. If times differ, replace `src/prayer/timetable.json` (the generator is described below).
- The Parent Zone tells parents to follow official announcements and their local mosque if times differ.

## Corrections made
The source contained 15 obvious typos (sunrise exactly one hour late for a few days, and one Isha time 10 minutes off its neighbours). Each was replaced with the value of the neighbouring days:

| Category | Time | Day row | Source value | Corrected |
|---|---|---|---|---|
| 44 | Sunrise | 332 | 6:59 | 6:00 |
| 44 | Sunrise | 333 | 7:59 | 6:00 |
| 50 | Sunrise | 332 | 6:59 | 6:00 |
| 50 | Sunrise | 333 | 6:59 | 6:00 |
| 53 | Sunrise | 332 | 6:58 | 5:59 |
| 53 | Sunrise | 333 | 6:58 | 6:00 |
| 53 | Sunrise | 334 | 6:59 | 6:00 |
| 75 | Isha | 30 | 19:28 | 19:38 |
| 80 | Sunrise | 247 | 6:10 | 6:02 |
| 80 | Sunrise | 248 | 6:10 | 6:02 |
| 81 | Sunrise | 357 | 6:59 | 6:00 |
| 46 | Sunrise | 213 | 6:59 | 5:59 |
| 46 | Sunrise | 214 | 6:59 | 5:59 |
| 46 | Sunrise | 215 | 6:59 | 5:59 |
| 46 | Sunrise | 216 | 6:59 | 5:59 |

A unit test (`tests/unit/prayer-times.test.ts`) checks every island on sample days so typos like these can't return.

## How it is used
- Each prayer's time runs from its start until the next prayer (Fajr until sunrise, Isha until midnight), in the device's local time (Maldives time).
- Marking a prayer during its time earns 1 star; after its time, ½ star; before its time it can't be marked yet. Unmarking removes the star (for mistakes).
- Parents choose the island in Parents → Salah & fasting journal (default Malé).
