// Virtual fishing economy stored in localStorage: no server-side anti-cheat.
// v1 saves already paid coins on catch. v2 moves NEW catches into a saleable bag.
// Legacy caught totals are historical, NOT saleable, avoiding double payouts.
import { BAITS } from "./bait-engine.mjs";

export const BAIT_SAVE_KEY="hanoi-fishing-world-save-v1"; // keep key to migrate existing progress
export const SAVE_VERSION=2;
export const STARTER_BAITS=Object.freeze({
  worm:16,flour:10,corn:8,greens:6,shrimp:5,snail:3,lure:2
});
export const BAIT_PRICES=Object.freeze({
  worm:1,flour:2,corn:3,greens:3,shrimp:4,snail:6,lure:8
});
export const FISH_VALUES=Object.freeze({
  "ro-phi":6,"ro-dong":7,diec:8,troi:9,"me-trang":10,
  chep:19,"tram-co":22,tre:23,"tram-den":48,"ca-qua":55
});
export const ROD_PRICES=Object.freeze({
  hand:0,reel:90,lure:160
});
export const ROD_ORDER=Object.freeze(["hand","reel","lure"]);
export const FISH_IDS=Object.freeze(Object.keys(FISH_VALUES));
const MAX_STOCK=99999,MAX_COINS=99999999,MAX_CATCHES=1000000;
const validCount=(v,max=MAX_STOCK)=>Number.isSafeInteger(v)&&v>=0&&v<=max;
const emptyFishInventory=()=>Object.fromEntries(FISH_IDS.map(id=>[id,0]));
const isOwnedRods=rods=>Array.isArray(rods)&&rods.length>=1&&
  rods.length<=ROD_ORDER.length&&new Set(rods).size===rods.length&&
  rods.includes("hand")&&rods.every(id=>Object.hasOwn(ROD_PRICES,id));

export function countBaits(stock){
  return Object.keys(BAITS).reduce((sum,id)=>sum+(validCount(stock?.[id])?stock[id]:0),0);
}
export function countFish(bag){
  return FISH_IDS.reduce((sum,id)=>sum+(validCount(bag?.[id],MAX_CATCHES)?bag[id]:0),0);
}
export function starterProgress(){
  return {
    coins:50,inventory:{...STARTER_BAITS},
    fishInventory:emptyFishInventory(),ownedRods:["hand"],selectedRod:"hand",
    caught:0,score:0,fishCounts:{},
    freeRemaining:300,paidRemaining:0,freeUsed:false
  };
}

