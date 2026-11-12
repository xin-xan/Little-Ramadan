/**
 * Tiny IndexedDB wrapper with an in-memory fallback.
 * Nothing here ever talks to the network.
 */
import {
  DB_NAME,
  DB_VERSION,
  KV_KEYS,
  SCHEMA_VERSION,
  STORES,
  migrate,
  normalise,
  type AppData,
  type Completion,
  type GoalRecord,
  type JournalEntry,
  type RawData,
} from "./schema";

type StoreName = (typeof STORES)[keyof typeof STORES];

export interface Storage {
  /** "indexeddb" when progress is saved on the device, "memory" when it can't be. */
  readonly kind: "indexeddb" | "memory";
  loadAll(): Promise<AppData>;
  putKv(key: string, value: unknown): Promise<void>;
  put(store: Exclude<StoreName, "kv">, value: Completion | JournalEntry | GoalRecord): Promise<void>;
  remove(store: StoreName, key: string): Promise<void>;
  clear(store: StoreName): Promise<void>;
  /** Removes the whole database from the device. */
  destroy(): Promise<void>;
}

function req<T>(r: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error ?? new Error("Transaction aborted"));
  });
}

export function openDatabase(idb: IDBFactory = indexedDB): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const r = idb.open(DB_NAME, DB_VERSION);
    r.onupgradeneeded = () => {
      const db = r.result;
      // Structural upgrades go here, keyed on event.oldVersion, when DB_VERSION is bumped.
      if (!db.objectStoreNames.contains(STORES.kv)) db.createObjectStore(STORES.kv);
      if (!db.objectStoreNames.contains(STORES.completions)) db.createObjectStore(STORES.completions, { keyPath: "id" });
      if (!db.objectStoreNames.contains(STORES.journal)) db.createObjectStore(STORES.journal, { keyPath: "id" });
      if (!db.objectStoreNames.contains(STORES.goals)) db.createObjectStore(STORES.goals, { keyPath: "id" });
    };
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
    r.onblocked = () => reject(new Error("Database is blocked by another open tab"));
  });
}

/**
 * IndexedDB storage. Safari (especially on iPhone, and inside embedded frames) can close
 * a database connection at any time — e.g. when the page goes to the background. Every
 * operation therefore reopens the connection and retries once if it finds it closed.
 */
class IdbStorage implements Storage {
  readonly kind = "indexeddb" as const;
  private closed = false;
  constructor(
    private db: IDBDatabase,
    private idb: IDBFactory,
  ) {
    this.watch(db);
  }

  private watch(db: IDBDatabase) {
    db.onversionchange = () => {
      db.close();
      this.closed = true;
    };
    db.onclose = () => {
      this.closed = true;
    };
  }

  private async reopen() {
    try {
      this.db.close();
    } catch {
      /* already closed */
    }
    this.db = await openDatabase(this.idb);
    this.closed = false;
    this.watch(this.db);
  }

  /** Runs one transaction, reopening the connection and retrying once if it was closed. */
  private async run<T>(stores: StoreName | StoreName[], mode: IDBTransactionMode, body: (tx: IDBTransaction) => Promise<T> | T): Promise<T> {
    const attempt = async () => {
      if (this.closed) await this.reopen();
      const tx = this.db.transaction(stores, mode);
      const result = await body(tx);
      await txDone(tx);
      return result;
    };
    try {
      return await attempt();
    } catch (e) {
      await this.reopen();
      try {
        return await attempt();
      } catch {
        throw e;
      }
    }
  }

