"use client";

import { useSearchParams } from "next/navigation";
import { dayById } from "@/content/days";

/** Reads ?day=dNN when an activity was opened from a journey day. Use inside <Suspense>. */
export function useDayParam() {
  const id = useSearchParams()?.get("day") ?? null;
  const day = id ? dayById(id) : undefined;
  return day ? { id: day.id, day: day.day } : null;
}
