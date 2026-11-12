// Hanoi Fishing World · timed Space rhythm fishing mini-game.
// The cursor AUTOMATICALLY sweeps left/right. Space is a single timed strike,
// not a hold-to-increase-tension control. Values are gameplay balance.
export const FISH_FIGHTS = Object.freeze({
  "ro-phi":   {seconds:5.0, width:43, speed:78,  swing:3,  frequency:1.55, hits:2},
  "ro-dong":  {seconds:5.3, width:41, speed:84,  swing:4,  frequency:1.68, hits:2},
  "diec":     {seconds:5.6, width:39, speed:88,  swing:5,  frequency:1.82, hits:3},
  "troi":     {seconds:6.0, width:37, speed:92,  swing:6,  frequency:1.90, hits:3},
  "me-trang": {seconds:6.3, width:35, speed:96,  swing:6,  frequency:2.05, hits:3},
  "chep":     {seconds:7.0, width:30, speed:105, swing:7,  frequency:2.12, hits:4},
  "tram-co":  {seconds:7.8, width:27, speed:113, swing:8,  frequency:2.30, hits:4},
  "tre":      {seconds:8.1, width:25, speed:122, swing:9,  frequency:2.47, hits:5},
  "tram-den": {seconds:9.4, width:20, speed:134, swing:10, frequency:2.56, hits:6},
  "ca-qua":   {seconds:10,  width:18, speed:145, swing:11, frequency:2.70, hits:7}
});
export const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));

// Pole: wider zone. Reel: slightly slower sweep. Lure: a narrower, faster
// challenge. One scored Space per left-to-right or right-to-left traversal.
export function makeFight(fishId,rodId="hand"){
  const data=FISH_FIGHTS[fishId];
  if(!data)throw new Error("Unknown fish: "+fishId);
  const width=clamp(data.width+(rodId==="hand"?3:rodId==="lure"?-2:0),14,48);
  return {
    fishId,rodId,seconds:data.seconds,width,
    speed:data.speed*(rodId==="reel"?.92:rodId==="lure"?1.06:1),
    swing:data.swing,frequency:data.frequency,
    targetHits:data.hits,hits:0,misses:0,maxMisses:4,
    elapsed:0,cursor:4,direction:1,pass:0,lastHitPass:-1,
    safeLeft:50-width/2,safeRight:50+width/2,
    lastAction:"ready",result:null
  };
}

export function stepFight(fight,seconds){
  if(fight.result)return fight;
  // Frame-independent bounce: move the automatically running cursor.
  const dt=clamp(seconds,0,.05);
  fight.elapsed=Math.min(fight.seconds,fight.elapsed+dt);
  const distance=(fight.cursor-4)+(fight.direction===1?fight.speed*dt:-fight.speed*dt);
  let x=distance;
  while(x<0||x>92){
    if(x>92){x=184-x;fight.direction=-1;fight.pass++}
    else {x=-x;fight.direction=1;fight.pass++}
  }
  fight.cursor=4+x;

  const t=fight.elapsed;
  const center=50+Math.sin(t*fight.frequency)*fight.swing*.45;
  fight.safeLeft=clamp(center-fight.width/2,4,96-fight.width);
  fight.safeRight=fight.safeLeft+fight.width;
  if(fight.elapsed>=fight.seconds-1e-8){
    fight.result=fight.hits>=fight.targetHits?"caught":"escaped";
  }
  return fight;
}

// An attempt is a KEYDOWN, never a continuous key hold. Duplicate key presses
// during the same sweep cannot farm points.
export function strikeFight(fight){
  if(fight.result)return "finished";
  if(fight.hits>=fight.targetHits)return "complete";
  const inside=fight.cursor>=fight.safeLeft&&fight.cursor<=fight.safeRight;
  if(inside){
    if(fight.pass===fight.lastHitPass)return "duplicate";
    fight.lastHitPass=fight.pass;
    fight.hits=Math.min(fight.targetHits,fight.hits+1);
    fight.lastAction="hit";
    // Catch immediately on the final correct Space press. A fight's seconds
    // remain a timeout limit, never a mandatory wait after success.
    if(fight.hits===fight.targetHits)fight.result="caught";
    return "hit";
  }
  fight.misses++;
  fight.lastAction="miss";
  if(fight.misses>=fight.maxMisses)fight.result="escaped";
  return "miss";
}

// Bobber bite timing remains species-dependent; tiny shivers are false cues.
export function biteConfig(fishId,rodId="hand"){
  const f=FISH_FIGHTS[fishId];if(!f)throw new Error("Unknown fish");
  const fast=f.seconds<6.4;
  const pattern=fishId==="chep"||fishId==="tram-den"?"lift":fishId==="tram-co"||fishId==="tre"||fishId==="ca-qua"?"slide":"dive";
  return {pattern,windowMs:(fast?950:1250)+(rodId==="reel"?160:rodId==="lure"?-110:0)};
}
