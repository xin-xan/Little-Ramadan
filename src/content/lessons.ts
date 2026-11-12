import type { Lesson } from "./types";
import data from "./data/lessons.json";

/**
 * DRAFT educational content. Not yet reviewed by a qualified Islamic content
 * reviewer (see docs/content-review-record.md). Contains no Quran or hadith
 * quotations, translations or attributions by design.
 */

export const lessons = data as Lesson[];

export const lessonById = (id: string) => lessons.find((l) => l.id === id);
