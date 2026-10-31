"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { badges } from "@/content/badges";
import { decorations } from "@/content/decorations";
import { MemoryStorage, openStorage, requestPersistence, type Storage } from "@/storage/db";
import { completionId, starsFor, unlockedBadgeIds, unlockedDecorationIds } from "@/storage/rewards";
import {
  DEFAULT_SETTINGS,
  EMPTY_ROOM,
  KV_KEYS,
  STORES,
  cleanNickname,
  nicknameProblem,
  validateSettings,
  type AppData,
  type ChildProfile,
  type Completion,
  type CompletionKind,
  type GoalRecord,
  type JournalEntry,
  type JournalExperience,
  type Settings,
} from "@/storage/schema";
import { playSound } from "@/accessibility/sound";
import type { RoomSlot } from "@/content/types";

export interface Celebration {
  id: string;
  stars: number;
  badgeIds: string[];
  decorationIds: string[];
}

type Status = "loading" | "ready" | "error";

interface AppState {
  status: Status;
  error: string | null;
  storageKind: Storage["kind"] | null;
  data: AppData;
  celebration: Celebration | null;
  dismissCelebration(): void;
  createProfile(input: { nickname: string; avatar: string; soundOn: boolean; reducedMotion: boolean }): Promise<void>;
  updateProfile(patch: Partial<Pick<ChildProfile, "nickname" | "avatar">>): Promise<void>;
  updateSettings(patch: Partial<Settings>): Promise<void>;
  complete(kind: CompletionKind, contentId: string, opts?: { day?: number; reflection?: string; silent?: boolean }): Promise<boolean>;
  saveReflection(dayId: string, day: number, text: string): Promise<void>;
  addJournalEntry(input: { experience: JournalExperience; note?: string; date: string }): Promise<void>;
  deleteJournalEntry(id: string): Promise<void>;
  clearJournal(): Promise<void>;
  chooseGoal(id: string): Promise<void>;
  removeGoal(id: string): Promise<void>;
  completeGoal(id: string): Promise<void>;
  setRoomSlot(slot: RoomSlot, decorationId: string | null): Promise<void>;
  resetProgress(): Promise<void>;
  deleteEverything(): Promise<void>;
  retry(): void;
}

const emptyData = (): AppData => ({ profile: null, settings: structuredClone(DEFAULT_SETTINGS), completions: [], journal: [], goals: [], room: structuredClone(EMPTY_ROOM) });

const Ctx = createContext<AppState | null>(null);

const newId = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);

