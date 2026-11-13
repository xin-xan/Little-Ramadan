> # Claude Code project instructions
>
> **Project:** Little Ramadan  
> **Purpose:** Build a complete, child-safe, free Ramadan learning and adventure PWA according to this specification.
>
> ## How to use this file
> This file is the product brief, design specification, technical direction and phased implementation plan. Treat it as the source of truth for product behaviour and scope. If the repository already contains implementation decisions, inspect them first and preserve sound existing conventions unless they conflict with a safety or product requirement below.
>
> ## Required working method
> 1. Start by inspecting the repository, its package manager, existing application structure, scripts, tests and current implementation. Do not overwrite a working project or assume it is empty.
> 2. Identify the current phase and report a concise implementation plan before making broad changes.
> 3. Build in the numbered phases in this document. Complete and test one phase before moving to the next. Do not silently skip acceptance criteria.
> 4. Implement real interactions and persistent behaviour. Do not substitute static mockups, dead buttons, fake data presented as live data, placeholder links, or simulated success states for required functionality.
> 5. Prefer a lightweight, mobile-first PWA and local-first storage for the MVP. Do not add accounts, a backend, analytics, advertising, payments or third-party services unless this specification is explicitly updated.
>    *Owner decision (November 2026): the grown-ups' content admin at `/admin/` has a username-and-password sign-in, checked by a small Cloudflare Worker (`worker/`) that also holds the GitHub key for publishing. It never touches children's data; the children's app stays account-free and local-first.*
> 6. Keep content data-driven so reviewed stories, lessons, missions and quizzes can be updated without rewriting UI components.
> 7. Run the repository's relevant lint, type-check, test and production-build commands after meaningful changes. Fix failures you introduce. If a command cannot run, state why rather than claiming it passed.
> 8. Test responsive layouts and core flows at common iPhone and Android viewport sizes. Check keyboard access, readable text, touch target sizes, offline reopening and data persistence where relevant.
> 9. Maintain or add concise project documentation, including setup, development, build, test and deployment instructions. Keep a progress checklist so work can resume reliably.
> 10. Do not claim that the app is deployed or publicly accessible unless deployment has actually completed and the URL has been verified.
>
> ## Non-negotiable child-safety and product rules
> - The app is for children aged 7–9 and must be welcoming to children who fast, partially fast or do not fast.
> - Never score, rank, reward or compare children based on fasting duration. Never pressure a child to fast, continue fasting, hide symptoms or feel guilty.
  *Owner decisions (November 2026): a day's fast earns 2 stars (the same for practising, part of a day or a full fast, so never more for longer fasting) and a day without a fast shows a gentle reminder of why Muslims fast; prayers earn 1 star on time and ½ star after their time, with gentle reminders when a prayer's time has passed. Health-first guardrails stay: stop and tell a grown-up if unwell, the fasting journal is off until a parent turns it on, badges never depend on prayer or fasting, and there are no streaks.*
> - Health comes first. Encourage a child who feels unwell to stop the activity and tell a trusted adult. Parents/guardians guide fasting decisions.
> - Children who do not fast must still be able to access all learning, kindness activities and non-fasting rewards.
> - No child-to-child chat, public profiles, social feed, location tracking, ads, purchases, subscriptions or behavioural advertising.
> - Collect the minimum possible data. Use a nickname rather than a real name and keep the MVP local-first.
> - Treat Islamic material as draft educational content until reviewed by qualified reviewers. Do not invent religious rulings, hadith references, Quran quotations or prayer-time claims.
> - Do not present the app as a medical authority or religious authority.
> - Keep the product completely free: no monetisation, paywalls, paid upgrades or in-app purchases.
>
> ## Product identity
> Use **Little Ramadan** as the app name everywhere, including app metadata, manifest, page titles, onboarding, settings, certificates and documentation. Use the tagline **“My Little Journey of Faith, Kindness & Discovery.”** The former working name “My First Ramadan” is retired and must not appear in the shipped product UI.
>
> ## Definition of done
> A feature is complete only when its intended user flow works, state persists where required, empty/loading/error states are handled, the layout is usable on mobile, accessibility basics are addressed, tests or a documented manual test cover it, and the relevant phase acceptance criteria pass.
>
> ---
>
# Little Ramadan

## Complete Product Concept, Design Specification and Phased Development Plan

**Product tagline:** My Little Journey of Faith, Kindness & Discovery\
**Initial audience:** Children aged 7--9\
**Initial market:** Maldives\
**Language:** English\
**Visual direction:** Cute, polished 3D-cartoon adventure game\
**Platforms:** Mobile-first Progressive Web App (PWA), usable on iPhone,
Android and desktop\
**Pricing promise:** Free for every child and family; no advertisements,
subscriptions, paid upgrades or in-app purchases.

------------------------------------------------------------------------

# 1. Executive summary

**Little Ramadan** is a child-friendly Ramadan companion and
educational adventure for children aged 7--9 who are learning about
Ramadan and may be trying fasting for the first time.

The app should make Ramadan feel welcoming, joyful, meaningful and
memorable. It is not a fasting endurance game, a religious authority, or
a competitive social network. It encourages learning, kindness,
gratitude, family participation and age-appropriate Islamic
understanding.

Children explore a colourful Ramadan Village with a friendly guide named
**Noor**, a learning companion named **Amina**, and a crescent-moon
mascot named **Hilmy**. They complete daily activities, explore
illustrated stories, play short educational games, collect
non-purchasable stars, badges and stickers.

The app must make clear that: - A child's health and wellbeing come
before any fasting activity. - Children should never be pressured to
fast or continue fasting when unwell. - A child can enjoy and complete
the Ramadan journey without fasting. - Fasting duration does not earn
points, status or competitive advantage. - Parents or guardians guide
any fasting practice according to the child's health, readiness and
family/religious guidance. - The app's educational content is reviewed
by suitably qualified people before release.

The first release should be a genuinely working, polished MVP---not just
a visual prototype. Build it in phases, test each phase and only then
proceed.

