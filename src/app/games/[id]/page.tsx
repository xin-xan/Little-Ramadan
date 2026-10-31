import { Suspense } from "react";
import { LoadingBlock } from "@/components/ui";
import { games } from "@/content/games";
import { GamePlayer } from "./GamePlayer";

export const dynamicParams = false;
export const generateStaticParams = () => games.filter((g) => g.id !== "quiz").map((g) => ({ id: g.id }));

export default async function GamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={<LoadingBlock />}>
      <GamePlayer id={id} />
    </Suspense>
  );
}
