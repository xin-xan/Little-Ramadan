"use client";

import { formatStars } from "@/storage/rewards";
import Link from "next/link";
import { StickerArt } from "./Sticker";
import { allStickers } from "@/storage/stickers";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { playSound, setSoundEnabled, type SoundName } from "@/accessibility/sound";
import { Confetti } from "./Confetti";
import { stopRecordingPlayback } from "@/recordings/player";
import { Icon } from "./Icon";
import { SiteFooter } from "./SiteFooter";
import { badges } from "@/content/badges";
import { STOPPING_MESSAGE } from "@/content/copy";
import { Hilmy } from "@/characters/Characters";
import { useApp } from "@/state/AppState";
import { BadgeIcon } from "./art/BadgeIcon";
import { BottomNav } from "./BottomNav";
import { LogoMark } from "./Logo";
import { Sheet } from "./ui";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const NO_PROFILE_ROUTES = ["/welcome", "/style-guide"];
const NO_NAV_ROUTES = ["/welcome", "/style-guide"];

const strip = (p: string) => {
  const s = BASE && p.startsWith(BASE) ? p.slice(BASE.length) || "/" : p;
  // "/games/quiz/x" and "/games/quiz/x/" are the same page: never remount a page (and lose a game) over a slash.
  return s.length > 1 && !s.endsWith("/") ? `${s}/` : s;
};

function useOnline() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  return online;
}

function useServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_PREVIEW === "1" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register(`${BASE}/sw.js`, { scope: `${BASE}/` }).catch(() => {
      /* offline support unavailable; the app still works online */
    });
  }, []);
}

const stickerById = (id: string) => allStickers().find((s) => s.id === id);

function CelebrationLayer() {
  const { celebration, dismissCelebration, data } = useApp();
  const open = !!celebration;
  const reduced = data.settings.reducedMotion || (typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
  return (
    <>
    {!reduced && <Confetti burst={celebration?.id ?? null} />}
    <Sheet open={open} onClose={dismissCelebration} labelledBy="celebrate-title">
      {celebration && (
        <div className="stack center" aria-live="polite">
          <div className="pop" style={{ display: "flex", justifyContent: "center" }}>
            <Hilmy expression="cheer" size={76} />
          </div>
          <h2 id="celebrate-title">{celebration.stars > 0 ? `You earned ${formatStars(celebration.stars)} star${celebration.stars > 1 ? "s" : ""}!` : "Something new unlocked!"}</h2>
          {celebration.message && <p style={{ margin: 0 }}>{celebration.message}</p>}
          {celebration.stars > 0 && (
            <div className="celebrate-stars" aria-hidden="true">
              {Array.from({ length: Math.ceil(celebration.stars) }, (_, i) => (
                <span key={i} className={`pop${i + 1 > celebration.stars ? " half-star" : ""}`} style={{ animationDelay: `${120 + i * 120}ms` }}>
                  <Icon name="star" size={32} fill strokeWidth={1.5} />
                </span>
              ))}
            </div>
          )}
          {celebration.badgeIds.map((id) => {
            const b = badges.find((x) => x.id === id);
            return b ? (
              <div key={id} className="card gold row celebrate-item">
                <BadgeIcon id={id} size={52} />
                <div>
                  <strong>New badge: {b.title}</strong>
                  <div className="small">{b.description}</div>
                </div>
              </div>
            ) : null;
          })}
          {celebration.stickerIds.map((id) => {
            const st = stickerById(id);
            return st ? (
              <div key={id} className="card sky row celebrate-item">
                <StickerArt sticker={st} size={56} />
                <div>
                  <strong>New sticker: {st.title}</strong>
                  <div className="small">It&apos;s in your Sticker Album!</div>
                </div>
              </div>
            ) : null;
          })}
          <div className="stack">
            {celebration.stickerIds.length > 0 && (
              <Link href="/rewards/stickers/" className="btn gold block" onClick={dismissCelebration}>
                See my Sticker Album
              </Link>
            )}
            <button className="btn block" onClick={dismissCelebration} data-autofocus>
              Yay! Continue
            </button>
          </div>
        </div>
      )}
    </Sheet>
    </>
  );
}

/** Gentle, optional break reminder set by a parent. No notifications, no pressure. */
function ScreenTimeReminder() {
  const { data } = useApp();
  const { enabled, minutes } = data.settings.screenTime;
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    let elapsed = 0;
    const tick = 15_000;
    const id = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      elapsed += tick;
      if (elapsed >= minutes * 60_000) {
        setShow(true);
        elapsed = 0;
      }
    }, tick);
    return () => window.clearInterval(id);
  }, [enabled, minutes]);
  return (
    <Sheet open={show} onClose={() => setShow(false)} labelledBy="break-title">
      <div className="stack center">
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Hilmy expression="sleepy" size={96} />
        </div>
        <h2 id="break-title">Time for a little break?</h2>
        <p>{STOPPING_MESSAGE}</p>
        <button className="btn block" onClick={() => setShow(false)} data-autofocus>
          Okay!
        </button>
      </div>
    </Sheet>
  );
}

