"use client";

import { useDayParam } from "@/components/activities/useDayParam";
import { QuizGame } from "@/components/games/QuizGame";
import { NotFound } from "@/components/ui";
import { quizSetById } from "@/content/quizzes";

export function QuizPlayer({ setId }: { setId: string }) {
  const day = useDayParam();
  const set = quizSetById(setId);
  if (!set) return <NotFound what="quiz" back={{ href: "/games/quiz/", label: "quizzes" }} />;
  return <QuizGame set={set} day={day} />;
}
