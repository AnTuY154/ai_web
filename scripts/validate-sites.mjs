import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const sitesRoot = path.join(root, "sites");
const required = [
  "package.json",
  "next.config.mjs",
  "tsconfig.json",
  "next-env.d.ts",
  "app/layout.tsx",
  "app/page.tsx",
  "app/globals.css",
  "data/site.ts",
  "MARKET_RESEARCH.md",
  "README.md",
];

const folders = (await readdir(sitesRoot, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

const errors = [];
if (folders.length !== 50) errors.push(`Expected 50 site folders, found ${folders.length}.`);

for (const folder of folders) {
  for (const file of required) {
    try {
      await access(path.join(sitesRoot, folder, file));
    } catch {
      errors.push(`${folder}: missing ${file}`);
    }
  }

  const data = await readFile(path.join(sitesRoot, folder, "data/site.ts"), "utf8");
  if (!data.includes("google.com/maps")) errors.push(`${folder}: missing Google Maps URL`);
  if (!data.includes("latestReview")) errors.push(`${folder}: missing review recency evidence`);
  if (/undefined|null/.test(data)) errors.push(`${folder}: unresolved data value`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Validated ${folders.length} complete, independent site projects.`);
