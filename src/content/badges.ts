import type { Badge } from "./types";
import data from "./data/badges.json";

/**
 * Badges recognise learning, kindness and participation only.
 * No rule may ever reference fasting or the fasting journal.
 */
export const badges = data as Badge[];
