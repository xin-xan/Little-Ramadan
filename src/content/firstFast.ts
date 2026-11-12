import type { IllustrationKey, Review } from "./types";
import data from "./data/first-fast.json";


/** Child-facing fasting education. Optional, educational, never a challenge. */
export const firstFastPages = data.pages as { id: string; title: string; illustration: IllustrationKey; paragraphs: string[]; review: Review }[];

export const JOURNAL_OPTIONS = data.journalOptions as { value: "fasting" | "practice" | "partial" | "full" | "not_fast" | "memory"; label: string; illustration: IllustrationKey }[];

/** Friendly reply after saving — identical warmth for every choice; no rewards. */
export const JOURNAL_SAVED_MESSAGE: string = data.savedMessage;
