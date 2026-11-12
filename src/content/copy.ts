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
} as const;

export const ENCOURAGEMENTS: string[] = data.encouragements;

export const STOPPING_MESSAGE: string = data.stoppingMessage;
