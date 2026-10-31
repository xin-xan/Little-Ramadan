"use client";

import Link from "next/link";
import { useState } from "react";
import { Noor } from "@/characters/Characters";
import { CrescentArt, LanternArt, MosqueArt, PalmArt, StarArt } from "@/components/art/Illustration";
import { countKind, unlockedBadgeIds, unlockedDecorationIds } from "@/storage/rewards";
import { useApp } from "@/state/AppState";

export const DESTINATIONS = [
  { id: "house", name: "Noor's House", what: "Daily missions", href: "/journey/", icon: "🏠", x: 18, y: 64 },
  { id: "garden", name: "Knowledge Garden", what: "Stories and lessons", href: "/learn/", icon: "🌴", x: 50, y: 40 },
  { id: "street", name: "Kindness Street", what: "Good deeds", href: "/kindness/", icon: "💗", x: 82, y: 64 },
  { id: "palace", name: "Puzzle Palace", what: "Quizzes and games", href: "/games/", icon: "🧩", x: 26, y: 88 },
  { id: "square", name: "Celebration Square", what: "Stars, badges and Eid", href: "/rewards/", icon: "🎉", x: 74, y: 88 },
] as const;

/** Low-powered device heuristic for the automatic simple village. */
export function isLowPowerDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  return (nav.deviceMemory !== undefined && nav.deviceMemory <= 2) || (nav.hardwareConcurrency !== undefined && nav.hardwareConcurrency <= 2) || nav.connection?.saveData === true;
}

