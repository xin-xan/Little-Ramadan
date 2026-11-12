/** Every illustration the content may reference. Each key has original SVG art in Illustration.tsx. */
export const ILLUSTRATION_KEYS = [
  "crescent",
  "lantern",
  "dates",
  "mosque",
  "book",
  "prayer-mat",
  "family-table",
  "heart-hands",
  "maldivian-food",
  "water",
  "sunrise",
  "sunset",
  "star",
  "gift",
  "tidy",
  "card",
  "reading",
  "garden",
  "calendar",
  "night-sky",
  "charity-box",
  "island",
  "eid",
  "sharing",
  "thank-you",
  "hourglass",
  "smile",
  "dua",
  "shoes",
  "family",
  "pillars",
  "toys",
  "phone-call",
  "puzzle",
  "memory",
  "quiz",
  "match",
  "sort",
  "abc",
] as const;

/** A built-in illustration, or "img:<file>" for a picture uploaded in the admin dashboard (public/content-images/). */
export type IllustrationKey = (typeof ILLUSTRATION_KEYS)[number] | `img:${string}`;

/** URL of an uploaded content picture ("img:boat.webp" -> "/content-images/boat.webp"). */
export function contentImageUrl(key: string): string | null {
  if (!key.startsWith("img:")) return null;
  const file = key.slice(4).replace(/[^a-zA-Z0-9._-]/g, "");
  return file ? `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/content-images/${file}` : null;
}