  async loadAll(): Promise<AppData> {
    const [profile, settings, meta, salah, completions, journal, goals] = await this.run([STORES.kv, STORES.completions, STORES.journal, STORES.goals], "readonly", (tx) => {
      const kv = tx.objectStore(STORES.kv);
      return Promise.all([
        req(kv.get(KV_KEYS.profile)),
        req(kv.get(KV_KEYS.settings)),
        req(kv.get(KV_KEYS.meta)),
        req(kv.get(KV_KEYS.salah)),
        req(tx.objectStore(STORES.completions).getAll()),
        req(tx.objectStore(STORES.journal).getAll()),
        req(tx.objectStore(STORES.goals).getAll()),
      ]);
    });
    const raw: RawData = { profile, settings, salah, completions, journal, goals };
    const fromVersion = typeof (meta as { schemaVersion?: number } | undefined)?.schemaVersion === "number" ? (meta as { schemaVersion: number }).schemaVersion : SCHEMA_VERSION;
    const data = normalise(migrate(raw, fromVersion));
    if (fromVersion !== SCHEMA_VERSION || meta === undefined) await this.putKv(KV_KEYS.meta, { schemaVersion: SCHEMA_VERSION });
    return data;
  }

  async putKv(key: string, value: unknown) {
    await this.run(STORES.kv, "readwrite", (tx) => void tx.objectStore(STORES.kv).put(value, key));
  }

  async put(store: Exclude<StoreName, "kv">, value: Completion | JournalEntry | GoalRecord) {
    await this.run(store, "readwrite", (tx) => void tx.objectStore(store).put(value));
  }

  async remove(store: StoreName, key: string) {
    await this.run(store, "readwrite", (tx) => void tx.objectStore(store).delete(key));
  }

  async clear(store: StoreName) {
    await this.run(store, "readwrite", (tx) => void tx.objectStore(store).clear());
  }

  async destroy() {
    try {
      this.db.close();
    } catch {
      /* already closed */
    }
    await new Promise<void>((resolve, reject) => {
      const r = this.idb.deleteDatabase(DB_NAME);
      r.onsuccess = () => resolve();
      r.onerror = () => reject(r.error);
      r.onblocked = () => resolve(); // other tabs close on versionchange; deletion completes after
    });
  }
}

export class MemoryStorage implements Storage {
  readonly kind = "memory" as const;
  private kv = new Map<string, unknown>();
  private stores: Record<Exclude<StoreName, "kv">, Map<string, unknown>> = {
    completions: new Map(),
    journal: new Map(),
    goals: new Map(),
  };
  async loadAll() {
    return normalise({
      profile: this.kv.get(KV_KEYS.profile),
      settings: this.kv.get(KV_KEYS.settings),
      salah: this.kv.get(KV_KEYS.salah),
      completions: [...this.stores.completions.values()],
      journal: [...this.stores.journal.values()],
      goals: [...this.stores.goals.values()],
    });
  }
  async putKv(key: string, value: unknown) {
    this.kv.set(key, structuredClone(value));
  }
  async put(store: Exclude<StoreName, "kv">, value: Completion | JournalEntry | GoalRecord) {
    this.stores[store].set(value.id, structuredClone(value));
  }
  async remove(store: StoreName, key: string) {
    if (store === "kv") this.kv.delete(key);
    else this.stores[store].delete(key);
  }
  async clear(store: StoreName) {
    if (store === "kv") this.kv.clear();
    else this.stores[store].clear();
  }
  async destroy() {
    this.kv.clear();
    Object.values(this.stores).forEach((s) => s.clear());
  }
}

/** Opens device storage, falling back to memory when IndexedDB is unavailable. */
export async function openStorage(): Promise<Storage> {
  try {
    if (typeof indexedDB === "undefined") throw new Error("IndexedDB unavailable");
    const db = await openDatabase(indexedDB);
    return new IdbStorage(db, indexedDB);
  } catch {
    return new MemoryStorage();
  }
}

/** Ask the browser to keep our data (reduces eviction risk, especially on iOS). */
export async function requestPersistence(): Promise<boolean> {
  try {
    if (navigator.storage?.persist) return await navigator.storage.persist();
  } catch {
    /* not supported */
  }
  return false;
}