------------------------------------------------------------------------

# 2. Product goals and non-goals

## 2.1 Primary goals

1.  Help children understand the meaning and practices of Ramadan in
    age-appropriate language.
2.  Make a child's first Ramadan experience positive and encouraging.
3.  Encourage kindness, patience, honesty, gratitude, generosity and
    helpfulness.
4.  Introduce fasting concepts gently without pressuring children to
    fast.
5.  Provide safe, short, enjoyable educational play.
6.  Give parents a simple way to guide and review the child's use.
7.  Work reliably on common mobile devices, including modest devices and
    slower connections.
8.  Provide useful offline functionality after the initial app and
    content have loaded.
9.  Remain free to use and minimise operating costs.

## 2.2 Non-goals for the first release

Do not build these into the MVP: - Public child profiles or social
feeds. - Chat, messaging, comments or friend requests. - Public
leaderboards or competitions. - Location tracking or nearby-child
discovery. - User-generated public content. - Online payments, donations
or purchases. - Advertising, sponsorship placements or behavioural
analytics. - AI chatbots for children. - Medical diagnosis or
personalised medical advice. - A full Quran reader or prayer-time
authority unless reliable content and review are arranged. - Complex
multiplayer games. - Mandatory accounts or cloud synchronisation.

These exclusions reduce privacy, moderation, cost and safety risks.

------------------------------------------------------------------------

# 3. Audience and accessibility

## 3.1 Primary audience

Children aged 7--9. The reading level should be simple, sentences short,
instructions concrete and interactions easy to understand.

Design for: - Children who have never fasted. - Children who are
practising a partial or short fast with family guidance. - Children who
complete a fast. - Children who do not fast. - Children who are still
learning basic Islamic vocabulary. - Children with different reading
speeds and levels of digital confidence.

## 3.2 Secondary audience

Parents and guardians who: - Set up the child's nickname and avatar. -
Review learning progress. - Read parent guidance. - Decide whether the
fasting journal is enabled. - Manage sound, reminders and screen-time
prompts. - Reset or remove local data.

## 3.3 Accessibility requirements

-   Large touch targets, ideally at least 44 by 44 CSS pixels.
-   High contrast between text and backgrounds.
-   Avoid communicating success or errors through colour alone.
-   Use readable type with comfortable line spacing.
-   Provide captions or text equivalents for important audio.
-   Avoid flashing effects and rapid camera movement.
-   Provide reduced-motion settings.
-   Make sound optional and muted by default where appropriate.
-   Support portrait mobile screens first, while remaining usable in
    landscape and desktop.
-   Use plain English and explain unfamiliar terms.
-   Do not require precise dragging; offer tap alternatives for games.

------------------------------------------------------------------------

# 4. Brand, tone and visual identity

## 4.1 Name and tagline

**App name:** Little Ramadan\
**Tagline:** My Little Journey of Faith, Kindness & Discovery

The name should be readable, memorable and welcoming. Check name and
domain availability before public launch.

## 4.2 Visual direction

Use a cute, high-quality 3D-cartoon style: - Soft rounded shapes. -
Friendly expressive characters. - Warm lantern light. - Emerald and deep
teal greens. - Cream and warm ivory surfaces. - Muted gold accents. -
Gentle night-sky blues and purples. - Tropical island details suitable
for the Maldives. - Decorative Islamic geometric patterns used
respectfully and sparingly.

Avoid overly dark screens, visual clutter, frightening imagery,
excessive glitter or animation that makes the app difficult to use.

Suggested palette (adjust after contrast testing): - Deep emerald:
`#123C35` - Teal green: `#286356` - Cream: `#FFF7E8` - Warm gold:
`#E9C66B` - Soft sky: `#BBD8E8` - Lavender: `#D9CFF0` - Body text:
`#26332F`

## 4.3 Character system

### Noor --- main guide

-   Cheerful young Muslim boy character.
-   Green outfit with simple, consistent design.
-   Curious, encouraging and patient.
-   Introduces missions, explains navigation and celebrates effort.

### Amina --- learning friend

-   Cheerful young Muslim girl character.
-   Modest pastel outfit and hijab.
-   Curious, kind and enthusiastic.
-   Introduces stories, lessons and quizzes.

### Hilmy --- crescent-moon mascot

-   Friendly expressive crescent moon.
-   Warm gold or soft cream appearance.
-   Guides the calendar and gives gentle reminders.

### Character consistency requirements

-   Create approved character reference sheets before producing screens.
-   Define front, side, back and expression views.
-   Define a fixed colour palette, clothing, proportions and
    accessories.
-   Keep character proportions and facial features consistent across
    scenes.
-   Use the same approved character assets throughout the app.
-   Do not rely on ad-hoc image generation for every screen.
-   Keep characters respectful and age-appropriate.
-   Do not depict prophets or sacred figures.

## 4.4 Tone of voice

Use language that is: - Warm and encouraging. - Simple and respectful. -
Positive without being pushy. - Inclusive of children who are not
fasting. - Free from guilt, shame, threats or fear.

Example messages: - "Welcome back, Ramadan Explorer!" - "You learned
something new today!" - "That was a thoughtful thing to do." - "Every
kind action matters." - "Your health comes first. Tell a trusted adult
if you feel unwell." - "You can enjoy your Ramadan adventure whether or
not you are fasting."

Avoid: - "You failed your fast." - "You lost your streak." - "Real
champions never stop fasting." - "You must finish today's fast." - Any
message that rewards longer fasting.

------------------------------------------------------------------------

# 5. The game world: Ramadan Village

The main environment is an inviting island-inspired Ramadan village at
night. It should feel magical but calm and easy to navigate.

## 5.1 Five destinations

1.  **Noor's House** --- daily missions and the home dashboard.
2.  **Knowledge Garden** --- illustrated Islamic stories and lessons.
3.  **Kindness Street** --- good deed challenges.
4.  **Puzzle Palace** --- quizzes, puzzles and mini-games.
5.  **Celebration Square** --- achievements, rewards and Eid
    celebration.

