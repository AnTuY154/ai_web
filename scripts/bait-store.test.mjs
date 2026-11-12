import test from "node:test";
import assert from "node:assert/strict";
import {BAITS,fishEncounterOdds} from "../bait-engine.mjs";
import {
  BAIT_SAVE_KEY,BAIT_PRICES,STARTER_BAITS,countBaits,
  starterProgress,restoreProgress,makeSave,spendBait,buyBait
} from "../bait-store.mjs";

const FISH=[
  {id:"ro-phi",rarity:"common"},{id:"ro-dong",rarity:"common"},
  {id:"diec",rarity:"common"},{id:"troi",rarity:"common"},
  {id:"me-trang",rarity:"common"},{id:"chep",rarity:"rare"},
  {id:"tram-co",rarity:"rare"},{id:"tre",rarity:"rare"},
  {id:"tram-den",rarity:"epic"},{id:"ca-qua",rarity:"epic"}
];
test("new players receive EXACTLY 50 free bait uses across all seven bait types",()=>{
  assert.ok(BAIT_SAVE_KEY.includes("save-v1"));
  const progress=starterProgress();
  assert.equal(countBaits(progress.inventory),50);
  assert.equal(progress.coins,50);
  assert.deepEqual(Object.keys(progress.inventory).sort(),Object.keys(BAITS).sort());
  assert.ok(Object.values(progress.inventory).every(n=>n>0));
  assert.deepEqual(Object.keys(BAIT_PRICES).sort(),Object.keys(BAITS).sort());
  assert.notStrictEqual(starterProgress().inventory,progress.inventory,"starter inventory must be a fresh object");
  assert.ok(Object.values(BAIT_PRICES).every(n=>Number.isSafeInteger(n)&&n>0));
});
test("every new cast spends exactly one bait, and zero stock cannot cast",()=>{
  const initial=starterProgress().inventory;
  const used=spendBait(initial,"worm");
  assert.equal(used.ok,true);
  assert.equal(used.inventory.worm,initial.worm-1);
  assert.equal(countBaits(used.inventory),49);
  assert.equal(countBaits(initial),50,"no mutation of original inventory");
  let stock=used.inventory;
  for(let n=0;n<initial.worm-1;n++)stock=spendBait(stock,"worm").inventory;
  assert.equal(stock.worm,0);
  const failed=spendBait(stock,"worm");
  assert.equal(failed.ok,false);
  assert.equal(failed.inventory.worm,0);
  assert.equal(countBaits(stock),50-initial.worm);
  assert.equal(spendBait(stock,"does-not-exist").ok,false);
  assert.equal(spendBait(stock,"lure").inventory.lure,1,"artificial bait also consumes one use");
});
test("buy one or five baits uses exact in-game coin balance",()=>{
  const start=starterProgress();
  const one=buyBait(start.inventory,start.coins,"snail",1);
  assert.equal(one.ok,true);
  assert.equal(one.coins,start.coins-6);
  assert.equal(one.inventory.snail,start.inventory.snail+1);
  const five=buyBait(one.inventory,one.coins,"worm",5);
  assert.equal(five.ok,true);
  assert.equal(five.coins,start.coins-11);
  assert.equal(five.inventory.worm,start.inventory.worm+5);
  assert.equal(countBaits(five.inventory),56);
  assert.equal(countBaits(start.inventory),50);
});
test("buying refuses insufficient coins, invalid quantities and unknown bait IDs",()=>{
  const stock=starterProgress().inventory;
  for(const [id,qty] of [["lure",10],["snail",5],["corn",5]]){
    const result=buyBait(stock,0,id,qty);
    assert.equal(result.ok,false);
    assert.equal(result.reason,"not-enough-coins");
    assert.equal(result.coins,0);
    assert.deepEqual(result.inventory,stock);
  }
  for(const qty of [0,-1,1.1,11,NaN,Infinity]){
    const result=buyBait(stock,50,"worm",qty);
    assert.equal(result.ok,false,"invalid qty "+qty);
    assert.deepEqual(result.inventory,stock);
  }
  assert.equal(buyBait(stock,50,"unknown",1).reason,"invalid-order");
});
test("saved browser progress cannot receive another welcome gift upon reload",()=>{
  const p=starterProgress();
  p.inventory=spendBait(p.inventory,"corn").inventory;
  const bought=buyBait(p.inventory,p.coins,"shrimp",5);
  p.inventory=bought.inventory;p.coins=bought.coins;
  p.caught=3;p.score=220;p.fishCounts={"chep":2,"ro-phi":1};
  p.freeRemaining=191.5;p.paidRemaining=40;p.freeUsed=true;
  const serialized=JSON.stringify(makeSave(p));
  const restored=restoreProgress(JSON.parse(serialized));
  assert.deepEqual(restored.inventory,p.inventory);
  assert.equal(restored.coins,p.coins);
  assert.equal(restored.caught,3);
  assert.equal(restored.score,220);
  assert.equal(restored.fishCounts.chep,2);
  assert.equal(restored.freeRemaining,191.5);
  assert.equal(restored.paidRemaining,40);
  assert.equal(restored.freeUsed,true);
  assert.equal(countBaits(restored.inventory),54);
  const again=restoreProgress(JSON.parse(JSON.stringify(makeSave(restored))));
  assert.deepEqual(again.inventory,restored.inventory,"reload must never refill 50 baits");
});
test("corrupt or malicious stored data does not create a negative wallet",()=>{
  const good=makeSave(starterProgress());
  for(const broken of [null,{}, {...good,version:999},
    {...good,coins:-20},{...good,inventory:{...good.inventory,worm:-1}},
    {...good,inventory:{...good.inventory,lure:"999"}},
    {...good,coins:Infinity},{...good,score:NaN}]){
    const restored=restoreProgress(broken);
    assert.deepEqual(restored.inventory,STARTER_BAITS);
    assert.equal(restored.coins,50);
  }
});
test("rarity odds vary by bait, without implying success is guaranteed",()=>{
  const byBait=Object.fromEntries(Object.keys(BAITS).map(id=>[id,fishEncounterOdds(FISH,id).rarityOdds]));
  assert.ok(byBait.lure.epic>byBait.snail.epic);
  assert.ok(byBait.snail.epic>byBait.shrimp.epic);
  assert.ok(byBait.greens.rare>byBait.worm.rare);
  for(const odds of Object.values(byBait)){
    assert.ok(odds.common>odds.rare&&odds.rare>odds.epic);
    assert.ok(Math.abs(odds.common+odds.rare+odds.epic-1)<1e-12);
  }
});
