/**
 * Versioned local data model. Everything stays on the device (IndexedDB).
 * Rewards are never stored as counters: they are derived from `completions`
 * (see rewards.ts) so they cannot drift and fasting can never affect them.
 */

export const DB_NAME = "little-ramadan";
export const DB_VERSION = 1;
/** Version of the record shapes below. Bump and add a migration when they change. */
export const SCHEMA_VERSION = 1;

export const STORES = {
  kv: "kv",
  completions: "completions",
  journal: "journal",
  goals: "goals",
} as const;

export interface ChildProfile {
  nickname: string;
  avatar: string;
  createdAt: string;
}

export type RamadanLength = 29 | 30;

export interface CalendarSettings {
  /** ISO date (YYYY-MM-DD) chosen by the parent from local official announcements. */
  startDate: string | null;
  length: RamadanLength;
  /** When true, every journey day is open now (otherwise days open on their date). */
  openAllDays: boolean;
}

export interface Settings {
  soundOn: boolean;
  reducedMotion: boolean;
  /** "auto" picks the simple village on low-powered devices. */
  villageMode: "auto" | "scene" | "simple";
  journalEnabled: boolean;
  /** Show the private Salah tracker on the home screen. */
  salahTracker: boolean;
  /** Island whose prayer times are used (Maldives timetable island id; default Malé). */
  prayerIsland: number;
  calendar: CalendarSettings;
  screenTime: { enabled: boolean; minutes: number };
  /** PBKDF2 hash of an optional parent PIN. Never stored in plain text. */
  parentPin: { hash: string; salt: string } | null;
  consentAt: string | null;
  seenBadges: string[];
}

export const DEFAULT_SETTINGS: Settings = {
  soundOn: true,
  reducedMotion: false,
  villageMode: "auto",
  journalEnabled: false,
  salahTracker: true,
  prayerIsland: 102,
  calendar: { startDate: null, length: 30, openAllDays: false },
  screenTime: { enabled: false, minutes: 20 },
  parentPin: null,
  consentAt: null,
  seenBadges: [],
};

/** Activity kinds that can be completed. "journal" is intentionally not one of them. */
export const COMPLETION_KINDS = ["lesson", "story", "kindness", "quiz", "game", "goal", "reflection", "dayplay", "dhivehi", "salah", "salah-late", "fast"] as const;
/** Journal choices that count as a fast for the daily fasting reward (owner decision; same reward for each). */
export const FAST_EXPERIENCES = ["practice", "partial", "full"] as const;
export type CompletionKind = (typeof COMPLETION_KINDS)[number];

export interface Completion {
  /** `${kind}:${contentId}` — an activity is rewarded once. */
  id: string;
  kind: CompletionKind;
  contentId: string;
  /** Journey day number the child launched it from (if any). */
  day?: number;
  completedAt: string;
  /** Optional private reflection text. */
  reflection?: string;
}

export const JOURNAL_EXPERIENCES = ["practice", "partial", "full", "not_fast", "memory"] as const;
export type JournalExperience = (typeof JOURNAL_EXPERIENCES)[number];

export interface JournalEntry {
  id: string;
  /** Local date YYYY-MM-DD */
  date: string;
  experience: JournalExperience;
  note?: string;
  createdAt: string;
}

export interface GoalRecord {
  id: string; // goal content id
  chosenAt: string;
  completedAt?: string;
}


/** The five daily prayers, in order. */
export const PRAYERS = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;
export type Prayer = (typeof PRAYERS)[number];
/**
 * Private Salah log: local date (YYYY-MM-DD) -> prayers the child marked. Kept on the device
 * for the last 60 days only. Never scored, counted, rewarded or turned into a streak.
 */
export type SalahLog = Record<string, Prayer[]>;
export const SALAH_KEEP_DAYS = 60;

export function validateSalahLog(v: unknown, today = new Date()): SalahLog {
  if (!isObj(v)) return {};
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() - SALAH_KEEP_DAYS);
  const out: SalahLog = {};
  for (const [date, list] of Object.entries(v)) {
    if (!isIsoDate(date) || !Array.isArray(list) || new Date(`${date}T12:00:00`) < cutoff) continue;
    const prayers = PRAYERS.filter((p) => list.includes(p));
    if (prayers.length) out[date] = prayers;
  }
  return out;
}

export interface AppData {
  profile: ChildProfile | null;
  settings: Settings;
  completions: Completion[];
  journal: JournalEntry[];
  goals: GoalRecord[];
  salah: SalahLog;
}

export const KV_KEYS = { profile: "profile", settings: "settings", meta: "meta", salah: "salah" } as const;

// ---------- validation (defensive: stored data may be old, partial or corrupted) ----------

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === "string";
const isIsoDate = (v: unknown): v is string => isStr(v) && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));

export const NICKNAME_MIN = 2;
export const NICKNAME_MAX = 16;

