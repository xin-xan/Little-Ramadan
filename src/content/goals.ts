import type { Goal } from "./types";
import data from "./data/goals.json";

/** Optional, private, adjustable personal goals chosen with a parent. */
export const goals = data as Goal[];

export const MAX_ACTIVE_GOALS = 3;
