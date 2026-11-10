/**
 * Parent voice recordings, kept in their own IndexedDB database on this device only.
 * Separate from progress data so "Reset progress" keeps them and a recording problem
 * can never affect saved progress. Nothing here talks to the network.
 */
const DB = "little-ramadan-voices";
const STORE = "recordings";

export interface Recording {
  id: string;
  /** Audio bytes (stored as ArrayBuffer: more reliable than Blob in older Safari). */
  data: ArrayBuffer;
  mime: string;
  durationMs: number;
  createdAt: string;
}

let dbPromise: Promise<IDBDatabase> | null = null;
const memory = new Map<string, Recording>();
let useMemory = false;

function open(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const r = indexedDB.open(DB, 1);
      r.onupgradeneeded = () => {
        if (!r.result.objectStoreNames.contains(STORE)) r.result.createObjectStore(STORE, { keyPath: "id" });
      };
      r.onsuccess = () => {
        const db = r.result;
        db.onclose = () => (dbPromise = null);
        db.onversionchange = () => {
          db.close();
          dbPromise = null;
        };
        resolve(db);
      };
      r.onerror = () => reject(r.error);
      r.onblocked = () => reject(new Error("blocked"));
    });
    dbPromise.catch(() => (dbPromise = null));
  }
  return dbPromise;
}

async function run<T>(mode: IDBTransactionMode, body: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const attempt = async () => {
    const db = await open();
    return new Promise<T>((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const r = body(tx.objectStore(STORE));
      tx.oncomplete = () => resolve(r.result);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error ?? new Error("aborted"));
    });
  };
  try {
    return await attempt();
  } catch {
    dbPromise = null; // Safari may have closed the connection: reopen once.
    return attempt();
  }
}

function available() {
  return !useMemory && typeof indexedDB !== "undefined";
}

// ---- Which items have a recording (shared, so every screen updates together) ----
let ids: Set<string> | null = null;
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function subscribeRecordings(fn: () => void) {
  listeners.add(fn);
  if (!ids && !loading) void refreshRecordingIds();
  return () => {
    listeners.delete(fn);
  };
}
export const recordedIdsSnapshot = () => ids;

export async function refreshRecordingIds() {
  loading = (async () => {
    try {
      ids = new Set(available() ? ((await run("readonly", (s) => s.getAllKeys())) as string[]) : memory.keys());
    } catch {
      useMemory = true;
      ids = new Set(memory.keys());
    }
  })();
  await loading;
  loading = null;
  emit();
}

export async function saveRecording(rec: Recording) {
  if (available()) {
    try {
      await run("readwrite", (s) => s.put(rec));
    } catch {
      useMemory = true;
    }
  }
  if (!available()) memory.set(rec.id, rec);
  urlCache.delete(rec.id);
  (ids ??= new Set()).add(rec.id);
  ids = new Set(ids);
  emit();
}

export async function getRecording(id: string): Promise<Recording | undefined> {
  if (available()) return (await run("readonly", (s) => s.get(id))) as Recording | undefined;
  return memory.get(id);
}

export async function getAllRecordings(): Promise<Recording[]> {
  if (available()) return (await run("readonly", (s) => s.getAll())) as Recording[];
  return [...memory.values()];
}

export async function deleteRecording(id: string) {
  if (available()) await run("readwrite", (s) => s.delete(id));
  memory.delete(id);
  revoke(id);
  if (ids) {
    ids = new Set(ids);
    ids.delete(id);
  }
  emit();
}

/** Removes every recording and the recordings database itself. */
export async function deleteAllRecordings() {
  memory.clear();
  for (const id of [...urlCache.keys()]) revoke(id);
  if (typeof indexedDB !== "undefined") {
    try {
      (await dbPromise?.catch(() => null))?.close();
    } catch {
      /* already closed */
    }
    dbPromise = null;
    await new Promise<void>((resolve) => {
      const r = indexedDB.deleteDatabase(DB);
      r.onsuccess = r.onerror = r.onblocked = () => resolve();
    });
  }
  ids = new Set();
  emit();
}

// ---- Object URLs for playback (prepared ahead, so play() can run straight from a tap on iPhone) ----
const urlCache = new Map<string, string>();
function revoke(id: string) {
  const u = urlCache.get(id);
  if (u) URL.revokeObjectURL(u);
  urlCache.delete(id);
}
export async function recordingUrl(id: string): Promise<string | null> {
  const hit = urlCache.get(id);
  if (hit) return hit;
  const rec = await getRecording(id);
  if (!rec) return null;
  const url = URL.createObjectURL(new Blob([rec.data], { type: rec.mime }));
  urlCache.set(id, url);
  return url;
}
export const cachedRecordingUrl = (id: string) => urlCache.get(id) ?? null;

// ---- Backup (a single file the parent keeps; never uploaded anywhere) ----
interface BackupFile {
  app: "little-ramadan-voices";
  version: 1;
  recordings: { id: string; mime: string; durationMs: number; createdAt: string; base64: string }[];
}

function toBase64(buf: ArrayBuffer) {
  const bytes = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}
function fromBase64(b64: string) {
  const s = atob(b64);
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out.buffer;
}

export async function exportRecordings(): Promise<Blob> {
  const all = await getAllRecordings();
  const file: BackupFile = { app: "little-ramadan-voices", version: 1, recordings: all.map((r) => ({ id: r.id, mime: r.mime, durationMs: r.durationMs, createdAt: r.createdAt, base64: toBase64(r.data) })) };
  return new Blob([JSON.stringify(file)], { type: "application/json" });
}

/** Restores recordings from a backup file. Only IDs the app knows are imported. Returns how many. */
export async function importRecordings(text: string, knownIds: Set<string>): Promise<number> {
  let parsed: BackupFile;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("This file is not a Little Ramadan recordings backup.");
  }
  if (parsed?.app !== "little-ramadan-voices" || !Array.isArray(parsed.recordings)) throw new Error("This file is not a Little Ramadan recordings backup.");
  let n = 0;
  for (const r of parsed.recordings) {
    if (typeof r?.id !== "string" || !knownIds.has(r.id) || typeof r.base64 !== "string" || typeof r.mime !== "string" || !/^audio\//.test(r.mime)) continue;
    await saveRecording({ id: r.id, mime: r.mime, durationMs: Number(r.durationMs) || 0, createdAt: typeof r.createdAt === "string" ? r.createdAt : new Date().toISOString(), data: fromBase64(r.base64) });
    n++;
  }
  return n;
}