Celebration Square also holds **My Sticker Album**, where children
collect a sticker for every lesson, story and kindness mission.

## 5.2 Environment details

Use tasteful visual references to the Maldives: - Tropical palms and
island plants. - Island houses and sandy paths. - A calm ocean view
where appropriate. - A mosque-inspired village landmark, designed
respectfully. - Lanterns, stars and crescent decorations. - Family Iftar
settings. - Local food illustrations.

Do not present fictional village scenes as accurate depictions of a
specific Maldivian island or mosque.

## 5.3 Progressive village lights

As children finish journey days, more village lanterns light up, and
flowers appear along the path for kindness missions. Progress is never
purchased, and children who miss days are never locked out of later
content.

------------------------------------------------------------------------

# 6. Complete feature specification

## 6.1 Welcome and onboarding

Purpose: Introduce the app and let a family set up a local child profile
without requiring an account.

Screens: 1. Splash screen with logo and gentle animation. 2. Welcome
message from Noor. 3. Short explanation of the app. 4. Parent gate. 5.
Parent consent and privacy explanation. 6. Child nickname entry. 7.
Avatar selection. 8. Optional sound and motion preferences. 9.
Child-friendly safety introduction. 10. Enter Ramadan Village.

Requirements: - Do not ask for the child's full legal name, phone
number, address, school or exact birth date. - Use a nickname only. - Do
not collect precise location. - Do not require email or social login. -
Explain local-only progress storage to the parent. - Make clear how to
reset or delete the profile. - Avoid asking children to enter personal
information.

## 6.2 Home dashboard

The home screen should show: - Greeting from Noor. - Child's chosen
nickname. - Current Ramadan day, if the parent has configured the
calendar. - Today's mission. - Journey progress. - Star balance. -
Shortcuts to Learn, Play, Kindness and Learn Dhivehi. - A simple parent-zone
entry point.

The dashboard must remain usable if the Ramadan calendar is not
configured. In that case, show a general "Explore Ramadan" experience
rather than inventing a current Ramadan day.

## 6.3 My Ramadan Journey

A 29- or 30-day calendar with one illustrated activity tile per day.

Requirements: - Support both 29-day and 30-day Ramadan. - Do not assume
Ramadan always has 30 days. - Allow parents to configure the start date
or select a locally confirmed calendar. - Do not automatically claim an
official date unless sourced and verified. - Let children revisit
previously available activities. - Do not punish missed days. - Do not
lock learning content behind a fasting milestone. - Make progress clear
and celebratory, not competitive.

Each day can include: - Theme. - Short lesson. - Good deed. - Mini-game
or quiz. - Optional reflection. - Reward for participation.

## 6.4 My First Fast

This is an educational and optional journaling feature, not a fasting
challenge.

Content: - What is fasting? - What are Suhoor and Iftar? - What does it
mean to begin and end a fast? - Why do Muslims fast during Ramadan? -
What can a child do if they are not fasting? - Why health and family
guidance matter.

Optional private journal categories: - I practised with my family. - I
tried fasting for part of the day. - I completed a fast with family
guidance. - I did not fast today. - I want to record a different Ramadan
memory.

Rules: - No points, badges, rankings or prizes based on fasting
duration. - No streaks for fasting. - No pressure to continue. - No
countdown designed to encourage endurance. - Do not ask the child to
report symptoms to an automated system as a substitute for adult help. -
Include a prominent instruction to tell a parent or trusted adult if
they feel dizzy, weak, sick or unwell. - Tell the child that stopping is
okay and their Ramadan journey remains valuable. - Keep entries private
on the device and parent-controlled. - Consider disabling this feature
by default until a parent enables it.

Suggested child-facing message:

> Your health comes first! If you feel dizzy, very weak or unwell, tell
> your parent or another trusted adult straight away. You can stop
> fasting whenever you need to. Your Ramadan adventure is still special!

The app is not a medical service. Parents should use appropriate
professional advice for health questions. Do not make definitive medical
claims about which children can safely fast.

## 6.5 Kindness Missions

A rotating library of age-appropriate actions, for example: - Help a
parent set the table. - Put toys away. - Share something with a
sibling. - Say thank you. - Help keep a shared space clean. - Make a
kind card for someone. - Read with a younger family member. - Help
prepare Iftar with adult supervision. - Give food to someone in need
with a parent or guardian. - Check on a relative with family support.

Each mission should include: - Short title. - One-sentence
explanation. - Illustration. - Safety note if an adult is needed. - "I
did it!" completion action. - Optional reflection prompt.

Do not ask children to photograph, identify or publicly report people
they help.

## 6.6 Islamic Learning Library

Lessons should be short, illustrated and reviewed before release.

Suggested topics: 1. What is Ramadan? 2. Why do Muslims fast? 3. What is
Suhoor? 4. What is Iftar? 5. What is the Quran? 6. What is Salah? 7. The
five pillars of Islam. 8. What is charity? 9. What is Zakat? 10. What is
a dua? 11. What is a mosque? 12. Good manners in Islam. 13. Honesty. 14.
Patience. 15. Gratitude. 16. Helping neighbours. 17. Laylatul Qadr. 18.
Eid al-Fitr. 19. Sharing and generosity. 20. Caring for family and
community.

A story lesson should generally take 2--4 minutes to read or listen to.

Content rules: - Use reliable Islamic references. - Have a knowledgeable
reviewer approve religious explanations. - Clearly distinguish
established teachings from illustrative storytelling. - Do not invent
hadith or Quran quotations. - Verify every quotation, translation and
attribution. - Avoid sectarian disputes and unnecessary differences of
opinion. - Do not depict prophets or sacred figures. - Do not use
generated text as the sole source of religious content. - Provide source
notes in the parent area or content credits where practical.

## 6.7 Mini-games

Build short games that teach rather than distract.

### Game 1: Ramadan Quiz

-   Multiple-choice questions.
-   Three answer options for younger players.
-   Friendly feedback after each answer.
-   Allow retrying.
-   Explain the correct answer.

