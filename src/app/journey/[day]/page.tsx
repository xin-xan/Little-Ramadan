import { allDays } from "@/content/days";
import { DayView } from "./DayView";

export const dynamicParams = false;

export function generateStaticParams() {
  return allDays.map((d) => ({ day: d.id }));
}

export default async function DayPage({ params }: { params: Promise<{ day: string }> }) {
  const { day } = await params;
  return <DayView dayId={day} />;
}
