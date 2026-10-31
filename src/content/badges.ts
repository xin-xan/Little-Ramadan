import type { Badge } from "./types";

/**
 * Badges recognise learning, kindness and participation only.
 * No rule may ever reference fasting or the fasting journal.
 */
export const badges: Badge[] = [
  { id: "ramadan-explorer", title: "Ramadan Explorer", description: "You completed your first activity!", rule: { type: "count", kind: "any", atLeast: 1 }, hint: "Complete any activity." },
  { id: "kindness-hero", title: "Kindness Hero", description: "You completed five kindness missions.", rule: { type: "count", kind: "kindness", atLeast: 5 }, hint: "Complete five kindness missions." },
  { id: "little-scholar", title: "Little Scholar", description: "You completed five lessons.", rule: { type: "count", kind: "lesson", atLeast: 5 }, hint: "Complete five lessons." },
  { id: "curious-mind", title: "Curious Mind", description: "You completed five quizzes.", rule: { type: "count", kind: "quiz", atLeast: 5 }, hint: "Complete five quizzes." },
  { id: "story-lover", title: "Story Lover", description: "You read five stories.", rule: { type: "count", kind: "story", atLeast: 5 }, hint: "Read five stories." },
  { id: "game-explorer", title: "Game Explorer", description: "You tried every game in Puzzle Palace.", rule: { type: "gamesExplored", atLeast: 7 }, hint: "Try all seven games." },
  { id: "goal-getter", title: "Goal Getter", description: "You finished a personal goal.", rule: { type: "count", kind: "goal", atLeast: 1 }, hint: "Finish one of your Ramadan goals." },
  { id: "ramadan-star", title: "Ramadan Star", description: "You took part in the Ramadan journey.", rule: { type: "days", atLeast: 10 }, hint: "Finish the activities for ten journey days, in any order." },
];
