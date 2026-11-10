"use client";

import { useEffect, useSyncExternalStore } from "react";
import { playingRecordingId, subscribePlayer } from "./player";
import { recordedIdsSnapshot, recordingUrl, subscribeRecordings } from "./store";

const EMPTY = new Set<string>();

/** IDs of every item a parent has recorded on this device. */
export function useRecordedIds(): Set<string> {
  return useSyncExternalStore(subscribeRecordings, () => recordedIdsSnapshot() ?? EMPTY, () => EMPTY);
}

export function useHasRecording(id: string) {
  const has = useRecordedIds().has(id);
  // Prepare the audio ahead of the tap (iPhone only plays audio started directly by a tap).
  useEffect(() => {
    if (has) void recordingUrl(id).catch(() => null);
  }, [has, id]);
  return has;
}

export function usePlayingId() {
  return useSyncExternalStore(subscribePlayer, playingRecordingId, () => null);
}
