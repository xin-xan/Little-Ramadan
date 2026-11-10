"use client";

import { createPortal } from "react-dom";
import { VoiceButton } from "./VoiceButton";
import { rid } from "@/recordings/ids";
import Link from "next/link";
import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import { playSound, setSoundEnabled } from "@/accessibility/sound";
import { useApp } from "@/state/AppState";
import { CharacterById, CHARACTER_NAMES, type Expression } from "@/characters/Characters";
import { Icon } from "./Icon";

export function PageHeader({ title, back, right }: { title: string; back?: { href: string; label: string }; right?: ReactNode }) {
  return (
    <header className="page-header">
      {back && (
        <Link href={back.href} className="icon-btn" aria-label={`Back to ${back.label}`}>
          <Icon name="back" />
        </Link>
      )}
      <h1>{title}</h1>
      {right}
    </header>
  );
}

export function SpeechBubble({ who, expression = "happy", children, size = 84 }: { who: "noor" | "amina" | "hilmy"; expression?: Expression; children: ReactNode; size?: number }) {
  return (
    <div className="speech">
      <div style={{ flex: "none" }}>
        <CharacterById id={who} expression={expression} size={size} />
      </div>
      <div className="bubble">
        <span className="who">{CHARACTER_NAMES[who]}</span>
        {children}
      </div>
    </div>
  );
}

export function ProgressBar({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max > 0 ? Math.round((Math.min(value, max) / max) * 100) : 0;
  return (
    <div>
      <div className="spread small">
        <span>{label}</span>
        <strong>
          {value} of {max}
        </strong>
      </div>
      <div className="progress" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={Math.min(value, max)}>
        <span style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function StarCount({ stars, href = "/rewards/" }: { stars: number; href?: string }) {
  return (
    <Link href={href} className="star-count" aria-label={`${stars} stars. Open rewards`}>
      <Icon name="star" size={20} fill strokeWidth={1.5} /> {stars}
    </Link>
  );
}

export function Switch({ checked, onChange, label, id, description }: { checked: boolean; onChange(v: boolean): void; label: string; id: string; description?: string }) {
  return (
    <div className="toggle-row">
      <div>
        <label htmlFor={id}>{label}</label>
        {description && (
          <div className="small muted" id={`${id}-desc`}>
            {description}
          </div>
        )}
      </div>
      <div className="row" style={{ gap: 8 }}>
        <span className="switch-label" aria-hidden="true">
          {checked ? "On" : "Off"}
        </span>
        <button id={id} type="button" role="switch" aria-checked={checked} aria-describedby={description ? `${id}-desc` : undefined} className="switch" onClick={() => onChange(!checked)} />
      </div>
    </div>
  );
}

/** Accessible modal sheet: focus moves in, Tab is trapped, Escape closes. */
const noopSubscribe = () => () => {};
/** True only in the browser after hydration, so portals never cause a hydration mismatch. */
export function useIsClient() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

export function Sheet({ open, onClose, labelledBy, children, dismissable = true }: { open: boolean; onClose(): void; labelledBy: string; children: ReactNode; dismissable?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const isClient = useIsClient();
  useEffect(() => {
    onCloseRef.current = onClose;
  });
  useEffect(() => {
    if (!open) return;
    playSound("open");
    const prev = document.activeElement as HTMLElement | null;
    const el = ref.current;
    const focusables = () => [...(el?.querySelectorAll<HTMLElement>('button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])') ?? [])].filter((x) => !x.hasAttribute("disabled"));
    (el?.querySelector<HTMLElement>("[data-autofocus]") ?? focusables()[0] ?? el)?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && dismissable) onCloseRef.current();
      if (e.key === "Tab") {
        const f = focusables();
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      playSound("close");
      prev?.focus?.();
    };
  }, [open, dismissable]);
  if (!open || !isClient) return null;
  // Portal to <body> so a transformed ancestor (e.g. the .page-enter animation)
  // can't trap this fixed overlay inside the page box on iOS Safari.
  const node = (
    <div className="sheet-backdrop" onClick={(e) => dismissable && e.target === e.currentTarget && onClose()}>
      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby={labelledBy} ref={ref} tabIndex={-1}>
        {children}
      </div>
    </div>
  );
  return createPortal(node, document.body);
}

export function HealthNotice({ compact = false }: { compact?: boolean }) {
  return (
    <div className="notice health" role="note">
      <strong className="row" style={{ display: "inline-flex", gap: 6 }}>
        <Icon name="heart" size={18} fill strokeWidth={1.5} /> Your health comes first!
      </strong>{" "}
      {compact ? "If you feel unwell, tell a grown-up straight away." : "If you feel dizzy, very weak or unwell, tell your parent or another trusted adult straight away. You can stop fasting whenever you need to. Your Ramadan adventure is still special!"}
      {!compact && <VoiceButton id={rid.health()} className="mt" />}
    </div>
  );
}

export function LoadingBlock({ label = "Loading…" }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="stack">
      <span className="sr-only">{label}</span>
      <div className="skeleton" />
      <div className="skeleton" />
    </div>
  );
}

export function NotFound({ what, back }: { what: string; back: { href: string; label: string } }) {
  return (
    <div className="card stack center" role="alert">
      <h2>We couldn&apos;t find that {what}</h2>
      <p>It may have moved. Let&apos;s go back and choose another one.</p>
      <Link className="btn" href={back.href}>
        Back to {back.label}
      </Link>
    </div>
  );
}

/** Quick sound on/off button (the same setting as Parents → Settings). */
export function SoundToggle() {
  const { data, updateSettings } = useApp();
  const on = data.settings.soundOn;
  return (
    <button
      type="button"
      className="icon-btn"
      aria-pressed={on}
      aria-label={on ? "Sound is on. Turn sound off" : "Sound is off. Turn sound on"}
      data-sound="none"
      onClick={async () => {
        await updateSettings({ soundOn: !on });
        if (!on) {
          setSoundEnabled(true);
          playSound("toggle");
        }
      }}
    >
      <Icon name={on ? "sound-on" : "sound-off"} />
    </button>
  );
}
