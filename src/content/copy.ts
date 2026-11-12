import data from "./data/copy.json";
/** Shared child-facing copy. Kept here so wording can be reviewed in one place and translated later. */
export const APP_NAME = "Little Ramadan";
export const TAGLINE = "My Little Journey of Faith, Kindness & Discovery.";

export const STAR_VALUES = {
  lesson: 2,
  story: 2,
  kindness: 3,
  quiz: 2,
  goal: 3,
  game: 1,
  reflection: 0,
  dayplay: 0,
  /** A Learn Dhivehi day, or trying a Dhivehi game for the first time. */
  dhivehi: 1,
  /** A prayer marked during its time (owner decision, November 2026). */
  salah: 1,
  /** A prayer marked after its time had passed. */
  "salah-late": 0.5,
  /**
   * A day's fast, part of a day or practising with family: the same for each, never more for
   * longer fasting (owner-approved exception to the spec, November 2026; health guardrails stay).
   */
  fast: 2,
} as const;

export const ENCOURAGEMENTS: string[] = data.encouragements;

export const STOPPING_MESSAGE: string = data.stoppingMessage;
