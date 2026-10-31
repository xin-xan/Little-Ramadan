# Design system (Phase 0)

Implemented as CSS custom properties in `src/styles/tokens.css`.

## Colour (from CLAUDE.md §4.2, contrast-checked)
| Token | Hex | Use | Contrast |
|---|---|---|---|
| `--emerald` | #123C35 | headers, primary buttons | cream on emerald 11.4:1 |
| `--teal` | #286356 | secondary buttons, links | white on teal 7.0:1 |
| `--cream` | #FFF7E8 | page background | body text on cream 12.3:1 |
| `--gold` | #E9C66B | accents, stars | emerald on gold 7.4:1 (never gold text on cream) |
| `--sky` | #BBD8E8 | cards, info | text on sky 8.8:1 |
| `--lavender` | #D9CFF0 | story/learning cards | text on lavender 8.9:1 |
| `--text` | #26332F | body text | — |
| `--night` | #1D2B4F | village night sky | — |
| `--parent` | #33465C | Parent Zone theme | white on parent 9.7:1 |
| `--danger-soft` | #FBE3DC + #8A2B12 text | health / safety notices | 7.0:1 |

All ratios computed with the WCAG 2.x formula (AA needs 4.5:1 for body text).

Success/error is never colour-only: every state also has an icon and words (“✓ Done”, “Try again”).

## Type
System font stack (no web font download, works offline): `ui-rounded, "SF Pro Rounded", "Nunito", "Segoe UI", system-ui, sans-serif`. Body 18 px / 1.55 line-height on mobile, headings 24–30 px, minimum 16 px anywhere a child reads.

## Shape & spacing
Radii 16 / 24 px, spacing scale 4-8-12-16-24-32, soft shadows `0 6px 0 rgba(18,60,53,.18)` (“toy-like” 3D buttons that press down on tap).

## Components
`Button` (primary/secondary/ghost, min 48×48 px), `Card`, `BigTile` (icon + label shortcut), `SpeechBubble` (character + text), `ProgressBar` (with text label), `StarCount`, `Badge`, `Sheet` (modal, focus-trapped, Esc closes), `ParentGate`, `PageHeader` (back + title), `BottomNav`, `OfflineBanner`, `Notice` (info / health).

## Motion
Gentle only: 150–300 ms ease-out, lantern sway ≤ 4°, star twinkle opacity-only. No flashing, no camera movement. All animation disabled when the child/parent turns on Reduced Motion or the OS prefers reduced motion.
