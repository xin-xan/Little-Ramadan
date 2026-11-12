// Builds the content admin dashboard into out/admin/ as its own small app, separate from the
// children's app: its own bundle and its own Content-Security-Policy (the only page allowed to
// contact api.github.com). Not precached by the service worker.
import { build } from "esbuild";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const outDir = path.join(root, "out", "admin");
const base = process.env.BASE_PATH ?? "";
mkdirSync(outDir, { recursive: true });

await build({
  entryPoints: [path.join(root, "admin/main.tsx")],
  bundle: true,
  minify: true,
  format: "iife",
  target: "es2020",
  outfile: path.join(outDir, "admin.js"),
  alias: { "@": path.join(root, "src") },
  jsx: "automatic",
  loader: { ".woff2": "file" },
  assetNames: "[name]-[hash]",
  define: { "process.env.NODE_ENV": '"production"', "process.env.NEXT_PUBLIC_BASE_PATH": JSON.stringify(base) },
  logLevel: "warning",
});

const csp = ["default-src 'self'", "script-src 'self'", "style-src 'self' 'unsafe-inline'", "img-src 'self' data: blob:", "font-src 'self'", "connect-src 'self' https://api.github.com", "object-src 'none'", "base-uri 'self'", "form-action 'none'"].join("; ");
writeFileSync(
  path.join(outDir, "index.html"),
  `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta http-equiv="Content-Security-Policy" content="${csp}">
<meta name="robots" content="noindex, nofollow">
<meta name="referrer" content="no-referrer">
<title>Little Ramadan · Content admin</title>
<link rel="stylesheet" href="${base}/admin/admin.css">
</head>
<body>
<div id="root"></div>
<noscript>The content admin needs JavaScript.</noscript>
<script src="${base}/admin/admin.js"></script>
</body>
</html>
`,
);
console.log("admin: built out/admin/");
