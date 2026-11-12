import type { Story } from "./types";
import data from "./data/stories.json";

/**
 * Original fictional stories with Noor and Amina. They illustrate values;
 * they are not religious teachings. DRAFT until reviewed.
 */

export const stories = data as Story[];

export const storyById = (id: string) => stories.find((s) => s.id === id);
