"use client";

import Link from "next/link";
import { Hilmy } from "@/characters/Characters";
import { HealthNotice, PageHeader } from "@/components/ui";
import { CHILD_SAFETY_POINTS } from "@/content/safety";

export default function SafetyPage() {
  return (
    <div className="stack-lg">
      <PageHeader title="Your health comes first" back={{ href: "/home/", label: "Home" }} />
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Hilmy size={110} />
      </div>
      <HealthNotice />
      <div className="card stack">
        <h2>If you feel unwell</h2>
        <ol className="stack reader-text" style={{ margin: 0 }}>
          <li>Stop what you are doing.</li>
          <li>Tell your parent or another trusted adult straight away.</li>
          <li>Have a drink or something to eat if your grown-up says so. Stopping a fast is okay!</li>
        </ol>
        <p style={{ margin: 0 }}>Your Ramadan adventure is still special, whatever you do.</p>
      </div>
      <div className="card sky stack">
        <h2>Staying safe</h2>
        <ul className="stack" style={{ margin: 0 }}>
          {CHILD_SAFETY_POINTS.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </div>
      <Link href="/home/" className="btn block">
        Back to Noor&apos;s House
      </Link>
    </div>
  );
}
