"use client";

import Link from "next/link";
import { MissionCard } from "@/components/activities/MissionCard";
import { NotFound, PageHeader } from "@/components/ui";
import { missionById } from "@/content/missions";

export function MissionView({ id }: { id: string }) {
  const mission = missionById(id);
  if (!mission) return <NotFound what="mission" back={{ href: "/kindness/", label: "Kindness Street" }} />;
  return (
    <div className="stack-lg">
      <PageHeader title="Kindness mission" back={{ href: "/kindness/", label: "Kindness Street" }} />
      <div className="card">
        <MissionCard mission={mission} />
      </div>
      <Link href="/kindness/" className="btn ghost block">
        More kindness missions
      </Link>
    </div>
  );
}
