/**
 * Content contracts. All stories, lessons, missions, quizzes and badges are data so reviewers can update them without touching UI code.
 * IDs are stable across releases — never rename an ID that has shipped.
 */
import type { CompletionKind } from "@/storage/schema";
import type { IllustrationKey } from "@/components/art/illustrationKeys";

export type { IllustrationKey };

export interface Review {
  status: "draft" | "in_review" | "reviewed";
  reviewer?: string;
  reviewedOn?: string;
  notes?: string;
}

export type CharacterId = "noor" | "amina" | "hilmy";

export interface Lesson {
  id: string;
  title: string;
  summary: string;
  illustration: IllustrationKey;
  guide: CharacterId;
  /** Approximate reading time. Lessons should take 2–4 minutes. */
  minutes: number;
  sections: { heading: string; text: string }[];
  keyWords: { word: string; meaning: string }[];
  /** An off-screen family activity. */
  tryThis: string;
  /** What kind of reliable reference the reviewer should check this against. */
  sourceNote: string;
  review: Review;
}

export interface StoryPage {
  text: string;
  illustration: IllustrationKey;
}

export interface Story {
  id: string;
  title: string;
  summary: string;
  illustration: IllustrationKey;
  /** The value the story illustrates (stories are fiction, not religious teachings). */
  value: string;
  minutes: number;
  pages: StoryPage[];
  review: Review;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  category: "kindness" | "learning" | "family" | "reflection";
  adultHelpRequired: boolean;
  safetyNote?: string;
  illustration: IllustrationKey;
  reflectionPrompt: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: [string, string, string];
  answer: 0 | 1 | 2;
  explanation: string;
}

export interface QuizSet {
  id: string;
  title: string;
  illustration: IllustrationKey;
  questions: QuizQuestion[];
  review: Review;
}

export interface VocabTerm {
  id: string;
  word: string;
  meaning: string;
  illustration: IllustrationKey;
  review: Review;
}

export interface SortCard {
  id: string;
  text: string;
  helpful: boolean;
  explanation: string;
  illustration: IllustrationKey;
}

export type GameId = "quiz" | "match-words" | "missing-lantern" | "mosque-puzzle" | "sort-deeds" | "memory-cards" | "vocab-match";

export interface GameInfo {
  id: GameId;
  title: string;
  description: string;
  howToPlay: string[];
  illustration: IllustrationKey;
}

export interface JourneyDay {
  day: number;
  theme: string;
  /** The activity line from the content plan. */
  activity: string;
  illustration: IllustrationKey;
  learn: { kind: "lesson" | "story"; id: string };
  kindnessId: string;
  play: { game: GameId; quizSetId?: string };
  reflection: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  illustration: IllustrationKey;
}

export type UnlockRule =
  | { type: "start" }
  | { type: "count"; kind: CompletionKind | "any"; atLeast: number }
  | { type: "stars"; atLeast: number }
  | { type: "days"; atLeast: number }
  | { type: "gamesExplored"; atLeast: number };

export interface Badge {
  id: string;
  title: string;
  description: string;
  rule: UnlockRule;
  /** Child-friendly hint shown while still locked. */
  hint: string;
}

