import { Illustration } from "@/components/art/Illustration";
import type { Sticker as StickerData } from "@/storage/stickers";

/** A small, stable tilt per sticker so the album looks hand-made (same every time). */
const tilt = (id: string) => {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return ((Math.abs(h) % 7) - 3) * 1.2;
};

/** A die-cut sticker: the activity's picture with a white border and a little shine. */
export function StickerArt({ sticker, size = 88, earned = true }: { sticker: Pick<StickerData, "id" | "illustration">; size?: number; earned?: boolean }) {
  return (
    <span className={`sticker${earned ? "" : " not-yet"}`} style={{ width: size, height: size, transform: earned ? `rotate(${tilt(sticker.id)}deg)` : undefined }} aria-hidden="true">
      <Illustration name={sticker.illustration} size={Math.round(size * 0.78)} />
      {earned && <span className="sticker-shine" />}
    </span>
  );
}
