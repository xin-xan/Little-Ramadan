/**
 * Approved character components (see docs/phase-0/03-character-guide.md).
 * Always use these — never redraw characters inline — so every screen is consistent.
 * Soft "3D-cartoon" shading comes from radial gradients and rim highlights.
 */
import { useId } from "react";

/** Mix a hex colour towards white (used for soft highlights without grey blending). */
function lighten(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const ch = (shift: number) => Math.round(((n >> shift) & 255) + (255 - ((n >> shift) & 255)) * amt);
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
}

export type Expression = "happy" | "wave" | "think" | "cheer" | "calm";

export const PALETTE = {
  noor: { skin: "#C98E62", skinShade: "#A8714B", hair: "#3A2618", outfit: "#2E8B6E", outfitShade: "#1E6A53", trim: "#E9C66B", trousers: "#FFF7E8", cap: "#FFFFFF" },
  amina: { skin: "#D9A27A", skinShade: "#B9825C", outfit: "#B9A6E3", outfitShade: "#9583C6", hijab: "#F3C6D3", hijabShade: "#D9A2B4", sleeves: "#FFF7E8" },
} as const;

interface KidProps {
  who: "noor" | "amina";
  expression?: Expression;
  size?: number;
  title?: string;
  className?: string;
}

function Kid({ who, expression = "happy", size = 160, title, className }: KidProps) {
  const uid = useId().replace(/:/g, "");
  const p = who === "noor" ? PALETTE.noor : PALETTE.amina;
  const outfit = who === "noor" ? PALETTE.noor.outfit : PALETTE.amina.outfit;
  const outfitShade = who === "noor" ? PALETTE.noor.outfitShade : PALETTE.amina.outfitShade;
  const armUpL = expression === "cheer";
  const armUpR = expression === "wave" || expression === "cheer";
  const eyesClosed = expression === "calm" || expression === "cheer";
  const label = title ?? (who === "noor" ? "Noor, a cheerful boy in a green outfit" : "Amina, a cheerful girl in a lavender dress and pink hijab");

  return (
    <svg viewBox="0 0 200 240" width={size} height={(size * 240) / 200} role="img" aria-label={label} className={className}>
      <defs>
        <radialGradient id={`skin${uid}`} cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor={lighten(p.skin, 0.3)} />
          <stop offset="45%" stopColor={p.skin} />
          <stop offset="100%" stopColor={p.skinShade} />
        </radialGradient>
        <radialGradient id={`body${uid}`} cx="35%" cy="25%" r="85%">
          <stop offset="0%" stopColor={lighten(outfit, 0.3)} />
          <stop offset="40%" stopColor={outfit} />
          <stop offset="100%" stopColor={outfitShade} />
        </radialGradient>
        {who === "amina" && (
          <radialGradient id={`hijab${uid}`} cx="40%" cy="30%" r="75%">
            <stop offset="0%" stopColor={lighten(PALETTE.amina.hijab, 0.45)} />
            <stop offset="45%" stopColor={PALETTE.amina.hijab} />
            <stop offset="100%" stopColor={PALETTE.amina.hijabShade} />
          </radialGradient>
        )}
      </defs>
      {/* ground shadow */}
      <ellipse cx="100" cy="230" rx="52" ry="8" fill="#123C35" opacity="0.18" />
      {/* legs */}
      {who === "noor" ? (
        <g fill={PALETTE.noor.trousers} stroke="#E4D7BE" strokeWidth="2">
          <rect x="78" y="196" width="18" height="30" rx="8" />
          <rect x="104" y="196" width="18" height="30" rx="8" />
        </g>
      ) : (
        <g fill={PALETTE.amina.sleeves} stroke="#E4D7BE" strokeWidth="2">
          <rect x="80" y="204" width="16" height="22" rx="7" />
          <rect x="104" y="204" width="16" height="22" rx="7" />
        </g>
      )}
      {/* body */}
      {who === "noor" ? (
        <path d="M62 150 Q100 128 138 150 L146 206 Q100 218 54 206 Z" fill={`url(#body${uid})`} />
      ) : (
        <path d="M64 150 Q100 128 136 150 L152 212 Q100 224 48 212 Z" fill={`url(#body${uid})`} />
      )}
      {who === "noor" && <path d="M88 142 L100 160 L112 142" fill="none" stroke={PALETTE.noor.trim} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />}
      {/* arms */}
      <g stroke={who === "noor" ? outfit : PALETTE.amina.sleeves} strokeWidth="16" strokeLinecap="round" fill="none">
        {armUpL ? <path d="M66 158 Q46 136 44 112" /> : <path d="M66 158 Q52 178 56 196" />}
        {armUpR ? <path d="M134 158 Q154 136 156 112" /> : <path d="M134 158 Q148 178 144 196" />}
      </g>
      <g fill={`url(#skin${uid})`}>
        <circle cx={armUpL ? 44 : 56} cy={armUpL ? 106 : 200} r="9" />
        <circle cx={armUpR ? 156 : 144} cy={armUpR ? 106 : 200} r="9" />
      </g>
      {/* head */}
      {who === "amina" && <path d="M44 92 Q44 30 100 28 Q156 30 156 92 Q160 140 132 152 Q100 166 68 152 Q40 140 44 92 Z" fill={`url(#hijab${uid})`} />}
      <ellipse cx="100" cy="96" rx={who === "amina" ? 40 : 46} ry={who === "amina" ? 44 : 48} fill={`url(#skin${uid})`} />
      {who === "noor" && (
        <>
          <path d="M56 84 Q60 46 100 44 Q140 46 144 84 Q128 66 100 66 Q72 66 56 84 Z" fill={PALETTE.noor.hair} />
          <path d="M60 62 Q100 22 140 62 Q100 52 60 62 Z" fill={PALETTE.noor.cap} stroke="#E7E1D3" strokeWidth="2" />
          <path d="M61 60 Q100 50 139 60" stroke={PALETTE.noor.trim} strokeWidth="4" fill="none" />
          <ellipse cx="54" cy="100" rx="7" ry="10" fill={p.skinShade} />
          <ellipse cx="146" cy="100" rx="7" ry="10" fill={p.skinShade} />
        </>
      )}
      {who === "amina" && <path d="M60 66 Q100 44 140 66" stroke="#FFFFFF" strokeOpacity="0.55" strokeWidth="5" fill="none" strokeLinecap="round" />}
      {/* face */}
      {eyesClosed ? (
        <g stroke="#2A1A12" strokeWidth="4" strokeLinecap="round" fill="none">
          <path d="M76 98 Q84 90 92 98" />
          <path d="M108 98 Q116 90 124 98" />
        </g>
      ) : (
        <g>
          <ellipse cx="84" cy="98" rx="8" ry="10" fill="#2A1A12" />
          <ellipse cx="116" cy="98" rx="8" ry="10" fill="#2A1A12" />
          <circle cx="87" cy="94" r="3" fill="#fff" />
          <circle cx="119" cy="94" r="3" fill="#fff" />
          <circle cx="82" cy="101" r="1.5" fill="#fff" />
          <circle cx="114" cy="101" r="1.5" fill="#fff" />
        </g>
      )}
      <ellipse cx="72" cy="114" rx="8" ry="5" fill="#F08A7E" opacity="0.45" />
      <ellipse cx="128" cy="114" rx="8" ry="5" fill="#F08A7E" opacity="0.45" />
      {expression === "think" ? (
        <circle cx="104" cy="124" r="5" fill="#7A3A2A" />
      ) : expression === "cheer" || expression === "wave" ? (
        <path d="M86 118 Q100 136 114 118 Z" fill="#7A3A2A" />
      ) : (
        <path d="M88 120 Q100 130 112 120" stroke="#7A3A2A" strokeWidth="4" fill="none" strokeLinecap="round" />
      )}
      {expression === "think" && (
        <g fill="#FFFFFF" stroke="#BBD8E8" strokeWidth="2">
          <circle cx="152" cy="62" r="4" />
          <circle cx="164" cy="48" r="6" />
          <circle cx="180" cy="28" r="12" />
        </g>
      )}
    </svg>
  );
}

