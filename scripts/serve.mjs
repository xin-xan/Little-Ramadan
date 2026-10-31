// Minimal static server for the exported app (used by `npm start` and e2e tests).
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";

const port = Number(process.argv[2] ?? process.env.PORT ?? 4173);
const root = "out";
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".webmanifest": "application/manifest+json", ".png": "image/png", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".txt": "text/plain", ".woff2": "font/woff2" };

createServer((req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  let p = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, "");
  let file = join(root, p);
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
  else if (!existsSync(file) && existsSync(file + ".html")) file += ".html";
  else if (!existsSync(file) && existsSync(join(file, "index.html"))) {
    res.writeHead(308, { Location: url.pathname + "/" });
    return res.end();
  }
  if (!existsSync(file)) {
    res.writeHead(404, { "Content-Type": TYPES[".html"] });
    return res.end(existsSync(join(root, "404.html")) ? readFileSync(join(root, "404.html")) : "Not found");
  }
  const headers = { "Content-Type": TYPES[extname(file)] ?? "application/octet-stream", "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer" };
  if (file.endsWith("sw.js")) headers["Cache-Control"] = "no-cache";
  res.writeHead(200, headers);
  res.end(readFileSync(file));
}).listen(port, () => console.log(`Little Ramadan at http://localhost:${port}`));
