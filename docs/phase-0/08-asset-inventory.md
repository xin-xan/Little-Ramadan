# Asset inventory & licence record

All artwork is original work created for this project in code, except the items marked below. Licence of original work: same as the project.

| Asset | Location | Source / licence |
|---|---|---|
| App logo & icons (192, 512, maskable, apple-touch) | `src/components/Logo.tsx`, `public/icons/*.png` (rendered from the SVG by `scripts/make-icons.mjs`) | Original |
| Noor (5 expressions) | `src/characters/Noor.tsx` | Original |
| Amina (5 expressions) | `src/characters/Amina.tsx` | Original |
| Hilmy (3 expressions) | `src/characters/Hilmy.tsx` | Original |
| Child avatars (8 sea/island friends) | `src/characters/Avatars.tsx` | Original |
| Ramadan Village scene + 5 destinations | `src/components/village/VillageScene.tsx` | Original |
| My Little Ramadan Room + 18 decorations | `src/components/room/` | Original |
| Mission/lesson/story illustrations | `src/components/art/Illustrations.tsx` (icon-style scenes by key) | Original |
| Game objects (lanterns, cards, mosque puzzle art) | `src/components/art/` | Original |
| Badge icons (8) | `src/components/art/BadgeIcon.tsx` | Original |
| Certificate artwork | `src/app/rewards/certificate/` | Original |
| Sound design (taps, chimes, sparkles, page turns, celebrations) | `src/accessibility/sound.ts` (Web Audio synthesis) | Original, no files |
| 3D characters (Noor, Amina, Hilmy) and 3D Ramadan Village | `src/three/characters.ts`, `src/three/village.ts` | Original (built from geometry in code) |
| Icon set | `src/components/Icon.tsx` | Original |
| Fonts: Fredoka, Nunito (latin subsets) | `src/styles/fonts/` | **Third-party**, SIL Open Font License 1.1, licences in `src/styles/fonts/LICENSE-*.txt` |
| Font: Faruma (Thaana letters only, subset to 9 KB WOFF2; primary Dhivehi font) | `src/styles/fonts/faruma-thaana.woff2` | **Third-party, supplied by the owner.** © The President's Office (Maldives) 2002, created by Ibrahim Yasir, calligraphy by Musthafa Mohamed; marked "All rights reserved" with restricted (print & preview) embedding. The Latin letters (Times New Roman, Monotype) were removed. **Owner to confirm permission for web use before public launch**; if not confirmed, delete the file and its `@font-face` and the app falls back to Noto Sans Thaana (OFL). |
| Font: Noto Sans Thaana 400/700 (fallback for Dhivehi letters; via @fontsource/noto-sans-thaana 5.3.0) | `src/styles/fonts/` | **Third-party**, SIL Open Font License 1.1, `src/styles/fonts/LICENSE-NotoSansThaana.txt` |
| Learn Dhivehi pictures (fish, coconut, boat, moon …) | `src/components/dhivehi/DvPicture.tsx` | Original SVG, made for this project |
| RYSE logo | `src/assets/ryse-logo.png` | **Supplied by the project owner (RYSE)** for the footer credit |
| Three.js 3D library | npm `three` | **Third-party**, MIT licence |
