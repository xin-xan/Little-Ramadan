/** Form controls generated from the schema. */
import { useState, type ReactNode } from "react";
import { Illustration } from "@/components/art/Illustration";
import { DvPicture } from "@/components/dhivehi/DvPicture";
import type { IllustrationKey } from "@/components/art/illustrationKeys";
import type { PictureKey } from "@/content/dhivehi";
import type { ContentBundle } from "@/content/validate";
import { ILLUSTRATIONS, PICTURES, REVIEW_STATUSES, type Field, type Obj, type Option } from "./schema";

export interface Ctx {
  bundle: ContentBundle;
  /** Uploaded pictures (already in the repository, or waiting to be published). */
  images: string[];
  /** Data URLs for pictures uploaded in this session (not yet on the live site). */
  previews: Record<string, string>;
  onUpload(file: File): Promise<string | null>;
  /** IDs already published in this collection: these can't be changed. */
  lockedIds: Set<string>;
}

export const slug = (t: string) =>
  t
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

const uid = (() => {
  let n = 0;
  return () => `f${++n}`;
})();

function Labelled({ id, label, help, error, children }: { id: string; label: string; help?: string; error?: string; children: ReactNode }) {
  return (
    <div className={`field${error ? " has-error" : ""}`}>
      <label htmlFor={id}>{label}</label>
      {help && <p className="help">{help}</p>}
      {children}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

/** A picture from the built-in set or an uploaded one. */
export function PicturePreview({ value, ctx, dhivehi = false, size = 56 }: { value: string; ctx: Ctx; dhivehi?: boolean; size?: number }) {
  if (value.startsWith("img:")) {
    const name = value.slice(4);
    const src = ctx.previews[name] ?? `/content-images/${name}`;
    // eslint-disable-next-line @next/next/no-img-element -- the admin is not a Next.js page
    return <img src={src} width={size} height={size} alt="" className="pic" />;
  }
  return dhivehi ? <DvPicture name={value as PictureKey} size={size} /> : <Illustration name={value as IllustrationKey} size={size} />;
}

function PicturePicker({ value, onChange, ctx, dhivehi, optional, label, id }: { value: string | undefined; onChange(v: string | undefined): void; ctx: Ctx; dhivehi: boolean; optional?: boolean; label: string; id: string }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const builtIn = dhivehi ? PICTURES : ILLUSTRATIONS;
  return (
    <div className="picker">
      <div className="row">
        {value ? <PicturePreview value={value} ctx={ctx} dhivehi={dhivehi} /> : <span className="pic empty">None</span>}
        <span className="muted small">{value ?? ""}</span>
        <button type="button" id={id} className="btn" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? `Close ${label.toLowerCase()} choices` : `Change ${label.toLowerCase()}`}>
          {open ? "Close" : "Change picture"}
        </button>
        {optional && value && (
          <button type="button" className="btn ghost" onClick={() => onChange(undefined)}>
            Remove
          </button>
        )}
      </div>
      {open && (
        <div className="picker-panel" role="group" aria-label={`Choose ${label}`}>
          <label className="btn upload">
            {busy ? "Uploading…" : "Upload a new picture"}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              hidden
              data-testid="upload-picture"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (!f) return;
                setBusy(true);
                setError(null);
                try {
                  const name = await ctx.onUpload(f);
                  if (name) {
                    onChange(`img:${name}`);
                    setOpen(false);
                  }
                } catch (err) {
                  setError((err as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            />
          </label>
          {error && <p className="field-error">{error}</p>}
          {ctx.images.length > 0 && <h4>Uploaded pictures</h4>}
          <div className="pic-grid">
            {ctx.images.map((n) => (
              <button key={n} type="button" className={`pic-choice${value === `img:${n}` ? " on" : ""}`} onClick={() => { onChange(`img:${n}`); setOpen(false); }} aria-label={n} aria-pressed={value === `img:${n}`}>
                <PicturePreview value={`img:${n}`} ctx={ctx} size={48} />
              </button>
            ))}
          </div>
          <h4>Built-in pictures</h4>
          <div className="pic-grid">
            {builtIn.map((k) => (
              <button key={k} type="button" className={`pic-choice${value === k ? " on" : ""}`} onClick={() => { onChange(k); setOpen(false); }} aria-label={k} aria-pressed={value === k} title={k}>
                <PicturePreview value={k} ctx={ctx} dhivehi={dhivehi} size={48} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function move<T>(arr: T[], from: number, to: number) {
  const a = [...arr];
  const [x] = a.splice(from, 1);
  a.splice(to, 0, x);
  return a;
}

export function FieldEditor({ field, value, onChange, parent, ctx, errorFor }: { field: Field; value: unknown; onChange(v: unknown): void; parent: Obj; ctx: Ctx; errorFor(key: string): string | undefined }) {
  const [id] = useState(uid);
  const err = errorFor(field.key);
  switch (field.type) {
    case "id": {
      const v = typeof value === "string" ? value : "";
      const locked = !!v && ctx.lockedIds.has(v);
      const title = typeof parent.title === "string" ? parent.title : typeof parent.word === "string" ? parent.word : typeof parent.label === "string" ? parent.label : typeof parent.question === "string" ? parent.question : typeof parent.roman === "string" ? parent.roman : "";
      return (
        <Labelled id={id} label={field.label} help={locked ? "This ID is already published. Children's saved progress uses it, so it can't be changed." : "Lower-case words joined by hyphens. It never changes after publishing."} error={err}>
          <div className="row">
            <input id={id} className="input" value={v} readOnly={locked} onChange={(e) => onChange(slug(e.target.value.replace(/-$/, "x")).replace(/x$/, "") || e.target.value.toLowerCase())} />
            {!locked && title && (
              <button type="button" className="btn ghost" onClick={() => onChange(slug(title))}>
                Make from title
              </button>
            )}
          </div>
        </Labelled>
      );
    }
    case "text": {
      const v = typeof value === "string" ? value : "";
      const props = { id, className: `input${field.thaana ? " thaana" : ""}`, value: v, dir: field.thaana ? "rtl" : undefined, lang: field.thaana ? "dv" : undefined, onChange: (e: { target: { value: string } }) => onChange(field.optional && e.target.value === "" ? undefined : e.target.value) };
      return (
        <Labelled id={id} label={field.label} help={field.help} error={err}>
          {field.multiline ? <textarea rows={Math.min(10, Math.max(3, Math.ceil(v.length / 60)))} {...props} /> : <input {...props} />}
        </Labelled>
      );
    }
    case "number":
      return (
        <Labelled id={id} label={field.label} help={field.help} error={err}>
          <input id={id} type="number" className="input narrow" min={field.min} max={field.max} value={typeof value === "number" ? value : ""} onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))} />
        </Labelled>
      );
    case "boolean":
      return (
        <Labelled id={id} label={field.label} help={field.help} error={err}>
          <div className="segmented" id={id} role="radiogroup" aria-label={field.label}>
            <button type="button" role="radio" aria-checked={value === true} onClick={() => onChange(true)}>
              {field.yes}
            </button>
            <button type="button" role="radio" aria-checked={value !== true} onClick={() => onChange(false)}>
              {field.no}
            </button>
          </div>
        </Labelled>
      );
    case "select": {
      const options: Option[] = typeof field.options === "function" ? field.options(ctx.bundle) : field.options;
      const v = typeof value === "string" ? value : "";
      return (
        <Labelled id={id} label={field.label} help={field.help} error={err}>
          <select id={id} className="input" value={v} onChange={(e) => onChange(e.target.value === "" ? undefined : e.target.value)}>
            {(field.optional || !v) && <option value="">{field.optional ? "— none —" : "Choose…"}</option>}
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
            {v && !options.some((o) => o.value === v) && <option value={v}>{v} (not found)</option>}
          </select>
        </Labelled>
      );
    }
    case "illustration":
    case "picture":
      return (
        <Labelled id={id} label={field.label} help={field.help} error={err}>
          <PicturePicker id={id} label={field.label} value={typeof value === "string" ? value : undefined} onChange={(v) => onChange(v)} ctx={ctx} dhivehi={field.type === "picture"} optional={field.type === "picture" && field.optional} />
        </Labelled>
      );
    case "color": {
      const v = typeof value === "string" ? value : "";
      return (
        <Labelled id={id} label={field.label} help={field.help} error={err}>
          <div className="row">
            <input type="color" aria-label={`${field.label} picker`} value={/^#[0-9a-fA-F]{6}$/.test(v) ? v : "#000000"} onChange={(e) => onChange(e.target.value.toUpperCase())} />
            <input id={id} className="input narrow" value={v} placeholder={field.optional ? "none" : "#RRGGBB"} onChange={(e) => onChange(field.optional && !e.target.value ? undefined : e.target.value)} />
          </div>
        </Labelled>
      );
    }
    case "textList": {
      const arr = Array.isArray(value) ? (value as string[]) : [];
      return (
        <fieldset className={`group${err ? " has-error" : ""}`}>
          <legend>{field.label}</legend>
          {field.help && <p className="help">{field.help}</p>}
          {err && <p className="field-error">{err}</p>}
          {arr.map((t, i) => (
            <div key={i} className="list-row">
              {field.multiline ? (
                <textarea className="input" rows={3} aria-label={`${field.label} ${i + 1}`} value={t} onChange={(e) => onChange(arr.map((x, j) => (j === i ? e.target.value : x)))} />
              ) : (
                <input className="input" aria-label={`${field.label} ${i + 1}`} value={t} onChange={(e) => onChange(arr.map((x, j) => (j === i ? e.target.value : x)))} />
              )}
              {errorFor(`${field.key}[${i}]`) && <p className="field-error">{errorFor(`${field.key}[${i}]`)}</p>}
              <div className="mini-actions">
                <button type="button" className="icon" disabled={i === 0} onClick={() => onChange(move(arr, i, i - 1))} aria-label={`Move ${field.itemLabel} ${i + 1} up`}>↑</button>
                <button type="button" className="icon" disabled={i === arr.length - 1} onClick={() => onChange(move(arr, i, i + 1))} aria-label={`Move ${field.itemLabel} ${i + 1} down`}>↓</button>
                <button type="button" className="icon danger" onClick={() => onChange(arr.filter((_, j) => j !== i))} aria-label={`Remove ${field.itemLabel} ${i + 1}`}>✕</button>
              </div>
            </div>
          ))}
          <button type="button" className="btn ghost" onClick={() => onChange([...arr, ""])}>
            + Add {field.itemLabel}
          </button>
        </fieldset>
      );
    }
    case "list": {
      const arr = Array.isArray(value) ? (value as Obj[]) : [];
      return (
        <fieldset className={`group${err ? " has-error" : ""}`}>
          <legend>{field.label}</legend>
          {field.help && <p className="help">{field.help}</p>}
          {err && <p className="field-error">{err}</p>}
          {arr.map((item, i) => {
            const subErr = (k: string) => errorFor(`${field.key}[${i}].${k}`) ?? (k === "" ? errorFor(`${field.key}[${i}]`) : undefined);
            return (
              <details key={i} className="sub-item" open={arr.length <= 3 || undefined}>
                <summary>
                  <span>{field.titleOf ? field.titleOf(item, i) : `${field.itemLabel} ${i + 1}`}</span>
                  {Object.keys(item).some((k) => subErr(k)) && <span className="badge-error">needs fixing</span>}
                </summary>
                {field.fields.map((f) => (
                  <FieldEditor key={f.key} field={f} value={item[f.key]} parent={item} ctx={ctx} errorFor={(k) => subErr(k)} onChange={(v) => onChange(arr.map((x, j) => (j === i ? setKey(x, f.key, v) : x)))} />
                ))}
                <div className="mini-actions">
                  <button type="button" className="btn ghost" disabled={i === 0} onClick={() => onChange(move(arr, i, i - 1))}>↑ Move up</button>
                  <button type="button" className="btn ghost" disabled={i === arr.length - 1} onClick={() => onChange(move(arr, i, i + 1))}>↓ Move down</button>
                  <button type="button" className="btn ghost danger" onClick={() => onChange(arr.filter((_, j) => j !== i))}>Remove {field.itemLabel}</button>
                </div>
              </details>
            );
          })}
          <button type="button" className="btn ghost" onClick={() => onChange([...arr, field.newItem()])}>
            + Add {field.itemLabel}
          </button>
        </fieldset>
      );
    }
    case "object": {
      const obj = value && typeof value === "object" ? (value as Obj) : undefined;
      if (!obj)
        return (
          <fieldset className="group">
            <legend>{field.label}</legend>
            <button type="button" className="btn ghost" onClick={() => onChange(Object.fromEntries(field.fields.map((f) => [f.key, f.type === "boolean" ? false : undefined])))}>
              + Add {field.label.toLowerCase()}
            </button>
          </fieldset>
        );
      return (
        <fieldset className="group">
          <legend>{field.label}</legend>
          {field.help && <p className="help">{field.help}</p>}
          {field.fields.map((f) => (
            <FieldEditor key={f.key} field={f} value={obj[f.key]} parent={obj} ctx={ctx} errorFor={(k) => errorFor(`${field.key}.${k}`)} onChange={(v) => onChange(setKey(obj, f.key, v))} />
          ))}
          {field.optional && (
            <button type="button" className="btn ghost danger" onClick={() => onChange(undefined)}>
              Remove {field.label.toLowerCase()}
            </button>
          )}
        </fieldset>
      );
    }
    case "review": {
      const r = value && typeof value === "object" ? (value as Obj) : { status: "draft" };
      const set = (k: string, v: unknown) => onChange(setKey(r, k, v === "" ? undefined : v));
      return (
        <fieldset className={`group review${err ? " has-error" : ""}`}>
          <legend>{field.label}</legend>
          {field.help && <p className="help">{field.help}</p>}
          <label htmlFor={`${id}-s`}>Status</label>
          <select id={`${id}-s`} className="input" value={String(r.status ?? "draft")} onChange={(e) => set("status", e.target.value)}>
            {REVIEW_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s === "draft" ? "Draft (not yet reviewed)" : s === "in_review" ? "In review" : "Reviewed and approved"}
              </option>
            ))}
          </select>
          <label htmlFor={`${id}-r`}>Reviewer</label>
          <input id={`${id}-r`} className="input" value={String(r.reviewer ?? "")} onChange={(e) => set("reviewer", e.target.value)} />
          <label htmlFor={`${id}-d`}>Reviewed on</label>
          <input id={`${id}-d`} type="date" className="input narrow" value={String(r.reviewedOn ?? "")} onChange={(e) => set("reviewedOn", e.target.value)} />
          <label htmlFor={`${id}-n`}>Notes</label>
          <textarea id={`${id}-n`} className="input" rows={2} value={String(r.notes ?? "")} onChange={(e) => set("notes", e.target.value)} />
        </fieldset>
      );
    }
    case "answer": {
      const options = Array.isArray(parent.options) ? (parent.options as string[]) : [];
      return (
        <Labelled id={id} label={field.label} help={field.help} error={err}>
          <select id={id} className="input" value={typeof value === "number" ? String(value) : ""} onChange={(e) => onChange(Number(e.target.value))}>
            {options.map((o, i) => (
              <option key={i} value={i}>
                {["A", "B", "C"][i] ?? i + 1}: {o || "(empty)"}
              </option>
            ))}
          </select>
        </Labelled>
      );
    }
  }
}

/** Sets a key immutably; `undefined` removes it (keeps the JSON tidy). */
export function setKey(obj: Obj, key: string, v: unknown): Obj {
  const next = { ...obj };
  if (v === undefined) delete next[key];
  else next[key] = v;
  return next;
}
