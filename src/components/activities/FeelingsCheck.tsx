"use client";

import { useState } from "react";
import { Icon } from "../Icon";

const FEELINGS = [
  { id: "happy", icon: "heart", label: "Happy", reply: "Stories can fill us with happy feelings. What was your favourite part?" },
  { id: "proud", icon: "star", label: "Proud", reply: "Feeling proud is lovely. Doing the right thing can make us glow inside!" },
  { id: "calm", icon: "moon", label: "Calm", reply: "A calm heart is a gift. Take a slow breath and smile." },
  { id: "thinking", icon: "thought", label: "Thinking", reply: "Great thinkers ask questions. You could talk about this story with your family." },
] as const;

/** "How did the story make you feel?" A gentle check-in with no right or wrong answer; nothing is saved. */
export function FeelingsCheck({ title = "How did the story make you feel?" }: { title?: string }) {
  const [pick, setPick] = useState<(typeof FEELINGS)[number] | null>(null);
  return (
    <section className="card lav stack" aria-labelledby="feel-h">
      <h2 id="feel-h" style={{ margin: 0 }}>
        {title}
      </h2>
      <div className="feelings" role="radiogroup" aria-labelledby="feel-h">
        {FEELINGS.map((f) => (
          <button key={f.id} type="button" role="radio" aria-checked={pick?.id === f.id} className={`feeling${pick?.id === f.id ? " on" : ""}`} onClick={() => setPick(f)}>
            <span aria-hidden="true" className="feeling-face">
              <Icon name={f.icon} size={28} fill={f.icon === "heart" || f.icon === "star"} strokeWidth={1.8} />
            </span>
            {f.label}
          </button>
        ))}
      </div>
      {pick && (
        <p className="pop" role="status" style={{ margin: 0 }}>
          {pick.reply}
        </p>
      )}
    </section>
  );
}
