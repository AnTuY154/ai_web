// In-browser virtual bait inventory. Not server-authoritative user accounts.
// A new browser save receives exactly 50 free bait uses ONCE.
import { BAITS } from "./bait-engine.mjs";

export const BAIT_SAVE_KEY="hanoi-fishing-world-save-v1";
export const STARTER_BAITS=Object.freeze({
  worm:16,flour:10,corn:8,greens:6,shrimp:5,snail:3,lure:2
});
export const BAIT_PRICES=Object.freeze({
  worm:1,flour:2,corn:3,greens:3,shrimp:4,snail:6,lure:8
});
const MAX_STOCK=99999,MAX_COINS=99999999;
const validCount=(v,max=MAX_STOCK)=>Number.isSafeInteger(v)&&v>=0&&v<=max;

export function countBaits(stock){
  return Object.keys(BAITS).reduce((sum,id)=>sum+(validCount(stock?.[id])?stock[id]:0),0);
}
export function starterProgress(){
  return {
    coins:50,inventory:{...STARTER_BAITS},
    caught:0,score:0,fishCounts:{},
    freeRemaining:300,paidRemaining:0,freeUsed:false
  };
}

// Parse all fields atomically to avoid partially restoring a corrupted save
// and accidentally granting 50 starter baits again after a normal reload.
export function restoreProgress(raw){
  const defaults=starterProgress();
  if(!raw||raw.version!==1||!raw.inventory||typeof raw.inventory!=="object")return defaults;
  const inventory={};
  for(const id of Object.keys(BAITS)){
    if(!validCount(raw.inventory[id]))return defaults;
    inventory[id]=raw.inventory[id];
  }
  if(!validCount(raw.coins,MAX_COINS)||!validCount(raw.caught,1000000)||
    !validCount(raw.score,MAX_COINS))return defaults;
  const fishCounts={};
  if(raw.fishCounts&&typeof raw.fishCounts==="object"){
    for(const [id,n] of Object.entries(raw.fishCounts)){
      if(/^[a-z0-9-]+$/.test(id)&&validCount(n,1000000))fishCounts[id]=n;
    }
  }
  const safeSeconds=n=>typeof n==="number"&&Number.isFinite(n)&&n>=0&&n<=300?n:null;
  return {
    coins:raw.coins,inventory,caught:raw.caught,score:raw.score,fishCounts,
    freeRemaining:safeSeconds(raw.freeRemaining)??defaults.freeRemaining,
    paidRemaining:safeSeconds(raw.paidRemaining)??0,
    freeUsed:raw.freeUsed===true
  };
}
export function makeSave(progress){
  return {
    version:1,coins:progress.coins,inventory:{...progress.inventory},
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
