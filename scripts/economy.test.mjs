import test from "node:test";
import assert from "node:assert/strict";
import {
  BAIT_SAVE_KEY,SAVE_VERSION,FISH_VALUES,FISH_IDS,ROD_PRICES,ROD_ORDER,
  starterProgress,restoreProgress,makeSave,countFish,
  addCaughtFish,sellFish,buyRod,buyBait
} from "../bait-store.mjs";

test("new browser save has empty fish bag, owned starter pole, fifty free baits",()=>{
  const a=starterProgress(),b=starterProgress();
  assert.equal(SAVE_VERSION,2);
  assert.equal(BAIT_SAVE_KEY,"hanoi-fishing-world-save-v1","existing browser saves must be migrated");
  assert.equal(Object.values(a.inventory).reduce((x,y)=>x+y,0),50);
  assert.deepEqual(Object.keys(a.fishInventory).sort(),[...FISH_IDS].sort());
  assert.equal(countFish(a.fishInventory),0);
  assert.deepEqual(a.ownedRods,["hand"]);
  assert.equal(a.selectedRod,"hand");
  assert.equal(a.coins,50);
  assert.notStrictEqual(a.fishInventory,b.fishInventory,"separate players use independent bags");
});
test("catching a fish creates one unsold unit, without granting coins immediately",()=>{
  const p=starterProgress();
  const caught=addCaughtFish(p.fishInventory,"tram-den");
  assert.equal(caught.ok,true);
  assert.equal(caught.fishInventory["tram-den"],1);
  assert.equal(countFish(caught.fishInventory),1);
  assert.equal(p.fishInventory["tram-den"],0);
  assert.equal(p.coins,50,"coins remain unchanged until sale");
  const twice=addCaughtFish(caught.fishInventory,"tram-den");
  assert.equal(twice.fishInventory["tram-den"],2);
  assert.equal(addCaughtFish(caught.fishInventory,"unlisted").ok,false);
});
test("selling one fish or selling all credits exactly its fixed sale value",()=>{
  const p=starterProgress();
  let bag=addCaughtFish(p.fishInventory,"chep").fishInventory;
  bag=addCaughtFish(bag,"chep").fishInventory;
  bag=addCaughtFish(bag,"chep").fishInventory;
  const one=sellFish(bag,p.coins,"chep",1);
  assert.equal(one.ok,true);
  assert.equal(one.revenue,19);
  assert.equal(one.coins,69);
  assert.equal(one.fishInventory.chep,2);
  assert.equal(bag.chep,3,"sale must not mutate previous bag");
  const all=sellFish(one.fishInventory,one.coins,"chep",2);
  assert.equal(all.ok,true);
  assert.equal(all.coins,107);
  assert.equal(all.fishInventory.chep,0);
  assert.equal(countFish(all.fishInventory),0);
  assert.equal(sellFish(all.fishInventory,all.coins,"chep",1).ok,false,"no double selling");
});
test("cannot sell fish not owned, a fraction of a fish, or an imaginary species",()=>{
  const p=starterProgress();
  for(const [id,quantity] of [["ca-qua",1],["ca-qua",0],["ca-qua",-1],
    ["ca-qua",1.5],["unknown",1],["ca-qua",Infinity]]){
    const before=JSON.stringify(p.fishInventory);
    const result=sellFish(p.fishInventory,p.coins,id,quantity);
    assert.equal(result.ok,false);
    assert.equal(result.coins,p.coins);
    assert.equal(JSON.stringify(result.fishInventory),before);
  }
});
test("rod purchase is one-time, requires currency and keeps starter pole",()=>{
  const p=starterProgress();
  assert.deepEqual(ROD_ORDER,["hand","reel","lure"]);
  assert.equal(ROD_PRICES.hand,0);
  assert.equal(ROD_PRICES.reel,90);
  assert.equal(ROD_PRICES.lure,160);
  const short=buyRod(p.ownedRods,p.coins,"reel");
  assert.equal(short.reason,"not-enough-coins");
  assert.deepEqual(short.ownedRods,["hand"]);
  const bought=buyRod(p.ownedRods,130,"reel");
  assert.equal(bought.ok,true);
  assert.equal(bought.coins,40);
  assert.deepEqual(bought.ownedRods,["hand","reel"]);
  const repeat=buyRod(bought.ownedRods,bought.coins,"reel");
  assert.equal(repeat.reason,"already-owned");
  assert.equal(repeat.coins,40);
  assert.equal(buyRod(p.ownedRods,130,"unknown").ok,false);
  assert.equal(buyRod([],130,"reel").ok,false,"cannot buy with invalid ownership");
});
test("sell fish, buy bait and save the owned rod in one persistent economy",()=>{
  let p=starterProgress();
  let bag=p.fishInventory;
  for(let i=0;i<3;i++)bag=addCaughtFish(bag,"tram-den").fishInventory;
  const sold=sellFish(bag,p.coins,"tram-den",3);
  assert.equal(sold.coins,194);
  const rod=buyRod(p.ownedRods,sold.coins,"lure");
  assert.equal(rod.ok,true);
  const bait=buyBait(p.inventory,rod.coins,"worm",5);
  assert.equal(bait.ok,true);
  p={...p,coins:bait.coins,inventory:bait.inventory,
    fishInventory:sold.fishInventory,ownedRods:rod.ownedRods,selectedRod:"lure",
    caught:3,score:1440,fishCounts:{"tram-den":3}};
  const revived=restoreProgress(JSON.parse(JSON.stringify(makeSave(p))));
  assert.equal(revived.coins,29);
  assert.equal(revived.inventory.worm,21);
  assert.deepEqual(revived.ownedRods,["hand","lure"]);
  assert.equal(revived.selectedRod,"lure");
  assert.equal(revived.fishInventory["tram-den"],0,"fish sold should not reappear on reload");
  assert.equal(revived.fishCounts["tram-den"],3,"historical catches should remain counted");
  assert.equal(revived.caught,3);
});
test("migrate v1 savings intact without double-paying already rewarded catches",()=>{
  const original=starterProgress();
  const old={
    version:1,coins:127,inventory:{...original.inventory,worm:9},
    caught:4,score:320,fishCounts:{"chep":2,"ro-phi":2},
    freeRemaining:122,paidRemaining:0,freeUsed:true
  };
  const revived=restoreProgress(old);
  assert.equal(revived.coins,127,"don't confiscate old credited coins");
  assert.equal(revived.inventory.worm,9,"don't refill the free welcome bait");
  assert.equal(revived.fishCounts.chep,2,"keep achievements");
  assert.equal(revived.caught,4);
  assert.equal(countFish(revived.fishInventory),0,"no double reward: historical fish not saleable");
  assert.deepEqual(revived.ownedRods,["hand"]);
  const upgraded=makeSave(revived);
  assert.equal(upgraded.version,2);
  assert.deepEqual(restoreProgress(upgraded).fishInventory,revived.fishInventory);
});
test("corrupt v2 ownership or inventory cannot grant free rods/fish",()=>{
  const good=makeSave(starterProgress());
  for(const invalid of [
    {...good,ownedRods:["reel"]},
    {...good,ownedRods:["hand","reel","reel"]},
    {...good,ownedRods:["hand","not-real"]},
    {...good,selectedRod:"lure"},
    {...good,fishInventory:{...good.fishInventory,chep:-1}},
    {...good,fishInventory:{...good.fishInventory,chep:"9"}},
    {...good,fishInventory:{...good.fishInventory,chep:1.5}}
  ]){
    const restored=restoreProgress(invalid);
    assert.deepEqual(restored.ownedRods,["hand"]);
    assert.equal(countFish(restored.fishInventory),0);
  }
  const full={...starterProgress(),coins:99999999};
  assert.equal(sellFish(full.fishInventory,full.coins,"chep",1).ok,false);
  assert.equal(FISH_VALUES["ca-qua"],55);
});