### Game 2: Match the Words

Match terms such as Ramadan, Suhoor, Iftar, Dua and Mosque to simple
definitions or illustrations.

### Game 3: Find the Missing Lantern

A visual observation game in which the child identifies which lantern is
missing.

### Game 4: Mosque Puzzle

A simple jigsaw-style puzzle using a respectful architectural
illustration. Do not use sacred text as puzzle pieces.

### Game 5: Sort the Good Deeds

Sort illustrated actions into helpful/kind choices and unhelpful
choices. Avoid shaming language; explain choices gently.

### Game 6: Ramadan Memory Cards

A simple matching game with lanterns, dates, crescent moons, stars and
other appropriate objects.

### Game 7: Islamic Vocabulary Match

Match a word to its simple English meaning.

Game requirements: - Tap-based alternatives for drag interactions. - No
time pressure in the default mode. - No ads or external links. - No paid
hints. - No public scores. - Short sessions. - Pause and exit options. -
Reduced-motion support. - Correct answers should include explanations.

## 6.8 My Sticker Album

*Replaces "My Little Ramadan Room" and its decorations, removed at the owner's request (November 2026).*

A personal sticker album in Celebration Square.

-   Every lesson, story and kindness mission has its own sticker, using
    that activity's illustration.
-   Finishing the activity earns exactly that sticker. Nothing is random,
    bought or linked to fasting.
-   Stickers not yet earned appear as soft outlines that link to the
    activity, so children can find what to do next.
-   Tapping an earned sticker shows a short fact and a link to revisit
    the activity.
-   New content added in the admin dashboard gets a sticker
    automatically.
-   No purchases, loot boxes or social sharing. Stickers are kept on the
    device as part of normal progress.

## 6.9 My Ramadan Goals

Children can choose a few personal goals with a parent: - Learn a new
dua. - Read a short Quran passage with family. - Help someone at home. -
Practise saying thank you. - Learn about fasting. - Be patient. - Share
with someone.

Goals are optional, private and adjustable. Do not create shame or
punishment for unfinished goals.

## 6.10 Parent Zone

Access through a parent gate, such as a simple adult-oriented challenge
or device authentication where supported.

Features: - View nickname and avatar. - Review learning activity
completion. - Enable or disable the fasting journal. - Configure Ramadan
calendar dates. - Manage sound and motion. - Set gentle screen-time
reminders. - Review child-safety and fasting guidance. - Reset
progress. - Delete locally stored profile data. - Read privacy
information. - View content sources and review information.

A simple multiplication question alone is not strong authentication. Use
it only as a low-friction parental gate, not as a guarantee of identity
or security. Never store sensitive parent credentials in plain text.

## 6.11 Rewards and certificates

Rewards should recognise participation, learning and kindness.

Suggested star values: - Complete a lesson: 2 stars. - Complete a
kindness mission: 3 stars. - Complete a quiz: 2 stars. - Read a story: 2
stars. - Complete a personal goal: 3 stars. - Explore a new game: 1
star.

Suggested badges: - Ramadan Explorer --- first activity completed. -
Kindness Hero --- five kindness missions. - Little Scholar --- five
lessons completed. - Curious Mind --- five quizzes completed. - Ramadan
Star --- participated in the Ramadan journey.

Important: - Never award more points for longer fasting. - Never remove
stars for stopping a fast. - Never use fasting as a badge requirement. -
A child who does not fast can earn every learning and kindness
achievement. - Avoid streak loss and shame-based notifications.

## 6.12 Ramadan trophy

*Replaces the printable certificate at the owner's request (November 2026): an animated gold trophy held up by Noor and Amina, engraved with the child's nickname and year, showing their learning and kindness highlights and badges, and saved as a picture. It celebrates participation and learning, never fasting.*

At the end of the journey, generate a printable certificate or
downloadable image with: - Child's nickname only. - "Little Ramadan Journey". - Selected achievements. - Date or Ramadan year if
configured. - A warm congratulatory message. - App name and a small
decorative design.

Do not call the certificate proof of religious completion or proof of
fasting. It celebrates participation and learning.

------------------------------------------------------------------------

# 7. Thirty-day content plan

Prepare content for a 29- or 30-day Ramadan. The final day should adapt
to the locally confirmed month length.

    Day Theme               Mission or activity
  ----- ------------------- ----------------------------------------
      1 Welcome Ramadan     Get the home ready for Ramadan
      2 What is Ramadan?    Learn why Muslims fast
      3 Suhoor              Discover the pre-dawn meal
      4 Iftar               Learn about breaking the fast
      5 Patience            Practise waiting patiently
      6 Kindness            Help a family member
      7 Sharing             Share something with someone
      8 The Quran           Learn what the Quran is
      9 Prayer              Learn about the five daily prayers
     10 Gratitude           Name three things you are thankful for
     11 Cleanliness         Keep your room tidy
     12 Good Words          Say something encouraging
     13 Charity             Learn about giving
     14 Family              Spend time with family
     15 Mid-Ramadan         Celebrate progress
     16 Honesty             Practise telling the truth
     17 Helping Others      Do a helpful task
     18 Forgiveness         Learn about forgiveness
     19 Respect             Respect parents and elders
     20 Good Manners        Practise good manners
     21 Laylatul Qadr       Learn about the special night
     22 Dua                 Learn a simple dua
     23 The Mosque          Learn about mosque manners
     24 Generosity          Learn about Zakat
     25 Thankfulness        Thank someone special
     26 Islamic Knowledge   Complete a knowledge quiz
     27 Ramadan Memories    Record a favourite memory
     28 Eid Preparation     Learn about Eid
     29 My Achievements     Review the journey
     30 Eid Celebration     Celebrate the Ramadan journey

Content schedule should be configurable. Some topics, such as Laylatul
Qadr, should be presented as learning themes rather than claiming a
particular night is definitively Laylatul Qadr. The app should not
assume the same date across all communities.

------------------------------------------------------------------------

# 8. Navigation and screen map

Use five primary navigation destinations:

