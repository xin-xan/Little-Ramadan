import { DvDayView } from "./DvDayView";

export const dynamicParams = false;
export const generateStaticParams = () => Array.from({ length: 30 }, (_, i) => ({ day: String(i + 1) }));

export default async function DhivehiDayPage({ params }: { params: Promise<{ day: string }> }) {
  const { day } = await params;
  return <DvDayView day={Number(day)} />;
}
