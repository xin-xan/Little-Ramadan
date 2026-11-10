/** Plays one parent recording at a time. */
import { cachedRecordingUrl, recordingUrl } from "./store";

let audio: HTMLAudioElement | null = null;
let playingId: string | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const subscribePlayer = (fn: () => void) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};
export const playingRecordingId = () => playingId;

export function stopRecordingPlayback() {
  if (audio) {
    audio.pause();
    audio.removeAttribute("src");
  }
  if (playingId) {
    playingId = null;
    emit();
  }
}

/** Call straight from a tap. Uses a prepared URL when there is one so iPhone allows playback. */
export async function playRecording(id: string) {
  stopRecordingPlayback();
  audio ??= new Audio();
  const a = audio;
  a.onended = a.onerror = () => {
    if (playingId === id) {
      playingId = null;
      emit();
    }
  };
  playingId = id;
  emit();
  const url = cachedRecordingUrl(id) ?? (await recordingUrl(id));
  if (!url || playingId !== id) return;
  a.src = url;
  try {
    await a.play();
  } catch {
    if (playingId === id) {
      playingId = null;
      emit();
    }
  }
}

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") stopRecordingPlayback();
  });
}
