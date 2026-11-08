import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const data=JSON.parse(await readFile(new URL("../data/hanoi-lakes.json",import.meta.url),"utf8"));
assert.ok(Array.isArray(data.lakes),"lakes must be an array");
assert.equal(data.count,data.lakes.length,"count must match array");
assert.ok(data.lakes.length>=20,"seed should contain substantial coverage");
const ids=new Set();
for(const lake of data.lakes){
  assert.ok(typeof lake.id==="string"&&lake.id.length>0,"lake needs id");
  assert.ok(typeof lake.name==="string"&&lake.name.length>0,"lake needs name");
  assert.ok(!ids.has(lake.id),"lake id must be unique");
  assert.ok(Array.isArray(lake.sources)&&lake.sources.length>0,"lake needs provenance");
  ids.add(lake.id);
}
assert.ok(ids.has("bay-mau"),"sample lake Bảy Mẫu must exist");
const html=await readFile(new URL("../index.html",import.meta.url),"utf8");
for(const id of ["mapScreen","mapFrame","gameScreen","gameCanvas","gameLayout","fishingView","floatCanvas","seatNumber","biteBanner","fightPanel","safeBand","tensionMarker","fightClock","fishingStatus","castBtn","reelBtn","fishList","rentBtn"]){
  assert.ok(html.includes('id="'+id+'"'),"missing frontend id "+id);
}
const js=await readFile(new URL("../app.js",import.meta.url),"utf8");
assert.ok(js.includes("MAX_ANGLERS=15"),"15-spot rule");
assert.ok(js.includes("MAX_SPECTATORS=30"),"30-spectator rule");
assert.ok(js.includes("FREE_SECONDS=300"),"5-minute free rule");
assert.ok(js.includes("makeFight("),"must enter tension mini-game after a strike");
assert.ok(js.includes("drawFloatScene("),"must render float close-up");
assert.ok(js.includes("Space"),"Space controls must exist");
for(const found of js.matchAll(/\$\("([\w-]+)"\)/g)){
  assert.ok(html.includes('id="'+found[1]+'"'),"missing HTML ID referenced by JS: "+found[1]);
}
const count=(js.match(/rarity:"(common|rare|epic)"/g)||[]).length;
assert.equal(count,10,"ten fish species");
const vercel=JSON.parse(await readFile(new URL("../vercel.json",import.meta.url),"utf8"));
assert.equal(vercel.framework,null,"Vercel must not use the old Next.js framework");
assert.equal(vercel.buildCommand,"npm run build","Vercel must build the static game");
assert.equal(vercel.outputDirectory,"dist","Vercel must serve dist");
console.log("✓ Pixel prototype data, rules and Vercel configuration passed.");
