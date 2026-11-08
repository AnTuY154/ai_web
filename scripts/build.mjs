import assert from "node:assert/strict";
import { copyFile, mkdir, readFile, rm, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const dist=join(root,"dist");
const assets=["index.html","styles.css","app.js","data/hanoi-lakes.json"];

const html=await readFile(join(root,"index.html"),"utf8");
assert.match(html, /src="\.\/app\.js"/, "index.html needs local app.js");
assert.match(html, /href="\.\/styles\.css"/, "index.html needs local styles.css");
const js=await readFile(join(root,"app.js"),"utf8");
assert.match(js, /fetch\("\.\/data\/hanoi-lakes\.json"\)/, "app.js needs relative lake data asset");

await rm(dist,{recursive:true,force:true});
for(const asset of assets){
  const output=join(dist,asset);
  await mkdir(dirname(output),{recursive:true});
  await copyFile(join(root,asset),output);
  const s=await stat(output);
  assert.ok(s.size>0,"Empty build asset: "+asset);
}
console.log("✓ Static production build written to dist/");
console.log("  Assets: "+assets.join(", "));
