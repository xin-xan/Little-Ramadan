"use client";

import { playRecording, stopRecordingPlayback } from "@/recordings/player";
import { useHasRecording, usePlayingId } from "@/recordings/hooks";
import { Icon } from "./Icon";

/**
 * "Listen" button for a grown-up's recording of this text. It only appears when a parent
 * has recorded it in the Parent Zone; otherwise nothing is shown and the text is read as usual.
 */
export function VoiceButton({ id, label = "Listen", compact = false, className = "" }: { id: string; label?: string; compact?: boolean; className?: string }) {
  const has = useHasRecording(id);
  const playing = usePlayingId() === id;
  if (!has) return null;
  const onClick = () => (playing ? stopRecordingPlayback() : void playRecording(id));
  if (compact)
    return (
      <button type="button" className={`icon-btn voice-btn${playing ? " playing" : ""} ${className}`} onClick={onClick} aria-pressed={playing} aria-label={playing ? "Stop listening" : `${label}: hear your grown-up read this`} data-sound="none" data-testid="voice-button">
        <Icon name={playing ? "stop" : "sound-on"} />
      </button>
    );
  return (
    <button type="button" className={`voice-pill${playing ? " playing" : ""} ${className}`} onClick={onClick} aria-pressed={playing} data-sound="none" data-testid="voice-button">
      <Icon name={playing ? "stop" : "sound-on"} size={20} />
      {playing ? "Stop" : label}
      {playing && (
        <span className="voice-bars" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      )}
    </button>
  );
}
