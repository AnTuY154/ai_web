// Hanoi Fishing World · bait preference and fish encounter distribution.
// These are game balance weights inspired by freshwater feeding habits,
// NOT scientifically measured probabilities for Hanoi lakes.
export const BAITS=Object.freeze({
  worm:   {name:"Giun đất",emoji:"🪱",group:"Mồi động vật",description:"Mồi tự nhiên đa dụng; hợp cá rô, diếc và cá trê.",favorites:["ro-dong","tre","diec"]},
  flour:  {name:"Bột ngũ cốc",emoji:"🍚",group:"Mồi thực vật",description:"Bột làm mây mồi; hợp cá mè, cá trôi, cá chép.",favorites:["me-trang","troi","chep"]},
  corn:   {name:"Ngô ngọt",emoji:"🌽",group:"Mồi thực vật",description:"Mồi hạt thiên về cá chép, cá trắm cỏ, cá trôi.",favorites:["chep","tram-co","troi"]},
  greens: {name:"Rau non / cỏ",emoji:"🌿",group:"Mồi thực vật",description:"Thiên về cá trắm cỏ và một số loài ăn tạp.",favorites:["tram-co","ro-phi","troi"]},
  shrimp: {name:"Tép / tôm nhỏ",emoji:"🦐",group:"Mồi động vật",description:"Mồi tanh dễ thu hút cá trê, rô đồng, cá quả.",favorites:["tre","ro-dong","ca-qua"]},
  snail:  {name:"Ốc nhỏ",emoji:"🐚",group:"Mồi động vật",description:"Thiên về cá trắm đen và một số cá ăn đáy.",favorites:["tram-den","tre","chep"]},
  lure:   {name:"Mồi giả",emoji:"🎣",group:"Mồi mô phỏng",description:"Mồi chuyển động hợp cá săn mồi như cá quả.",favorites:["ca-qua","tre","ro-dong"]}
});

// All weights remain above zero: bait *influences*, never guarantees species.
// Silver carp in this demo can be attracted by a powder cloud rather than
// literally swallowing a dough ball on a hook.
export const FISH_BAIT_WEIGHTS=Object.freeze({
  "ro-phi":   {worm:1.8,flour:2.6,corn:1.6,greens:1.4,shrimp:1.1,snail:.25,lure:.08},
  "ro-dong":  {worm:2.9,flour:.5,corn:.25,greens:.2,shrimp:2.6,snail:.85,lure:.18},
  "diec":     {worm:2.1,flour:2.3,corn:1.35,greens:.65,shrimp:.8,snail:.28,lure:.08},
  "troi":     {worm:.75,flour:2.5,corn:2.4,greens:1.25,shrimp:.45,snail:.12,lure:.06},
  "me-trang": {worm:.18,flour:3.9,corn:.45,greens:.5,shrimp:.12,snail:.05,lure:.04},
  "chep":     {worm:1.5,flour:2.7,corn:3.7,greens:.6,shrimp:1.1,snail:1.0,lure:.08},
  "tram-co":  {worm:.65,flour:2.1,corn:4.0,greens:4.2,shrimp:.16,snail:.1,lure:.03},
  "tre":      {worm:3.7,flour:.25,corn:.16,greens:.1,shrimp:3.7,snail:1.8,lure:.35},
  "tram-den": {worm:.35,flour:.25,corn:.22,greens:.12,shrimp:1.3,snail:6.0,lure:.03},
  "ca-qua":   {worm:.7,flour:.04,corn:.03,greens:.04,shrimp:2.4,snail:.55,lure:7.0}
});

const BASE_RARITY=Object.freeze({common:.70,rare:.25,epic:.05});
const BAIT_RARITY=Object.freeze({
  worm:   {common:1.10,rare:1.00,epic:.85},
  flour:  {common:1.00,rare:1.12,epic:.42},
  corn:   {common:1.00,rare:1.40,epic:.40},
  greens: {common:1.00,rare:1.60,epic:.35},
  shrimp: {common:1.00,rare:1.25,epic:1.50},
  snail:  {common:.80,rare:.90,epic:2.10},
  lure:   {common:.76,rare:.95,epic:3.20}
});
const RARITIES=["common","rare","epic"];
const clampRandom=x=>Number.isFinite(x)?Math.max(0,Math.min(x,1-Number.EPSILON)):0;

export function getBaitInfo(baitId){
  return BAITS[baitId]??BAITS.worm;
}

// Two-stage weighted distribution:
// 1. Choose rarity using base odds with modest bait and rod factors.
// 2. Choose an individual species according to its bait affinity.
// Weights do not affect force-meter difficulty or grant guaranteed catches.
export function fishEncounterOdds(fishCatalog,baitId="worm",rodId="hand"){
  const bait=Object.hasOwn(BAITS,baitId)?baitId:"worm";
  if(!Array.isArray(fishCatalog)||fishCatalog.length===0)throw new Error("Fish catalog is empty");
  const seen=new Set();
  for(const fish of fishCatalog){
    if(!fish||seen.has(fish.id)||!FISH_BAIT_WEIGHTS[fish.id])throw new Error("Unsupported fish catalog entry");
    if(!RARITIES.includes(fish.rarity))throw new Error("Unsupported fish rarity");
    seen.add(fish.id);
  }
  const baseRare=.25+(rodId==="reel"?.02:0);
  const baseEpic=.05+(rodId==="lure"&&bait==="lure"?.015:0);
  const rarityBase={common:1-baseRare-baseEpic,rare:baseRare,epic:baseEpic};
  const rawRarity={};
  let sumRarity=0;
  for(const tier of RARITIES){
    const hasFish=fishCatalog.some(f=>f.rarity===tier);
    const weight=hasFish?rarityBase[tier]*BAIT_RARITY[bait][tier]:0;
    rawRarity[tier]=weight;
    sumRarity+=weight;
  }
  const rarityOdds=Object.fromEntries(RARITIES.map(k=>[k,rawRarity[k]/sumRarity]));
  const odds={};
  for(const tier of RARITIES){
    const pool=fishCatalog.filter(f=>f.rarity===tier);
    const sum=pool.reduce((total,f)=>total+FISH_BAIT_WEIGHTS[f.id][bait],0);
    for(const fish of pool)odds[fish.id]=rarityOdds[tier]*FISH_BAIT_WEIGHTS[fish.id][bait]/sum;
  }
  return {odds,rarityOdds};
}

export function chooseFishByBait(fishCatalog,baitId="worm",rodId="hand",random=Math.random){
  const {odds}=fishEncounterOdds(fishCatalog,baitId,rodId);
  const draw=clampRandom(random());
  let total=0;
  for(const fish of fishCatalog){
    total+=odds[fish.id];
    if(draw<total)return fish;
  }
  return fishCatalog[fishCatalog.length-1];
}
