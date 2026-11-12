import type { ReactNode } from "react";
import { Illustration } from "@/components/art/Illustration";
import { contentImageUrl, type IllustrationKey } from "@/components/art/illustrationKeys";
import type { PictureKey } from "@/content/dhivehi";

/** Pictures that already exist in the app's illustration set. */
const FROM_ILLUSTRATIONS: Partial<Record<PictureKey, IllustrationKey>> = {
  ramadan: "crescent",
  fasting: "hourglass",
  suhoor: "sunrise",
  iftar: "sunset",
  mosque: "mosque",
  prayer: "prayer-mat",
  eid: "eid",
  thanks: "thank-you",
  dates: "dates",
  book: "book",
  island: "island",
};

const O = "#26332f"; // outline
const face = (cx: number, cy: number, s = 1) => (
  <g>
    <circle cx={cx - 4 * s} cy={cy} r={1.6 * s} fill={O} />
    <circle cx={cx + 4 * s} cy={cy} r={1.6 * s} fill={O} />
    <path d={`M${cx - 2.6 * s} ${cy + 3.4 * s} q${2.6 * s} ${2.4 * s} ${5.2 * s} 0`} stroke={O} strokeWidth={1.4 * s} fill="none" strokeLinecap="round" />
  </g>
);

/** Original flat cartoon pictures (64×64), drawn for Little Ramadan. */
const ART: Partial<Record<PictureKey, ReactNode>> = {
  moon: (
    <>
      <path d="M40 10a22 22 0 1 0 14 38A18 18 0 0 1 40 10Z" fill="#f6d36b" stroke={O} strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="30" cy="34" r="1.8" fill={O} />
      <path d="M27 40q4 3 8 0" stroke={O} strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </>
  ),
  sun: (
    <>
      {Array.from({ length: 8 }, (_, i) => (
        <line key={i} x1="32" y1="6" x2="32" y2="13" stroke="#f0a92e" strokeWidth="4" strokeLinecap="round" transform={`rotate(${i * 45} 32 32)`} />
      ))}
      <circle cx="32" cy="32" r="15" fill="#ffd34d" stroke={O} strokeWidth="2.5" />
      {face(32, 31)}
    </>
  ),
  star: (
    <>
      <path d="M32 6l7.6 15.6 17.2 2.5-12.4 12.1 2.9 17.1L32 45.2 16.7 53.3l2.9-17.1L7.2 24.1l17.2-2.5Z" fill="#ffd34d" stroke={O} strokeWidth="2.5" strokeLinejoin="round" />
      {face(32, 32, 0.9)}
    </>
  ),
  sea: (
    <>
      <circle cx="46" cy="16" r="7" fill="#ffd34d" stroke={O} strokeWidth="2" />
      <path d="M6 30q6.5-6 13 0t13 0 13 0 13 0v26H6Z" fill="#3b8fd9" stroke={O} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M10 42q5.5-4.5 11 0t11 0 11 0 11 0" stroke="#bfe3ff" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M10 51q5.5-4.5 11 0t11 0 11 0 11 0" stroke="#bfe3ff" strokeWidth="3" fill="none" strokeLinecap="round" />
    </>
  ),
  coconut: (
    <>
      <circle cx="32" cy="36" r="20" fill="#8b5a32" stroke={O} strokeWidth="2.5" />
      <path d="M16 30q16-12 32 0" stroke="#6a4224" strokeWidth="2" fill="none" />
      <circle cx="26" cy="24" r="2.2" fill="#4a2e18" />
      <circle cx="34" cy="22" r="2.2" fill="#4a2e18" />
      <circle cx="30" cy="29" r="2.2" fill="#4a2e18" />
      <path d="M32 16q8-10 18-8" stroke="#3fa65a" strokeWidth="4" fill="none" strokeLinecap="round" />
    </>
  ),
  fish: (
    <>
      <path d="M10 32q14-18 34-6l10-10v32l-10-10Q24 50 10 32Z" fill="#f28c38" stroke={O} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M26 21q4 11 0 22" stroke="#fff" strokeWidth="3" fill="none" />
      <circle cx="18" cy="30" r="2.4" fill={O} />
    </>
  ),
  turtle: (
    <>
      <ellipse cx="14" cy="44" rx="5" ry="3.5" fill="#8fd17c" stroke={O} strokeWidth="2" />
      <ellipse cx="44" cy="46" rx="5" ry="3.5" fill="#8fd17c" stroke={O} strokeWidth="2" />
      <circle cx="54" cy="34" r="7" fill="#8fd17c" stroke={O} strokeWidth="2.5" />
      <circle cx="56" cy="32" r="1.6" fill={O} />
      <path d="M8 38q0-22 24-22t24 22Z" fill="#3fa65a" stroke={O} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M20 37l4-12h16l4 12M32 25v12" stroke="#2a7a41" strokeWidth="2" fill="none" />
    </>
  ),
  crab: (
    <>
      <path d="M12 22q-6-8 0-12 2 6 8 6M52 22q6-8 0-12-2 6-8 6" fill="#ef6a4c" stroke={O} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M18 24l4 6M46 24l-4 6" stroke={O} strokeWidth="2.2" />
      <path d="M14 46l-6 6M18 49l-4 7M50 46l6 6M46 49l4 7" stroke={O} strokeWidth="2.5" strokeLinecap="round" />
      <ellipse cx="32" cy="40" rx="20" ry="13" fill="#ef6a4c" stroke={O} strokeWidth="2.5" />
      {face(32, 38)}
    </>
  ),
  cat: (
    <>
      <path d="M14 26l2-16 10 9M50 26l-2-16-10 9" fill="#f2b56b" stroke={O} strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="32" cy="34" r="20" fill="#f2b56b" stroke={O} strokeWidth="2.5" />
      {face(32, 33)}
      <path d="M12 36h8M12 41h8M44 36h8M44 41h8" stroke={O} strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  bird: (
    <>
      <path d="M12 38q0-18 20-18 16 0 20 14l8 2-8 4q-4 14-20 14-20 0-20-16Z" fill="#6ec6f0" stroke={O} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M22 36q8 10 18 2" fill="#4aa3d1" stroke={O} strokeWidth="2" />
      <circle cx="42" cy="30" r="2.2" fill={O} />
      <path d="M26 54v5M34 54v5" stroke={O} strokeWidth="2.2" strokeLinecap="round" />
    </>
  ),
  cow: (
    <>
      <path d="M14 20q-8-2-8-8M50 20q8-2 8-8" stroke={O} strokeWidth="3" fill="none" strokeLinecap="round" />
      <ellipse cx="32" cy="30" rx="18" ry="17" fill="#fff" stroke={O} strokeWidth="2.5" />
      <path d="M17 22q6 2 6 9-6 1-8-3" fill="#4b4b4b" />
      <ellipse cx="32" cy="44" rx="13" ry="9" fill="#f5b7c4" stroke={O} strokeWidth="2.2" />
      <circle cx="27" cy="44" r="1.8" fill={O} />
      <circle cx="37" cy="44" r="1.8" fill={O} />
      <circle cx="25" cy="29" r="2" fill={O} />
      <circle cx="39" cy="29" r="2" fill={O} />
    </>
  ),
  giraffe: (
    <>
      <path d="M26 58V30l6-18h8l2 8-8 4v34Z" fill="#f2c14e" stroke={O} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M34 8V4M39 9V5" stroke={O} strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="30" cy="40" r="2.6" fill="#b5762c" />
      <circle cx="30" cy="50" r="2.4" fill="#b5762c" />
      <circle cx="33" cy="30" r="2.2" fill="#b5762c" />
      <circle cx="37" cy="15" r="1.7" fill={O} />
    </>
  ),
  boat: (
    <>
      <path d="M32 8v32" stroke={O} strokeWidth="2.5" />
      <path d="M34 10q16 12 2 26h-2Z" fill="#fff" stroke={O} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M6 40h52l-8 12H16Z" fill="#c8823e" stroke={O} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M4 56q7-4 14 0t14 0 14 0 14 0" stroke="#3b8fd9" strokeWidth="3" fill="none" strokeLinecap="round" />
    </>
  ),
  house: (
    <>
      <path d="M8 30L32 10l24 20" fill="#ef6a4c" stroke={O} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M14 28h36v26H14Z" fill="#fff4dc" stroke={O} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M27 54V40h10v14" fill="#3fa65a" stroke={O} strokeWidth="2.2" />
      <rect x="18" y="34" width="6" height="6" fill="#bfe3ff" stroke={O} strokeWidth="1.8" />
      <rect x="40" y="34" width="6" height="6" fill="#bfe3ff" stroke={O} strokeWidth="1.8" />
    </>
  ),
  tree: (
    <>
      <path d="M30 56c2-12 2-24 6-34" stroke="#8b5a32" strokeWidth="6" strokeLinecap="round" fill="none" />
      <path d="M36 22q-14-8-26 2M36 22q14-10 24 0M36 22q-4-12-16-14M36 22q6-12 18-12M36 22q-2 10-12 14" stroke="#3fa65a" strokeWidth="5" strokeLinecap="round" fill="none" />
      <circle cx="33" cy="26" r="3" fill="#8b5a32" />
      <circle cx="39" cy="26" r="3" fill="#8b5a32" />
    </>
  ),
  flower: (
    <>
      <path d="M32 40v18" stroke="#3fa65a" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M32 52q8-8 14-4-6 6-14 4Z" fill="#3fa65a" />
      {Array.from({ length: 6 }, (_, i) => (
        <ellipse key={i} cx="32" cy="14" rx="7" ry="10" fill="#f26d9b" stroke={O} strokeWidth="2" transform={`rotate(${i * 60} 32 26)`} />
      ))}
      <circle cx="32" cy="26" r="7" fill="#ffd34d" stroke={O} strokeWidth="2" />
    </>
  ),
  water: (
    <>
      <path d="M32 6q18 22 18 34a18 18 0 0 1-36 0Q14 28 32 6Z" fill="#5fb3f0" stroke={O} strokeWidth="2.5" strokeLinejoin="round" />
      {face(32, 40)}
    </>
  ),
  tea: (
    <>
      <path d="M24 10q-4 4 0 8t0 8M34 10q-4 4 0 8t0 8" stroke="#b9c1be" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M12 30h36v8a16 16 0 0 1-16 16h-4a16 16 0 0 1-16-16Z" fill="#fff" stroke={O} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M48 34h4a6 6 0 0 1 0 12h-6" stroke={O} strokeWidth="2.5" fill="none" />
      <path d="M14 33h32" stroke="#b5762c" strokeWidth="4" />
    </>
  ),
  milk: (
    <>
      <path d="M22 8h20v8l6 8v32H16V24l6-8Z" fill="#fff" stroke={O} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M16 34h32v12H16Z" fill="#6ec6f0" />
      <path d="M22 16h20" stroke={O} strokeWidth="2" />
    </>
  ),
  bread: (
    <>
      <path d="M12 30a10 10 0 0 1 4-18h32a10 10 0 0 1 4 18v22H12Z" fill="#f2c27b" stroke={O} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M18 30a6 6 0 0 1 2-12h24a6 6 0 0 1 2 12v18H18Z" fill="#fde7bd" />
      {face(32, 34, 0.8)}
    </>
  ),
  rice: (
    <>
      <path d="M14 30q0-14 18-14t18 14Z" fill="#fff" stroke={O} strokeWidth="2.2" />
      <path d="M8 30h48a24 22 0 0 1-48 0Z" fill="#6ec6f0" stroke={O} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M22 24l2 1M30 21l2 1M38 24l2 1M27 27l2 1M35 27l2 1" stroke="#c9c2b0" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  banana: (
    <>
      <path d="M12 18q4 32 38 32 4-2 4-6Q24 42 18 14Z" fill="#ffd34d" stroke={O} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M14 18l-2-6" stroke="#8b5a32" strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  watermelon: (
    <>
      <path d="M6 24h52a26 26 0 0 1-52 0Z" fill="#3fa65a" stroke={O} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M11 24h42a21 21 0 0 1-42 0Z" fill="#f05a6a" />
      <path d="M22 32l1 3M32 36l1 3M42 32l1 3M27 42l1 3M37 42l1 3" stroke={O} strokeWidth="2.5" strokeLinecap="round" />
    </>
  ),
  egg: (
    <>
      <path d="M32 8c12 0 20 18 20 30a20 20 0 0 1-40 0C12 26 20 8 32 8Z" fill="#fffaf0" stroke={O} strokeWidth="2.5" />
      {face(32, 36)}
    </>
  ),
  eye: (
    <>
      <path d="M6 32q26-26 52 0-26 26-52 0Z" fill="#fff" stroke={O} strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="32" cy="32" r="10" fill="#8b5a32" stroke={O} strokeWidth="2" />
      <circle cx="32" cy="32" r="4.5" fill={O} />
      <circle cx="35" cy="29" r="2" fill="#fff" />
    </>
  ),
  hand: (
    <>
      <path d="M20 58V30l-6-8a3.5 3.5 0 0 1 6-4l6 8V10a3.5 3.5 0 0 1 7 0v14V8a3.5 3.5 0 0 1 7 0v16-12a3.5 3.5 0 0 1 7 0v14-8a3.5 3.5 0 0 1 7 0v20q0 16-14 16Z" fill="#e8b48c" stroke={O} strokeWidth="2.2" strokeLinejoin="round" />
    </>
  ),
  cloud: (
    <>
      <path d="M16 46a10 10 0 0 1 0-20 14 14 0 0 1 27-4 11 11 0 0 1 5 24Z" fill="#fff" stroke={O} strokeWidth="2.5" strokeLinejoin="round" />
      {face(32, 36)}
    </>
  ),
  rain: (
    <>
      <path d="M16 36a9 9 0 0 1 0-18 13 13 0 0 1 25-4 10 10 0 0 1 5 22Z" fill="#cfd8de" stroke={O} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M20 44l-3 7M32 44l-3 7M44 44l-3 7M26 52l-2 5M38 52l-2 5" stroke="#3b8fd9" strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  drum: (
    <>
      <path d="M12 18v28q20 12 40 0V18" fill="#c8823e" stroke={O} strokeWidth="2.5" />
      <path d="M12 22l10 26M22 22l10 30M32 22l10 28M42 22l10 22" stroke="#fde7bd" strokeWidth="2.5" />
      <ellipse cx="32" cy="18" rx="20" ry="7" fill="#fde7bd" stroke={O} strokeWidth="2.5" />
    </>
  ),
};

export function DvPicture({ name, size = 96, label }: { name: PictureKey; size?: number; label?: string }) {
  if (contentImageUrl(name)) return <Illustration name={name as IllustrationKey} size={size} label={label} />;
  const fromIll = FROM_ILLUSTRATIONS[name as keyof typeof FROM_ILLUSTRATIONS];
  if (fromIll) return <Illustration name={fromIll} size={size} label={label} />;
  const art = ART[name as keyof typeof ART];
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      {art ?? <circle cx="32" cy="32" r="20" fill="#e9c66b" />}
    </svg>
  );
}

/** A colour swatch for colour words. */
export function ColourSwatch({ colour, size = 96, label }: { colour: string; size?: number; label?: string }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <path d="M32 8c-14 0-24 9-24 22 0 10 6 14 12 14 4 0 5 3 5 6 0 4 3 6 7 6 14 0 24-10 24-24S46 8 32 8Z" fill={colour} stroke="#26332f" strokeWidth="2.5" />
      <circle cx="22" cy="24" r="3" fill="#fff" fillOpacity="0.5" />
    </svg>
  );
}
