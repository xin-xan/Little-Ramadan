/**
 * Derived rewards. Pure functions over `completions` only.
 * Fasting-journal entries are not an input — fasting can never affect stars,
 * badges or decorations (CLAUDE.md §6.4, §6.11).
 */
import { badges } from "@/content/badges";
import { STAR_VALUES } from "@/content/copy";
import { allDays } from "@/content/days";
import { decorations } from "@/content/decorations";
import type { UnlockRule } from "@/content/types";
import type { Completion, CompletionKind } from "./schema";

export function starsFor(kind: CompletionKind): number {
  return STAR_VALUES[kind];
}

export function totalStars(completions: Completion[]): number {
  return completions.reduce((sum, c) => sum + starsFor(c.kind), 0);
}

export const completionId = (kind: CompletionKind, contentId: string) => `${kind}:${contentId}`;

export function has(completions: Completion[], kind: CompletionKind, contentId: string) {
  return completions.some((c) => c.kind === kind && c.contentId === contentId);
}

/** Learning/participation activities (reflection and dayplay records are bookkeeping, not "activities"). */
const ACTIVITY_KINDS: CompletionKind[] = ["lesson", "story", "kindness", "quiz", "game", "goal", "dhivehi"];

export function countKind(completions: Completion[], kind: CompletionKind | "any") {
  if (kind === "any") return completions.filter((c) => ACTIVITY_KINDS.includes(c.kind)).length;
  return completions.filter((c) => c.kind === kind).length;
}

export type DayPart = "learn" | "kindness" | "play";

export function dayPartsDone(completions: Completion[], dayId: string): Record<DayPart, boolean> {
  const d = allDays.find((x) => x.id === dayId);
  if (!d) return { learn: false, kindness: false, play: false };
  return {
    learn: has(completions, d.learn.kind, d.learn.id),
    kindness: has(completions, "kindness", d.kindnessId),
    play: has(completions, "dayplay", d.id),
  };
}

export function isDayComplete(completions: Completion[], dayId: string) {
  const p = dayPartsDone(completions, dayId);
  return p.learn && p.kindness && p.play;
}

export function completedDayIds(completions: Completion[]): string[] {
  return allDays.filter((d) => isDayComplete(completions, d.id)).map((d) => d.id);
}

export function gamesExplored(completions: Completion[]) {
  return countKind(completions, "game");
}

export interface Progress {
  stars: number;
  daysCompleted: number;
  gamesExplored: number;
}

export function progressOf(completions: Completion[]): Progress {
  return { stars: totalStars(completions), daysCompleted: completedDayIds(completions).length, gamesExplored: gamesExplored(completions) };
}

export function ruleMet(rule: UnlockRule, completions: Completion[], p: Progress = progressOf(completions)): boolean {
  switch (rule.type) {
    case "start":
      return true;
    case "count":
      return countKind(completions, rule.kind) >= rule.atLeast;
    case "stars":
      return p.stars >= rule.atLeast;
    case "days":
      return p.daysCompleted >= rule.atLeast;
    case "gamesExplored":
      return p.gamesExplored >= rule.atLeast;
  }
}

/** 0..1 progress towards a rule, for friendly "almost there" bars. */
export function ruleProgress(rule: UnlockRule, completions: Completion[], p: Progress = progressOf(completions)): number {
  const frac = (n: number, of: number) => Math.min(1, of === 0 ? 1 : n / of);
  switch (rule.type) {
    case "start":
      return 1;
    case "count":
      return frac(countKind(completions, rule.kind), rule.atLeast);
    case "stars":
      return frac(p.stars, rule.atLeast);
    case "days":
      return frac(p.daysCompleted, rule.atLeast);
    case "gamesExplored":
      return frac(p.gamesExplored, rule.atLeast);
  }
}

export function unlockedBadgeIds(completions: Completion[]): string[] {
  const p = progressOf(completions);
  return badges.filter((b) => ruleMet(b.rule, completions, p)).map((b) => b.id);
}

export function unlockedDecorationIds(completions: Completion[]): string[] {
  const p = progressOf(completions);
  return decorations.filter((d) => ruleMet(d.rule, completions, p)).map((d) => d.id);
}
