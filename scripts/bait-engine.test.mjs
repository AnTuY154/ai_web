import test from "node:test";
import assert from "node:assert/strict";
import {BAITS,FISH_BAIT_WEIGHTS,getBaitInfo,fishEncounterOdds,chooseFishByBait} from "../bait-engine.mjs";

const FISH=[
  {id:"ro-phi",rarity:"common"},{id:"ro-dong",rarity:"common"},
  {id:"diec",rarity:"common"},{id:"troi",rarity:"common"},
  {id:"me-trang",rarity:"common"},{id:"chep",rarity:"rare"},
  {id:"tram-co",rarity:"rare"},{id:"tre",rarity:"rare"},
  {id:"tram-den",rarity:"epic"},{id:"ca-qua",rarity:"epic"}
];
const odds=(bait,rod)=>fishEncounterOdds(FISH,bait,rod).odds;

test("seven bait types cover ten fish with nonzero, finite weights",()=>{
  assert.equal(Object.keys(BAITS).length,7);
  assert.equal(Object.keys(FISH_BAIT_WEIGHTS).length,10);
  for(const [baitId,bait] of Object.entries(BAITS)){
    assert.ok(bait.name&&bait.group&&bait.description);
    assert.ok(bait.favorites.length>=1);
    for(const fishId of bait.favorites)assert.ok(FISH.some(f=>f.id===fishId),baitId+": hint missing fish");
  }
  for(const [id,weights] of Object.entries(FISH_BAIT_WEIGHTS)){
    for(const baitId of Object.keys(BAITS)){
      assert.ok(Number.isFinite(weights[baitId])&&weights[baitId]>0,id+" requires weight for "+baitId);
    }
  }
});
test("species probabilities normalize and rarity remains possible for all baits",()=>{
  for(const baitId of Object.keys(BAITS)){
    const {odds:species,rarityOdds}=fishEncounterOdds(FISH,baitId);
    assert.ok(Math.abs(Object.values(species).reduce((a,b)=>a+b,0)-1)<1e-12,baitId+": normalized fish odds");
    assert.ok(Math.abs(Object.values(rarityOdds).reduce((a,b)=>a+b,0)-1)<1e-12,baitId+": normalized tiers");
    assert.ok(Object.values(species).every(x=>x>0&&x<1),baitId+": all fish remain possible");
    assert.ok(rarityOdds.common>rarityOdds.rare&&rarityOdds.rare>rarityOdds.epic,baitId+": rarity should still matter");
  }
});
test("bait has strong species-specific effects, not just a label",()=>{
  assert.ok(odds("greens")["tram-co"]>odds("shrimp")["tram-co"]*3,"grass carp favors greens");
  assert.ok(odds("corn")["chep"]>odds("lure")["chep"]*3,"common carp favors corn over fake lure");
  assert.ok(odds("flour")["me-trang"]>odds("worm")["me-trang"]*3,"silver carp favors powdered food cloud");
  assert.ok(odds("snail")["tram-den"]>odds("corn")["tram-den"]*3,"black carp favors snails");
  assert.ok(odds("lure")["ca-qua"]>odds("flour")["ca-qua"]*10,"snakehead favors active lures");
  assert.ok(odds("shrimp")["tre"]>odds("corn")["tre"]*3,"catfish favors animal bait");
});
test("bait shifts rarity probabilities but never guarantees a rare fish",()=>{
  const lure=fishEncounterOdds(FISH,"lure").rarityOdds;
  const worm=fishEncounterOdds(FISH,"worm").rarityOdds;
  assert.ok(lure.epic>worm.epic,"predator lure should meaningfully increase extreme-rarity encounter odds");
  assert.ok(lure.common>.5,"common fish should remain prevalent even with lure");
  const withLureRod=fishEncounterOdds(FISH,"lure","lure").rarityOdds;
  assert.ok(withLureRod.epic>lure.epic,"lure rod + lure bait should have a slight synergy");
});
test("weighted random sampler is deterministic with injected RNG",()=>{
  for(const baitId of Object.keys(BAITS)){
    for(const draw of [0,.00001,.01,.1,.4,.7,.9,.999999999,1]){
      const result=chooseFishByBait(FISH,baitId,"hand",()=>draw);
      assert.ok(FISH.includes(result),baitId+": sample must be a catalog fish");
      assert.equal(result,chooseFishByBait(FISH,baitId,"hand",()=>draw));
    }
  }
});
test("sampling trends match the per-bait species distribution in large simulation",()=>{
  const counts=(bait)=>{
    let seed=123456789;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
    const tally=Object.fromEntries(FISH.map(f=>[f.id,0]));
    for(let i=0;i<10000;i++)tally[chooseFishByBait(FISH,bait,"hand",rnd).id]++;
    return tally;
  };
  const lure=counts("lure"),snail=counts("snail"),greens=counts("greens");
  assert.ok(lure["ca-qua"]>snail["ca-qua"]*2,"lure catches more snakehead than snail");
  assert.ok(snail["tram-den"]>lure["tram-den"]*5,"snail catches more black carp than lure");
  assert.ok(greens["tram-co"]>lure["tram-co"]*5,"greens attract grass carp more than lure");
});
test("unrecognized bait falls back to worm; bad fish catalogs fail loudly",()=>{
  assert.equal(getBaitInfo("unknown"),BAITS.worm);
  assert.deepEqual(odds("unknown"),odds("worm"));
  assert.throws(()=>fishEncounterOdds([],"worm"),/empty/);
  assert.throws(()=>fishEncounterOdds([{id:"unknown",rarity:"common"}],"worm"),/Unsupported/);
});
