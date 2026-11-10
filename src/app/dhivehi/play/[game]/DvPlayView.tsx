"use client";

import { DvGamePlayer } from "@/components/dhivehi/DvGames";
import { NotFound, PageHeader } from "@/components/ui";
import { dvGameById, dvPlayId } from "@/content/dhivehi";
import { useApp } from "@/state/AppState";

export function DvPlayView({ id }: { id: string }) {
  const { complete } = useApp();
  const game = dvGameById(id);
  if (!game) return <NotFound what="game" back={{ href: "/dhivehi/", label: "Learn Dhivehi" }} />;
  return (
    <div className="stack-lg">
      <PageHeader title={game.title} back={{ href: "/dhivehi/", label: "Learn Dhivehi" }} />
      <p className="small muted" style={{ margin: 0 }}>
        {game.howToPlay.join(" ")} No timer. Take your time!
      </p>
      <DvGamePlayer game={game.id} onFinish={() => complete("dhivehi", dvPlayId(game.id))} />
    </div>
  );
}
