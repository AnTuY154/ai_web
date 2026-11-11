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
for(const id of ["mapScreen","mapFrame","gameScreen","gameCanvas","gameLayout","fishingView","floatCanvas","seatNumber","fightPanel","fightScrim","fightHitBtn","fightMistakes","safeBand","tensionMarker","fightClock","fishingStatus","castBtn","reelBtn","fishList","rentBtn"]){
  assert.ok(html.includes('id="'+id+'"'),"missing frontend id "+id);
}
const js=await readFile(new URL("../app.js",import.meta.url),"utf8");
assert.ok(js.includes("MAX_ANGLERS=15"),"15-spot rule");
assert.ok(js.includes("MAX_SPECTATORS=30"),"30-spectator rule");
assert.ok(js.includes("FREE_SECONDS=300"),"5-minute free rule");
assert.ok(js.includes("makeFight("),"must enter tension mini-game after a strike");
assert.ok(js.includes("drawFloatScene("),"must render float close-up");

assert.ok(js.includes("planFloatCast("),"must randomly schedule natural false movements and real takes");
assert.ok(js.includes("floatPose("),"bobber motion must use pure physical float simulation");
assert.ok(js.includes("planNextTake(now);"),"missed takes must settle silently and offer another bite");
assert.ok(js.includes('state.fishing==="bite"'),"real bite still needs a genuine hook window");
assert.doesNotMatch(html,/id="biteBanner"|CÁ CẮN!|CÁ CẮN THẬT!/i,"do not show a flashing bite warning");
assert.doesNotMatch(js,/CÁ CẮN THẬT|CÁ CẮN!|GIẬT CẦN NGAY|PHAO BIẾN ĐỘNG MẠNH/,"no cheat text or prompt at bite time");
assert.match(js,/const observing=stage==="waiting"\|\|stage==="bite";/,"identical visual HUD states before and during take");

assert.ok(js.includes("Space"),"Space controls must exist");
for(const id of ["baitSelect","baitAdvice","baitGroup","baitFavorites","baitDescription"]){
  assert.ok(html.includes('id="'+id+'"'),"bait UI missing "+id);
}
const baitSelectHtml=html.match(/<select id="baitSelect"[^>]*>([\s\S]*?)<\/select>/)?.[1];
assert.ok(baitSelectHtml,"bait choice control is missing");
const baitOptions=[...baitSelectHtml.matchAll(/<option value="([^"]+)"/g)].map(x=>x[1]);
assert.deepEqual(baitOptions.sort(),["worm","flour","corn","greens","shrimp","snail","lure"].sort(),"all 7 bait types must be selectable");
assert.match(js,/from "\.\/bait-engine\.mjs"/,"app must import bait encounter engine");
assert.match(js,/chooseFishByBait\(FISH,\$\("baitSelect"\)\.value,\$\("rodSelect"\)\.value\)/,"bait and rod must affect fish choice");
assert.match(js,/const locked=state\.fishing!=="idle";/,"bait and rod should lock during cast");
assert.match(js,/renderBaitAdvice\(\)/,"bait selection must show contextual guide");

assert.ok(js.includes("strikeFight("),"Space press must score moving marker");
assert.ok(js.includes('if(state.fishing==="reeling")syncFightMeter();'),"cursor animation should update every frame");
assert.ok(!js.includes("state.held"),"old hold/release model must be removed");
const css=await readFile(new URL("../styles.css",import.meta.url),"utf8");
assert.doesNotMatch(css,/\.bite-banner|bite-flash/,"no dormant bite alarm CSS");
assert.match(css,/\#fightPanel\s*\{[^}]*position:fixed;top:50%;left:50%/,"meter must be fixed in center of screen");
assert.match(css,/translate\(-50%,-50%\)/,"meter must be centered in both axes");
for(const found of js.matchAll(/\$\("([\w-]+)"\)/g)){
  assert.ok(html.includes('id="'+found[1]+'"'),"missing HTML ID referenced by JS: "+found[1]);
}
// A successful catch must show a real local fish sprite (never a missing image).
for(const id of ["catchSuccessModal","catchSuccessCard","catchSuccessTitle","catchSuccessImage","catchSuccessName","catchSuccessRarity","catchSuccessCoins","catchSuccessPoints","catchSuccessClose"]){
  assert.ok(html.includes('id="'+id+'"'),"catch result is missing "+id);
}
assert.match(html,/id="catchSuccessModal"[^>]*role="dialog"[^>]*aria-modal="true"/,"catch result must be an accessible dialog");
assert.match(js,/function showCatchSuccess\(fish\)/,"show catch result function missing");
assert.match(js,/function closeCatchSuccess\(continueFishing=false\)/,"continue fishing handler missing");
assert.match(js,/showCatchSuccess\(fish\);/,"successful catch must trigger fish result");
assert.match(js,/state\.catchModalOpen/,"result dialog must guard keyboard input");
assert.match(css,/\.catch-success-modal\s*\{[^}]*position:fixed/,"result dialog must cover viewport");
const fishIds=["ro-phi","ro-dong","diec","troi","me-trang","chep","tram-co","tre","tram-den","ca-qua"];
const spriteBodies=[];
for(const id of fishIds){
  const svg=await readFile(new URL("../assets/fish/"+id+".svg",import.meta.url),"utf8");
  assert.match(svg,/<svg\s/,"missing SVG root: "+id);
  assert.match(svg,/shape-rendering="crispEdges"/,"fish sprite must be crisp pixel art: "+id);
  assert.match(svg,/<title>/,"fish needs accessible title: "+id);
  assert.doesNotMatch(svg,/<script\b|<foreignObject\b|(?:href|src)="https?:\/\//i,"fish sprite must not contain scripts or external image resources: "+id);
  spriteBodies.push(svg);
}
assert.equal(new Set(spriteBodies).size,10,"all 10 fish must use distinct art assets");
const count=(js.match(/rarity:"(common|rare|epic)"/g)||[]).length;
assert.equal(count,10,"ten fish species");
const vercel=JSON.parse(await readFile(new URL("../vercel.json",import.meta.url),"utf8"));
assert.equal(vercel.framework,null,"Vercel must not use the old Next.js framework");
assert.equal(vercel.buildCommand,"npm run build","Vercel must build the static game");
assert.equal(vercel.outputDirectory,"dist","Vercel must serve dist");
console.log("✓ Pixel prototype data, rules and Vercel configuration passed.");
