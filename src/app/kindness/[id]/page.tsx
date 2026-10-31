import { missions } from "@/content/missions";
import { MissionView } from "./MissionView";

export const dynamicParams = false;
export const generateStaticParams = () => missions.map((m) => ({ id: m.id }));

export default async function MissionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MissionView id={id} />;
}
