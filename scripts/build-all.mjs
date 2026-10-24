import { spawn } from "node:child_process";
import { readdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const sitesRoot = path.join(root, "sites");
const sites = (await readdir(sitesRoot, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

function run(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
      stdio: "inherit",
    });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with code ${code}`));
    });
  });
}

console.log(`Building ${sites.length} independent Next.js projects...`);
for (const [index, site] of sites.entries()) {
  console.log(`\n[${index + 1}/${sites.length}] ${site}`);
  await run("npm", ["run", "build", "--workspace", `sites/${site}`], root);
}
console.log(`\nAll ${sites.length} projects built successfully.`);
