/**
 * What the admin dashboard can edit: every content file, every field, with labels and help
 * written for non-technical editors. The editor UI is generated from these definitions.
 */
import { ILLUSTRATION_KEYS } from "@/components/art/illustrationKeys";
import { PICTURE_KEYS } from "@/content/dhivehi";
import type { ContentBundle, ContentKey } from "@/content/validate";
import { DV_GAME_TONES, LANTERN_SHAPES, REVIEW_STATUSES, ROOM_SLOT_IDS, WORD_TOPICS } from "@/content/validate";
import { COMPLETION_KINDS } from "@/storage/schema";

export type Obj = Record<string, unknown>;
export interface Option {
  value: string;
  label: string;
}

export type Field = { key: string; label: string; help?: string } & (
  | { type: "id" }
  | { type: "text"; multiline?: boolean; thaana?: boolean; optional?: boolean }
  | { type: "number"; min?: number; max?: number }
  | { type: "boolean"; yes: string; no: string }
  | { type: "select"; options: Option[] | ((c: ContentBundle) => Option[]); optional?: boolean }
  | { type: "illustration" }
  | { type: "picture"; optional?: boolean }
  | { type: "color"; optional?: boolean }
  | { type: "textList"; itemLabel: string; multiline?: boolean }
  | { type: "list"; itemLabel: string; fields: Field[]; newItem: () => Obj; titleOf?: (x: Obj, i: number) => string }
  | { type: "object"; fields: Field[]; optional?: boolean }
  | { type: "review" }
  | { type: "answer" }
);

export interface Collection {
  id: string;
  title: string;
  group: string;
  file: ContentKey;
  /** Path inside the file: [] for the whole file, ["pages"] for firstFast.pages, etc. */
  path: string[];
  kind: "list" | "object";
  description: string;
  fields: Field[];
  itemTitle?: (x: Obj, i: number) => string;
  itemSubtitle?: (x: Obj, i: number) => string;
  newItem?: (existing: Obj[]) => Obj;
  canAdd?: boolean;
  canDelete?: boolean;
  canReorder?: boolean;
}

const opts = (values: readonly string[], labels?: Record<string, string>): Option[] => values.map((v) => ({ value: v, label: labels?.[v] ?? v }));
const draftReview = () => ({ status: "draft", notes: "Added in the admin dashboard; awaiting review." });
const s = (v: unknown) => (typeof v === "string" ? v : "");

export const ILLUSTRATIONS = [...ILLUSTRATION_KEYS] as string[];
export const PICTURES = [...PICTURE_KEYS] as string[];

const idsOf = (c: ContentBundle, key: ContentKey, label: (x: Obj) => string): Option[] => ((c[key] as Obj[]) ?? []).map((x) => ({ value: s(x.id), label: `${label(x)} (${s(x.id)})` }));

const reviewField: Field = { key: "review", label: "Review status", type: "review", help: "Religious, educational and safety content must be checked by a qualified reviewer before launch." };

