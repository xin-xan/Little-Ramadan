"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { playSound } from "@/accessibility/sound";
import { Amina, AminaFlat, Noor, NoorFlat } from "@/characters/Characters";
import { TrophyArt } from "@/components/art/Trophy";
import { Icon } from "@/components/Icon";
import { PageHeader } from "@/components/ui";
import { badges } from "@/content/badges";
import { countKind, progressOf, ruleMet } from "@/storage/rewards";
import { earnedStickers } from "@/storage/stickers";
import { useApp } from "@/state/AppState";

/**
 * My Ramadan Trophy: an animated trophy held up by Noor and Amina, engraved with the child's
 * nickname. It celebrates learning, kindness and taking part. It is not a record of fasting.
 */
export default function TrophyPage() {
  const { data } = useApp();
  const [burst, setBurst] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const exportRef = useRef<SVGSVGElement>(null);
  if (!data.profile) return null;
  const c = data.completions;
  const p = progressOf(c);
  const earned = badges.filter((b) => ruleMet(b.rule, c, p));
  const year = data.settings.calendar.startDate ? new Date(data.settings.calendar.startDate).getFullYear() : new Date().getFullYear();
  const learned = countKind(c, "lesson") + countKind(c, "story");
  const kind = countKind(c, "kindness");
  const played = countKind(c, "quiz") + p.gamesExplored;
  const stickers = earnedStickers(c).length;
  const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
  const highlights = [
    learned ? plural(learned, "story or lesson", "stories and lessons") : "",
    kind ? plural(kind, "kind action", "kind actions") : "",
    played ? plural(played, "quiz or game", "quizzes and games") : "",
    stickers ? plural(stickers, "sticker", "stickers") : "",
  ].filter(Boolean);
  const reduced = data.settings.reducedMotion;

  const W = 900;
  const H = 640;
  /** Saves a picture of the trophy scene (drawn characters, not 3D, so it works everywhere). */
  const save = async () => {
    setError(null);
    try {
      const svgEl = exportRef.current;
      if (!svgEl) return;
      const xml = new XMLSerializer().serializeToString(svgEl);
      const img = new Image();
      const url = URL.createObjectURL(new Blob([xml], { type: "image/svg+xml;charset=utf-8" }));
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Could not draw the trophy picture"));
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
      a.download = `little-ramadan-trophy-${data.profile!.nickname.replace(/\s+/g, "-").toLowerCase()}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="stack-lg">
      <PageHeader title="My Ramadan Trophy" back={{ href: "/rewards/", label: "Celebration Square" }} />
      <section className={`trophy-scene${reduced ? " still" : ""}`} aria-label={`Trophy for ${data.profile.nickname}, held up by Noor and Amina`} role="img">
        <span className="trophy-stars" aria-hidden="true">
          {Array.from({ length: 14 }, (_, i) => (
            <i key={i} style={{ left: `${(i * 37) % 100}%`, top: `${(i * 23) % 45}%`, animationDelay: `${(i % 5) * 0.4}s` }} />
          ))}
        </span>
        <div className="trophy-kid left">
          <Noor expression="cheer" size={112} title="Noor cheering" />
        </div>
        <button
          type="button"
          className="trophy-button"
          aria-label="Tap the trophy!"
          data-sound="none"
          onClick={() => {
            setBurst(burst + 1);
            if (data.settings.soundOn) playSound("celebrate");
          }}
        >
          <svg viewBox="14 14 212 236" width="100%" aria-hidden="true">
            <TrophyArt name={data.profile.nickname} year={year} animate={!reduced} />
          </svg>
          {burst > 0 && (
            <span className="tap-sparkles" key={burst} aria-hidden="true">
              {Array.from({ length: 10 }, (_, i) => (
                <i key={i} style={{ transform: `rotate(${i * 36}deg) translateY(-90px)` }} />
              ))}
            </span>
          )}
        </button>
        <div className="trophy-kid right">
          <Amina expression="cheer" size={112} title="Amina cheering" />
        </div>
      </section>

      <div className="card gold stack center">
        <h2 style={{ margin: 0 }}>Well done, {data.profile.nickname}!</h2>
        <p style={{ margin: 0 }}>Your kindness and learning made Ramadan {year} shine.</p>
        {highlights.length > 0 ? (
          <div className="row wrap" style={{ justifyContent: "center" }}>
            {highlights.map((h) => (
              <span key={h} className="pill">
                {h}
              </span>
            ))}
          </div>
        ) : (
          <p className="small" style={{ margin: 0 }}>Finish lessons, stories and kind missions to fill your trophy with memories!</p>
        )}
        {earned.length > 0 && (
          <p className="small" style={{ margin: 0 }}>
            <strong>Badges:</strong> {earned.map((b) => b.title).join(", ")}
          </p>
        )}
      </div>

      {/* Drawn version of the scene, used only for "Save as picture". */}
      <div style={{ position: "absolute", left: -10000, top: 0, width: 1, height: 1, overflow: "hidden" }} aria-hidden="true">
      <svg ref={exportRef} xmlns="http://www.w3.org/2000/svg" width={W} height={H} viewBox={`0 0 ${W} ${H}`} focusable="false">
        <defs>
          <linearGradient id="exp-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1B2A55" />
            <stop offset="1" stopColor="#2E5C6B" />
          </linearGradient>
        </defs>
        <rect width={W} height={H} fill="url(#exp-sky)" />
        {Array.from({ length: 26 }, (_, i) => (
          <circle key={i} cx={(i * 137) % W} cy={((i * 71) % 200) + 10} r={1 + (i % 3)} fill="#FFF3C4" opacity="0.8" />
        ))}
        <text x={W / 2} y="70" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="34" fontWeight="800" fill="#FFF3C4">
          My Ramadan Trophy
        </text>
        <text x={W / 2} y="110" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="22" fill="#FFFFFF">
          Well done, {data.profile.nickname}!
        </text>
        <g transform="translate(300 140) scale(1.25)">
          <TrophyArt name={data.profile.nickname} year={year} animate={false} />
        </g>
        <g transform="translate(40 250)">
          <NoorFlat expression="cheer" size={260} />
        </g>
        <g transform={`translate(${W - 300} 250)`}>
          <AminaFlat expression="cheer" size={260} />
        </g>
        <text x={W / 2} y={H - 50} textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="20" fill="#FFF3C4">
          {highlights.join("  •  ") || "Ready for a wonderful Ramadan adventure!"}
        </text>
        <text x={W / 2} y={H - 20} textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="14" fill="#BBD8E8">
          Little Ramadan · Celebrating learning, kindness and taking part
        </text>
      </svg>
      </div>

      <div className="stack">
        <button className="btn gold block" onClick={save}>
          <Icon name="download" /> Save as picture
        </button>
        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}
        <p className="small muted center">This trophy celebrates learning, kindness and taking part. It is not a record of fasting.</p>
        <Link href="/rewards/eid/" className="btn ghost block">
          Eid celebration
        </Link>
      </div>
    </div>
  );
}
