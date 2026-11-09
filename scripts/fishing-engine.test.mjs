import test from "node:test";
import assert from "node:assert/strict";
import { FISH_FIGHTS, makeFight, stepFight, strikeFight, biteConfig } from "../fishing-engine.mjs";

const ids=["ro-phi","ro-dong","diec","troi","me-trang","chep","tram-co","tre","tram-den","ca-qua"];

test("all 10 fish use 5–10 second rhythm fights with increasingly narrow bands",()=>{
  assert.equal(Object.keys(FISH_FIGHTS).length,10);
  let lastWidth=Infinity,lastSeconds=0,lastSpeed=0;
  for(const id of ids){
    const f=makeFight(id);
    assert.ok(f.seconds>=5&&f.seconds<=10,id+": duration");
    assert.ok(f.seconds>lastSeconds,id+": unique increasing duration");
    assert.ok(f.width<lastWidth,id+": narrower zone");
    assert.ok(f.speed>lastSpeed,id+": faster automatic sweep");
    assert.ok(f.targetHits>=2&&f.targetHits<=7,id+": number of required beats");
    assert.ok(f.safeLeft>=4&&f.safeRight<=96,id+": legal band");
    lastWidth=f.width;lastSeconds=f.seconds;lastSpeed=f.speed;
  }
});
test("rod choice changes band, automatic speed and bite window",()=>{
  const hand=makeFight("chep","hand"),reel=makeFight("chep","reel"),lure=makeFight("chep","lure");
  assert.ok(hand.width>reel.width&&reel.width>lure.width);
  assert.ok(reel.speed<hand.speed&&hand.speed<lure.speed);
  assert.ok(biteConfig("chep","reel").windowMs>biteConfig("chep","lure").windowMs);
  assert.equal(biteConfig("chep").pattern,"lift");
  assert.equal(biteConfig("tram-co").pattern,"slide");
  assert.equal(biteConfig("ro-dong").pattern,"dive");
});
test("cursor runs left to right and bounces back without any input",()=>{
  const f=makeFight("ca-qua");
  const values=[],directions=new Set();
  for(let i=0;i<180;i++){
    stepFight(f,.02);
    values.push(f.cursor);directions.add(f.direction);
  }
  assert.ok(Math.min(...values)<6&&Math.max(...values)>94);
  assert.deepEqual([...directions].sort(),[-1,1]);
  assert.ok(values.every(x=>x>=4&&x<=96));
  assert.equal(f.hits,0,"automatic motion must not score");
});
test("a Space press on green scores, holding/spam in same sweep cannot farm",()=>{
  const f=makeFight("ro-phi");
  while(f.cursor<f.safeLeft)stepFight(f,.01);
  assert.equal(strikeFight(f),"hit");
  const first=f.hits;
  assert.equal(strikeFight(f),"duplicate");
  assert.equal(f.hits,first);
});
test("Space presses outside green count as mistakes and four mistakes lose fish",()=>{
  const f=makeFight("ro-phi");
  assert.ok(f.cursor<f.safeLeft,"start outside green");
  for(let i=0;i<3;i++)assert.equal(strikeFight(f),"miss");
  assert.equal(f.result,null);
  assert.equal(strikeFight(f),"miss");
  assert.equal(f.result,"escaped");
  assert.equal(strikeFight(f),"finished");
});
test("no successful Space presses results in fish escape after its timer",()=>{
  const f=makeFight("ro-phi");
  for(let i=0;i<800&&!f.result;i++)stepFight(f,.016);
  assert.equal(f.result,"escaped");
  assert.equal(f.hits,0);
  assert.ok(f.elapsed>=f.seconds-1e-7);
});
test("skilled timed Space presses catch every species at 5–10 seconds",()=>{
  for(const id of ids){
    const f=makeFight(id);
    for(let i=0;i<1100&&!f.result;i++){
      stepFight(f,.016);
      if(f.cursor>=f.safeLeft&&f.cursor<=f.safeRight&&f.lastHitPass!==f.pass&&f.hits<f.targetHits)
        assert.equal(strikeFight(f),"hit",id+": hitting moving green zone");
    }
    assert.equal(f.result,"caught",id+": winnable with timing");
    assert.equal(f.hits,f.targetHits);
    assert.ok(f.elapsed>=f.seconds-1e-6);
  }
});
test("after enough hits more input cannot cause extra misses",()=>{
  const f=makeFight("ro-phi");
  f.hits=f.targetHits;
  assert.equal(strikeFight(f),"complete");
  assert.equal(f.misses,0);
});
test("finished fight is inert",()=>{
  const f=makeFight("ro-phi");
  f.result="caught";
  stepFight(f,1);
  assert.equal(f.elapsed,0);
  assert.equal(strikeFight(f),"finished");
});
