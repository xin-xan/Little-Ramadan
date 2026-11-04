"use client";

import { useEffect, useRef } from "react";

const COLOURS = ["#E9C66B", "#2F8F6A", "#F3C6D3", "#BBD8E8", "#D9CFF0", "#F59E6B"];

/** A short, gentle confetti burst (no flashing). Not rendered when motion is reduced. */
export function Confetti({ burst }: { burst: string | null }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!burst) return;
    const c = ref.current;
    if (!c) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = innerWidth * dpr;
    c.height = innerHeight * dpr;
    const g = c.getContext("2d")!;
    g.scale(dpr, dpr);
    const parts = Array.from({ length: 90 }, (_, i) => ({
      x: innerWidth / 2 + (Math.random() - 0.5) * 80,
      y: innerHeight * 0.38,
      vx: (Math.random() - 0.5) * 9,
      vy: -6 - Math.random() * 8,
      r: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      w: 6 + Math.random() * 6,
      h: 8 + Math.random() * 8,
      c: COLOURS[i % COLOURS.length],
      star: i % 7 === 0,
    }));
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = (now - start) / 1000;
      g.clearRect(0, 0, innerWidth, innerHeight);
      for (const p of parts) {
        p.vy += 0.32;
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.r += p.vr;
        g.save();
        g.globalAlpha = Math.max(0, 1 - t / 2.2);
        g.translate(p.x, p.y);
        g.rotate(p.r);
        g.fillStyle = p.c;
        if (p.star) {
          g.beginPath();
          for (let k = 0; k < 10; k++) {
            const a = (Math.PI / 5) * k;
            const rr = k % 2 ? 3 : 7;
            g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
          }
          g.fill();
        } else g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.r * 2)) + 2);
        g.restore();
      }
      if (t < 2.3) raf = requestAnimationFrame(tick);
      else g.clearRect(0, 0, innerWidth, innerHeight);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [burst]);
  return <canvas ref={ref} className="confetti" aria-hidden="true" style={{ width: "100vw", height: "100vh" }} />;
}
