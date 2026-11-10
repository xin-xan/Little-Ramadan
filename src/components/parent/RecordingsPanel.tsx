"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import { Sheet } from "@/components/ui";
import { ALL_RECORDING_ITEMS, RECORDING_SECTIONS, type RecItem } from "@/recordings/catalog";
import { useRecordedIds, usePlayingId } from "@/recordings/hooks";
import { playRecording, stopRecordingPlayback } from "@/recordings/player";
import { MAX_RECORDING_MS, MicError, recordingSupported, startRecording, type ActiveRecording } from "@/recordings/recorder";
import { deleteAllRecordings, deleteRecording, exportRecordings, importRecordings, saveRecording } from "@/recordings/store";

/** Monotonic clock for the recording timer (only used in event handlers and timers). */
const clock = () => performance.now();

const fmt = (ms: number) => {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

/**
 * Parent Zone: record your own voice for stories, lessons, quizzes, missions and Dhivehi
 * letters. Children then see a Listen button on everything you have recorded.
 */
export function RecordingsPanel() {
  const recorded = useRecordedIds();
  const playing = usePlayingId();
  const [section, setSection] = useState(RECORDING_SECTIONS[0].id);
  const [active, setActive] = useState<{ id: string; rec: ActiveRecording; started: number } | null>(null);
  const [starting, setStarting] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [confirmAll, setConfirmAll] = useState(false);
  const [supported] = useState(() => typeof window === "undefined" || recordingSupported());
  const activeRef = useRef(active);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);
  // Never leave the microphone on when the panel closes.
  useEffect(() => () => activeRef.current?.rec.cancel(), []);
  useEffect(() => {
    if (!active) return;
    const t = window.setInterval(() => setElapsed(clock() - active.started), 250);
    return () => window.clearInterval(t);
  }, [active]);

  const stop = async () => {
    const a = activeRef.current;
    if (!a) return;
    setActive(null);
    try {
      const out = await a.rec.stop();
      if (out.data.byteLength < 200 || out.durationMs < 400) {
        setError("That recording was too short. Tap Record and speak, then tap Stop.");
        return;
      }
      await saveRecording({ id: a.id, data: out.data, mime: out.mime, durationMs: out.durationMs, createdAt: new Date().toISOString() });
      setMessage("Saved on this device.");
    } catch {
      setError("The recording could not be saved. Please try again.");
    }
  };

  const record = async (id: string) => {
    setError(null);
    setMessage(null);
    stopRecordingPlayback();
    if (activeRef.current) await stop();
    setStarting(id);
    try {
      const rec = await startRecording(() => void stop());
      const a = { id, rec, started: clock() };
      activeRef.current = a;
      setElapsed(0);
      setActive(a);
    } catch (e) {
      setError(e instanceof MicError ? e.message : "The microphone could not be started.");
    } finally {
      setStarting(null);
    }
  };

  const current = RECORDING_SECTIONS.find((s) => s.id === section)!;
  const total = ALL_RECORDING_ITEMS.length;

  const row = (item: RecItem) => {
    const isRec = active?.id === item.id;
    const has = recorded.has(item.id);
    const isPlaying = playing === item.id;
    return (
      <li key={item.id} className={`rec-row${isRec ? " recording" : ""}`} data-testid={`rec-${item.id}`}>
        {item.dv && (
          <span className="thaana rec-dv" lang="dv" dir="rtl" aria-hidden="true">
            {item.dv}
          </span>
        )}
        <div className="rec-text">
          <strong>{item.label}</strong>
          <span className="small muted rec-script">{item.script}</span>
        </div>
        <div className="rec-actions">
          {isRec ? (
            <button type="button" className="btn rec-btn stop" onClick={() => void stop()} data-sound="none" aria-label={`Stop recording ${item.label}`}>
              <Icon name="stop" size={16} /> Stop {fmt(elapsed)}
            </button>
          ) : has ? (
            <>
              <button type="button" className="icon-btn" onClick={() => (isPlaying ? stopRecordingPlayback() : void playRecording(item.id))} aria-label={isPlaying ? `Stop playing ${item.label}` : `Play your recording of ${item.label}`} data-sound="none">
                <Icon name={isPlaying ? "stop" : "play"} />
              </button>
              <button type="button" className="icon-btn" onClick={() => void record(item.id)} disabled={!!starting || !supported} aria-label={`Record ${item.label} again`} data-sound="none">
                <Icon name="mic" />
              </button>
              <button type="button" className="icon-btn" onClick={() => void deleteRecording(item.id)} aria-label={`Delete recording of ${item.label}`}>
                <Icon name="trash" />
              </button>
            </>
          ) : (
            <button type="button" className="btn rec-btn" onClick={() => void record(item.id)} disabled={!!starting || !supported} aria-label={`Record ${item.label}`} data-sound="none">
              <span className="rec-dot" aria-hidden="true" /> {starting === item.id ? "Starting…" : "Record"}
            </button>
          )}
        </div>
      </li>
    );
  };

  return (
    <div className="stack">
      <div className="card stack">
        <h2>Record your voice</h2>
        <p style={{ margin: 0 }}>
          Read stories, lessons and letters aloud in your own voice. Your child will see a <strong>Listen</strong> button on everything you record. Anything you don&apos;t record stays as text.
        </p>
        <p className="small" style={{ margin: 0 }}>
          <strong>{recorded.size}</strong> of {total} recorded.
        </p>
        <p className="notice" style={{ margin: 0 }}>
          <Icon name="shield" size={16} /> The microphone is used only while you are recording here, after you tap Record. Recordings are saved only on this device and are never uploaded. Clearing browser data or removing the app deletes them, so use <strong>Save a backup</strong> below.
        </p>
        {!supported && <p className="notice warn" style={{ margin: 0 }}>This browser cannot record audio. Please use Safari on iPhone or Chrome on Android.</p>}
      </div>

      <div className="tabs" role="tablist" aria-label="What to record">
        {RECORDING_SECTIONS.map((s) => {
          const n = s.groups.reduce((a, g) => a + g.items.filter((i) => recorded.has(i.id)).length, 0);
          const t = s.groups.reduce((a, g) => a + g.items.length, 0);
          return (
            <button key={s.id} role="tab" aria-selected={section === s.id} onClick={() => setSection(s.id)}>
              {s.title} <span className="small">({n}/{t})</span>
            </button>
          );
        })}
      </div>

      {(error || message) && (
        <p role="status" className={`notice${error ? " warn" : ""}`} style={{ margin: 0 }}>
          {error ?? message}
        </p>
      )}

      <p className="small muted" style={{ margin: 0 }}>
        {current.hint} Each recording can be up to {MAX_RECORDING_MS / 60000} minutes.
      </p>

      {current.groups.map((g) => {
        const n = g.items.filter((i) => recorded.has(i.id)).length;
        const single = current.groups.length === 1;
        return (
          <details key={g.id} className="card rec-group" open={single || undefined}>
            <summary>
              <span>{g.title}</span>
              <span className={`pill${n === g.items.length ? " done" : ""}`}>
                {n}/{g.items.length}
              </span>
            </summary>
            <ul className="rec-list">
              {g.items.map(row)}
            </ul>
          </details>
        );
      })}

      <div className="card stack">
        <h2>Backup</h2>
        <p className="small" style={{ margin: 0 }}>
          Save all your recordings in one file on your phone, and load them again later or on a new phone. The file stays with you; it is not uploaded anywhere.
        </p>
        <div className="row wrap">
          <button
            type="button"
            className="btn ghost"
            disabled={recorded.size === 0}
            onClick={async () => {
              const blob = await exportRecordings();
              const a = document.createElement("a");
              a.href = URL.createObjectURL(blob);
              a.download = `little-ramadan-recordings-${new Date().toISOString().slice(0, 10)}.json`;
              a.click();
              setTimeout(() => URL.revokeObjectURL(a.href), 5000);
            }}
          >
            <Icon name="download" size={18} /> Save a backup
          </button>
          <button type="button" className="btn ghost" onClick={() => fileRef.current?.click()}>
            <Icon name="refresh" size={18} /> Load a backup
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            data-testid="rec-import"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (!f) return;
              setError(null);
              try {
                const n = await importRecordings(await f.text(), new Set(ALL_RECORDING_ITEMS.map((i) => i.id)));
                setMessage(`${n} recording${n === 1 ? "" : "s"} loaded.`);
              } catch (err) {
                setError((err as Error).message);
              }
            }}
          />
          <button type="button" className="btn ghost danger" disabled={recorded.size === 0} onClick={() => setConfirmAll(true)}>
            <Icon name="trash" size={18} /> Delete all recordings
          </button>
        </div>
      </div>

      <Sheet open={confirmAll} onClose={() => setConfirmAll(false)} labelledBy="rec-del-title">
        <div className="stack">
          <h2 id="rec-del-title">Delete all recordings?</h2>
          <p>All {recorded.size} recordings will be removed from this device. This cannot be undone unless you saved a backup.</p>
          <button
            className="btn block danger"
            onClick={async () => {
              stopRecordingPlayback();
              await deleteAllRecordings();
              setConfirmAll(false);
              setMessage("All recordings deleted.");
            }}
          >
            Delete all recordings
          </button>
          <button className="btn ghost block" onClick={() => setConfirmAll(false)} data-autofocus>
            Cancel
          </button>
        </div>
      </Sheet>
    </div>
  );
}
