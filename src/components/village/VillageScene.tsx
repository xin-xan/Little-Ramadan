"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { playSound } from "@/accessibility/sound";
import { Icon, IconChip } from "@/components/Icon";
import type { DestinationId, VillageHandle } from "@/three/village";
import { CrescentArt, LanternArt, MosqueArt, PalmArt, StarArt } from "@/components/art/Illustration";
import { completedDayIds, countKind, unlockedBadgeIds } from "@/storage/rewards";
import { useApp } from "@/state/AppState";

export const DESTINATIONS = [
  { id: "house", name: "Noor's House", short: "Noor's House", what: "Daily missions", href: "/journey/", icon: "home", tone: "emerald", x: 20, y: 50 },
  { id: "garden", name: "Knowledge Garden", short: "Garden", what: "Stories and lessons", href: "/learn/", icon: "sprout", tone: "emerald", x: 50, y: 36 },
  { id: "street", name: "Kindness Street", short: "Kindness", what: "Good deeds", href: "/kindness/", icon: "heart", tone: "rose", x: 80, y: 50 },
  { id: "palace", name: "Puzzle Palace", short: "Puzzles", what: "Quizzes and games", href: "/games/", icon: "games", tone: "lavender", x: 28, y: 78 },
  { id: "square", name: "Celebration Square", short: "Celebrate", what: "Stars, badges and Eid", href: "/rewards/", icon: "rewards", tone: "gold", x: 72, y: 78 },
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
            <IconChip name={d.icon} tone={d.tone} />
            <span className="grow">
              <strong>{d.name}</strong>
              <span className="small muted">{d.what}</span>
            </span>
            <Icon name="next" className="chev" />
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
      {/* lantern string: one more lantern lights up for each journey day finished */}
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

type Pins = Record<DestinationId, { x: number; y: number; visible: boolean }>;

/** Interactive 3D village (lazy-loaded). Flat illustrated scene while loading or without WebGL. */
function Village3D({ animate, lowPower }: { animate: boolean; lowPower: boolean }) {
  const { data } = useApp();
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pinRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const handle = useRef<VillageHandle | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "fallback">("loading");
  const c = data.completions;
  // One lantern glows to start, then one more for each journey day finished.
  const lanterns = Math.min(12, 1 + completedDayIds(c).length);
  const flowers = countKind(c, "kindness");
  const init = useRef({ animate, lanterns, flowers, router, sound: data.settings.soundOn });
  useEffect(() => {
    init.current.router = router;
    init.current.sound = data.settings.soundOn;
  }, [router, data.settings.soundOn]);

  useEffect(() => {
    let cancelled = false;
    import("@/three/village")
      .then((m) => {
        if (cancelled || !canvasRef.current) return;
        const h = m.mountVillage(canvasRef.current, {
          animate: init.current.animate,
          lowPower,
          lanterns: init.current.lanterns,
          flowers: init.current.flowers,
          onSelect: (id) => {
            if (init.current.sound) playSound("open");
            const d = DESTINATIONS.find((x) => x.id === id);
            if (d) init.current.router.push(d.href);
          },
          onPins: (pins: Pins) => {
            // Place labels above their buildings, nudging any that would overlap (anchor = bottom centre).
            const placed: { l: number; r: number; t: number; b: number }[] = [];
            const order = (Object.entries(pins) as [string, Pins[DestinationId]][]).sort((a, b) => a[1].y - b[1].y);
            for (const [id, p] of order) {
              const el = pinRefs.current[id];
              if (!el) continue;
              const w = el.offsetWidth;
              const h = el.offsetHeight + 8;
              let y = p.y;
              for (let guard = 0; guard < 6; guard++) {
                const hit = placed.find((q) => p.x - w / 2 < q.r && p.x + w / 2 > q.l && y - h < q.b && y > q.t);
                if (!hit) break;
                y = hit.b + h;
              }
              placed.push({ l: p.x - w / 2, r: p.x + w / 2, t: y - h, b: y });
              el.style.left = `${p.x}px`;
              el.style.top = `${y}px`;
              el.style.visibility = p.visible ? "visible" : "hidden";
            }
          },
        });
        if (!h) return setState("fallback");
        handle.current = h;
        setState("ready");
      })
      .catch(() => !cancelled && setState("fallback"));
    return () => {
      cancelled = true;
      handle.current?.dispose();
      handle.current = null;
    };
  }, [lowPower]);

  useEffect(() => handle.current?.setProgress(lanterns, flowers), [lanterns, flowers, state]);
  useEffect(() => handle.current?.setAnimate(animate), [animate, state]);

  return (
    <div className="village">
      {state !== "ready" && (
        <div style={{ position: "absolute", inset: 0 }} aria-hidden="true">
          <SceneArt lanterns={lanterns} flowers={flowers} stars={unlockedBadgeIds(c).length} animate={false} />
        </div>
      )}
      {state !== "fallback" && <canvas ref={canvasRef} aria-hidden="true" style={{ opacity: state === "ready" ? 1 : 0, transition: "opacity 600ms ease" }} />}
      <nav aria-label="Village places">
        {DESTINATIONS.map((d) => (
          <Link
            key={d.id}
            href={d.href}
            ref={(el) => {
              pinRefs.current[d.id] = el;
            }}
            className="village-pin"
            style={{ left: `${d.x}%`, top: `${d.y}%` }}
            data-sound="open"
            aria-label={d.name}
          >
            <IconChip name={d.icon} tone={d.tone} size={28} />
            {d.short}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export function VillageScene() {
  const { data, updateSettings } = useApp();
  const mode = data.settings.villageMode;
  // Page content only renders on the client (after local data loads), so this is safe to read once.
  const [lowPower] = useState(isLowPowerDevice);
  const simple = mode === "simple" || (mode === "auto" && lowPower);
  const animate = !data.settings.reducedMotion && !(typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);

  const toggle = (
    <button type="button" className="btn ghost small" onClick={() => updateSettings({ villageMode: simple ? "scene" : "simple" })}>
      <Icon name={simple ? "eye" : "book"} size={20} />
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

  return (
    <div className="stack">
      <Village3D animate={animate} lowPower={lowPower} />
      <p className="small muted center" style={{ margin: 0 }}>
        Tap a place to visit it. Drag to look around.
      </p>
      {toggle}
    </div>
  );
}
