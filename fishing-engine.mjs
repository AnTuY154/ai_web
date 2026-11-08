// Hanoi Fishing World · pure, deterministic reel tension system.
// The fight duration is 5–10 s depending on the hooked species.
// Values are gameplay balance, NOT biological measurements.
export const FISH_FIGHTS = Object.freeze({
  "ro-phi":   {seconds:5.0, width:43, swing:3,  aggression:.60, frequency:1.55, tolerance:1.95},
  "ro-dong":  {seconds:5.3, width:41, swing:4,  aggression:.67, frequency:1.68, tolerance:1.90},
  "diec":     {seconds:5.6, width:39, swing:5,  aggression:.74, frequency:1.82, tolerance:1.85},
  "troi":     {seconds:6.0, width:37, swing:6,  aggression:.84, frequency:1.90, tolerance:1.75},
  "me-trang": {seconds:6.3, width:35, swing:6,  aggression:.94, frequency:2.05, tolerance:1.70},
  "chep":     {seconds:7.0, width:30, swing:7,  aggression:1.05,frequency:2.12, tolerance:1.65},
  "tram-co":  {seconds:7.8, width:27, swing:8,  aggression:1.18,frequency:2.30, tolerance:1.55},
  "tre":      {seconds:8.1, width:25, swing:9,  aggression:1.28,frequency:2.47, tolerance:1.50},
  "tram-den": {seconds:9.4, width:20, swing:10, aggression:1.42,frequency:2.56, tolerance:1.40},
  "ca-qua":   {seconds:10,  width:18, swing:11, aggression:1.55,frequency:2.70, tolerance:1.35}
});
export const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));

// The fish type defines the length/width of the green force band.
// Hand rod: wider forgiving zone; reel rod: less severe force change;
// lure: slightly faster reaction, a narrower fighting zone.
export function makeFight(fishId, rodId="hand"){
  const data=FISH_FIGHTS[fishId];
  if(!data)throw new Error("Unknown fish: "+fishId);
  const width=clamp(data.width+(rodId==="hand"?3:rodId==="lure"?-2:0),14,48);
  return {
    fishId,rodId,seconds:data.seconds,width,swing:data.swing,
    aggression:data.aggression,frequency:data.frequency,tolerance:data.tolerance,
    elapsed:0,tension:54,safeLeft:54-width/2,safeRight:54+width/2,
    safeSeconds:0,danger:0,result:null
  };
}

// 60 Hz model step. Holding increases tension; releasing reduces it.
// Fish pulls non-uniformly, and the green safe band oscillates per fish.
export function stepFight(fight,seconds,holding){
  if(fight.result)return fight;
  const dt=clamp(seconds,0,.05);
  fight.elapsed=Math.min(fight.seconds,fight.elapsed+dt);
  const t=fight.elapsed;
  const center=54+Math.sin(t*fight.frequency)*fight.swing
    +Math.sin(t*fight.frequency*.39+1.4)*fight.swing*.24;
  fight.safeLeft=clamp(center-fight.width/2,4,96-fight.width);
  fight.safeRight=fight.safeLeft+fight.width;

  const push=16*fight.aggression*(.55+.45*Math.sin(t*3.7+fight.aggression*4));
  const reelRate=fight.rodId==="reel"?49:59;
  const releaseRate=fight.rodId==="reel"?42:46;
  fight.tension=clamp(fight.tension+(holding?reelRate:-releaseRate)*dt+push*dt,0,100);

  const inside=fight.tension>=fight.safeLeft&&fight.tension<=fight.safeRight;
  if(inside){
    fight.safeSeconds+=dt;
    fight.danger=Math.max(0,fight.danger-dt*1.15);
  }else{
    const gap=fight.tension<fight.safeLeft?fight.safeLeft-fight.tension:fight.tension-fight.safeRight;
    fight.danger+=dt*(.92+Math.max(0,gap-9)*.021);
  }
  if(fight.danger>=fight.tolerance){
    fight.result=fight.tension>fight.safeRight?"snapped":"escaped";
  }else if(fight.elapsed>=fight.seconds-1e-8){
    // Recoverable mistakes are allowed, but holding/releasing at random will not win.
    fight.result=fight.safeSeconds>=fight.seconds*.48?"caught":"escaped";
  }
  return fight;
}

// Hook timing is species-dependent. A decisive float dive/sideways glide/rise
// signals the bite; tiny pre-bite shivers should NOT be struck.
export function biteConfig(fishId,rodId="hand"){
  const f=FISH_FIGHTS[fishId];if(!f)throw new Error("Unknown fish");
  const fast=f.seconds<6.4;
  const pattern=fishId==="chep"||fishId==="tram-den"?"lift":fishId==="tram-co"||fishId==="tre"||fishId==="ca-qua"?"slide":"dive";
  return {pattern,windowMs:(fast?950:1250)+(rodId==="reel"?160:rodId==="lure"?-110:0)};
}