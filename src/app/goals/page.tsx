"use client";

import { Illustration } from "@/components/art/Illustration";
import { PageHeader, SpeechBubble } from "@/components/ui";
import { STAR_VALUES } from "@/content/copy";
import { goals, MAX_ACTIVE_GOALS } from "@/content/goals";
import { useApp } from "@/state/AppState";
import { Icon } from "@/components/Icon";

export default function GoalsPage() {
  const { data, chooseGoal, removeGoal, completeGoal } = useApp();
  const chosen = new Map(data.goals.map((g) => [g.id, g]));
  const active = data.goals.filter((g) => !g.completedAt).length;

  return (
    <div className="stack-lg">
      <PageHeader title="My Ramadan Goals" back={{ href: "/home/", label: "Home" }} />
      <SpeechBubble who="amina">
        Choose up to {MAX_ACTIVE_GOALS} goals with a grown-up. You can change them any time. There&apos;s no rush — every little step counts!
      </SpeechBubble>
      <ul className="stack" style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {goals.map((g) => {
          const rec = chosen.get(g.id);
          const done = !!rec?.completedAt;
          return (
            <li key={g.id} className="card stack" style={{ background: done ? "var(--success-bg)" : rec ? "#fbf0cf" : undefined }}>
              <div className="row">
                <Illustration name={g.illustration} size={56} />
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: "1.1rem", marginBottom: 2 }}>{g.title}</h2>
                  <p className="small" style={{ margin: 0 }}>
                    {g.description}
                  </p>
                </div>
              </div>
              {done ? (
                <p className="pill done" style={{ alignSelf: "flex-start" }}>
                  <Icon name="check" size={14} strokeWidth={3} /> Goal finished! Wonderful effort.
                </p>
              ) : rec ? (
                <div className="row wrap">
                  <button className="btn gold" onClick={() => completeGoal(g.id)}>
                    I did it! (+{STAR_VALUES.goal} stars)
                  </button>
                  <button className="btn ghost" onClick={() => removeGoal(g.id)}>
                    Remove goal
                  </button>
                </div>
              ) : (
                <button className="btn secondary" onClick={() => chooseGoal(g.id)} disabled={active >= MAX_ACTIVE_GOALS} aria-describedby={active >= MAX_ACTIVE_GOALS ? "goal-limit" : undefined}>
                  Choose this goal
                </button>
              )}
            </li>
          );
        })}
      </ul>
      {active >= MAX_ACTIVE_GOALS && (
        <p id="goal-limit" className="notice">
          You have {MAX_ACTIVE_GOALS} goals at the moment. Finish or remove one to choose another.
        </p>
      )}
    </div>
  );
}
