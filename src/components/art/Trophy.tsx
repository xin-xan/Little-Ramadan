/** A shiny gold trophy (original artwork). The plaque shows the child's nickname and year. */
export function TrophyArt({ name, year, animate = true }: { name: string; year: number | string; animate?: boolean }) {
  const short = name.length > 14 ? `${name.slice(0, 13)}…` : name;
  return (
    <g className={animate ? "trophy-bob" : undefined}>
      <defs>
        <linearGradient id="tr-gold" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#B8862B" />
          <stop offset="0.35" stopColor="#F6D67A" />
          <stop offset="0.55" stopColor="#FFF0B8" />
          <stop offset="0.75" stopColor="#E9C66B" />
          <stop offset="1" stopColor="#A87822" />
        </linearGradient>
        <linearGradient id="tr-base" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#286356" />
          <stop offset="1" stopColor="#123C35" />
        </linearGradient>
        <clipPath id="tr-cup">
          <path d="M60 30 H180 V60 C180 120 150 150 120 156 C90 150 60 120 60 60 Z" />
        </clipPath>
      </defs>
      {/* handles */}
      <path d="M62 46 C24 46 22 104 70 112" fill="none" stroke="url(#tr-gold)" strokeWidth="11" strokeLinecap="round" />
      <path d="M178 46 C216 46 218 104 170 112" fill="none" stroke="url(#tr-gold)" strokeWidth="11" strokeLinecap="round" />
      {/* cup */}
      <path d="M60 30 H180 V60 C180 120 150 150 120 156 C90 150 60 120 60 60 Z" fill="url(#tr-gold)" stroke="#9A6E1E" strokeWidth="2" />
      <ellipse cx="120" cy="30" rx="60" ry="9" fill="#FFF3C4" stroke="#9A6E1E" strokeWidth="2" />
      {/* crescent and star on the cup */}
      <path d="M118 66 a20 20 0 1 0 0 40 a26 26 0 0 1 0 -40 Z" fill="#123C35" opacity="0.85" />
      <path d="M140 76 l3.5 7 7.7 1.1 -5.6 5.4 1.3 7.6 -6.9 -3.6 -6.9 3.6 1.3 -7.6 -5.6 -5.4 7.7 -1.1 Z" fill="#123C35" opacity="0.85" />
      {/* moving shine */}
      <g clipPath="url(#tr-cup)">
        <rect className={animate ? "trophy-shine" : undefined} x="40" y="20" width="26" height="150" fill="#FFFFFF" opacity="0.45" transform="skewX(-18)" />
      </g>
      {/* stem and base */}
      <rect x="108" y="154" width="24" height="26" fill="url(#tr-gold)" stroke="#9A6E1E" strokeWidth="2" />
      <path d="M86 180 H154 L162 196 H78 Z" fill="url(#tr-gold)" stroke="#9A6E1E" strokeWidth="2" />
      <rect x="62" y="196" width="116" height="48" rx="8" fill="url(#tr-base)" />
      <rect x="72" y="204" width="96" height="32" rx="5" fill="#E9C66B" />
      <text x="120" y="219" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="12" fontWeight="800" fill="#123C35">
        {short}
      </text>
      <text x="120" y="231" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="8.5" fontWeight="700" fill="#286356">
        Little Ramadan {year}
      </text>
    </g>
  );
}
