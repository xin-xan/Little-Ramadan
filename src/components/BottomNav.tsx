"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/home/", label: "Home", icon: "🏠", match: ["/home", "/learn", "/kindness", "/goals", "/first-fast", "/safety"] },
  { href: "/journey/", label: "Journey", icon: "🌙", match: ["/journey"] },
  { href: "/games/", label: "Games", icon: "🧩", match: ["/games"] },
  { href: "/rewards/", label: "Rewards", icon: "⭐", match: ["/rewards"] },
  { href: "/parent/", label: "Parents", icon: "👪", match: ["/parent"] },
];

const strip = (p: string) => {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return base && p.startsWith(base) ? p.slice(base.length) || "/" : p;
};

export function BottomNav() {
  const pathname = strip(usePathname() ?? "/");
  return (
    <nav className="bottom-nav no-print" aria-label="Main">
      <ul>
        {ITEMS.map((it) => {
          const active = it.match.some((m) => pathname === m || pathname.startsWith(m + "/"));
          return (
            <li key={it.href}>
              <Link href={it.href} aria-current={active ? "page" : undefined} className={it.href === "/parent/" ? "parent-link" : undefined}>
                <span className="nav-icon" aria-hidden="true">
                  {it.icon}
                </span>
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