export function AppChrome({ children }: { children: ReactNode }) {
  const { status, error, data, storageKind, retry } = useApp();
  const router = useRouter();
  const pathname = strip(usePathname() ?? "/");
  const online = useOnline();
  useServiceWorker();

  const needsProfile = !NO_PROFILE_ROUTES.some((r) => pathname.startsWith(r));
  const showNav = !NO_NAV_ROUTES.some((r) => pathname.startsWith(r)) && pathname !== "/";

  useEffect(() => {
    if (status !== "ready") return;
    if (!data.profile && needsProfile) router.replace("/welcome/");
    else if (data.profile && pathname === "/") router.replace("/home/");
  }, [status, data.profile, needsProfile, pathname, router]);

  // A grown-up's recording stops when the page changes.
  useEffect(() => stopRecordingPlayback(), [pathname]);

  // Soft UI sounds for every button and link (a premium, tactile feel). data-sound="none" opts out.
  const soundOn = data.settings.soundOn;
  useEffect(() => {
    setSoundEnabled(soundOn);
    if (!soundOn) return;
    const onDown = (e: PointerEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>("button, a, [role=switch], [role=tab], summary");
      if (!el || el.getAttribute("aria-disabled") === "true" || (el as HTMLButtonElement).disabled) return;
      const s = el.dataset.sound ?? (el.getAttribute("role") === "switch" ? "toggle" : "tap");
      if (s !== "none") playSound(s as SoundName);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [soundOn]);

  // Reduced motion: the in-app setting adds to the OS preference.
  useEffect(() => {
    document.documentElement.dataset.reducedMotion = String(data.settings.reducedMotion);
  }, [data.settings.reducedMotion]);

  if (status === "loading" || (status === "ready" && ((!data.profile && needsProfile) || (data.profile && pathname === "/")))) {
    return (
      <div className="loading-screen" role="status" aria-live="polite">
        <LogoMark size={88} />
        <h1>Little Ramadan</h1>
        <div className="loader-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <p>Getting your Ramadan Village ready…</p>
        <SiteFooter dark />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="loading-screen" role="alert">
        <LogoMark size={72} />
        <h1>Oops! Something went wrong</h1>
        <p>We couldn&apos;t open your saved progress. Your progress has not been deleted.</p>
        <p className="small">{error}</p>
        <button className="btn gold" onClick={retry}>
          Try again
        </button>
        <SiteFooter dark />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      {!online && (
        <div className="banner offline" role="status">
          <Icon name="moon" size={16} /> You&apos;re offline. Everything already on this device still works, and your progress is saved here.
        </div>
      )}
      {storageKind === "memory" && (
        <div className="banner memory" role="status">
          <Icon name="info" size={16} /> This browser can&apos;t save progress (for example in private browsing). Progress will be lost when the app closes.
        </div>
      )}
      <main id="main" className="page">
        <div key={pathname} className="page-enter">
          {children}
        </div>
      </main>
      <SiteFooter />
      {showNav && <div className="nav-spacer" aria-hidden="true" />}
      {showNav && <BottomNav />}
      <CelebrationLayer />
      <ScreenTimeReminder />
    </div>
  );
}