1.  Home
2.  Journey
3.  Games
4.  Rewards
5.  Parent Zone

Secondary screens: - Welcome. - Profile setup. - Ramadan Village. -
Daily mission detail. - Learning library. - Story reader. - Quiz. -
Mini-game. - My First Fast. - My Sticker Album. - My Ramadan
Goals. - Ramadan trophy. - Settings. - Privacy and safety information.

Navigation requirements: - Keep the primary navigation visible and
predictable. - Use icons plus text labels. - Provide a clear back
action. - Avoid deep navigation trees. - Keep child-facing controls
large. - Keep Parent Zone visually distinct. - Never place external
links in the child navigation.

------------------------------------------------------------------------

# 9. Technical architecture

## 9.1 Recommended MVP stack

-   **Frontend:** React with Next.js and TypeScript.
-   **3D and interactive scenes:** Three.js, React Three Fiber or
    lightweight pre-rendered 3D assets where appropriate.
-   **Styling:** CSS modules or a consistent utility/component system.
-   **Local data:** IndexedDB, using a small wrapper library if useful.
-   **PWA:** Web app manifest and service worker.
-   **Hosting:** Static or low-cost hosting with a free tier, subject to
    provider limits and terms.
-   **Testing:** Unit tests, component tests and browser-based
    end-to-end tests.

Do not introduce a backend, analytics platform, authentication provider
or database service unless a later feature genuinely requires it.

## 9.2 Why a PWA

A PWA allows families to: - Open the app from a web link. - Add it to
the home screen. - Use a full-screen app-like interface. - Receive
cached content for offline use. - Avoid app-store installation as a
launch requirement.

Test installation and offline behaviour on real iPhones and Android
devices. iOS PWA capabilities and storage behaviour differ from desktop
browsers and should not be assumed identical.

## 9.3 Local-first data storage

Store progress on the child's device: - Nickname. - Avatar. -
Preferences. - Completed missions. - Completed lessons. - Completed
games. - Stars. - Badges. - Stickers (from completed activities). - Optional fasting journal
entries. - Parent settings.

Use IndexedDB for structured data. Use a versioned schema and migration
process so future releases can update stored progress safely.

Warn parents that clearing browser data, removing the app or changing
devices may remove local progress. Provide a clear reset and deletion
process. A future export/import feature can be considered, but do not
collect or upload children's data by default.

## 9.4 Suggested data model

``` typescript
interface ChildProfile {
  nickname: string;
  avatar: string;
  createdAt: string;
}

interface DailyProgress {
  day: number;
  completedMissions: string[];
  completedLessons: string[];
  completedGames: string[];
  starsEarned: number;
}

interface RamadanProgress {
  profile: ChildProfile;
  days: DailyProgress[];
  totalStars: number;
  unlockedBadges: string[];
  stickers: string[];
  fastingJournal: {
    date: string;
    experience: "practice" | "partial" | "full" | "not_fast";
  }[];
}
```

This is a starting point, not a final database contract. Validate all
stored data, handle missing or corrupted records and version the schema.

## 9.5 Suggested project structure

``` text
my-first-ramadan/
├── public/
│   ├── characters/
│   ├── environments/
│   ├── animations/
│   ├── sounds/
│   ├── badges/
│   ├── stories/
│   └── icons/
├── src/
│   ├── app/
│   │   ├── welcome/
│   │   ├── home/
│   │   ├── journey/
│   │   ├── missions/
│   │   ├── learning/
│   │   ├── games/
│   │   ├── rewards/
│   │   ├── first-fast/
│   │   └── parent-zone/
│   ├── components/
│   ├── characters/
│   ├── game-engine/
│   ├── content/
│   ├── storage/
│   ├── safety/
│   ├── accessibility/
│   └── styles/
├── tests/
├── manifest.json
└── service-worker.ts
```

## 9.6 Content-driven design

Keep stories, missions, quiz questions and badges in structured content
files rather than hard-coding them into screen components.

Example:

``` typescript
interface Mission {
  id: string;
  title: string;
  description: string;
  day?: number;
  category: "kindness" | "learning" | "family" | "reflection";
  adultHelpRequired: boolean;
  rewardStars: number;
  illustration: string;
}
```

Use content IDs that remain stable across releases. Validate all content
before it ships.

## 9.7 Offline strategy

Cache: - App shell. - Navigation and layout. - Character assets needed
for core screens. - Core stories and missions. - Quiz and game assets. -
Badges and certificate template.

Offline requirements: - The home screen opens after the app has been
installed and cached. - Completed activities save locally. - The child
can access downloaded stories and games. - A clear offline indicator
appears when needed. - No feature should silently pretend that online
data was synchronised. - Updates should not erase existing progress.

------------------------------------------------------------------------

# 10. Visual and asset production plan

## 10.1 Asset inventory

Before detailed implementation, create an asset list and approve the
visual direction.

Required assets: - App logo and icon. - Noor character model and
expressions. - Amina character model and expressions. - Hilmy mascot. -
Ramadan Village background. - Five destination illustrations. -
Sticker artwork (from activity illustrations). - Mission illustrations. - Story illustrations. - Quiz and
game objects. - Badge icons. - Certificate artwork. - UI buttons, cards
and navigation icons.

## 10.2 Asset production rules

-   Use original or properly licensed assets.
-   Record source and licence for every third-party asset.
-   Keep a consistent art direction.
-   Optimise 3D models, textures and image sizes.
-   Use compressed modern image formats where supported.
-   Provide fallback images if a 3D scene cannot load.
-   Do not make the entire app dependent on a heavy 3D engine.
-   Use 3D for the village and selected moments; use lightweight 2D UI
    for reading and settings.
-   Avoid unnecessary background animation.
-   Test graphics on older and lower-powered phones.

## 10.3 Performance targets

Set practical targets and measure them: - Fast initial page display on a
typical mobile connection. - Small initial download. - Lazy-load
nonessential scenes and stories. - Avoid loading all 3D assets on the
first screen. - Maintain responsive touch interactions. - Provide a
reduced-quality or static-scene fallback for low-performance devices. -
Avoid memory-heavy effects and large uncompressed audio files.