// v1 saved earnings were already credited to coins, so its historical
// fishCounts must never be migrated to saleable fishInventory.
export function restoreProgress(raw){
  const defaults=starterProgress();
  if(!raw||(raw.version!==1&&raw.version!==SAVE_VERSION)||
     !raw.inventory||typeof raw.inventory!=="object")return defaults;
  const inventory={};
  for(const id of Object.keys(BAITS)){
    if(!validCount(raw.inventory[id]))return defaults;
    inventory[id]=raw.inventory[id];
  }
  if(!validCount(raw.coins,MAX_COINS)||!validCount(raw.caught,MAX_CATCHES)||
     !validCount(raw.score,MAX_COINS))return defaults;
  const fishCounts={};
  if(raw.fishCounts&&typeof raw.fishCounts==="object"){
    for(const [id,n] of Object.entries(raw.fishCounts)){
      if(Object.hasOwn(FISH_VALUES,id)&&validCount(n,MAX_CATCHES))fishCounts[id]=n;
    }
  }
  let fishInventory=emptyFishInventory(),ownedRods=["hand"],selectedRod="hand";
  if(raw.version===SAVE_VERSION){
    if(!raw.fishInventory||typeof raw.fishInventory!=="object"||
      !isOwnedRods(raw.ownedRods)||!raw.ownedRods.includes(raw.selectedRod))return defaults;
    for(const id of FISH_IDS){
      if(!validCount(raw.fishInventory[id],MAX_CATCHES))return defaults;
      fishInventory[id]=raw.fishInventory[id];
    }
    ownedRods=ROD_ORDER.filter(id=>raw.ownedRods.includes(id));
    selectedRod=raw.selectedRod;
  }
  const safeSeconds=n=>typeof n==="number"&&Number.isFinite(n)&&n>=0&&n<=300?n:null;
  return {
    coins:raw.coins,inventory,fishInventory,ownedRods,selectedRod,
    caught:raw.caught,score:raw.score,fishCounts,
    freeRemaining:safeSeconds(raw.freeRemaining)??defaults.freeRemaining,
    paidRemaining:safeSeconds(raw.paidRemaining)??0,
    freeUsed:raw.freeUsed===true
  };
}
export function makeSave(progress){
  return {
    version:SAVE_VERSION,coins:progress.coins,
    inventory:{...progress.inventory},
    fishInventory:{...progress.fishInventory},
    ownedRods:[...progress.ownedRods],selectedRod:progress.selectedRod,
    caught:progress.caught,score:progress.score,fishCounts:{...progress.fishCounts},
    freeRemaining:progress.freeRemaining,paidRemaining:progress.paidRemaining,
    freeUsed:progress.freeUsed
  };
}
export function spendBait(stock,id){
  if(!Object.hasOwn(BAITS,id)||!validCount(stock?.[id])||stock[id]<1)
    return {ok:false,reason:"out-of-stock",inventory:stock};
  return {ok:true,inventory:{...stock,[id]:stock[id]-1}};
}
export function buyBait(stock,coins,id,quantity=1){
  if(!Object.hasOwn(BAITS,id)||!Number.isSafeInteger(quantity)||quantity<1||quantity>10)
    return {ok:false,reason:"invalid-order",inventory:stock,coins};
  if(!validCount(coins,MAX_COINS)||!validCount(stock?.[id]))
    return {ok:false,reason:"invalid-balance",inventory:stock,coins};
  const total=quantity*BAIT_PRICES[id];
  if(coins<total)return {ok:false,reason:"not-enough-coins",inventory:stock,coins,cost:total};
  if(stock[id]+quantity>MAX_STOCK)
    return {ok:false,reason:"full",inventory:stock,coins};
  return {ok:true,inventory:{...stock,[id]:stock[id]+quantity},coins:coins-total,cost:total};
}
export function addCaughtFish(bag,fishId){
  if(!Object.hasOwn(FISH_VALUES,fishId)||!validCount(bag?.[fishId],MAX_CATCHES)||
    bag[fishId]>=MAX_CATCHES)return {ok:false,reason:"invalid-fish",fishInventory:bag};
  return {ok:true,fishInventory:{...bag,[fishId]:bag[fishId]+1}};
}
export function sellFish(bag,coins,fishId,quantity=1){
  if(!Object.hasOwn(FISH_VALUES,fishId)||
    !Number.isSafeInteger(quantity)||quantity<1||quantity>MAX_CATCHES)
    return {ok:false,reason:"invalid-order",fishInventory:bag,coins};
  if(!validCount(coins,MAX_COINS)||!validCount(bag?.[fishId],MAX_CATCHES))
    return {ok:false,reason:"invalid-balance",fishInventory:bag,coins};
  if(bag[fishId]<quantity)return {ok:false,reason:"not-enough-fish",fishInventory:bag,coins};
  const revenue=quantity*FISH_VALUES[fishId];
  if(coins+revenue>MAX_COINS)return {ok:false,reason:"wallet-full",fishInventory:bag,coins};
  return {ok:true,fishInventory:{...bag,[fishId]:bag[fishId]-quantity},
    coins:coins+revenue,revenue,quantity};
}
export function buyRod(ownedRods,coins,rodId){
  if(!Object.hasOwn(ROD_PRICES,rodId)||!isOwnedRods(ownedRods))
    return {ok:false,reason:"invalid-order",ownedRods,coins};
  if(!validCount(coins,MAX_COINS))
    return {ok:false,reason:"invalid-balance",ownedRods,coins};
  if(ownedRods.includes(rodId))
    return {ok:false,reason:"already-owned",ownedRods,coins};
  const cost=ROD_PRICES[rodId];
  if(coins<cost)return {ok:false,reason:"not-enough-coins",ownedRods,coins,cost};
  return {ok:true,ownedRods:ROD_ORDER.filter(id=>ownedRods.includes(id)||id===rodId),
    coins:coins-cost,cost};
}
