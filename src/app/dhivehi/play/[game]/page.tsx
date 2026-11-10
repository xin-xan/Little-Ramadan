import { DV_GAMES } from "@/content/dhivehi";
import { DvPlayView } from "./DvPlayView";

export const dynamicParams = false;
export const generateStaticParams = () => DV_GAMES.map((g) => ({ game: g.id }));

export default async function DhivehiPlayPage({ params }: { params: Promise<{ game: string }> }) {
  const { game } = await params;
  return <DvPlayView id={game} />;
}