------------------------------------------------------------------------

# 11. Child safety, privacy and content governance

This is a core product requirement, not a later enhancement.

## 11.1 Privacy by design

-   No child account required for the MVP.
-   No full legal name.
-   No date of birth; age range is already defined by the product.
-   No precise location.
-   No contact list access.
-   No camera or microphone access.
    *Owner-approved exception (November 2026): a parent may choose to record their own voice in the Parent Zone ("Voice recordings") so their child can hear it. The microphone opens only while a grown-up is recording, children are never asked to record, and recordings stay on the device.*
-   No public profile.
-   No chat or messaging.
-   No behavioural advertising.
-   No unnecessary third-party analytics.
-   No sale of user data.
-   No collection of sensitive information unless a future feature has a
    clearly justified, reviewed need.

## 11.2 Parent control and consent

Provide clear parent-facing information before a profile is created.
Explain: - What information is stored. - Where it is stored. - Whether
anything leaves the device. - How to reset and delete it. - What the app
does and does not do. - That the app is educational and not a medical or
religious authority.

Review applicable privacy and child-protection requirements for the
Maldives and any other launch markets before public release. Obtain
legal advice where appropriate.

## 11.3 Content safety

-   Have Islamic material reviewed by a qualified and trusted reviewer.
-   Have child-facing language reviewed by educators or
    child-development specialists where possible.
-   Have fasting safety language reviewed by appropriate health
    professionals.
-   Do not make medical promises.
-   Do not shame children.
-   Do not create religious fear or guilt.
-   Do not show unsafe food preparation or unsupervised activities.
-   Clearly mark missions that require adult help.

## 11.4 Screen-time wellbeing

-   Keep activities short.
-   Avoid infinite scrolling.
-   Avoid autoplay.
-   Avoid manipulative notifications.
-   Avoid streak-loss mechanics.
-   Offer natural stopping points.
-   Let parents set optional reminders.
-   Encourage family activities away from the screen.

------------------------------------------------------------------------

# 12. Maldives-specific requirements

The initial release should be suitable for Maldivian families while
remaining usable internationally.

Include: - Tropical island-inspired environments. - Maldivian
island-life details. - Familiar family Suhoor and Iftar settings. -
Local food illustrations such as masroshi, gulha, bajiya and
rihaakuru. - Community kindness activities. - Eid decorations inspired
by local celebrations.

Do not assume all Maldivian families have identical customs or
preferences.

## 12.1 Calendar and local religious information

-   Support a parent-configured Ramadan start date.
-   Support 29- and 30-day calendars.
-   Do not assume the month length.
-   Do not claim an official start date without a reliable source.
-   If prayer or fasting times are added later, use a reliable locally
    approved source.
    *Added November 2026: island prayer times from the Maldives (MoIA-format) timetable, pending verification with MoIA; see docs/prayer-times.md.*
-   Make clear that local official announcements may determine dates.
-   Avoid displaying unverified Imsak or Iftar times.

## 12.2 English-only first release

All app interface and learning content should be in English for the
first release. Use simple, age-appropriate English. Design the content
architecture so Dhivehi can be added in a future release without
rebuilding the app.

------------------------------------------------------------------------

# 13. Phased development plan

Develop the product in six main phases. Each phase has objectives,
deliverables and acceptance criteria. Do not proceed just because
screens look complete; verify that features work.

## Phase 0 --- Discovery, content planning and design approval

**Purpose:** Confirm the product rules and approve the experience before
coding.

### Tasks

1.  Confirm the product name, tagline and audience.
2.  Define child and parent user journeys.
3.  Approve the visual style and colour palette.
4.  Create character reference sheets for Noor, Amina and Hilmy.
5.  Map all screens and navigation.
6.  Define the Ramadan content calendar.
7.  Draft initial stories, missions and quizzes.
8.  Identify Islamic content reviewers.
9.  Draft fasting safety guidance.
10. Define privacy and data-minimisation rules.
11. Create an asset inventory.
12. Define the MVP and explicitly exclude non-MVP features.

### Deliverables

-   Product requirements document.
-   Screen map.
-   Wireframes.
-   Approved character guide.
-   Design system.
-   Content inventory.
-   Safety and privacy checklist.
-   Technical architecture decision record.

### Acceptance criteria

-   Product scope is approved.
-   Every MVP screen is documented.
-   Character designs are consistent and approved.
-   Content has a review plan.
-   No unresolved high-risk safety decision is hidden inside
    implementation.

------------------------------------------------------------------------

## Phase 1 --- Foundation and working mobile app

**Purpose:** Build a real installable app shell and core navigation.

### Tasks

1.  Set up the Next.js, React and TypeScript project.
2.  Configure responsive layouts.
3.  Implement the design tokens and reusable UI components.
4.  Build the welcome screen.
5.  Build parent gate and privacy explanation.
6.  Build nickname and avatar selection.
7.  Build the home dashboard.
8.  Build primary navigation.
9.  Implement IndexedDB storage.
10. Implement local profile and progress state.
11. Add PWA manifest and icons.
12. Configure service worker and app-shell caching.
13. Add loading, empty and error states.
14. Add basic automated tests.

### Deliverables

-   Working PWA shell.
-   Welcome and onboarding flow.
-   Local child profile.
-   Home screen.
-   Navigation.
-   Local data persistence.
-   Installable app configuration.

### Acceptance criteria

-   A parent can set up a nickname and avatar.
-   The child can navigate between all implemented sections.
-   Data persists after closing and reopening the app.
-   The app is responsive on iPhone and Android screen sizes.
-   No account or personal contact details are required.
-   The app can reopen offline after initial caching.
-   Reset and deletion work as documented.

------------------------------------------------------------------------

## Phase 2 --- Ramadan Village and journey system

**Purpose:** Build the core game world and daily progression.

### Tasks

