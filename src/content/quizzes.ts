import type { QuizSet } from "./types";
import data from "./data/quizzes.json";


/** Three options per question for younger players. Every answer has an explanation. */
export const quizSets = data as QuizSet[];

export const quizSetById = (id: string) => quizSets.find((q) => q.id === id);
