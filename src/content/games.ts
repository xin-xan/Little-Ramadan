import type { GameInfo, IllustrationKey, SortCard, VocabTerm } from "./types";
import gamesData from "./data/games.json";
import vocabData from "./data/vocabulary.json";
import pictureData from "./data/picture-words.json";
import sortData from "./data/sort-cards.json";
import lanternData from "./data/lantern-designs.json";
import memoryData from "./data/memory-cards.json";


export const games = gamesData as GameInfo[];

export const gameById = (id: string) => games.find((g) => g.id === id);

export const vocabulary = vocabData as VocabTerm[];

/** Word-to-picture pairs for "Match the Words". */
export const pictureWords = pictureData as { id: string; word: string; illustration: IllustrationKey; picture: string; hint: string }[];

/** Cards for "Sort the Good Deeds". Language explains gently; never shames. */
export const sortCards = sortData as SortCard[];

/** Lantern designs for "Find the Missing Lantern". Names are spoken/read so colour is never the only cue. */
export const lanternDesigns = lanternData as { id: string; name: string; body: string; glow: string; shape: "round" | "tall" | "star" | "diamond" }[];

/** Picture cards for "Memory Cards". */
export const memoryCards = memoryData as { id: string; label: string; illustration: IllustrationKey }[];
