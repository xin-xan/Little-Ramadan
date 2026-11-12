/**
 * Content validation shared by the unit tests, the production build (bad content never
 * deploys) and the admin dashboard (checked before publishing). Works on raw JSON, so it
 * also catches type mistakes made while editing.
 */
import { ILLUSTRATION_KEYS } from "@/components/art/illustrationKeys";
import { COMPLETION_KINDS } from "@/storage/schema";
import { PICTURE_KEYS } from "./dhivehi";

/** Every editable content file in src/content/data/, by collection key. */
export const CONTENT_FILES = {
  lessons: "lessons.json",
  stories: "stories.json",
  missions: "missions.json",
  quizzes: "quizzes.json",
  days: "days.json",
  games: "games.json",
  vocabulary: "vocabulary.json",
  pictureWords: "picture-words.json",
  sortCards: "sort-cards.json",
  lanternDesigns: "lantern-designs.json",
  memoryCards: "memory-cards.json",
  goals: "goals.json",
  badges: "badges.json",
  firstFast: "first-fast.json",
  safety: "safety.json",
  copy: "copy.json",
  dhivehi: "dhivehi.json",
} as const;
export type ContentKey = keyof typeof CONTENT_FILES;
export type ContentBundle = Record<ContentKey, unknown>;

export interface Issue {
  file: ContentKey;
  /** Where in the file, e.g. "lessons[3].sections[1].text". */
  path: string;
  message: string;
}

/** Games and Dhivehi games each have their own screen in code: they can be edited, not added. */
export const GAME_IDS = ["quiz", "match-words", "missing-lantern", "mosque-puzzle", "sort-deeds", "memory-cards", "vocab-match"];
export const DV_GAME_IDS = ["letters", "trace", "bubbles", "find-word", "first-letter", "count", "colours", "fili", "memory", "build-word", "sums", "ramadan-words"];
export const JOURNAL_VALUES = ["practice", "partial", "full", "not_fast", "memory"];
export const REVIEW_STATUSES = ["draft", "in_review", "reviewed"];
export const WORD_TOPICS = ["nature", "animals", "home", "food", "body", "colours", "ramadan"];
export const DV_GAME_TONES = ["sky", "lavender", "rose", "gold", "emerald", "mint"];
export const LANTERN_SHAPES = ["round", "tall", "star", "diamond"];
export const ID_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const IMAGE_KEY = /^img:[a-zA-Z0-9][a-zA-Z0-9._-]*\.(webp|png|jpe?g|svg)$/;

