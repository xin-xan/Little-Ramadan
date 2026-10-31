"use client";

import { Amina, Hilmy, Noor, type Expression } from "@/characters/Characters";
import { AVATARS, Avatar } from "@/characters/Avatars";
import { BadgeIcon } from "@/components/art/BadgeIcon";
import { Illustration } from "@/components/art/Illustration";
import { ILLUSTRATION_KEYS } from "@/components/art/illustrationKeys";
import { LogoMark } from "@/components/Logo";
import { DecorationThumb } from "@/components/room/DecorationArt";
import { badges } from "@/content/badges";
import { decorations } from "@/content/decorations";

const EXPRESSIONS: Expression[] = ["happy", "wave", "think", "cheer", "calm"];
const COLOURS = [
  ["Deep emerald", "#123C35"],
  ["Teal green", "#286356"],
  ["Cream", "#FFF7E8"],
  ["Warm gold", "#E9C66B"],
  ["Soft sky", "#BBD8E8"],
  ["Lavender", "#D9CFF0"],
  ["Body text", "#26332F"],
  ["Night", "#1D2B4F"],
  ["Parent", "#33465C"],
];

/** Character reference sheet and asset gallery for design approval. Not linked from child navigation. */
export default function StyleGuidePage() {
  return (
    <div className="stack-lg">
      <div className="row">
        <LogoMark size={56} title="Little Ramadan logo" />
        <h1>Little Ramadan — reference sheet</h1>
      </div>
      <section className="card stack">
        <h2>Noor</h2>
        <div className="row wrap">
          {EXPRESSIONS.map((e) => (
            <figure key={e} className="center" style={{ margin: 0 }}>
              <Noor expression={e} size={110} />
              <figcaption className="small">{e}</figcaption>
            </figure>
          ))}
        </div>
      </section>
      <section className="card stack">
        <h2>Amina</h2>
        <div className="row wrap">
          {EXPRESSIONS.map((e) => (
            <figure key={e} className="center" style={{ margin: 0 }}>
              <Amina expression={e} size={110} />
              <figcaption className="small">{e}</figcaption>
            </figure>
          ))}
        </div>
      </section>
      <section className="card stack">
        <h2>Hilmy</h2>
        <div className="row wrap">
          {(["happy", "sleepy", "cheer"] as const).map((e) => (
            <figure key={e} className="center" style={{ margin: 0 }}>
              <Hilmy expression={e} size={100} />
              <figcaption className="small">{e}</figcaption>
            </figure>
          ))}
        </div>
      </section>
      <section className="card stack">
        <h2>Avatars</h2>
        <div className="row wrap">
          {AVATARS.map((a) => (
            <figure key={a.id} className="center" style={{ margin: 0 }}>
              <Avatar id={a.id} size={72} />
              <figcaption className="small">{a.name}</figcaption>
            </figure>
          ))}
        </div>
      </section>
      <section className="card stack">
        <h2>Palette</h2>
        <div className="row wrap">
          {COLOURS.map(([n, c]) => (
            <div key={c} className="center small" style={{ width: 90 }}>
              <div style={{ background: c, height: 56, borderRadius: 12, border: "1px solid #0002" }} />
              {n}
              <br />
              {c}
            </div>
          ))}
        </div>
      </section>
      <section className="card stack">
        <h2>Illustrations ({ILLUSTRATION_KEYS.length})</h2>
        <div className="row wrap">
          {ILLUSTRATION_KEYS.map((k) => (
            <figure key={k} className="center" style={{ margin: 0, width: 84 }}>
              <Illustration name={k} size={72} />
              <figcaption className="small">{k}</figcaption>
            </figure>
          ))}
        </div>
      </section>
      <section className="card stack">
        <h2>Badges and decorations</h2>
        <div className="row wrap">
          {badges.map((b) => (
            <BadgeIcon key={b.id} id={b.id} size={72} label={b.title} />
          ))}
        </div>
        <div className="row wrap">
          {decorations.map((d) => (
            <figure key={d.id} className="center" style={{ margin: 0, width: 84 }}>
              <DecorationThumb id={d.id} size={64} />
              <figcaption className="small">{d.title}</figcaption>
            </figure>
          ))}
        </div>
      </section>
    </div>
  );
}
