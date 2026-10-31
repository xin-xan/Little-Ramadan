/** Little Ramadan logo mark: a crescent cradling a glowing lantern. Original artwork. */
export function LogoMark({ size = 40, title }: { size?: number; title?: string }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <rect width="64" height="64" rx="16" fill="#123C35" />
      <path d="M30 10 A22 22 0 1 0 30 54 A28 28 0 0 1 30 10 Z" fill="#E9C66B" />
      <line x1="40" y1="14" x2="40" y2="22" stroke="#E9C66B" strokeWidth="2" />
      <path d="M33 24 Q32 38 36 44 L44 44 Q48 38 47 24 Z" fill="#F2CF6B" />
      <path d="M36 27 Q36 37 38.5 41 L41.5 41 Q44 37 44 27 Z" fill="#FFF1C2" />
      <path d="M34 22 L46 22 L44 25 L36 25 Z" fill="#C99A2E" />
      <circle cx="50" cy="14" r="2" fill="#FFF7E8" />
      <circle cx="54" cy="24" r="1.4" fill="#FFF7E8" />
    </svg>
  );
}