/** Wording that must never reach children (shame, pressure, fear or purchases). */
export const BANNED_CHILD_WORDING = [/you failed/i, /lost your streak/i, /\bstreak\b(?!s? for)/i, /real champions/i, /must finish/i, /you must fast/i, /don't tell/i, /shame/i, /naughty/i, /\bbad (boy|girl|child)\b/i, /hell(fire)?\b/i, /punish/i, /buy\b/i, /purchase/i, /\bshop\b/i];
/** No Quran or hadith quotations, references or attributions (they need a qualified reviewer first). */
export const RELIGIOUS_QUOTATION = /\b(surah|sura)\s+[A-Z][a-z-]+\s*\(?\d|\b\d{1,3}\s*:\s*\d{1,3}\b|narrated by|hadith|sahih|bukhari|muslim reported|the prophet said|allah says/i;
/** No prayer or fasting times, and no claim about which night is Laylatul Qadr. */
export const TIMES_OR_DATES = /\b\d{1,2}:\d{2}\s?(am|pm)?\b|laylatul qadr is (on )?the \d|27th night is/i;
export const MEDICAL_PROMISE = /safe for (all|every) child|guarantee|cure|healthy to fast/i;

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);

/** Validates every content file. Returns an empty list when everything is fine. */
export function validateContent(c: ContentBundle, opts: { images?: Set<string> } = {}): Issue[] {
  const issues: Issue[] = [];
  let file: ContentKey = "lessons";
  const err = (path: string, message: string) => issues.push({ file, path, message });

  const text = (v: unknown, path: string, min = 1) => {
    if (typeof v !== "string" || v.trim().length < min) err(path, min > 1 ? `Needs at least ${min} characters.` : "Can't be empty.");
    return typeof v === "string" ? v : "";
  };
  const textList = (v: unknown, path: string, minItems = 1) => {
    if (!Array.isArray(v) || v.length < minItems) return err(path, `Needs at least ${minItems} item${minItems === 1 ? "" : "s"}.`);
    v.forEach((x, i) => text(x, `${path}[${i}]`));
  };
  const oneOf = (v: unknown, allowed: readonly string[], path: string) => {
    if (typeof v !== "string" || !allowed.includes(v)) err(path, `Must be one of: ${allowed.join(", ")}.`);
  };
  const imageExists = (key: string, path: string) => {
    if (!IMAGE_KEY.test(key)) return err(path, `"${key}" is not a valid picture name.`);
    if (opts.images && !opts.images.has(key.slice(4))) err(path, `Picture "${key.slice(4)}" has not been uploaded.`);
  };
  const illustration = (v: unknown, path: string) => {
    if (typeof v !== "string") return err(path, "Choose a picture.");
    if (v.startsWith("img:")) return imageExists(v, path);
    if (!(ILLUSTRATION_KEYS as readonly string[]).includes(v)) err(path, `Unknown picture "${v}".`);
  };
  const picture = (v: unknown, path: string) => {
    if (typeof v !== "string") return err(path, "Choose a picture.");
    if (v.startsWith("img:")) return imageExists(v, path);
    if (!(PICTURE_KEYS as readonly string[]).includes(v)) err(path, `Unknown picture "${v}".`);
  };
  const review = (v: unknown, path: string) => {
    if (!isObj(v)) return err(path, "Needs a review status.");
    oneOf(v.status, REVIEW_STATUSES, `${path}.status`);
  };
  const list = (v: unknown, path: string, min = 0): Obj[] => {
    if (!Array.isArray(v)) {
      err(path, "Must be a list.");
      return [];
    }
    if (v.length < min) err(path, `Needs at least ${min} item${min === 1 ? "" : "s"}.`);
    return v.map((x, i) => {
      if (!isObj(x)) err(`${path}[${i}]`, "Must be an item with fields.");
      return isObj(x) ? x : {};
    });
  };
  const ids = (items: Obj[], path: string, key = "id") => {
    const seen = new Set<string>();
    items.forEach((x, i) => {
      const id = x[key];
      if (typeof id !== "string" || !ID_PATTERN.test(id)) err(`${path}[${i}].${key}`, "ID must be lower-case words joined by hyphens, e.g. \"my-new-story\".");
      else if (seen.has(id)) err(`${path}[${i}].${key}`, `ID "${id}" is used twice.`);
      else seen.add(id);
    });
    return seen;
  };
  const rule = (v: unknown, path: string) => {
    if (!isObj(v)) return err(path, "Needs an unlock rule.");
    oneOf(v.type, ["start", "count", "stars", "days", "gamesExplored"], `${path}.type`);
    if (v.type === "count") oneOf(v.kind, ["any", ...COMPLETION_KINDS.filter((k) => k !== "reflection" && k !== "dayplay")], `${path}.kind`);
    if (v.type !== "start" && (typeof v.atLeast !== "number" || !Number.isInteger(v.atLeast) || v.atLeast < 1 || v.atLeast > 500)) err(`${path}.atLeast`, "Must be a whole number from 1 to 500.");
  };
  const childSafe = (v: unknown, path: string) => {
    const s = JSON.stringify(v);
    for (const re of BANNED_CHILD_WORDING) if (re.test(s)) err(path, `Wording not allowed for children: matches ${re}.`);
  };

  // ---- Lessons
  file = "lessons";
  const lessons = list(c.lessons, "lessons", 1);
  const lessonIds = ids(lessons, "lessons");
  lessons.forEach((l, i) => {
    const p = `lessons[${i}]`;
    text(l.title, `${p}.title`);
    text(l.summary, `${p}.summary`);
    illustration(l.illustration, `${p}.illustration`);
    oneOf(l.guide, ["noor", "amina", "hilmy"], `${p}.guide`);
    if (typeof l.minutes !== "number" || l.minutes < 2 || l.minutes > 4) err(`${p}.minutes`, "Lessons take 2 to 4 minutes.");
    const sections = list(l.sections, `${p}.sections`, 1);
    sections.forEach((s, j) => {
      text(s.heading, `${p}.sections[${j}].heading`);
      text(s.text, `${p}.sections[${j}].text`);
    });
    const words = sections.map((s) => String(s.text ?? "")).join(" ").split(/\s+/).length;
    if (words > 420) err(`${p}.sections`, `Too long for a 2–4 minute lesson (${words} words; keep it under 420).`);
    list(l.keyWords, `${p}.keyWords`).forEach((k, j) => {
      text(k.word, `${p}.keyWords[${j}].word`);
      text(k.meaning, `${p}.keyWords[${j}].meaning`);
    });
    text(l.tryThis, `${p}.tryThis`);
    if (typeof l.sourceNote !== "string") err(`${p}.sourceNote`, "Add a source note for the reviewer (can be short).");
    review(l.review, `${p}.review`);
    childSafe(l, p);
  });

  // ---- Stories
  file = "stories";
  const stories = list(c.stories, "stories", 1);
  const storyIds = ids(stories, "stories");
  stories.forEach((s, i) => {
    const p = `stories[${i}]`;
    text(s.title, `${p}.title`);
    text(s.summary, `${p}.summary`);
    text(s.value, `${p}.value`);
    illustration(s.illustration, `${p}.illustration`);
    if (typeof s.minutes !== "number" || s.minutes < 1 || s.minutes > 6) err(`${p}.minutes`, "Use 1 to 6 minutes.");
    list(s.pages, `${p}.pages`, 3).forEach((pg, j) => {
      text(pg.text, `${p}.pages[${j}].text`);
      illustration(pg.illustration, `${p}.pages[${j}].illustration`);
    });
    review(s.review, `${p}.review`);
    childSafe(s, p);
  });

  // ---- Kindness missions
  file = "missions";
  const missions = list(c.missions, "missions", 1);
  const missionIds = ids(missions, "missions");
  missions.forEach((m, i) => {
    const p = `missions[${i}]`;
    const t = `${text(m.title, `${p}.title`)} ${text(m.description, `${p}.description`)}`.toLowerCase();
    oneOf(m.category, ["kindness", "learning", "family", "reflection"], `${p}.category`);
    illustration(m.illustration, `${p}.illustration`);
    text(m.reflectionPrompt, `${p}.reflectionPrompt`);
    if (typeof m.adultHelpRequired !== "boolean") err(`${p}.adultHelpRequired`, "Choose yes or no.");
    if (/iftar|cook|scissor|give food|in need|visit|call|neighbour|mosque/.test(t) && m.adultHelpRequired !== true) err(`${p}.adultHelpRequired`, "Missions about food, cooking, giving, visiting or calling must say a grown-up is needed.");
    if (m.adultHelpRequired === true && !(typeof m.safetyNote === "string" && m.safetyNote.trim())) err(`${p}.safetyNote`, "Add a safety note when a grown-up is needed.");
    if (/photo|camera|picture of (them|someone)|name of|post online|share online/i.test(JSON.stringify(m))) err(p, "Missions must never ask children to photograph, name or post about people.");
    childSafe(m, p);
  });

  // ---- Quizzes
  file = "quizzes";
  const quizzes = list(c.quizzes, "quizzes", 1);
  const quizIds = ids(quizzes, "quizzes");
  const qIds = new Set<string>();
  quizzes.forEach((q, i) => {
    const p = `quizzes[${i}]`;
    text(q.title, `${p}.title`);
    illustration(q.illustration, `${p}.illustration`);
    review(q.review, `${p}.review`);
    list(q.questions, `${p}.questions`, 1).forEach((x, j) => {
      const qp = `${p}.questions[${j}]`;
      if (typeof x.id !== "string" || !ID_PATTERN.test(x.id)) err(`${qp}.id`, "Question ID must be lower-case letters, numbers and hyphens.");
      else if (qIds.has(x.id)) err(`${qp}.id`, `Question ID "${x.id}" is used twice.`);
      else qIds.add(x.id);
      text(x.question, `${qp}.question`);
      const opts = Array.isArray(x.options) ? x.options : [];
      if (opts.length !== 3) err(`${qp}.options`, "Needs exactly 3 answers.");
      opts.forEach((o, k) => text(o, `${qp}.options[${k}]`));
      if (new Set(opts).size !== opts.length) err(`${qp}.options`, "The answers must all be different.");
      if (![0, 1, 2].includes(x.answer as number)) err(`${qp}.answer`, "Choose which answer is right.");
      text(x.explanation, `${qp}.explanation`, 16);
      if (opts.some((o) => /secret/i.test(String(o))) && /secret/i.test(String(opts[x.answer as number] ?? ""))) err(`${qp}.answer`, "Keeping secrets can never be the right answer.");
    });
    childSafe(q, p);
  });

  // ---- Games (fixed set) and game data
  file = "games";
  const games = list(c.games, "games");
  const gameIds = new Set(games.map((g) => g.id as string));
  if (games.length !== GAME_IDS.length || GAME_IDS.some((g) => !gameIds.has(g))) err("games", `Games can be edited but not added or removed (${GAME_IDS.join(", ")}).`);
  games.forEach((g, i) => {
    text(g.title, `games[${i}].title`);
    text(g.description, `games[${i}].description`);
    illustration(g.illustration, `games[${i}].illustration`);
    textList(g.howToPlay, `games[${i}].howToPlay`);
    childSafe(g, `games[${i}]`);
  });
  file = "vocabulary";
  const vocab = list(c.vocabulary, "vocabulary", 4);
  ids(vocab, "vocabulary");
  vocab.forEach((v, i) => {
    text(v.word, `vocabulary[${i}].word`);
    text(v.meaning, `vocabulary[${i}].meaning`);
    illustration(v.illustration, `vocabulary[${i}].illustration`);
    review(v.review, `vocabulary[${i}].review`);
  });
  file = "pictureWords";
  const pws = list(c.pictureWords, "pictureWords", 4);
  ids(pws, "pictureWords");
  pws.forEach((v, i) => {
    text(v.word, `pictureWords[${i}].word`);
    text(v.picture, `pictureWords[${i}].picture`);
    text(v.hint, `pictureWords[${i}].hint`);
    illustration(v.illustration, `pictureWords[${i}].illustration`);
  });
  file = "sortCards";
  const sorts = list(c.sortCards, "sortCards", 4);
  ids(sorts, "sortCards");
  sorts.forEach((v, i) => {
    text(v.text, `sortCards[${i}].text`);
    text(v.explanation, `sortCards[${i}].explanation`);
    illustration(v.illustration, `sortCards[${i}].illustration`);
    if (typeof v.helpful !== "boolean") err(`sortCards[${i}].helpful`, "Choose kind or not.");
    childSafe(v, `sortCards[${i}]`);
  });
  if (!sorts.some((s) => s.helpful === true) || !sorts.some((s) => s.helpful === false)) err("sortCards", "Needs some kind choices and some that could be better.");
  file = "lanternDesigns";
  const lanterns = list(c.lanternDesigns, "lanternDesigns", 4);
  ids(lanterns, "lanternDesigns");
  lanterns.forEach((v, i) => {
    text(v.name, `lanternDesigns[${i}].name`);
    for (const k of ["body", "glow"]) if (typeof v[k] !== "string" || !/^#[0-9a-fA-F]{6}$/.test(v[k] as string)) err(`lanternDesigns[${i}].${k}`, "Use a colour like #C8553D.");
    oneOf(v.shape, LANTERN_SHAPES, `lanternDesigns[${i}].shape`);
  });
  file = "memoryCards";
  const mem = list(c.memoryCards, "memoryCards", 4);
  ids(mem, "memoryCards");
  mem.forEach((v, i) => {
    text(v.label, `memoryCards[${i}].label`);
    illustration(v.illustration, `memoryCards[${i}].illustration`);
  });

  // ---- Journey days (exactly 30; the 29-day month folds day 29 into day 30)
  file = "days";
  const days = list(c.days, "days");
  if (days.length !== 30) err("days", "The journey has exactly 30 days (a 29-day month is handled automatically).");
  days.forEach((d, i) => {
    const p = `days[${i}]`;
    text(d.theme, `${p}.theme`);
    text(d.activity, `${p}.activity`);
    text(d.reflection, `${p}.reflection`, 6);
    illustration(d.illustration, `${p}.illustration`);
    const learn = isObj(d.learn) ? d.learn : {};
    oneOf(learn.kind, ["lesson", "story"], `${p}.learn.kind`);
    if (!(learn.kind === "lesson" ? lessonIds : storyIds).has(learn.id as string)) err(`${p}.learn.id`, `No ${String(learn.kind ?? "lesson")} with ID "${String(learn.id ?? "")}".`);
    if (!missionIds.has(d.kindnessId as string)) err(`${p}.kindnessId`, `No kindness mission with ID "${String(d.kindnessId ?? "")}".`);
    const play = isObj(d.play) ? d.play : {};
    oneOf(play.game, GAME_IDS, `${p}.play.game`);
    if (play.game === "quiz" && !quizIds.has(play.quizSetId as string)) err(`${p}.play.quizSetId`, "Choose which quiz to play.");
    childSafe(d, p);
  });

  // ---- Goals and badges
  file = "goals";
  const goals = list(c.goals, "goals", 1);
  ids(goals, "goals");
  goals.forEach((g, i) => {
    text(g.title, `goals[${i}].title`);
    text(g.description, `goals[${i}].description`);
    illustration(g.illustration, `goals[${i}].illustration`);
    childSafe(g, `goals[${i}]`);
  });
  for (const key of ["badges"] as const) {
    file = key;
    const items = list(c[key], key, 1);
    ids(items, key);
    items.forEach((b, i) => {
      text(b.title, `${key}[${i}].title`);
      text(b.hint, `${key}[${i}].hint`, 4);
      text(b.description, `${key}[${i}].description`);
      rule(b.rule, `${key}[${i}].rule`);
      // Rewards never depend on fasting.
      if (/fast|journal/i.test(JSON.stringify(b.rule ?? ""))) err(`${key}[${i}].rule`, "Rewards can never depend on fasting or the journal.");
      childSafe(b, `${key}[${i}]`);
    });
  }

  // ---- First Fast, safety, copy
  file = "firstFast";
  const ff = isObj(c.firstFast) ? c.firstFast : (err("firstFast", "Missing."), {});
  const pages = list(ff.pages, "firstFast.pages", 1);
  ids(pages, "firstFast.pages");
  pages.forEach((pg, i) => {
    text(pg.title, `firstFast.pages[${i}].title`);
    illustration(pg.illustration, `firstFast.pages[${i}].illustration`);
    textList(pg.paragraphs, `firstFast.pages[${i}].paragraphs`);
    review(pg.review, `firstFast.pages[${i}].review`);
  });
  const journal = list(ff.journalOptions, "firstFast.journalOptions");
  const values = journal.map((o) => o.value);
  if (values.length !== JOURNAL_VALUES.length || JOURNAL_VALUES.some((v) => !values.includes(v))) err("firstFast.journalOptions", `Journal choices can be reworded but not added or removed (${JOURNAL_VALUES.join(", ")}).`);
  journal.forEach((o, i) => {
    text(o.label, `firstFast.journalOptions[${i}].label`);
    illustration(o.illustration, `firstFast.journalOptions[${i}].illustration`);
  });
  text(ff.savedMessage, "firstFast.savedMessage");
  childSafe(ff, "firstFast");

  file = "safety";
  const sf = isObj(c.safety) ? c.safety : (err("safety", "Missing."), {});
  const health = text(sf.childHealthMessage, "safety.childHealthMessage");
  for (const must of ["Your health comes first!", "tell your parent or another trusted adult straight away", "You can stop fasting whenever you need to"])
    if (!health.includes(must)) err("safety.childHealthMessage", `The health message must include: "${must}".`);
  textList(sf.childSafetyPoints, "safety.childSafetyPoints");
  text(sf.notMedicalNotice, "safety.notMedicalNotice");
  text(sf.notReligiousAuthorityNotice, "safety.notReligiousAuthorityNotice");
  textList(sf.parentFastingGuidance, "safety.parentFastingGuidance");

  file = "copy";
  const cp = isObj(c.copy) ? c.copy : (err("copy", "Missing."), {});
  textList(cp.encouragements, "copy.encouragements");
  text(cp.stoppingMessage, "copy.stoppingMessage");
  childSafe(cp, "copy");

  // ---- Dhivehi
  file = "dhivehi";
  const dv = isObj(c.dhivehi) ? c.dhivehi : (err("dhivehi", "Missing."), {});
  review(dv.review, "dhivehi.review");
  const thaana = /^[ހ-޿]+$/;
  const letters = list(dv.letters, "dhivehi.letters", 1);
  const names = new Set<string>();
  const wordIds = ids(list(dv.words, "dhivehi.words", 4), "dhivehi.words");
  letters.forEach((l, i) => {
    const p = `dhivehi.letters[${i}]`;
    if (typeof l.char !== "string" || [...l.char].length !== 1 || !thaana.test(l.char)) err(`${p}.char`, "Must be one Thaana letter.");
    const n = text(l.name, `${p}.name`);
    if (names.has(n)) err(`${p}.name`, `Letter name "${n}" is used twice.`);
    names.add(n);
    text(l.sound, `${p}.sound`);
    if (l.example !== undefined) {
      const ex = isObj(l.example) ? l.example : {};
      if (!wordIds.has(ex.wordId as string)) err(`${p}.example.wordId`, `No Dhivehi word with ID "${String(ex.wordId ?? "")}".`);
    }
  });
  list(dv.words, "dhivehi.words").forEach((w, i) => {
    const p = `dhivehi.words[${i}]`;
    if (typeof w.dv !== "string" || !thaana.test(w.dv.replace(/\s/g, ""))) err(`${p}.dv`, "Write the word in Thaana letters.");
    text(w.roman, `${p}.roman`);
    text(w.en, `${p}.en`);
    oneOf(w.topic, WORD_TOPICS, `${p}.topic`);
    if (w.picture !== undefined) picture(w.picture, `${p}.picture`);
    if (w.colour !== undefined && (typeof w.colour !== "string" || !/^#[0-9a-fA-F]{6}$/.test(w.colour))) err(`${p}.colour`, "Use a colour like #2F80ED.");
    if (w.picture === undefined && w.colour === undefined) err(p, "Give the word a picture or a colour.");
  });
  list(dv.fili, "dhivehi.fili", 1).forEach((f, i) => {
    if (typeof f.char !== "string" || !thaana.test(f.char)) err(`dhivehi.fili[${i}].char`, "Must be a Thaana fili mark.");
    text(f.name, `dhivehi.fili[${i}].name`);
    text(f.vowel, `dhivehi.fili[${i}].vowel`);
  });
  list(dv.filiConsonants, "dhivehi.filiConsonants", 1).forEach((f, i) => {
    if (typeof f.char !== "string" || !thaana.test(f.char)) err(`dhivehi.filiConsonants[${i}].char`, "Must be a Thaana letter.");
    text(f.roman, `dhivehi.filiConsonants[${i}].roman`);
  });
  const nums = list(dv.numbers, "dhivehi.numbers", 10);
  nums.forEach((n, i) => {
    if (n.n !== i + 1) err(`dhivehi.numbers[${i}].n`, `Numbers go in order: this should be ${i + 1}.`);
    if (typeof n.dv !== "string" || !thaana.test(n.dv)) err(`dhivehi.numbers[${i}].dv`, "Write the number in Thaana letters.");
    text(n.roman, `dhivehi.numbers[${i}].roman`);
  });
  const dvGames = list(dv.games, "dhivehi.games");
  const dvIds = new Set(dvGames.map((g) => g.id as string));
  if (dvGames.length !== DV_GAME_IDS.length || DV_GAME_IDS.some((g) => !dvIds.has(g))) err("dhivehi.games", `Dhivehi games can be edited but not added or removed (${DV_GAME_IDS.join(", ")}).`);
  dvGames.forEach((g, i) => {
    text(g.title, `dhivehi.games[${i}].title`);
    text(g.description, `dhivehi.games[${i}].description`);
    textList(g.howToPlay, `dhivehi.games[${i}].howToPlay`);
    picture(g.picture, `dhivehi.games[${i}].picture`);
    oneOf(g.tone, DV_GAME_TONES, `dhivehi.games[${i}].tone`);
  });

  // ---- Rules for all content
  for (const key of Object.keys(CONTENT_FILES) as ContentKey[]) {
    file = key;
    const all = JSON.stringify(c[key] ?? "");
    if (RELIGIOUS_QUOTATION.test(all)) err(key, "Quran or hadith quotations and references need a qualified reviewer and can't be added here.");
    if (TIMES_OR_DATES.test(all)) err(key, "Don't add prayer or fasting times, or say which night is Laylatul Qadr.");
    if (key !== "safety" && MEDICAL_PROMISE.test(all)) err(key, "No medical promises.");
    if (/my first ramadan/i.test(all)) err(key, 'The app is called "Little Ramadan".');
  }
  return issues;
}
