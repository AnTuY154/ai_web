import test from "node:test";
import assert from "node:assert/strict";
import { FISH_FIGHTS, makeFight, stepFight, biteConfig } from "../fishing-engine.mjs";

const fishIds=[
  "ro-phi","ro-dong","diec","troi","me-trang",
  "chep","tram-co","tre","tram-den","ca-qua"
];

test("10 fish have distinct fights between 5 and 10 seconds",()=>{
  assert.equal(Object.keys(FISH_FIGHTS).length,10);
  let lastWidth=Infinity,lastSeconds=0;
  for(const id of fishIds){
    const fight=makeFight(id);
    assert.ok(fight.seconds>=5&&fight.seconds<=10,id+": duration 5–10 sec");
    assert.ok(fight.seconds>lastSeconds,id+": durations rise by species");
    assert.ok(fight.width<lastWidth,id+": each species gets a narrower force band");
    assert.ok(fight.safeLeft>=0&&fight.safeRight<=100,id+": band in meter");
    assert.equal(fight.result,null);
    lastWidth=fight.width;lastSeconds=fight.seconds;
  }
});
test("rod type changes band/difficulty and bite windows",()=>{
  const pole=makeFight("chep","hand"),reel=makeFight("chep","reel"),lure=makeFight("chep","lure");
  assert.ok(pole.width>reel.width&&reel.width>lure.width);
  assert.ok(biteConfig("chep","reel").windowMs>biteConfig("chep","lure").windowMs);
  assert.equal(biteConfig("chep").pattern,"lift");
  assert.equal(biteConfig("tram-co").pattern,"slide");
  assert.equal(biteConfig("ro-dong").pattern,"dive");
});
test("pressing Space builds tension and releasing reduces tension",()=>{
  const f=makeFight("ro-phi");
  const start=f.tension;
  stepFight(f,.04,true);
  assert.ok(f.tension>start,"holding increases force");
  const raised=f.tension;
  stepFight(f,.04,false);
  assert.ok(f.tension<raised,"release lowers force");
});
test("continuous Space without releasing snaps the line",()=>{
  const f=makeFight("ca-qua");
  for(let i=0;i<1000&&!f.result;i++)stepFight(f,.016,true);
  assert.equal(f.result,"snapped");
});
test("never pressing Space lets a hooked fish escape",()=>{
  const f=makeFight("chep");
  for(let i=0;i<1000&&!f.result;i++)stepFight(f,.016,false);
  assert.equal(f.result,"escaped");
});
test("a player who adjusts Space can land a common fish",()=>{
  const f=makeFight("ro-phi");
  for(let i=0;i<1000&&!f.result;i++){
    // A simple automated skilled player seeks the center of the moving safe band.
    const mid=(f.safeLeft+f.safeRight)/2;
    stepFight(f,.016,f.tension<mid);
  }
  assert.equal(f.result,"caught","controlled input must allow a successful catch");
  assert.ok(f.elapsed>=5&&f.elapsed<=10);
  assert.ok(f.safeSeconds>=f.seconds*.48);
});
test("cannot continue updating a finished battle",()=>{
  const f=makeFight("ro-phi");
  f.result="caught";stepFight(f,1,true);
  assert.equal(f.elapsed,0);
});
