"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { PageHeader } from "@/components/ui";
import { badges } from "@/content/badges";
import { countKind, progressOf, ruleMet } from "@/storage/rewards";
import { useApp } from "@/state/AppState";

const W = 1000;
const H = 700;

/**
 * Printable / downloadable certificate. Celebrates participation and learning
 * only — it is not proof of fasting or religious completion.
 */
export default function CertificatePage() {
  const { data } = useApp();
  const svgRef = useRef<SVGSVGElement>(null);
  const [error, setError] = useState<string | null>(null);
  if (!data.profile) return null;
  const c = data.completions;
  const p = progressOf(c);
  const earned = badges.filter((b) => ruleMet(b.rule, c, p)).slice(0, 4);
  const year = data.settings.calendar.startDate ? new Date(data.settings.calendar.startDate).getFullYear() : new Date().getFullYear();
  const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
  const learned = countKind(c, "lesson") + countKind(c, "story");
  const played = countKind(c, "quiz") + p.gamesExplored;
  const highlights = [
    learned ? plural(learned, "story or lesson", "stories and lessons") : "",
    countKind(c, "kindness") ? plural(countKind(c, "kindness"), "kind action", "kind actions") : "",
    played ? plural(played, "quiz or game", "quizzes and games") : "",
  ].filter(Boolean);

  const download = async () => {
    setError(null);
    try {
      const svg = svgRef.current;
      if (!svg) return;
      const xml = new XMLSerializer().serializeToString(svg);
      const img = new Image();
      const url = URL.createObjectURL(new Blob([xml], { type: "image/svg+xml;charset=utf-8" }));
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Could not draw the certificate"));
        img.src = url;
      });
      const canvas = document.createElement("canvas");
      canvas.width = W * 2;
      canvas.height = H * 2;
      const ctx = canvas.getContext("2d")!;
      ctx.scale(2, 2);
      ctx.drawImage(img, 0, 0, W, H);
      URL.revokeObjectURL(url);
      const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/png"));
      if (!blob) throw new Error("Could not create the picture");
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `little-ramadan-certificate-${data.profile!.nickname.replace(/\s+/g, "-").toLowerCase()}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Try printing instead.");
    }
  };

  return (
    <div className="stack-lg">
      <div className="no-print">
        <PageHeader title="My Certificate" back={{ href: "/rewards/", label: "Celebration Square" }} />
      </div>
      <svg ref={svgRef} xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`Certificate: Little Ramadan Journey, celebrating ${data.profile.nickname}`} style={{ display: "block", borderRadius: 12, boxShadow: "var(--shadow-soft)", background: "#FFF7E8" }}>
        <rect width={W} height={H} fill="#FFF7E8" />
        <rect x="24" y="24" width={W - 48} height={H - 48} rx="24" fill="none" stroke="#123C35" strokeWidth="10" />
        <rect x="44" y="44" width={W - 88} height={H - 88} rx="16" fill="none" stroke="#E9C66B" strokeWidth="4" strokeDasharray="14 8" />
        {[
          [90, 90],
          [W - 90, 90],
          [90, H - 150],
          [W - 90, H - 150],
        ].map(([x, y], i) => (
          <g key={i} transform={`translate(${x} ${y}) rotate(45)`}>
            <rect x="-18" y="-18" width="36" height="36" fill="#286356" />
            <rect x="-10" y="-10" width="20" height="20" fill="#E9C66B" />
          </g>
        ))}
        <path d={`M${W / 2 - 6} 70 A34 34 0 1 0 ${W / 2 - 6} 138 A44 44 0 0 1 ${W / 2 - 6} 70 Z`} fill="#E9C66B" />
        <text x={W / 2} y="196" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="30" fontWeight="700" fill="#286356" letterSpacing="4">
          LITTLE RAMADAN JOURNEY
        </text>
        <text x={W / 2} y="246" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="24" fill="#26332F">
          This certificate celebrates
        </text>
        <text x={W / 2} y="322" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="66" fontWeight="800" fill="#123C35">
          {data.profile.nickname}
        </text>
        <text x={W / 2} y="376" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="24" fill="#26332F">
          for joining the Ramadan {year} journey with curiosity and kindness!
        </text>
        <text x={W / 2} y="420" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="21" fill="#286356">
          {highlights.length ? highlights.join("  •  ") : "Ready for a wonderful Ramadan adventure!"}
        </text>
        {earned.length === 0 &&
          [-1, 0, 1].map((k) => (
            <text key={k} x={W / 2 + k * 70} y="510" textAnchor="middle" fontSize="44" fill="#E9C66B">
              ★
            </text>
          ))}
        {earned.map((b, i) => {
          const x = W / 2 + (i - (earned.length - 1) / 2) * 200;
          return (
            <g key={b.id}>
              <circle cx={x} cy="486" r="34" fill="#E9C66B" stroke="#123C35" strokeWidth="4" />
              <text x={x} y="498" textAnchor="middle" fontSize="30">
                ★
              </text>
              <text x={x} y="546" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="18" fontWeight="700" fill="#123C35">
                {b.title}
              </text>
            </g>
          );
        })}
        <text x={W / 2} y="604" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="21" fontStyle="italic" fill="#26332F">
          Well done! Your kindness and learning made Ramadan shine.
        </text>
        <text x={W / 2} y="640" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="16" fill="#4C5C57">
          Little Ramadan · My Little Journey of Faith, Kindness &amp; Discovery · Celebrating learning and participation
        </text>
      </svg>
      <div className="stack no-print">
        <button className="btn gold block" onClick={() => window.print()}>
          🖨️ Print certificate
        </button>
        <button className="btn block" onClick={download}>
          ⬇️ Save as picture
        </button>
        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}
        <p className="small muted center">This certificate celebrates learning, kindness and taking part. It is not a record of fasting.</p>
        <Link href="/rewards/eid/" className="btn ghost block">
          Eid celebration
        </Link>
      </div>
    </div>
  );
}