export function AppStateProvider({ children, storageFactory = openStorage }: { children: ReactNode; storageFactory?: () => Promise<Storage> }) {
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AppData>(emptyData);
  const [celebration, setCelebration] = useState<Celebration | null>(null);
  const [attempt, setAttempt] = useState(0);
  const storageRef = useRef<Storage | null>(null);
  const dataRef = useRef(data);
  const [storageKind, setStorageKind] = useState<Storage["kind"] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const s = await storageFactory();
        const loaded = await s.loadAll();
        if (cancelled) return;
        storageRef.current = s;
        setStorageKind(s.kind);
        dataRef.current = loaded;
        setData(loaded);
        setStatus("ready");
        if (s.kind === "indexeddb" && loaded.profile) void requestPersistence();
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Could not open saved progress");
        setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [storageFactory, attempt]);

  const store = () => {
    if (!storageRef.current) storageRef.current = new MemoryStorage();
    return storageRef.current;
  };

  const commit = useCallback((next: AppData) => {
    dataRef.current = next;
    setData(next);
  }, []);

  const updateSettings = useCallback(
    async (patch: Partial<Settings>) => {
      const settings = validateSettings({ ...dataRef.current.settings, ...patch });
      await store().putKv(KV_KEYS.settings, settings);
      commit({ ...dataRef.current, settings });
    },
    [commit],
  );

  const createProfile: AppState["createProfile"] = useCallback(
    async ({ nickname, avatar, soundOn, reducedMotion }) => {
      const name = cleanNickname(nickname);
      const problem = nicknameProblem(name);
      if (problem) throw new Error(problem);
      const profile: ChildProfile = { nickname: name, avatar, createdAt: new Date().toISOString() };
      const settings = validateSettings({ ...dataRef.current.settings, soundOn, reducedMotion, consentAt: new Date().toISOString() });
      await store().putKv(KV_KEYS.profile, profile);
      await store().putKv(KV_KEYS.settings, settings);
      commit({ ...dataRef.current, profile, settings });
      if (store().kind === "indexeddb") void requestPersistence();
    },
    [commit],
  );

  const updateProfile: AppState["updateProfile"] = useCallback(
    async (patch) => {
      const cur = dataRef.current.profile;
      if (!cur) return;
      const nickname = patch.nickname !== undefined ? cleanNickname(patch.nickname) : cur.nickname;
      const problem = nicknameProblem(nickname);
      if (problem) throw new Error(problem);
      const profile = { ...cur, ...patch, nickname };
      await store().putKv(KV_KEYS.profile, profile);
      commit({ ...dataRef.current, profile });
    },
    [commit],
  );

  const complete: AppState["complete"] = useCallback(
    async (kind, contentId, opts = {}) => {
      const cur = dataRef.current;
      const id = completionId(kind, contentId);
      if (cur.completions.some((c) => c.id === id)) return false; // rewarded once; revisiting is always allowed
      const c: Completion = { id, kind, contentId, completedAt: new Date().toISOString() };
      if (opts.day) c.day = opts.day;
      if (opts.reflection?.trim()) c.reflection = opts.reflection.trim().slice(0, 300);
      await store().put(STORES.completions, c);
      const completions = [...cur.completions, c];
      const beforeBadges = new Set(unlockedBadgeIds(cur.completions));
      const beforeDecor = new Set(unlockedDecorationIds(cur.completions));
      const newBadges = unlockedBadgeIds(completions).filter((b) => !beforeBadges.has(b));
      const newDecor = unlockedDecorationIds(completions).filter((d) => !beforeDecor.has(d));
      commit({ ...cur, completions });
      const stars = starsFor(kind);
      if (!opts.silent && (stars > 0 || newBadges.length || newDecor.length)) {
        setCelebration({ id: id, stars, badgeIds: newBadges, decorationIds: newDecor });
        if (cur.settings.soundOn) playSound(newBadges.length ? "badge" : "star");
      }
      return true;
    },
    [commit],
  );

  const saveReflection: AppState["saveReflection"] = useCallback(
    async (dayId, day, text) => {
      const cur = dataRef.current;
      const id = completionId("reflection", dayId);
      const c: Completion = { id, kind: "reflection", contentId: dayId, day, completedAt: new Date().toISOString(), reflection: text.trim().slice(0, 300) };
      await store().put(STORES.completions, c);
      commit({ ...cur, completions: [...cur.completions.filter((x) => x.id !== id), c] });
    },
    [commit],
  );

  const addJournalEntry: AppState["addJournalEntry"] = useCallback(
    async ({ experience, note, date }) => {
      const e: JournalEntry = { id: newId(), date, experience, createdAt: new Date().toISOString() };
      if (note?.trim()) e.note = note.trim().slice(0, 300);
      await store().put(STORES.journal, e);
      commit({ ...dataRef.current, journal: [...dataRef.current.journal, e] });
    },
    [commit],
  );

  const deleteJournalEntry = useCallback(
    async (id: string) => {
      await store().remove(STORES.journal, id);
      commit({ ...dataRef.current, journal: dataRef.current.journal.filter((j) => j.id !== id) });
    },
    [commit],
  );

  const clearJournal = useCallback(async () => {
    await store().clear(STORES.journal);
    commit({ ...dataRef.current, journal: [] });
  }, [commit]);

  const chooseGoal = useCallback(
    async (id: string) => {
      if (dataRef.current.goals.some((g) => g.id === id)) return;
      const g: GoalRecord = { id, chosenAt: new Date().toISOString() };
      await store().put(STORES.goals, g);
      commit({ ...dataRef.current, goals: [...dataRef.current.goals, g] });
    },
    [commit],
  );

  const removeGoal = useCallback(
    async (id: string) => {
      await store().remove(STORES.goals, id);
      commit({ ...dataRef.current, goals: dataRef.current.goals.filter((g) => g.id !== id) });
    },
    [commit],
  );

  const completeGoal = useCallback(
    async (id: string) => {
      const cur = dataRef.current.goals.find((g) => g.id === id);
      if (!cur || cur.completedAt) return;
      const g = { ...cur, completedAt: new Date().toISOString() };
      await store().put(STORES.goals, g);
      commit({ ...dataRef.current, goals: dataRef.current.goals.map((x) => (x.id === id ? g : x)) });
      await complete("goal", id);
    },
    [commit, complete],
  );

  const setRoomSlot = useCallback(
    async (slot: RoomSlot, decorationId: string | null) => {
      const slots = { ...dataRef.current.room.slots };
      if (decorationId) slots[slot] = decorationId;
      else delete slots[slot];
      const room = { slots };
      await store().putKv(KV_KEYS.room, room);
      commit({ ...dataRef.current, room });
    },
    [commit],
  );

  const resetProgress = useCallback(async () => {
    const s = store();
    await s.clear(STORES.completions);
    await s.clear(STORES.goals);
    await s.putKv(KV_KEYS.room, EMPTY_ROOM);
    const settings = validateSettings({ ...dataRef.current.settings, seenBadges: [], seenDecorations: [] });
    await s.putKv(KV_KEYS.settings, settings);
    setCelebration(null);
    commit({ ...dataRef.current, completions: [], goals: [], room: structuredClone(EMPTY_ROOM), settings });
  }, [commit]);

  const deleteEverything = useCallback(async () => {
    await store().destroy();
    storageRef.current = null;
    setCelebration(null);
    commit(emptyData());
    // Re-open a fresh, empty database for the next profile.
    setStatus("loading");
    setAttempt((a) => a + 1);
  }, [commit]);

  const value = useMemo<AppState>(
    () => ({
      status,
      error,
      storageKind,
      data,
      celebration,
      dismissCelebration: () => setCelebration(null),
      createProfile,
      updateProfile,
      updateSettings,
      complete,
      saveReflection,
      addJournalEntry,
      deleteJournalEntry,
      clearJournal,
      chooseGoal,
      removeGoal,
      completeGoal,
      setRoomSlot,
      resetProgress,
      deleteEverything,
      retry: () => {
        setStatus("loading");
        setAttempt((a) => a + 1);
      },
    }),
    [status, error, storageKind, data, celebration, createProfile, updateProfile, updateSettings, complete, saveReflection, addJournalEntry, deleteJournalEntry, clearJournal, chooseGoal, removeGoal, completeGoal, setRoomSlot, resetProgress, deleteEverything],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp must be used inside AppStateProvider");
  return v;
}

export const badgeById = (id: string) => badges.find((b) => b.id === id);
export const decorationInfo = (id: string) => decorations.find((d) => d.id === id);
