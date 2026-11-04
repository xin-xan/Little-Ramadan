"use client";

import Link from "next/link";
import { Noor } from "@/characters/Characters";
import { Illustration } from "@/components/art/Illustration";
import { PageHeader, ProgressBar } from "@/components/ui";
import { missions } from "@/content/missions";
import { localISODate } from "@/storage/calendar";
import { countKind, has } from "@/storage/rewards";
import { useApp } from "@/state/AppState";
import { Icon } from "@/components/Icon";

/** Rotating "kindness of the day" so the street feels fresh without any streak pressure. */
function missionOfTheDay(doneIds: Set<string>) {
  const day = Math.floor(Date.parse(localISODate()) / 86_400_000);
  const open = missions.filter((m) => !doneIds.has(m.id));
  const pool = open.length ? open : missions;
  return pool[day % pool.length];
}

export default function KindnessPage() {
  const { data } = useApp();
  const doneIds = new Set(data.completions.filter((c) => c.kind === "kindness").map((c) => c.contentId));
  const featured = missionOfTheDay(doneIds);
  return (
    <div className="stack-lg">
      <PageHeader title="Kindness Street" back={{ href: "/home/", label: "Home" }} />
      <div className="speech">
        <Noor size={84} expression="cheer" />
        <div className="bubble">
          <span className="who">Noor</span>
          Every kind action matters! Choose a mission, do it in real life, then tap &quot;I did it!&quot;.
        </div>
      </div>
      <ProgressBar value={countKind(data.completions, "kindness")} max={missions.length} label="Kind things done" />
      <Link href={`/kindness/${featured.id}/`} className="card gold row" style={{ textDecoration: "none", color: "inherit" }}>
        <Illustration name={featured.illustration} size={64} />
        <span>
          <span className="small" style={{ fontWeight: 800 }}>
            Idea for today
          </span>
          <strong style={{ display: "block", color: "var(--emerald)" }}>{featured.title}</strong>
          <span className="small">{featured.description}</span>
        </span>
      </Link>
      <ul className="stack" style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {missions.map((m) => {
          const done = has(data.completions, "kindness", m.id);
          return (
            <li key={m.id}>
              <Link href={`/kindness/${m.id}/`} className="list-link">
                <Illustration name={m.illustration} size={52} />
                <span className="grow">
                  <strong>{m.title}</strong>
                  <span className="small muted">{m.adultHelpRequired ? "With a grown-up" : m.description}</span>
                </span>
                <span className={`pill ${done ? "done" : ""}`}>{done ? <><Icon name="check" size={14} strokeWidth={3} /> Done</> : "Try it"}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
