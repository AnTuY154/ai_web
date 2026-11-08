import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const root=dirname(dirname(fileURLToPath(import.meta.url)));
const files=["index.html","app.js","fishing-engine.mjs","styles.css","data/hanoi-lakes.json"];
for(const file of files){
  const [source,built]=await Promise.all([
    readFile(join(root,file)),
    readFile(join(root,"dist",file))
  ]);
  assert.ok(built.length>0,"Empty build file: "+file);
  assert.deepEqual(built,source,"Mismatch in static build: "+file);
}
const data=JSON.parse(await readFile(join(root,"dist/data/hanoi-lakes.json"),"utf8"));
assert.equal(data.count,data.lakes.length);
console.log("✓ Build verification passed — "+files.length+" files and "+data.count+" lakes.");
