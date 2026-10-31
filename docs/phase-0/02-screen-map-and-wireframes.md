# Screen map & wireframes (Phase 0)

Primary navigation (bottom bar, icon + text): **Home · Journey · Games · Rewards · Parents**.
“Parents” always passes through the parent gate first and uses a visually distinct (blue-grey, adult) theme.

```
/                      → redirects to /welcome (no profile) or /home
/welcome               Onboarding flow (10 steps, single route, step state)
/home                  Noor's House dashboard + Ramadan Village scene
/journey               29/30-day calendar
/journey/day/[n]       Daily mission detail (lesson/story, kindness, game, reflection)
/learn                 Knowledge Garden — lesson + story library
/learn/lesson/[id]     Lesson reader
/learn/story/[id]      Story reader (paged)
/kindness              Kindness Street — mission library
/kindness/[id]         Kindness mission detail
/games                 Puzzle Palace — 7 games
/games/[id]            Game player (quiz, match, lantern, puzzle, sort, memory, vocab)
/rewards               Celebration Square — stars, badges, decorations, links
/rewards/room          My Little Ramadan Room
/rewards/certificate   Certificate (print / save image)
/rewards/eid           Eid celebration
/goals                 My Ramadan Goals
/first-fast            My First Fast — learn pages + journal (if enabled)
/safety                “Your health comes first” child safety page (always reachable)
/parent                Parent Zone (gate) — tabs: Progress, Settings, Calendar, Journal, Safety guide, Privacy, Content & review, Data
```

## Wireframes (mobile portrait, 360–430 px wide)

```
┌──────────────────────────┐   ┌──────────────────────────┐
│ ☾ Little Ramadan   ★ 12  │   │ ← Journey      Day 5/30  │
│ ┌──────────────────────┐ │   │ [1✓][2✓][3 ][4✓][5●]     │
│ │ (Noor) Welcome back, │ │   │ [6 ][7 ][8 ][9 ][10]     │
│ │  Turtle Explorer!    │ │   │ ...                      │
│ └──────────────────────┘ │   │ ● today  ✓ done  ○ open  │
│ Day 5 · Patience         │   │ 🔒 “Opens on 12 Mar”     │
│ [ Today's mission  ▶ ]   │   │   (only future days)     │
│ ▓▓▓▓░░░░ journey 4/30    │   └──────────────────────────┘
│ ┌ Ramadan Village scene ┐│   ┌──────────────────────────┐
│ │ 🏠  🌳  🛍  🏰  🎉    ││   │ ← Day 5 · Patience       │
│ └───────────────────────┘│   │ ① Learn: Patience  [✓]   │
│ [Learn][Play][Kind][Room]│   │ ② Kindness: Wait kindly  │
│ [Goals][First Fast][Safe]│   │ ③ Play: Patience quiz    │
├──────────────────────────┤   │ ④ Think (optional)       │
│ Home Journey Games ★ 👪  │   └──────────────────────────┘
└──────────────────────────┘
```

Game screens share a frame: title, `Pause` (opens Pause sheet: Resume / How to play / Exit), progress dots, content area, large answer buttons (≥ 48 px).

Parent gate: modal with an adult question shown in words (“What is seven times eight?”), numeric keypad, Cancel. If a parent PIN is set, the PIN is asked instead.
