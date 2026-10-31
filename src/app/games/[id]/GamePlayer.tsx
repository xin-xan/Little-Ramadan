"use client";

import { useDayParam } from "@/components/activities/useDayParam";
import { LanternGame } from "@/components/games/LanternGame";
import { MatchWordsGame } from "@/components/games/MatchWordsGame";
import { MemoryGame } from "@/components/games/MemoryGame";
import { PuzzleGame } from "@/components/games/PuzzleGame";
import { SortGame } from "@/components/games/SortGame";
import { VocabGame } from "@/components/games/VocabGame";
import { NotFound } from "@/components/ui";

export function GamePlayer({ id }: { id: string }) {
  const day = useDayParam();
  switch (id) {
    case "match-words":
      return <MatchWordsGame day={day} />;
    case "missing-lantern":
      return <LanternGame day={day} />;
    case "mosque-puzzle":
      return <PuzzleGame day={day} />;
    case "sort-deeds":
      return <SortGame day={day} />;
    case "memory-cards":
      return <MemoryGame day={day} />;
    case "vocab-match":
      return <VocabGame day={day} />;
    default:
      return <NotFound what="game" back={{ href: "/games/", label: "Puzzle Palace" }} />;
  }
}
