# Character guide (Phase 0)

All characters are **original vector artwork** drawn in code (`src/characters/`), so every screen uses the exact same asset — no ad-hoc image generation. A soft “3D-cartoon” look comes from radial gradients, rim highlights and soft ground shadows. Live reference sheet: run the app and open `/style-guide` (developer page, not linked from child navigation).

No prophets or sacred figures are depicted. Characters are children and a moon mascot only.

## Noor — main guide
- Cheerful young Muslim boy, ~8 years old, big round head (head:body ≈ 1:1.2), large dark-brown eyes with two white catch-lights.
- Outfit: emerald-green kurta `#2E8B6E` with gold collar trim `#E9C66B`, cream trousers `#FFF7E8`, white kufi cap with a thin gold band.
- Skin `#C98E62`, hair dark brown `#3A2618`.
- Personality: curious, encouraging, patient. Introduces missions and navigation.
- Expressions: `happy`, `wave`, `think`, `cheer`, `calm`.

## Amina — learning friend
- Cheerful young Muslim girl, same proportions as Noor.
- Modest pastel outfit: lavender dress `#B9A6E3`, soft-pink hijab `#F3C6D3` with rounded silhouette, cream sleeves.
- Skin `#D9A27A`, eyes dark brown with catch-lights, rosy cheeks.
- Personality: curious, kind, enthusiastic. Introduces stories, lessons and quizzes.
- Expressions: `happy`, `wave`, `think`, `cheer`, `calm`.

## Hilmy — crescent-moon mascot
- Friendly crescent moon, warm gold `#F2CF6B` → cream `#FFF1C2` gradient, small rosy cheek, closed-smile eyes.
- Guides the calendar and gives gentle reminders (safety, breaks).
- Expressions: `happy`, `sleepy`, `cheer`.

## Consistency rules
- Use only the `<Noor>`, `<Amina>`, `<Hilmy>` components; never redraw characters inline.
- Fixed palette above; sizes scale uniformly (no squashing).
- Front view is used in the MVP. **Side and back views are not drawn yet** because no screen needs them; they must be added to the same components before any screen uses them.

## Approval needed
The owner should approve the look in `/style-guide` before public launch. If commissioned 3D renders are preferred later, they should replace the component internals while keeping names, sizes and expressions so screens don't change.
