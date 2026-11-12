// Build gate: checks every file in src/content/data/ (and that uploaded pictures exist) before
// the app is built. If anything is wrong the build stops, so the live app keeps the last good
// version. Run on its own with `npm run validate:content`.
import { build } from "esbuild";
import { existsSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const out = path.join(root, "node_modules", ".validate-content.cjs");
await build({
  entryPoints: [path.join(root, "src/content/validate.ts")],
  bundle: true,
  platform: "node",
  format: "cjs",
  outfile: out,
  alias: { "@": path.join(root, "src") },
  logLevel: "error",
});
const { validateContent, CONTENT_FILES } = createRequire(import.meta.url)(out);
rmSync(out, { force: true });

const bundle = {};
const problems = [];
for (const [key, file] of Object.entries(CONTENT_FILES)) {
  try {
    bundle[key] = JSON.parse(readFileSync(path.join(root, "src/content/data", file), "utf8"));
  } catch (e) {
    problems.push(`${file}: could not be read as JSON (${e.message})`);
  }
}
const imgDir = path.join(root, "public/content-images");
const images = new Set(existsSync(imgDir) ? readdirSync(imgDir) : []);
if (!problems.length) for (const i of validateContent(bundle, { images })) problems.push(`${CONTENT_FILES[i.file]} → ${i.path}: ${i.message}`);

if (problems.length) {
  console.error(`\nContent check failed (${problems.length} problem${problems.length === 1 ? "" : "s"}). The app was not built.\n`);
  for (const p of problems) console.error(`  • ${p}`);
  console.error("");
  process.exit(1);
}
console.log("Content check passed.");
