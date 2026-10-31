"use client";

import Link from "next/link";
import { daysFor } from "@/storage/calendar";
import { useApp } from "@/state/AppState";

/** "Back to Day N" link shown when an activity was opened from a journey day. */
export function BackToDay({ dayId, className = "btn block" }: { dayId: string; className?: string }) {
  const { data } = useApp();
  const d = daysFor(data.settings.calendar).find((x) => x.id === dayId);
  return (
    <Link href={`/journey/${dayId}/`} className={className}>
      Back to {d ? `Day ${d.day}` : "my journey"}
    </Link>
  );
}
