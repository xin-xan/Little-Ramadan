import { Suspense } from "react";
import { stories } from "@/content/stories";
import { LoadingBlock } from "@/components/ui";
import { StoryReader } from "./StoryReader";

export const dynamicParams = false;
export const generateStaticParams = () => stories.map((s) => ({ id: s.id }));

export default async function StoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={<LoadingBlock />}>
      <StoryReader id={id} />
    </Suspense>
  );
}
