import type { Mission } from "./types";
import data from "./data/missions.json";

/**
 * Kindness missions. Never ask children to photograph, name or publicly
 * report people they help. Anything involving food, heat, sharp tools,
 * money, leaving home or contacting people is marked adultHelpRequired.
 */
export const missions = data as Mission[];

export const missionById = (id: string) => missions.find((m) => m.id === id);
