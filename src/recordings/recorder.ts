/**
 * Microphone recording for the Parent Zone only (owner-approved exception to the
 * "no microphone" rule). The microphone is opened only when a grown-up taps Record,
 * and released as soon as they tap Stop. Audio is saved on this device only.
 */
export const MAX_RECORDING_MS = 3 * 60 * 1000;

export function recordingSupported() {
  return typeof window !== "undefined" && typeof window.MediaRecorder === "function" && !!navigator.mediaDevices?.getUserMedia;
}

/** The first format this browser can both record and play back (Opus where possible, else AAC on iPhone). */
function pickMime() {
  const options = ["audio/webm;codecs=opus", "audio/mp4", "audio/webm", "audio/ogg;codecs=opus"];
  const probe = typeof Audio === "function" ? new Audio() : null;
  return options.find((m) => {
    try {
      return MediaRecorder.isTypeSupported(m) && (!probe || probe.canPlayType(m.split(";")[0]) !== "");
    } catch {
      return false;
    }
  });
}

export interface ActiveRecording {
  /** Stops recording and returns the audio. */
  stop(): Promise<{ data: ArrayBuffer; mime: string; durationMs: number }>;
  /** Stops and throws the audio away. */
  cancel(): void;
}

export class MicError extends Error {
  constructor(
    public reason: "denied" | "unsupported" | "no-mic" | "failed",
    message: string,
  ) {
    super(message);
  }
}

export async function startRecording(onAutoStop?: () => void): Promise<ActiveRecording> {
  if (!recordingSupported()) throw new MicError("unsupported", "This browser cannot record audio. Try Safari on iPhone or Chrome on Android.");
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
  } catch (e) {
    const name = (e as DOMException)?.name;
    if (name === "NotAllowedError" || name === "SecurityError") throw new MicError("denied", "Microphone access was not allowed. To record, allow the microphone for this site in your browser or phone settings, then try again.");
    if (name === "NotFoundError") throw new MicError("no-mic", "No microphone was found on this device.");
    throw new MicError("failed", "The microphone could not be started. Please try again.");
  }
  const mime = pickMime();
  const rec = new MediaRecorder(stream, mime ? { mimeType: mime, audioBitsPerSecond: 64000 } : undefined);
  const chunks: Blob[] = [];
  rec.ondataavailable = (e) => {
    if (e.data.size) chunks.push(e.data);
  };
  const started = performance.now();
  const release = () => stream.getTracks().forEach((t) => t.stop());
  const finished = new Promise<void>((resolve) => (rec.onstop = () => resolve()));
  rec.start(500);
  const timer = window.setTimeout(() => onAutoStop?.(), MAX_RECORDING_MS);
  let cancelled = false;
  return {
    async stop() {
      window.clearTimeout(timer);
      const durationMs = Math.round(performance.now() - started);
      if (rec.state !== "inactive") rec.stop();
      await finished;
      release();
      const type = rec.mimeType || mime || chunks[0]?.type || "audio/webm";
      const blob = new Blob(chunks, { type });
      return { data: await blob.arrayBuffer(), mime: type.split(";")[0] || "audio/webm", durationMs };
    },
    cancel() {
      if (cancelled) return;
      cancelled = true;
      window.clearTimeout(timer);
      try {
        if (rec.state !== "inactive") rec.stop();
      } catch {
        /* ignore */
      }
      release();
    },
  };
}
