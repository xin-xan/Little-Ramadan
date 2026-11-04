// Builds preview/dist/index.html: the whole app as ONE self-contained HTML file with hash routing,
// for sharing as a claude.ai artifact. The real product build is `npm run build` (static PWA).
import { build } from "esbuild";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "preview/dist");
mkdirSync(out, { recursive: true });

const result = await build({
  entryPoints: [join(root, "preview/main.tsx")],
  bundle: true,
  minify: true,
  write: false,
  outdir: out,
  format: "iife",
  target: "es2020",
  jsx: "automatic",
  loader: { ".png": "dataurl", ".woff2": "dataurl" },
  alias: { "next/link": join(root, "preview/shims/link.tsx"), "next/navigation": join(root, "preview/shims/navigation.ts") },
  define: { "process.env.NODE_ENV": '"preview"', "process.env.NEXT_PUBLIC_BASE_PATH": '""' },
  tsconfig: join(root, "tsconfig.json"),
  logLevel: "warning",
});

const js = result.outputFiles.find((f) => f.path.endsWith(".js")).text;
const css = result.outputFiles.find((f) => f.path.endsWith(".css"))?.text ?? "";
const icon = readFileSync(join(root, "public/icons/icon-192.png")).toString("base64");
const html = `<!DOCTYPE html>
<html lang="en-GB"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#123C35">
<title>Little Ramadan</title>
<link rel="icon" href="data:image/png;base64,${icon}">
<style>${css}</style></head>
<body><div id="root"></div><script>${js.replace(/<\/script/gi, "<\\/script")}</script></body></html>`;
writeFileSync(join(out, "index.html"), html);
console.log(`preview/dist/index.html: ${Math.round(html.length / 1024)} KB`);