export const COLLECTIONS: Collection[] = [
  // ---------------- Learning
  {
    id: "stories",
    title: "Stories",
    group: "Learning",
    file: "stories",
    path: [],
    kind: "list",
    description: "Picture stories in the Knowledge Garden. Children turn each page themselves.",
    itemTitle: (x) => s(x.title),
    itemSubtitle: (x) => `${Array.isArray(x.pages) ? x.pages.length : 0} pages · ${s((x.review as Obj)?.status)}`,
    canAdd: true,
    canDelete: true,
    canReorder: true,
    newItem: () => ({ id: "", title: "New story", summary: "", illustration: "star", value: "", minutes: 3, pages: [{ text: "", illustration: "star" }, { text: "", illustration: "star" }, { text: "", illustration: "star" }], review: draftReview() }),
    fields: [
      { key: "id", label: "ID", type: "id" },
      { key: "title", label: "Title", type: "text" },
      { key: "summary", label: "Summary", type: "text", multiline: true, help: "One sentence shown in the library." },
      { key: "value", label: "What the story is about", type: "text", help: 'Shown as "A story about …", e.g. "patience".' },
      { key: "illustration", label: "Cover picture", type: "illustration" },
      { key: "minutes", label: "Minutes to read", type: "number", min: 1, max: 6 },
      { key: "pages", label: "Pages", type: "list", itemLabel: "page", titleOf: (x, i) => `Page ${i + 1}${s(x.text) ? `: ${s(x.text).slice(0, 48)}${s(x.text).length > 48 ? "…" : ""}` : ""}`, newItem: () => ({ text: "", illustration: "star" }), fields: [
        { key: "text", label: "Text", type: "text", multiline: true },
        { key: "illustration", label: "Picture", type: "illustration" },
      ] },
      reviewField,
    ],
  },
  {
    id: "lessons",
    title: "Lessons",
    group: "Learning",
    file: "lessons",
    path: [],
    kind: "list",
    description: "Short Islamic learning lessons (2–4 minutes). Religious content stays draft until a qualified reviewer approves it.",
    itemTitle: (x) => s(x.title),
    itemSubtitle: (x) => `${Array.isArray(x.sections) ? x.sections.length : 0} parts · ${s((x.review as Obj)?.status)}`,
    canAdd: true,
    canDelete: true,
    canReorder: true,
    newItem: () => ({ id: "", title: "New lesson", summary: "", illustration: "book", guide: "noor", minutes: 3, sections: [{ heading: "", text: "" }], keyWords: [], tryThis: "", sourceNote: "", review: draftReview() }),
    fields: [
      { key: "id", label: "ID", type: "id" },
      { key: "title", label: "Title", type: "text" },
      { key: "summary", label: "Summary", type: "text", multiline: true },
      { key: "illustration", label: "Picture", type: "illustration" },
      { key: "guide", label: "Guide character", type: "select", options: opts(["noor", "amina", "hilmy"], { noor: "Noor", amina: "Amina", hilmy: "Hilmy" }) },
      { key: "minutes", label: "Minutes", type: "number", min: 2, max: 4 },
      { key: "sections", label: "Parts of the lesson", type: "list", itemLabel: "part", titleOf: (x, i) => s(x.heading) || `Part ${i + 1}`, newItem: () => ({ heading: "", text: "" }), fields: [
        { key: "heading", label: "Heading", type: "text" },
        { key: "text", label: "Text", type: "text", multiline: true },
      ] },
      { key: "keyWords", label: "Words to know", type: "list", itemLabel: "word", titleOf: (x) => s(x.word) || "New word", newItem: () => ({ word: "", meaning: "" }), fields: [
        { key: "word", label: "Word", type: "text" },
        { key: "meaning", label: "Meaning", type: "text" },
      ] },
      { key: "tryThis", label: "Try this with your family", type: "text", multiline: true },
      { key: "sourceNote", label: "Source note for the reviewer", type: "text", multiline: true, help: "Which reliable reference should the reviewer check this against? Shown in the Parent Zone." },
      reviewField,
    ],
  },
  {
    id: "vocabulary",
    title: "Word meanings",
    group: "Learning",
    file: "vocabulary",
    path: [],
    kind: "list",
    description: 'Islamic words and their meanings, used in the "Word Meanings" game.',
    itemTitle: (x) => `${s(x.word)} — ${s(x.meaning)}`,
    canAdd: true,
    canDelete: true,
    canReorder: true,
    newItem: () => ({ id: "", word: "", meaning: "", illustration: "abc", review: draftReview() }),
    fields: [
      { key: "id", label: "ID", type: "id" },
      { key: "word", label: "Word", type: "text" },
      { key: "meaning", label: "Meaning", type: "text" },
      { key: "illustration", label: "Picture", type: "illustration" },
      reviewField,
    ],
  },
  // ---------------- Games
  {
    id: "quizzes",
    title: "Quizzes",
    group: "Games",
    file: "quizzes",
    path: [],
    kind: "list",
    description: "Quiz sets. Every question has 3 answers and an explanation.",
    itemTitle: (x) => s(x.title),
    itemSubtitle: (x) => `${Array.isArray(x.questions) ? x.questions.length : 0} questions · ${s((x.review as Obj)?.status)}`,
    canAdd: true,
    canDelete: true,
    canReorder: true,
    newItem: () => ({ id: "", title: "New quiz", illustration: "quiz", questions: [{ id: "", question: "", options: ["", "", ""], answer: 0, explanation: "" }], review: draftReview() }),
    fields: [
      { key: "id", label: "ID", type: "id" },
      { key: "title", label: "Title", type: "text" },
      { key: "illustration", label: "Picture", type: "illustration" },
      { key: "questions", label: "Questions", type: "list", itemLabel: "question", titleOf: (x, i) => s(x.question) || `Question ${i + 1}`, newItem: () => ({ id: "", question: "", options: ["", "", ""], answer: 0, explanation: "" }), fields: [
        { key: "id", label: "Question ID", type: "id" },
        { key: "question", label: "Question", type: "text", multiline: true },
        { key: "options", label: "Answers (exactly 3)", type: "textList", itemLabel: "answer" },
        { key: "answer", label: "Right answer", type: "answer" },
        { key: "explanation", label: "Explanation", type: "text", multiline: true, help: "Shown after the right answer is found." },
      ] },
      reviewField,
    ],
  },
  {
    id: "games",
    title: "Game names & instructions",
    group: "Games",
    file: "games",
    path: [],
    kind: "list",
    description: "The seven Puzzle Palace games. Their names, descriptions and instructions can be changed.",
    itemTitle: (x) => s(x.title),
    canReorder: true,
    fields: [
      { key: "title", label: "Name", type: "text" },
      { key: "description", label: "Description", type: "text" },
      { key: "illustration", label: "Picture", type: "illustration" },
      { key: "howToPlay", label: "How to play", type: "textList", itemLabel: "step" },
    ],
  },
  {
    id: "pictureWords",
    title: "Match the Words",
    group: "Games",
    file: "pictureWords",
    path: [],
    kind: "list",
    description: "Words and pictures for the Match the Words game.",
    itemTitle: (x) => s(x.word),
    canAdd: true,
    canDelete: true,
    canReorder: true,
    newItem: () => ({ id: "", word: "", picture: "", illustration: "star", hint: "" }),
    fields: [
      { key: "id", label: "ID", type: "id" },
      { key: "word", label: "Word", type: "text" },
      { key: "illustration", label: "Picture", type: "illustration" },
      { key: "picture", label: "Picture description", type: "text", help: "Read by screen readers, e.g. \"a glowing lantern\"." },
      { key: "hint", label: "Hint after matching", type: "text", multiline: true },
    ],
  },
  {
    id: "sortCards",
    title: "Sort the Good Deeds",
    group: "Games",
    file: "sortCards",
    path: [],
    kind: "list",
    description: "Cards to sort into kind choices and choices that could be better. Explain gently; never shame.",
    itemTitle: (x) => s(x.text),
    itemSubtitle: (x) => (x.helpful ? "Kind choice" : "Could choose better"),
    canAdd: true,
    canDelete: true,
    canReorder: true,
    newItem: () => ({ id: "", text: "", helpful: true, explanation: "", illustration: "smile" }),
    fields: [
      { key: "id", label: "ID", type: "id" },
      { key: "text", label: "Card text", type: "text" },
      { key: "helpful", label: "Is it a kind choice?", type: "boolean", yes: "Kind choice", no: "Could choose better" },
      { key: "explanation", label: "Friendly explanation", type: "text", multiline: true },
      { key: "illustration", label: "Picture", type: "illustration" },
    ],
  },
  {
    id: "memoryCards",
    title: "Memory cards",
    group: "Games",
    file: "memoryCards",
    path: [],
    kind: "list",
    description: "Picture cards for the Memory Cards game.",
    itemTitle: (x) => s(x.label),
    canAdd: true,
    canDelete: true,
    canReorder: true,
    newItem: () => ({ id: "", label: "", illustration: "star" }),
    fields: [
      { key: "id", label: "ID", type: "id" },
      { key: "label", label: "Name", type: "text" },
      { key: "illustration", label: "Picture", type: "illustration" },
    ],
  },
  {
    id: "lanternDesigns",
    title: "Lanterns",
    group: "Games",
    file: "lanternDesigns",
    path: [],
    kind: "list",
    description: "Lanterns for Find the Missing Lantern. Names are read aloud by screen readers, so colour is never the only clue.",
    itemTitle: (x) => s(x.name),
    canAdd: true,
    canDelete: true,
    canReorder: true,
    newItem: () => ({ id: "", name: "", body: "#C8553D", glow: "#FFD27A", shape: "round" }),
    fields: [
      { key: "id", label: "ID", type: "id" },
      { key: "name", label: "Name", type: "text", help: 'e.g. "blue star lantern".' },
      { key: "body", label: "Lantern colour", type: "color" },
      { key: "glow", label: "Glow colour", type: "color" },
      { key: "shape", label: "Shape", type: "select", options: opts(LANTERN_SHAPES) },
    ],
  },
  // ---------------- Journey & kindness
  {
    id: "days",
    title: "Journey days",
    group: "Journey & kindness",
    file: "days",
    path: [],
    kind: "list",
    description: "The 30 days of the Ramadan journey. In a 29-day month, day 30's content becomes day 29 automatically.",
    itemTitle: (x, i) => `Day ${i + 1} · ${s(x.theme)}`,
    itemSubtitle: (x) => s(x.activity),
    fields: [
      { key: "theme", label: "Theme", type: "text" },
      { key: "activity", label: "Today's mission", type: "text" },
      { key: "illustration", label: "Picture", type: "illustration" },
      { key: "learn", label: "Learn", type: "object", fields: [
        { key: "kind", label: "Lesson or story", type: "select", options: opts(["lesson", "story"], { lesson: "Lesson", story: "Story" }) },
        { key: "id", label: "Which one", type: "select", options: (c) => [...idsOf(c, "lessons", (x) => `Lesson: ${s(x.title)}`), ...idsOf(c, "stories", (x) => `Story: ${s(x.title)}`)] },
      ] },
      { key: "kindnessId", label: "Kindness mission", type: "select", options: (c) => idsOf(c, "missions", (x) => s(x.title)) },
      { key: "play", label: "Play", type: "object", fields: [
        { key: "game", label: "Game", type: "select", options: (c) => idsOf(c, "games", (x) => s(x.title)) },
        { key: "quizSetId", label: "Quiz (when the game is the quiz)", type: "select", optional: true, options: (c) => idsOf(c, "quizzes", (x) => s(x.title)) },
      ] },
      { key: "reflection", label: "Think about it (question)", type: "text" },
    ],
  },
  {
    id: "missions",
    title: "Kindness missions",
    group: "Journey & kindness",
    file: "missions",
    path: [],
    kind: "list",
    description: "Good deeds for Kindness Street. Missions with food, heat, giving, visiting or calling must say a grown-up is needed.",
    itemTitle: (x) => s(x.title),
    itemSubtitle: (x) => (x.adultHelpRequired ? "With a grown-up" : ""),
    canAdd: true,
    canDelete: true,
    canReorder: true,
    newItem: () => ({ id: "", title: "", description: "", category: "kindness", adultHelpRequired: false, illustration: "heart-hands", reflectionPrompt: "How did it feel?" }),
    fields: [
      { key: "id", label: "ID", type: "id" },
      { key: "title", label: "Title", type: "text" },
      { key: "description", label: "One-sentence explanation", type: "text", multiline: true },
      { key: "category", label: "Category", type: "select", options: opts(["kindness", "learning", "family", "reflection"]) },
      { key: "adultHelpRequired", label: "Does it need a grown-up?", type: "boolean", yes: "Yes, with a grown-up", no: "No" },
      { key: "safetyNote", label: "Safety note", type: "text", optional: true, help: "Required when a grown-up is needed." },
      { key: "illustration", label: "Picture", type: "illustration" },
      { key: "reflectionPrompt", label: "Reflection question", type: "text" },
    ],
  },
  {
    id: "goals",
    title: "Ramadan goals",
    group: "Journey & kindness",
    file: "goals",
    path: [],
    kind: "list",
    description: "Personal goals children can choose with a parent.",
    itemTitle: (x) => s(x.title),
    canAdd: true,
    canDelete: true,
    canReorder: true,
    newItem: () => ({ id: "", title: "", description: "", illustration: "star" }),
    fields: [
      { key: "id", label: "ID", type: "id" },
      { key: "title", label: "Title", type: "text" },
      { key: "description", label: "Description", type: "text" },
      { key: "illustration", label: "Picture", type: "illustration" },
    ],
  },
  // ---------------- Rewards
  {
    id: "badges",
    title: "Badges",
    group: "Rewards",
    file: "badges",
    path: [],
    kind: "list",
    description: "Badges reward learning, kindness and taking part. They can never depend on fasting.",
    itemTitle: (x) => s(x.title),
    itemSubtitle: (x) => s(x.hint),
    canAdd: true,
    canDelete: true,
    canReorder: true,
    newItem: () => ({ id: "", title: "", description: "", rule: { type: "count", kind: "any", atLeast: 1 }, hint: "" }),
    fields: [
      { key: "id", label: "ID", type: "id" },
      { key: "title", label: "Name", type: "text" },
      { key: "description", label: "Description", type: "text" },
      { key: "hint", label: "Hint while locked", type: "text" },
      ruleField(),
    ],
  },
  {
    id: "decorations",
    title: "Room decorations",
    group: "Rewards",
    file: "decorations",
    path: [],
    kind: "list",
    description: "Decorations for My Little Ramadan Room. Each one has its own artwork, so they can be renamed and their unlock rules changed, but not added.",
    itemTitle: (x) => s(x.title),
    itemSubtitle: (x) => s(x.hint),
    canReorder: true,
    fields: [
      { key: "title", label: "Name", type: "text" },
      { key: "slot", label: "Where it goes", type: "select", options: opts(ROOM_SLOT_IDS) },
      { key: "hint", label: "Hint while locked", type: "text" },
      ruleField(),
    ],
  },
  // ---------------- Health & First Fast
  {
    id: "firstFastPages",
    title: "My First Fast pages",
    group: "Health & First Fast",
    file: "firstFast",
    path: ["pages"],
    kind: "list",
    description: "Gentle fasting education. Needs Islamic and health-professional review.",
    itemTitle: (x) => s(x.title),
    canAdd: true,
    canDelete: true,
    canReorder: true,
    newItem: () => ({ id: "", title: "", illustration: "star", paragraphs: [""], review: draftReview() }),
    fields: [
      { key: "id", label: "ID", type: "id" },
      { key: "title", label: "Title", type: "text" },
      { key: "illustration", label: "Picture", type: "illustration" },
      { key: "paragraphs", label: "Paragraphs", type: "textList", itemLabel: "paragraph", multiline: true },
      reviewField,
    ],
  },
  {
    id: "journalOptions",
    title: "Journal choices",
    group: "Health & First Fast",
    file: "firstFast",
    path: ["journalOptions"],
    kind: "list",
    description: "The choices in the optional, private fasting journal. They can be reworded; none of them ever earns a reward.",
    itemTitle: (x) => s(x.label),
    fields: [
      { key: "label", label: "Choice", type: "text" },
      { key: "illustration", label: "Picture", type: "illustration" },
    ],
  },
  {
    id: "safety",
    title: "Health & safety messages",
    group: "Health & First Fast",
    file: "safety",
    path: [],
    kind: "object",
    description: "Safety wording needs review by a health professional. The child health message must keep its three key sentences.",
    fields: [
      { key: "childHealthMessage", label: "Child health message", type: "text", multiline: true },
      { key: "childSafetyPoints", label: "Staying safe (children)", type: "textList", itemLabel: "point", multiline: true },
      { key: "notMedicalNotice", label: "Not medical advice notice (parents)", type: "text", multiline: true },
      { key: "notReligiousAuthorityNotice", label: "Not a religious authority notice (parents)", type: "text", multiline: true },
      { key: "parentFastingGuidance", label: "Fasting guidance for parents", type: "textList", itemLabel: "point", multiline: true },
    ],
  },
  {
    id: "firstFastText",
    title: "Journal saved message",
    group: "Health & First Fast",
    file: "firstFast",
    path: [],
    kind: "object",
    description: "Shown after a child saves a journal entry. The same warm message for every choice.",
    fields: [{ key: "savedMessage", label: "Message", type: "text", multiline: true }],
  },
  {
    id: "copy",
    title: "App messages",
    group: "Health & First Fast",
    file: "copy",
    path: [],
    kind: "object",
    description: "Encouraging messages and the gentle break message.",
    fields: [
      { key: "encouragements", label: "Encouragements", type: "textList", itemLabel: "message" },
      { key: "stoppingMessage", label: "Break / stopping message", type: "text", multiline: true },
    ],
  },
  // ---------------- Dhivehi
  {
    id: "dvLetters",
    title: "Letters (alphabet order)",
    group: "Learn Dhivehi",
    file: "dhivehi",
    path: ["letters"],
    kind: "list",
    description: "Thaana letters in alphabet order (haa first). Days 1, 2, 3… of the Dhivehi plan follow this order.",
    itemTitle: (x) => `${s(x.char)}  ${s(x.name)}`,
    itemSubtitle: (x) => `Sound: ${s(x.sound)}`,
    canAdd: true,
    canDelete: true,
    canReorder: true,
    newItem: () => ({ char: "", name: "", sound: "" }),
    fields: [
      { key: "char", label: "Letter", type: "text", thaana: true },
      { key: "name", label: "Name", type: "text" },
      { key: "sound", label: "Sound", type: "text" },
      { key: "example", label: "Example word", type: "object", optional: true, fields: [
        { key: "wordId", label: "Word", type: "select", options: (c) => (((c.dhivehi as Obj)?.words as Obj[]) ?? []).map((w) => ({ value: s(w.id), label: `${s(w.dv)} ${s(w.roman)} (${s(w.en)})` })) },
        { key: "contains", label: "Where is the letter?", type: "boolean", yes: "Inside the word", no: "At the start" },
      ] },
    ],
  },
  {
    id: "dvWords",
    title: "Words",
    group: "Learn Dhivehi",
    file: "dhivehi",
    path: ["words"],
    kind: "list",
    description: "Dhivehi words used in the games. Give each word a picture, or a colour for colour words.",
    itemTitle: (x) => `${s(x.dv)}  ${s(x.roman)} · ${s(x.en)}`,
    itemSubtitle: (x) => s(x.topic),
    canAdd: true,
    canDelete: true,
    canReorder: true,
    newItem: () => ({ id: "", dv: "", roman: "", en: "", picture: "star", topic: "nature" }),
    fields: [
      { key: "id", label: "ID", type: "id" },
      { key: "dv", label: "Word in Thaana", type: "text", thaana: true },
      { key: "roman", label: "In Latin letters", type: "text" },
      { key: "en", label: "English meaning", type: "text" },
      { key: "topic", label: "Topic", type: "select", options: opts(WORD_TOPICS) },
      { key: "picture", label: "Picture", type: "picture", optional: true },
      { key: "colour", label: "Colour (colour words only)", type: "color", optional: true },
    ],
  },
  {
    id: "dvFili",
    title: "Fili (vowel signs)",
    group: "Learn Dhivehi",
    file: "dhivehi",
    path: ["fili"],
    kind: "list",
    description: "Vowel signs used in the Fili sounds game.",
    itemTitle: (x) => `ބ${s(x.char)}  ${s(x.name)}`,
    canAdd: true,
    canDelete: true,
    canReorder: true,
    newItem: () => ({ char: "", name: "", vowel: "" }),
    fields: [
      { key: "char", label: "Fili mark", type: "text", thaana: true },
      { key: "name", label: "Name", type: "text" },
      { key: "vowel", label: "Vowel sound", type: "text" },
    ],
  },
  {
    id: "dvFiliConsonants",
    title: "Fili game letters",
    group: "Learn Dhivehi",
    file: "dhivehi",
    path: ["filiConsonants"],
    kind: "list",
    description: "Letters combined with fili in the Fili sounds game.",
    itemTitle: (x) => `${s(x.char)}  ${s(x.roman)}`,
    canAdd: true,
    canDelete: true,
    canReorder: true,
    newItem: () => ({ char: "", roman: "" }),
    fields: [
      { key: "char", label: "Letter", type: "text", thaana: true },
      { key: "roman", label: "Sound in Latin letters", type: "text" },
    ],
  },
  {
    id: "dvNumbers",
    title: "Numbers 1–10",
    group: "Learn Dhivehi",
    file: "dhivehi",
    path: ["numbers"],
    kind: "list",
    description: "Number words for counting and sums.",
    itemTitle: (x) => `${String(x.n)} · ${s(x.dv)}  ${s(x.roman)}`,
    fields: [
      { key: "dv", label: "In Thaana", type: "text", thaana: true },
      { key: "roman", label: "In Latin letters", type: "text" },
    ],
  },
  {
    id: "dvGames",
    title: "Dhivehi games",
    group: "Learn Dhivehi",
    file: "dhivehi",
    path: ["games"],
    kind: "list",
    description: "Names and instructions for the 12 Dhivehi games.",
    itemTitle: (x) => s(x.title),
    canReorder: true,
    fields: [
      { key: "title", label: "Name", type: "text" },
      { key: "description", label: "Description", type: "text" },
      { key: "howToPlay", label: "How to play", type: "textList", itemLabel: "step" },
      { key: "picture", label: "Picture", type: "picture" },
      { key: "tone", label: "Card colour", type: "select", options: opts(DV_GAME_TONES) },
    ],
  },
  {
    id: "dvReview",
    title: "Dhivehi review status",
    group: "Learn Dhivehi",
    file: "dhivehi",
    path: [],
    kind: "object",
    description: "Dhivehi spellings, letter names and romanisation should be checked by a Dhivehi teacher.",
    fields: [reviewField],
  },
];

function ruleField(): Field {
  return {
    key: "rule",
    label: "How to unlock it",
    type: "object",
    fields: [
      { key: "type", label: "Unlock when…", type: "select", options: opts(["start", "count", "days", "stars", "gamesExplored"], { start: "Ready from the start", count: "Some activities are done", days: "Some journey days are finished", stars: "Some stars are collected", gamesExplored: "Some games have been tried" }) },
      { key: "kind", label: "Which activities", type: "select", optional: true, options: opts(["any", ...COMPLETION_KINDS.filter((k) => k !== "reflection" && k !== "dayplay")], { any: "Any activity" }) },
      { key: "atLeast", label: "How many", type: "number", min: 1, max: 500 },
    ],
  };
}

export { REVIEW_STATUSES };
