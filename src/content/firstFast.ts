import type { IllustrationKey, Review } from "./types";

const draft: Review = { status: "draft", notes: "Awaiting Islamic content reviewer AND health-professional review of safety wording." };

/** Child-facing fasting education. Optional, educational, never a challenge. */
export const firstFastPages: { id: string; title: string; illustration: IllustrationKey; paragraphs: string[]; review: Review }[] = [
  { id: "ff-what", title: "What is fasting?", illustration: "hourglass", review: draft, paragraphs: ["Fasting means not eating or drinking from dawn until sunset.", "In Ramadan, grown-up Muslims who are healthy fast. It is one of the five pillars of Islam."] },
  { id: "ff-meals", title: "Suhoor and Iftar", illustration: "family-table", review: draft, paragraphs: ["Suhoor is the meal before dawn. Iftar is the meal at sunset.", "Many families enjoy these meals together. Many people begin Iftar with dates and water."] },
  { id: "ff-begin-end", title: "Beginning and ending a fast", illustration: "sunrise", review: draft, paragraphs: ["A fast begins at dawn, after Suhoor. It ends at sunset, at Iftar time.", "Grown-ups follow local times from trusted sources. This app does not show fasting times."] },
  { id: "ff-why", title: "Why do Muslims fast?", illustration: "heart-hands", review: draft, paragraphs: ["Muslims fast because Allah asks them to. Fasting helps them feel close to Allah, practise patience and remember people who are hungry.", "It also helps people be thankful for food and water."] },
  { id: "ff-not-fasting", title: "Not fasting? You can still join in!", illustration: "star", review: draft, paragraphs: ["Children do not have to fast. Lots of children don't fast at all, and that is okay.", "You can still learn, be kind, help at Suhoor and Iftar, make dua, play the games and collect every star and badge in this app."] },
  { id: "ff-health", title: "Health and family come first", illustration: "family", review: draft, paragraphs: ["Your parents or guardians decide if you practise fasting, and for how long.", "If you feel dizzy, very weak or unwell, stop and tell a grown-up straight away. Stopping is always okay."] },
];

export const JOURNAL_OPTIONS: { value: "practice" | "partial" | "full" | "not_fast" | "memory"; label: string; illustration: IllustrationKey }[] = [
  { value: "practice", label: "I practised with my family", illustration: "family" },
  { value: "partial", label: "I tried fasting for part of the day", illustration: "sunrise" },
  { value: "full", label: "I completed a fast with family guidance", illustration: "sunset" },
  { value: "not_fast", label: "I did not fast today", illustration: "smile" },
  { value: "memory", label: "I want to record a different Ramadan memory", illustration: "star" },
];

/** Friendly reply after saving — identical warmth for every choice; no rewards. */
export const JOURNAL_SAVED_MESSAGE = "Saved in your private journal. Every Ramadan day is special, whatever you did today!";
