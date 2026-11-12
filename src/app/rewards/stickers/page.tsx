"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { StickerArt } from "@/components/Sticker";
import { PageHeader, ProgressBar, Sheet } from "@/components/ui";
import { allStickers, earnedStickers, type Sticker } from "@/storage/stickers";
import { useApp } from "@/state/AppState";

const ALBUMS = [
  { id: "learning", label: "Learning", hint: "Finish a lesson or read a story to get its sticker." },
  { id: "kindness", label: "Kindness", hint: "Do a kindness mission and tap “I did it!” to get its sticker." },
] as const;

/** My Sticker Album: one sticker for every lesson, story and kindness mission. */
export default function StickerAlbumPage() {
  const { data } = useApp();
  const [album, setAlbum] = useState<(typeof ALBUMS)[number]["id"]>("learning");
  const [open, setOpen] = useState<Sticker | null>(null);
  const all = useMemo(() => allStickers(), []);
  const earned = useMemo(() => new Set(earnedStickers(data.completions).map((s) => s.id)), [data.completions]);
  const shown = all.filter((s) => s.album === album);
  const got = shown.filter((s) => earned.has(s.id)).length;
  const info = ALBUMS.find((a) => a.id === album)!;

  return (
    <div className="stack-lg">
      <PageHeader title="My Sticker Album" back={{ href: "/rewards/", label: "Celebration Square" }} />
      <p style={{ margin: 0 }}>Every lesson, story and kindness mission has its own sticker. Collect them by learning and being kind!</p>

      <div className="tabs" role="tablist" aria-label="Album pages">
        {ALBUMS.map((a) => (
          <button key={a.id} role="tab" aria-selected={album === a.id} onClick={() => setAlbum(a.id)}>
            {a.label}
          </button>
        ))}
      </div>

      <ProgressBar value={got} max={shown.length} label={`${got} of ${shown.length} ${info.label.toLowerCase()} stickers`} />
      <p className="small muted" style={{ margin: 0 }}>{info.hint}</p>

      <ul className="sticker-grid" aria-label={`${info.label} stickers`}>
        {shown.map((s) => {
          const has = earned.has(s.id);
          return (
            <li key={s.id}>
              {has ? (
                <button type="button" className="sticker-slot" onClick={() => setOpen(s)} aria-label={`${s.title} sticker`}>
                  <StickerArt sticker={s} size={84} />
                  <span className="sticker-name">{s.title}</span>
                </button>
              ) : (
                <Link href={s.href} className="sticker-slot empty" aria-label={`${s.title}: not collected yet. Open it to earn this sticker.`}>
                  <StickerArt sticker={s} size={84} earned={false} />
                  <span className="sticker-name">{s.title}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ul>

      <Sheet open={!!open} onClose={() => setOpen(null)} labelledBy="sticker-title">
        {open && (
          <div className="stack center">
            <div style={{ display: "flex", justifyContent: "center" }}>
              <StickerArt sticker={open} size={150} />
            </div>
            <h2 id="sticker-title">{open.title}</h2>
            <p>{open.blurb}</p>
            <Link href={open.href} className="btn ghost block" onClick={() => setOpen(null)}>
              {open.kind === "kindness" ? "See the mission again" : open.kind === "story" ? "Read the story again" : "Read the lesson again"}
            </Link>
            <button className="btn block" onClick={() => setOpen(null)} data-autofocus>
              Back to my album
            </button>
          </div>
        )}
      </Sheet>
    </div>
  );
}