1.  Create the Ramadan Village scene.
2.  Add the approved character assets.
3.  Add the five destination areas.
4.  Build the 29/30-day calendar.
5.  Implement parent-configured Ramadan dates.
6.  Build daily mission cards.
7.  Add activity completion states.
8.  Add star rewards for learning and participation.
9.  Add badge unlocking.
10. Add village lantern progression.
11. Add missed-day and revisit behaviour.
12. Add reduced-motion and low-performance fallbacks.

### Deliverables

-   Interactive Ramadan Village.
-   Journey calendar.
-   Daily mission framework.
-   Star and badge system.
-   Village lantern progression.

### Acceptance criteria

-   Every destination opens the correct screen.
-   Calendar supports 29 and 30 days.
-   Missing a day does not punish the child.
-   Activities can be revisited.
-   Fasting duration has no impact on stars or badges.
-   Rewards persist after app restart.
-   The village works on lower-powered mobile devices with a fallback.

------------------------------------------------------------------------

## Phase 3 --- Educational content and games

**Purpose:** Deliver meaningful daily learning and play.

### Tasks

1.  Implement the content-driven story library.
2.  Add the first reviewed Islamic lessons.
3.  Add the 30-day mission content.
4.  Implement kindness challenges.
5.  Build the quiz engine.
6.  Build vocabulary matching.
7.  Build memory cards.
8.  Build the lantern observation game.
9.  Build the simple puzzle game.
10. Add explanations for quiz answers.
11. Add accessibility alternatives for interactions.
12. Add content validation and tests.

### Deliverables

-   Story and lesson library.
-   Daily kindness missions.
-   Quiz system.
-   Five or more mini-games.
-   Initial reviewed content pack.

### Acceptance criteria

-   Lessons display correctly and are readable.
-   Quiz answers and explanations are accurate.
-   Games work with touch input.
-   Activities can be completed without time pressure.
-   Content has documented review status.
-   No unverified religious quotation is published.
-   The app does not require an internet connection for already cached
    core content.

------------------------------------------------------------------------

## Phase 4 --- First Fast and Parent Zone

**Purpose:** Add optional fasting education and responsible parent
controls.

### Tasks

1.  Write and review child-facing fasting explanations.
2.  Add Suhoor and Iftar lessons.
3.  Implement the optional fasting journal.
4.  Ensure journal entries have no rewards.
5.  Add the child wellbeing message.
6.  Build Parent Zone.
7.  Add parent controls for the journal.
8.  Add calendar configuration.
9.  Add sound and motion settings.
10. Add progress review.
11. Add reset and delete controls.
12. Review the parental gate and privacy wording.

### Deliverables

-   Optional First Fast journal.
-   Parent Zone.
-   Safety and wellbeing screens.
-   Parent-controlled settings.

### Acceptance criteria

-   The fasting journal is optional.
-   No fasting duration earns stars, badges or status.
-   A child can use all other features without fasting.
-   A child-facing safety message is easy to find.
-   Parent settings are not exposed as ordinary child navigation.
-   Reset and delete functions work reliably.
-   The app does not present itself as medical advice.

------------------------------------------------------------------------

## Phase 5 --- Rewards, sticker album and celebration

**Purpose:** Complete the emotional journey and end-of-Ramadan
experience.

### Tasks

1.  Build My Sticker Album.
2.  Add a sticker for every lesson, story and kindness mission.
3.  Add badge gallery.
4.  Add achievement summary.
5.  Create the animated Ramadan trophy.
6.  Add child nickname to the trophy.
7.  Add Eid celebration screen.
8.  Add optional sound effects.
9.  Add reduced-motion support.
10. Polish transitions and loading states.
11. Review all child-facing messages.
12. Optimise assets and bundle size.

### Deliverables

-   Sticker album.
-   Complete reward gallery.
-   Ramadan trophy.
-   Eid celebration.
-   Polished UI and animations.

### Acceptance criteria

-   Stickers are earned correctly.
-   No paid or randomised purchase mechanics exist.
-   The trophy does not claim proof of fasting.
-   Eid experience works with a 29- or 30-day calendar.
-   Animations can be reduced or disabled.
-   The experience remains usable without sound.

------------------------------------------------------------------------

## Phase 6 --- Testing, review and launch

**Purpose:** Confirm that the app is safe, reliable and genuinely
usable.

### Testing tasks

1.  Test on real iPhones.
2.  Test on real Android phones.
3.  Test small and large screens.
4.  Test installation and home-screen launch.
5.  Test offline startup after initial caching.
6.  Test progress persistence.
7.  Test app updates without data loss.
8.  Test reset and delete.
9.  Test every navigation link and button.
10. Test all mini-games.
11. Test 29-day and 30-day calendars.
12. Test low-memory and slow-network conditions.
13. Test reduced motion.
14. Test sound settings.
15. Test parent gate.
16. Test privacy and child-safety flows.
17. Have Islamic content reviewed.
18. Have fasting safety wording reviewed.
19. Conduct supervised usability testing with parents and children, with
    appropriate consent.
20. Fix all critical and high-priority issues before launch.

### Launch deliverables

-   Public HTTPS app URL.
-   Install instructions for iPhone and Android.
-   Privacy notice.
-   Parent guide.
-   Content review record.
-   Known limitations.
-   Support/contact route for parents that does not expose children to
    public messaging.

### Launch acceptance criteria

-   No known critical safety issue.
-   No broken primary navigation.
-   No data loss in normal use.
-   Core content works offline after caching.
-   Parent can reset and delete data.
-   No advertising or purchase mechanisms.
-   All religious and safety content has the required review.
-   Public link works on supported mobile devices.

------------------------------------------------------------------------

# 14. Development schedule

A focused MVP estimate is approximately **19--25 working days**,
assuming assets and content are available and the scope stays
controlled.

  Phase                                             Estimated effort
  ---------------------------------------- -------------------------
  Phase 0 --- Discovery and design                         2--3 days
  Phase 1 --- Foundation                                   3--4 days
  Phase 2 --- Village and journey                          4--5 days
  Phase 3 --- Learning and games                           4--5 days
  Phase 4 --- First Fast and Parent Zone                   2--3 days
  Phase 5 --- Rewards and polish                           2--3 days
  Phase 6 --- Testing and launch                           2--4 days
  **Total**                                  **19--27 working days**

