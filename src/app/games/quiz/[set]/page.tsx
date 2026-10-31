import { Suspense } from "react";
import { LoadingBlock } from "@/components/ui";
import { quizSets } from "@/content/quizzes";
import { QuizPlayer } from "./QuizPlayer";

export const dynamicParams = false;
export const generateStaticParams = () => quizSets.map((q) => ({ set: q.id }));

export default async function QuizSetPage({ params }: { params: Promise<{ set: string }> }) {
  const { set } = await params;
  return (
    <Suspense fallback={<LoadingBlock />}>
      <QuizPlayer setId={set} />
    </Suspense>
  );
}
