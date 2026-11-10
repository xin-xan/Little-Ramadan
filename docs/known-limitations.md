# Known limitations

- **Content is draft.** No religious or health reviewer has approved it yet. Do not launch publicly until `RELEASE_CONTENT_CHECK=1 npm test` passes.
- **Characters are original vector art with soft 3D shading,** not commissioned 3D models. Only front views exist. The village is an SVG scene, not WebGL (a deliberate performance choice, ADR-3).
- **Not yet tested on physical devices.** Automated tests use Chromium with iPhone/Android viewport emulation. iOS Safari PWA storage and install behaviour must be checked on real iPhones.
- **Local-only progress.** It is lost if browser data is cleared, the app is removed, or the family changes device or browser. There is no export/import yet (a possible future feature).
- **iOS storage eviction.** Safari may remove data of sites not used for several weeks unless the app is installed to the home screen. The app requests persistent storage where supported.
- **Parent gate is not security.** The maths question only keeps young children out. The optional PIN is hashed but stored on the same device.
- **First visit downloads the whole app (~2.5 MB uncompressed, ~0.6 MB with host compression)** so it works offline afterwards.
- **No audio narration.** Sounds are short synthesised effects only; all information is on screen. Recorded narration by licensed or commissioned narrators is a possible future feature.
- **English only.** Content is in data files, ready for a Dhivehi translation later.
- **Certificate "save as picture"** depends on the browser allowing downloads. In installed iOS web apps, printing or a screenshot may be needed instead.