export function Noor(props: Omit<KidProps, "who">) {
  return <Kid who="noor" {...props} />;
}

export function Amina(props: Omit<KidProps, "who">) {
  return <Kid who="amina" {...props} />;
}

export function Hilmy({ expression = "happy", size = 120, className, title = "Hilmy, a friendly crescent moon" }: { expression?: "happy" | "sleepy" | "cheer"; size?: number; className?: string; title?: string }) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} role="img" aria-label={title} className={className}>
      <defs>
        <radialGradient id={`moon${uid}`} cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#FFF8DC" />
          <stop offset="55%" stopColor="#F2CF6B" />
          <stop offset="100%" stopColor="#D4A72C" />
        </radialGradient>
        <mask id={`cres${uid}`}>
          <rect width="120" height="120" fill="#fff" />
          <circle cx="82" cy="46" r="40" fill="#000" />
        </mask>
      </defs>
      <circle cx="56" cy="62" r="44" fill={`url(#moon${uid})`} mask={`url(#cres${uid})`} />
      {expression === "sleepy" ? (
        <path d="M28 64 Q34 58 40 64" stroke="#5B3A12" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      ) : (
        <>
          <ellipse cx="34" cy="62" rx="4.5" ry="6" fill="#5B3A12" />
          <circle cx="36" cy="59" r="1.8" fill="#fff" />
        </>
      )}
      <ellipse cx="28" cy="76" rx="6" ry="4" fill="#F08A7E" opacity="0.5" />
      {expression === "cheer" ? <path d="M30 84 Q40 96 50 86 Z" fill="#5B3A12" /> : <path d="M30 86 Q40 94 48 86" stroke="#5B3A12" strokeWidth="3.5" fill="none" strokeLinecap="round" />}
      <path d="M22 40 Q30 26 44 22" stroke="#fff" strokeOpacity="0.7" strokeWidth="4" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function CharacterById({ id, expression, size }: { id: "noor" | "amina" | "hilmy"; expression?: Expression; size?: number }) {
  if (id === "hilmy") return <Hilmy size={size} expression={expression === "cheer" ? "cheer" : expression === "calm" ? "sleepy" : "happy"} />;
  return id === "noor" ? <Noor expression={expression} size={size} /> : <Amina expression={expression} size={size} />;
}

export const CHARACTER_NAMES = { noor: "Noor", amina: "Amina", hilmy: "Hilmy" } as const;
