import { firstFastPages } from "./firstFast";
import { vocabulary } from "./games";
import { lessons } from "./lessons";
import { quizSets } from "./quizzes";
import { stories } from "./stories";
import type { Review } from "./types";
import { dhivehiReview, LETTERS, NUMBERS, WORDS } from "./dhivehi";

export interface ReviewItem {
  id: string;
  title: string;
  type: "Lesson" | "Story" | "Quiz" | "Vocabulary" | "First Fast page" | "Dhivehi";
  review: Review;
  sourceNote?: string;
}

/** Every item that needs religious, educational or health review before launch. */
export function reviewItems(): ReviewItem[] {
  return [
    ...lessons.map((l) => ({ id: l.id, title: l.title, type: "Lesson" as const, review: l.review, sourceNote: l.sourceNote })),
    ...stories.map((s) => ({ id: s.id, title: s.title, type: "Story" as const, review: s.review })),
    ...quizSets.map((q) => ({ id: q.id, title: `${q.title} (${q.questions.length} questions)`, type: "Quiz" as const, review: q.review })),
    ...vocabulary.map((v) => ({ id: v.id, title: `${v.word} — ${v.meaning}`, type: "Vocabulary" as const, review: v.review })),
    ...firstFastPages.map((p) => ({ id: p.id, title: p.title, type: "First Fast page" as const, review: p.review })),
    { id: "dv-letters", title: `Learn Dhivehi: ${LETTERS.length} letter names, sounds and fili`, type: "Dhivehi" as const, review: dhivehiReview },
    { id: "dv-words", title: `Learn Dhivehi: ${WORDS.length} words and ${NUMBERS.length} numbers (spelling and romanisation)`, type: "Dhivehi" as const, review: dhivehiReview },
  ];
}

export function contentReviewSummary() {
  const items = reviewItems();
  return {
    total: items.length,
    reviewed: items.filter((i) => i.review.status === "reviewed").length,
    inReview: items.filter((i) => i.review.status === "in_review").length,
    draft: items.filter((i) => i.review.status === "draft").length,
  };
}