/** Returns an error message for children/parents, or null if the nickname is fine. */
export function nicknameProblem(raw: string): string | null {
  const n = raw.trim();
  if (n.length < NICKNAME_MIN) return `Please use at least ${NICKNAME_MIN} letters.`;
  if (n.length > NICKNAME_MAX) return `Please use ${NICKNAME_MAX} letters or fewer.`;
  if (!/^[\p{L}\p{N} '-]+$/u.test(n)) return "Please use only letters, numbers and spaces.";
  if (/\d{4,}/.test(n)) return "Please don't use long numbers (like phone numbers).";
  if (/@/.test(n)) return "Please don't use an email address.";
  return null;
}

export function cleanNickname(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

export function validateProfile(v: unknown): ChildProfile | null {
  if (!isObj(v) || !isStr(v.nickname) || !isStr(v.avatar)) return null;
  if (nicknameProblem(v.nickname)) return null;
  return { nickname: v.nickname, avatar: v.avatar, createdAt: isStr(v.createdAt) ? v.createdAt : new Date().toISOString() };
}

export function validateSettings(v: unknown): Settings {
  const d = DEFAULT_SETTINGS;
  if (!isObj(v)) return structuredClone(d);
  const cal = isObj(v.calendar) ? v.calendar : {};
  const st = isObj(v.screenTime) ? v.screenTime : {};
  const pin = isObj(v.parentPin) && isStr(v.parentPin.hash) && isStr(v.parentPin.salt) ? { hash: v.parentPin.hash, salt: v.parentPin.salt } : null;
  const minutes = typeof st.minutes === "number" && st.minutes >= 5 && st.minutes <= 120 ? Math.round(st.minutes) : d.screenTime.minutes;
  return {
    soundOn: typeof v.soundOn === "boolean" ? v.soundOn : d.soundOn,
    reducedMotion: typeof v.reducedMotion === "boolean" ? v.reducedMotion : d.reducedMotion,
    villageMode: v.villageMode === "scene" || v.villageMode === "simple" || v.villageMode === "auto" ? v.villageMode : d.villageMode,
    journalEnabled: typeof v.journalEnabled === "boolean" ? v.journalEnabled : d.journalEnabled,
    salahTracker: typeof v.salahTracker === "boolean" ? v.salahTracker : d.salahTracker,
    prayerIsland: typeof v.prayerIsland === "number" && Number.isInteger(v.prayerIsland) && v.prayerIsland > 0 && v.prayerIsland < 10000 ? v.prayerIsland : d.prayerIsland,
    calendar: {
      startDate: isIsoDate(cal.startDate) ? cal.startDate : null,
      length: cal.length === 29 ? 29 : 30,
      openAllDays: typeof cal.openAllDays === "boolean" ? cal.openAllDays : false,
    },
    screenTime: { enabled: typeof st.enabled === "boolean" ? st.enabled : false, minutes },
    parentPin: pin,
    consentAt: isStr(v.consentAt) ? v.consentAt : null,
    seenBadges: Array.isArray(v.seenBadges) ? v.seenBadges.filter(isStr) : [],
  };
}

export function validateCompletion(v: unknown): Completion | null {
  if (!isObj(v) || !isStr(v.kind) || !isStr(v.contentId)) return null;
  if (!(COMPLETION_KINDS as readonly string[]).includes(v.kind)) return null;
  const kind = v.kind as CompletionKind;
  const c: Completion = {
    id: `${kind}:${v.contentId}`,
    kind,
    contentId: v.contentId,
    completedAt: isStr(v.completedAt) ? v.completedAt : new Date().toISOString(),
  };
  if (typeof v.day === "number" && Number.isInteger(v.day) && v.day >= 1 && v.day <= 30) c.day = v.day;
  if (isStr(v.reflection) && v.reflection.trim()) c.reflection = v.reflection.slice(0, 300);
  return c;
}

export function validateJournalEntry(v: unknown): JournalEntry | null {
  if (!isObj(v) || !isStr(v.id) || !isIsoDate(v.date) || !isStr(v.experience)) return null;
  if (!(JOURNAL_EXPERIENCES as readonly string[]).includes(v.experience)) return null;
  const e: JournalEntry = {
    id: v.id,
    date: v.date,
    experience: v.experience as JournalExperience,
    createdAt: isStr(v.createdAt) ? v.createdAt : new Date().toISOString(),
  };
  if (isStr(v.note) && v.note.trim()) e.note = v.note.slice(0, 300);
  return e;
}

export function validateGoal(v: unknown): GoalRecord | null {
  if (!isObj(v) || !isStr(v.id)) return null;
  const g: GoalRecord = { id: v.id, chosenAt: isStr(v.chosenAt) ? v.chosenAt : new Date().toISOString() };
  if (isStr(v.completedAt)) g.completedAt = v.completedAt;
  return g;
}

/**
 * Record-shape migrations, applied in order to raw data loaded from older
 * versions. Each receives the raw kv/meta data and returns the upgraded data.
 * Version 1 is the first release, so the list is currently empty.
 */
export type RawData = { profile?: unknown; settings?: unknown; salah?: unknown; completions: unknown[]; journal: unknown[]; goals: unknown[] };
export const MIGRATIONS: { to: number; migrate: (d: RawData) => RawData }[] = [];

export function migrate(raw: RawData, fromVersion: number): RawData {
  let d = raw;
  for (const m of MIGRATIONS) if (m.to > fromVersion && m.to <= SCHEMA_VERSION) d = m.migrate(d);
  return d;
}

export function normalise(raw: RawData): AppData {
  const dedupe = <T extends { id: string }>(xs: (T | null)[]) => {
    const map = new Map<string, T>();
    for (const x of xs) if (x && !map.has(x.id)) map.set(x.id, x);
    return [...map.values()];
  };
  return {
    profile: validateProfile(raw.profile),
    settings: validateSettings(raw.settings),
    salah: validateSalahLog(raw.salah),
    completions: dedupe(raw.completions.map(validateCompletion)),
    journal: dedupe(raw.journal.map(validateJournalEntry)),
    goals: dedupe(raw.goals.map(validateGoal)),
  };
}
