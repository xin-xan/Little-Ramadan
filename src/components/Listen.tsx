"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore, type RefObject } from "react";
import { narratingKey, narrate, narrationAvailable, onNarrationChange, segmentsFrom, segmentsFromText, stopNarration } from "@/accessibility/narration";
import { useApp } from "@/state/AppState";
import { Icon } from "./Icon";

const subscribe = (fn: () => void) => {
  const off = onNarrationChange(fn);
  return () => void off();
};

/** Whether the device can narrate (re-checks when voices finish loading). */
export function useNarrationAvailable() {
  return useSyncExternalStore(subscribe, narrationAvailable, () => false);
}

function useSpeaking(key: string) {
  return useSyncExternalStore(subscribe, () => narratingKey() === key, () => false);
}

type Target = { target: RefObject<HTMLElement | null>; text?: never } | { text: string; target?: never } | { selector: string; target?: never; text?: never };

/** Starts reading a target element (or plain text) aloud. */
export function readTarget(t: Target, key: string) {
  let segs;
  if ("text" in t && t.text != null) segs = segmentsFromText(t.text);
  else {
    const el = "selector" in t ? document.querySelector(t.selector) : t.target?.current;
    if (!el) return Promise.resolve(false);
    segs = segmentsFrom(el);
  }
  return narrate(segs, key);
}

/**
 * "Listen" button: reads the target aloud with the device voice, highlighting each sentence.
 * Hidden when the device has no on-device English voice (the text is always on screen too).
 */
export function ListenButton({ label = "Listen", compact = false, className, narrationKey, ...t }: Target & { label?: string; compact?: boolean; className?: string; narrationKey?: string }) {
  const id = useId();
  const key = narrationKey ?? id;
  const available = useNarrationAvailable();
  const speaking = useSpeaking(key);
  if (!available) return null;
  const onClick = () => {
    if (speaking) stopNarration();
    else void readTarget(t as Target, key);
  };
  if (compact)
    return (
      <button type="button" className={`icon-btn listen-btn${speaking ? " speaking" : ""} ${className ?? ""}`} onClick={onClick} aria-pressed={speaking} aria-label={speaking ? "Stop reading" : `${label}: read this aloud`} data-sound="none" data-narrate="skip">
        <Icon name={speaking ? "stop" : "listen"} />
      </button>
    );
  return (
    <button type="button" className={`btn ghost listen-pill${speaking ? " speaking" : ""} ${className ?? ""}`} onClick={onClick} aria-pressed={speaking} data-sound="none" data-narrate="skip">
      <Icon name={speaking ? "stop" : "listen"} size={20} />
      {speaking ? "Stop" : label}
      {speaking && (
        <span className="voice-bars" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      )}
    </button>
  );
}

/**
 * Reads `target` aloud automatically whenever `trigger` changes, if the parent has
 * "Read aloud automatically" on. Returns the key so a ListenButton can share state.
 */
export function useAutoRead(target: RefObject<HTMLElement | null>, trigger: unknown, key: string, enabled = true) {
  const { data } = useApp();
  const on = data.settings.readAloud && enabled;
  const available = useNarrationAvailable();
  const first = useRef(true);
  useEffect(() => {
    if (!on || !available) return;
    // Let the new content render (and the page transition settle) first.
    const id = window.setTimeout(() => void readTarget({ target }, key), first.current ? 450 : 250);
    first.current = false;
    return () => window.clearTimeout(id);
  }, [on, available, trigger, target, key]);
  useEffect(() => () => stopNarration(), []);
}

/** A small switch children can use on reading screens: "Read to me" on/off. */
export function ReadToMeToggle() {
  const { data, updateSettings } = useApp();
  const available = useNarrationAvailable();
  const [busy, setBusy] = useState(false);
  if (!available) return null;
  const on = data.settings.readAloud;
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      className={`read-toggle${on ? " on" : ""}`}
      disabled={busy}
      data-narrate="skip"
      onClick={async () => {
        setBusy(true);
        if (on) stopNarration();
        await updateSettings({ readAloud: !on });
        setBusy(false);
      }}
    >
      <Icon name="listen" size={18} /> Read to me: {on ? "On" : "Off"}
    </button>
  );
}