function SimpleVillage() {
  return (
    <ul className="stack" style={{ listStyle: "none", padding: 0, margin: 0 }} aria-label="Village places">
      {DESTINATIONS.map((d) => (
        <li key={d.id}>
          <Link href={d.href} className="list-link">
            <span style={{ fontSize: "2rem" }} aria-hidden="true">
              {d.icon}
            </span>
            <span className="grow">
              <strong>{d.name}</strong>
              <span className="small muted">{d.what}</span>
            </span>
            <span aria-hidden="true">›</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function SceneArt({ lanterns, flowers, stars, animate }: { lanterns: number; flowers: number; stars: number; animate: boolean }) {
  return (
    <svg viewBox="0 0 400 300" width="100%" style={{ display: "block" }} aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="vsky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1D2B4F" />
          <stop offset="1" stopColor="#3B4F86" />
        </linearGradient>
        <linearGradient id="vsea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2F7FA0" />
          <stop offset="1" stopColor="#1F5D7A" />
        </linearGradient>
        <radialGradient id="vglow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#FFE9A8" stopOpacity="0.7" />
          <stop offset="1" stopColor="#FFE9A8" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="300" fill="url(#vsky)" />
      {/* stars: more appear as badges are earned */}
      {Array.from({ length: 6 + stars * 2 }, (_, i) => (
        <g key={i} className={animate ? "twinkle" : undefined} style={{ animationDelay: `${(i % 5) * 0.6}s` }}>
          <StarArt x={(i * 67 + 23) % 390} y={(i * 37 + 11) % 90 + 6} r={i % 3 === 0 ? 4 : 2.5} fill={i % 2 ? "#FFF7E8" : "#E9C66B"} />
        </g>
      ))}
      <CrescentArt x={340} y={44} r={22} />
      {/* sea and island */}
      <rect y="150" width="400" height="150" fill="url(#vsea)" />
      <path d="M0 170 h60 M120 190 h50 M300 176 h70" stroke="#fff" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M-10 300 Q20 170 200 160 Q380 170 410 300 Z" fill="#F3DFB3" />
      <path d="M30 300 Q60 196 200 188 Q340 196 370 300 Z" fill="#E8CD94" opacity="0.5" />
      {/* village mosque landmark (fictional design) */}
      <g transform="translate(150 80) scale(1)">
        <MosqueArt ground={false} />
      </g>
      <PalmArt x={60} y={190} s={1.1} />
      <PalmArt x={350} y={196} s={1} />
      <PalmArt x={230} y={170} s={0.8} />
      {/* Noor's House */}
      <g transform="translate(40 168)">
        <rect x="0" y="16" width="62" height="40" rx="4" fill="#FFF7E8" />
        <path d="M-6 18 L31 -8 L68 18 Z" fill="#286356" />
        <rect x="24" y="32" width="14" height="24" rx="3" fill="#8A5A3B" />
        <rect x="6" y="26" width="12" height="10" rx="2" fill="#FFD27A" />
        <rect x="44" y="26" width="12" height="10" rx="2" fill="#FFD27A" />
      </g>
      {/* Kindness Street houses */}
      <g transform="translate(296 168)">
        <rect x="0" y="12" width="30" height="40" rx="3" fill="#F3C6D3" />
        <rect x="32" y="4" width="34" height="48" rx="3" fill="#BBD8E8" />
        <path d="M-4 14 L15 -2 L34 14 Z" fill="#C2577E" />
        <path d="M28 6 L49 -10 L70 6 Z" fill="#2F6FA8" />
        <rect x="10" y="34" width="10" height="18" fill="#8A5A3B" />
        <rect x="44" y="34" width="10" height="18" fill="#8A5A3B" />
      </g>
      {/* Puzzle Palace */}
      <g transform="translate(70 232)">
        <rect x="0" y="10" width="70" height="40" rx="4" fill="#D9CFF0" />
        <rect x="-6" y="0" width="16" height="50" rx="3" fill="#B9A6E3" />
        <rect x="60" y="0" width="16" height="50" rx="3" fill="#B9A6E3" />
        <path d="M24 10 Q35 -12 46 10 Z" fill="#7A5FB5" />
        <rect x="28" y="28" width="14" height="22" rx="7" fill="#7A5FB5" />
      </g>
      {/* Celebration Square */}
      <g transform="translate(262 236)">
        <ellipse cx="38" cy="44" rx="48" ry="10" fill="#E9C66B" opacity="0.6" />
        <path d="M0 4 Q38 26 76 4" stroke="#8A5A3B" strokeWidth="2" fill="none" />
        {[8, 22, 36, 50, 64].map((x, i) => (
          <path key={x} d={`M${x} ${8 + Math.sin((i / 4) * Math.PI) * 10} l5 12 l5 -12 Z`} fill={["#E9C66B", "#286356", "#E2725B", "#286356", "#E9C66B"][i]} />
        ))}
        <rect x="34" y="18" width="6" height="26" fill="#8A5A3B" />
        <circle cx="37" cy="16" r="8" fill="#E2725B" />
      </g>
      {/* Knowledge Garden */}
      <g transform="translate(176 150)">
        <ellipse cx="24" cy="28" rx="34" ry="10" fill="#8CC084" />
        <circle cx="10" cy="20" r="7" fill="#E2725B" />
        <circle cx="38" cy="18" r="7" fill="#F3C6D3" />
        <rect x="16" y="10" width="16" height="12" rx="2" fill="#286356" />
      </g>
      {/* lantern string: one lantern lights up for each unlocked decoration */}
      <path d="M0 140 Q200 176 400 140" stroke="#8A5A3B" strokeWidth="1.5" fill="none" />
      {Array.from({ length: 12 }, (_, i) => {
        const x = 18 + i * 33;
        const y = 140 + Math.sin((x / 400) * Math.PI) * 18;
        const lit = i < lanterns;
        return (
          <g key={i} className={lit && animate ? "sway" : undefined} style={{ transformOrigin: `${x}px ${y}px`, animationDelay: `${i * 0.3}s` }}>
            {lit && <circle cx={x} cy={y + 14} r="12" fill="url(#vglow)" />}
            <LanternArt x={x} y={y + 2} s={0.32} body={lit ? "#E9C66B" : "#6C7A8C"} glow={lit ? "#FFE9A8" : "#9AA6B4"} />
          </g>
        );
      })}
      {/* flowers along the path: one for each kindness mission (up to 8) */}
      {Array.from({ length: Math.min(8, flowers) }, (_, i) => (
        <g key={i}>
          <circle cx={130 + i * 20} cy={226 + (i % 2) * 8} r="5" fill={i % 2 ? "#E2725B" : "#F3C6D3"} />
          <circle cx={130 + i * 20} cy={226 + (i % 2) * 8} r="1.8" fill="#E9C66B" />
        </g>
      ))}
    </svg>
  );
}

export function VillageScene() {
  const { data, updateSettings } = useApp();
  const mode = data.settings.villageMode;
  // Page content only renders on the client (after local data loads), so this is safe to read once.
  const [lowPower] = useState(isLowPowerDevice);
  const simple = mode === "simple" || (mode === "auto" && lowPower);
  const animate = !data.settings.reducedMotion;

  const toggle = (
    <button type="button" className="btn ghost small" onClick={() => updateSettings({ villageMode: simple ? "scene" : "simple" })}>
      {simple ? "Show village picture" : "Show simple list"}
    </button>
  );

  if (simple)
    return (
      <div className="stack">
        <SimpleVillage />
        {toggle}
      </div>
    );

  const c = data.completions;
  return (
    <div className="stack">
      <div style={{ position: "relative", borderRadius: 24, overflow: "hidden", boxShadow: "var(--shadow-soft)", aspectRatio: "4 / 3" }}>
        <SceneArt lanterns={unlockedDecorationIds(c).length} flowers={countKind(c, "kindness")} stars={unlockedBadgeIds(c).length} animate={animate} />
        <div style={{ position: "absolute", left: "2%", bottom: "28%", width: "17%" }} className={animate ? "float" : undefined}>
          <Noor size={70} expression="wave" title="Noor waving" />
        </div>
        <nav aria-label="Village places">
          {DESTINATIONS.map((d) => (
            <Link
              key={d.id}
              href={d.href}
              style={{
                position: "absolute",
                left: `${d.x}%`,
                top: `${d.y}%`,
                transform: "translate(-50%, -50%)",
                background: "rgba(255,253,246,0.95)",
                color: "var(--emerald)",
                borderRadius: 999,
                padding: "6px 10px",
                minHeight: 44,
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontWeight: 800,
                fontSize: "0.8rem",
                textDecoration: "none",
                boxShadow: "0 4px 0 rgba(18,60,53,.25)",
                whiteSpace: "nowrap",
              }}
            >
              <span aria-hidden="true">{d.icon}</span>
              {d.name}
            </Link>
          ))}
        </nav>
      </div>
      {toggle}
    </div>
  );
}
