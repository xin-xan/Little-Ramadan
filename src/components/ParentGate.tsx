"use client";

import { useState } from "react";
import { useApp } from "@/state/AppState";
import { checkChallenge, makeChallenge, verifyPin, type GateChallenge } from "@/safety/parentGate";
import { Sheet } from "./ui";
import { Icon, IconChip } from "./Icon";

/**
 * Low-friction parent gate. Not authentication: it simply keeps young
 * children out of grown-up settings. If a parent PIN is set, the PIN is used.
 */
export function ParentGate({ open, onPass, onCancel, reason = "This part is for grown-ups." }: { open: boolean; onPass(): void; onCancel(): void; reason?: string }) {
  const { data } = useApp();
  const pin = data.settings.parentPin;
  const [challenge, setChallenge] = useState<GateChallenge>(() => makeChallenge());
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setValue("");
    setError(null);
    setChallenge(makeChallenge());
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const ok = pin ? await verifyPin(value, pin) : checkChallenge(challenge, value);
      if (ok) {
        reset();
        onPass();
      } else {
        setError(pin ? "That PIN isn't right. Please try again." : "That's not quite right. Here's a new question.");
        setValue("");
        if (!pin) setChallenge(makeChallenge());
      }
    } finally {
      setBusy(false);
    }
  };

  const press = (d: string) => setValue((v) => (v.length < 6 ? v + d : v));

  return (
    <Sheet
      open={open}
      onClose={() => {
        reset();
        onCancel();
      }}
      labelledBy="gate-title"
    >
      <form onSubmit={submit} className="stack" aria-describedby="gate-desc">
        <h2 id="gate-title" className="row" style={{ gap: 10 }}>
          <IconChip name="parents" tone="parent" size={40} />
          Grown-ups only
        </h2>
        <p id="gate-desc" className="muted">
          {reason} {pin ? "Please enter your parent PIN." : "Please answer this question."}
        </p>
        {!pin && (
          <p style={{ fontSize: "1.25rem", fontWeight: 800 }} data-testid="gate-question">
            {challenge.prompt}
          </p>
        )}
        <label htmlFor="gate-answer">{pin ? "Parent PIN" : "Answer"}</label>
        <input
          id="gate-answer"
          className="input"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          type={pin ? "password" : "text"}
          value={value}
          onChange={(e) => setValue(e.target.value.replace(/\D/g, "").slice(0, 6))}
          data-autofocus
        />
        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}
        <div className="grid-3" aria-label="Number pad">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
            <button key={d} type="button" className="btn ghost" onClick={() => press(d)} aria-label={`Digit ${d}`}>
              {d}
            </button>
          ))}
          <button type="button" className="btn ghost" onClick={() => setValue((v) => v.slice(0, -1))} aria-label="Delete last digit">
            <Icon name="back" />
          </button>
          <button type="button" className="btn ghost" onClick={() => press("0")} aria-label="Digit 0">
            0
          </button>
          <button type="submit" className="btn" disabled={busy || value === ""}>
            OK
          </button>
        </div>
        <button
          type="button"
          className="btn ghost block"
          onClick={() => {
            reset();
            onCancel();
          }}
        >
          Cancel
        </button>
      </form>
    </Sheet>
  );
}
