"use client";

import { useState } from "react";
import { Illustration } from "@/components/art/Illustration";
import type { Mission } from "@/content/types";
import { STAR_VALUES } from "@/content/copy";
import { has } from "@/storage/rewards";
import { useApp } from "@/state/AppState";

/** A kindness mission with "I did it!" and an optional private reflection. */
export function MissionCard({ mission, day }: { mission: Mission; day?: number }) {
  const { data, complete } = useApp();
  const done = has(data.completions, "kindness", mission.id);
  const saved = data.completions.find((c) => c.kind === "kindness" && c.contentId === mission.id);
  const [reflection, setReflection] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <div className="stack">
      <div className="row" style={{ alignItems: "flex-start" }}>
        <Illustration name={mission.illustration} size={72} />
        <div style={{ flex: 1 }}>
          <h3 style={{ marginBottom: 4 }}>{mission.title}</h3>
          <p style={{ margin: 0 }}>{mission.description}</p>
        </div>
      </div>
      {mission.adultHelpRequired && (
        <p className="notice warn" style={{ margin: 0 }}>
          <strong>👪 Do this with a grown-up.</strong> {mission.safetyNote}
        </p>
      )}
      {!mission.adultHelpRequired && mission.safetyNote && <p className="small muted">{mission.safetyNote}</p>}
      {done ? (
        <div className="stack">
          <p className="pill done" style={{ alignSelf: "flex-start", fontSize: "1rem" }}>
            ✓ You did it! Every kind action matters.
          </p>
          {saved?.reflection && (
            <p className="small">
              <strong>Your thought:</strong> {saved.reflection}
            </p>
          )}
        </div>
      ) : (
        <form
          className="stack"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            try {
              await complete("kindness", mission.id, { day, reflection });
            } finally {
              setBusy(false);
            }
          }}
        >
          <label htmlFor={`reflect-${mission.id}`} className="small">
            {mission.reflectionPrompt} <span className="muted">(optional)</span>
          </label>
          <textarea id={`reflect-${mission.id}`} className="input" maxLength={300} value={reflection} onChange={(e) => setReflection(e.target.value)} placeholder="You can write or draw on paper instead. Please don't write names or addresses." />
          <button className="btn gold block" type="submit" disabled={busy}>
            ✋ I did it! (+{STAR_VALUES.kindness} stars)
          </button>
          <p className="small muted" style={{ margin: 0 }}>
            No rush — you can come back and tap this after you&apos;ve done it.
          </p>
        </form>
      )}
    </div>
  );
}