The estimate is a planning guide, not a guaranteed deadline. Custom 3D
character production, content review, device compatibility and child
testing can increase the schedule.

A smaller first public beta can be released after Phases 1--3, provided
its content and safety requirements are met. Do not publish an
unfinished fasting feature.

------------------------------------------------------------------------

# 15. Quality assurance checklist

## Functionality

-   [ ] Onboarding works.
-   [ ] Nickname and avatar save.
-   [ ] Navigation works.
-   [ ] Calendar supports 29 and 30 days.
-   [ ] Daily missions open and complete.
-   [ ] Stars calculate correctly.
-   [ ] Badges unlock correctly.
-   [ ] Lessons open.
-   [ ] Quiz feedback is correct.
-   [ ] Mini-games work.
-   [ ] Stickers are earned.
-   [ ] Trophy shows and saves.
-   [ ] Parent settings work.
-   [ ] Reset and delete work.

## Safety

-   [ ] No ads.
-   [ ] No chat.
-   [ ] No public profiles.
-   [ ] No location tracking.
-   [ ] No public leaderboards.
-   [ ] No purchase flows.
-   [ ] No fasting competition.
-   [ ] No shame-based messages.
-   [ ] Child wellbeing message is visible.
-   [ ] Parent controls are available.
-   [ ] Religious content is reviewed.
-   [ ] Safety wording is reviewed.

## Performance and accessibility

-   [ ] Mobile layout works.
-   [ ] Buttons have large touch targets.
-   [ ] Text is readable.
-   [ ] Contrast is sufficient.
-   [ ] Reduced motion works.
-   [ ] Sound can be muted.
-   [ ] Loading states are clear.
-   [ ] Offline behaviour works.
-   [ ] Low-performance fallback works.
-   [ ] App updates preserve local progress.

------------------------------------------------------------------------

# 16. Free operation and sustainability

The app should remain free for every user.

## Product rules

-   No advertisements.
-   No subscriptions.
-   No premium tier.
-   No paid badges or stickers.
-   No in-app purchases.
-   No paywall.
-   No sale of user data.
-   No paid hints or game advantages.

## Cost-control approach

-   Use static or free-tier hosting where available.
-   Keep progress local.
-   Avoid paid APIs.
-   Compress images and 3D assets.
-   Cache content.
-   Avoid unnecessary server functions.
-   Avoid storing children's personal information.
-   Monitor hosting limits and provider terms.

"Free to use" can be a firm product commitment. "Zero cost to operate
forever" cannot be guaranteed because hosting providers may change their
free tiers or impose limits. If the project later needs funding, seek
voluntary adult/community support or grants without adding charges or
advertising to the child experience.

------------------------------------------------------------------------

# 17. Future enhancements --- only after the MVP

Potential future features: - Dhivehi language option. - Additional
languages. - More stories and reviewed learning packs. - Parent-managed
family profiles. - Optional progress export/import. - More
island-inspired environments. - Additional accessibility options. -
Audio narration by licensed or commissioned narrators. - More Eid
activities. - Year-round kindness and Islamic learning mode.

Do not add social features, location discovery, AI chat or public
content sharing without a separate safety and privacy assessment.

------------------------------------------------------------------------

# 18. Project handover requirements

A completed development handover should include:

1.  Full source code.
2.  Clear setup and run instructions.
3.  Deployment instructions.
4.  Environment-variable example file, with no real secrets included.
5.  Asset inventory and licence records.
6.  Content inventory and reviewer status.
7.  Data model documentation.
8.  Test results.
9.  Known limitations.
10. Parent guide.
11. Privacy notice.
12. Public app URL.
13. Instructions for future updates.
14. Backup and recovery guidance for the project source and content.

The delivered app must be a working application. A static screenshot,
nonfunctional mockup, or placeholder link does not count as completion.

------------------------------------------------------------------------

# 19. Final product principles

Every design and development decision should follow these principles:

1.  **Child wellbeing first.** Never encourage a child to ignore hunger,
    thirst, dizziness, weakness or illness.
2.  **Participation over performance.** Celebrate learning, kindness and
    curiosity---not fasting duration.
3.  **Family guidance.** Parents and guardians remain responsible for
    decisions about a child's fasting.
4.  **Faith with care.** Islamic content must be accurate, respectful
    and reviewed.
5.  **Privacy by default.** Collect as little information as possible.
6.  **No commercial pressure.** No ads, purchases, subscriptions or paid
    rewards.
7.  **Accessible learning.** Make activities simple, readable and usable
    by different children.
8.  **Useful offline.** Core experiences should work after initial
    caching.
9.  **Maldives-aware, globally welcoming.** Include local cultural
    details without excluding other children.
10. **Working software over mockups.** Test every feature and deliver a
    real public app.

------------------------------------------------------------------------

# 20. The finished experience

When a child opens **Little Ramadan**, Noor welcomes them into Ramadan
Village.

They choose a daily activity, learn something about Ramadan, complete a
kind action, play a short game and collect a star. They can explore the
stories, collect stickers in their album and record their personal
Ramadan memories.

If they are learning to fast, the app helps them understand Suhoor,
Iftar and the meaning of fasting while reminding them that their health
comes first. If they do not fast, they can still enjoy the complete
learning and kindness adventure.

At the end of Ramadan, they receive a personalised animated trophy
celebrating their journey.

**The intended result:** a safe, joyful and meaningful first Ramadan
companion that children can use without paying anything.

------------------------------------------------------------------------

## Build instruction

Build this project phase by phase in the order defined above. Treat this
document as the product specification and source of truth. Do not skip
acceptance criteria, replace working features with mockups, invent
religious content, or introduce monetisation. Keep the MVP focused, test
each phase on real mobile devices and only proceed after the phase
passes its acceptance criteria.
