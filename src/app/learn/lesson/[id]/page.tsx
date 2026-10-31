import { Suspense } from "react";
import { lessons } from "@/content/lessons";
import { LoadingBlock } from "@/components/ui";
import { LessonReader } from "./LessonReader";

export const dynamicParams = false;
export const generateStaticParams = () => lessons.map((l) => ({ id: l.id }));

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={<LoadingBlock />}>
      <LessonReader id={id} />
    </Suspense>
  );
}
