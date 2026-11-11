"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  /** The full-screen "read and record" view: the whole text, large, with Record / Stop. */
  const [studio, setStudio] = useState<{ title: string; items: RecItem[]; index: number } | null>(null);
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

  useEffect(() => {
    if (!studio) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [studio]);

  // Move focus into the recording view when it opens or changes item (keyboard and screen readers).
  const studioKey = studio ? `${studio.title}:${studio.index}` : "";
  useEffect(() => {
    if (!studioKey) return;
    document.querySelector<HTMLElement>(".rec-studio .rec-btn, .rec-studio button")?.focus();
  }, [studioKey]);

  const openStudio = (title: string, items: RecItem[], index: number) => {
    setError(null);
    setMessage(null);
    setStudio({ title, items, index });
  };
  const closeStudio = async () => {
    if (activeRef.current) await stop();
    stopRecordingPlayback();
    setStudio(null);
  };
  const goTo = (index: number) => {
    stopRecordingPlayback();
    setError(null);
    setMessage(null);
    setStudio((st) => (st ? { ...st, index } : st));
  };

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

  const row = (item: RecItem, groupTitle: string, items: RecItem[], index: number) => {
    const open = () => openStudio(groupTitle, items, index);
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
        <button type="button" className="rec-text" onClick={open} aria-label={`Read the full text of ${item.label}`} data-sound="none">
          <strong>{item.label}</strong>
          <span className="small muted rec-script">{item.script}</span>
        </button>
        <div className="rec-actions">
          {has ? (
            <>
              <button type="button" className="icon-btn" onClick={() => (isPlaying ? stopRecordingPlayback() : void playRecording(item.id))} aria-label={isPlaying ? `Stop playing ${item.label}` : `Play your recording of ${item.label}`} data-sound="none">
                <Icon name={isPlaying ? "stop" : "play"} />
              </button>
              <button type="button" className="icon-btn" onClick={open} disabled={!supported} aria-label={`Record ${item.label} again`} data-sound="none">
                <Icon name="mic" />
              </button>
              <button type="button" className="icon-btn" onClick={() => void deleteRecording(item.id)} aria-label={`Delete recording of ${item.label}`}>
                <Icon name="trash" />
              </button>
            </>
          ) : (
            <button type="button" className="btn rec-btn" onClick={open} disabled={!supported} aria-label={`Record ${item.label}`} data-sound="none">
              <span className="rec-dot" aria-hidden="true" /> Record
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
              {g.items.map((item, i) => row(item, g.title, g.items, i))}
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

      {studio &&
        (() => {
          const item = studio.items[studio.index];
          const isRec = active?.id === item.id;
          const has = recorded.has(item.id);
          const isPlaying = playing === item.id;
          const last = studio.items.length - 1;
          return (
            createPortal(<div className="rec-studio" role="dialog" aria-modal="true" aria-labelledby="studio-title" onKeyDown={(e) => e.key === "Escape" && !isRec && void closeStudio()}>
              <header className="rec-studio-head">
                <div style={{ minWidth: 0 }}>
                  <p className="small muted" style={{ margin: 0 }}>
                    {studio.title} · {studio.index + 1} of {studio.items.length}
                  </p>
                  <h2 id="studio-title" style={{ margin: 0 }}>
                    {item.label}
                  </h2>
                </div>
                <button type="button" className="icon-btn" onClick={() => void closeStudio()} aria-label={isRec ? "Stop, save and close" : "Close"}>
                  <Icon name="close" />
                </button>
              </header>

              <div className="rec-studio-body" data-testid="studio-text">
                {item.dv && (
                  <p className="thaana rec-studio-dv" lang="dv" dir="rtl">
                    {item.dv}
                  </p>
                )}
                <p className="rec-studio-script">{item.script}</p>
              </div>

              <footer className="rec-studio-foot">
                {(error || message) && (
                  <p role="status" className={`notice${error ? " warn" : ""}`} style={{ margin: 0 }}>
                    {error ?? message}
                  </p>
                )}
                {isRec ? (
                  <>
                    <p className="rec-live" role="status">
                      <span className="rec-live-dot" aria-hidden="true" /> Recording… {fmt(elapsed)}
                    </p>
                    <button type="button" className="btn block rec-btn stop" onClick={() => void stop()} data-sound="none" aria-label={`Stop recording ${item.label}`} data-autofocus>
                      <Icon name="stop" size={18} /> Stop
                    </button>
                  </>
                ) : (
                  <>
                    {!has && <p className="small muted center" style={{ margin: 0 }}>Read the text above first if you like. Tap Start, read it aloud, then tap Stop.</p>}
                    <div className="row">
                      {has && (
                        <button type="button" className="btn ghost" style={{ flex: 1 }} onClick={() => (isPlaying ? stopRecordingPlayback() : void playRecording(item.id))} aria-label={isPlaying ? `Stop playing ${item.label}` : `Play your recording of ${item.label}`} data-sound="none">
                          <Icon name={isPlaying ? "stop" : "play"} size={18} /> {isPlaying ? "Stop" : "Play"}
                        </button>
                      )}
                      <button type="button" className="btn rec-btn" style={{ flex: 2 }} onClick={() => void record(item.id)} disabled={!!starting || !supported} aria-label={has ? `Start recording ${item.label} again` : `Start recording ${item.label}`} data-sound="none">
                        <span className="rec-dot" aria-hidden="true" /> {starting === item.id ? "Starting…" : has ? "Record again" : "Start recording"}
                      </button>
                    </div>
                  </>
                )}
                <div className="row">
                  <button type="button" className="btn ghost" style={{ flex: 1 }} disabled={isRec || studio.index === 0} onClick={() => goTo(studio.index - 1)}>
                    <Icon name="back" size={18} /> Previous
                  </button>
                  <button type="button" className="btn ghost" style={{ flex: 1 }} disabled={isRec || studio.index === last} onClick={() => goTo(studio.index + 1)}>
                    Next <Icon name="next" size={18} />
                  </button>
                </div>
              </footer>
            </div>, document.body)
          );
        })()}

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
