// Bobber observation model for Hanoi Fishing World.
// Inspired by the user-supplied fishing tutorial summary, not a claim that
// each fish always behaves identically in real life. No bite HUD/timer cues.
export const floatClamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const smooth=t=>{const x=floatClamp(t,0,1);return x*x*(3-2*x)};
const biggerBaits=new Set(["corn","greens","snail","lure"]);

// Schedules environmental/wary-fish cues before a genuine take.
// Animal/soft baits invite more shallow small-fish activity; chunky baits
// reduce nuisance nibbles without guaranteeing a species or clean hook.
export function planFloatCast(now,random=Math.random,baitId="worm"){
  const seed=random()*Math.PI*2;
  const ordinaryWait=6200+random()*9000;
  const longWait=random()<.14?random()*8000:0;
  const biteAt=now+ordinaryWait+longWait;
  const bulky=biggerBaits.has(baitId);
  const count=(bulky?1:2)+Math.floor(random()*3);
  const touches=[];
  let at=now+900+random()*1400;
  for(let i=0;i<count;i++){
    const choice=random();
    const kind=choice<(bulky?.13:.43)?"nibble"
      :choice<.65?"peck"
      :choice<.84?"dip-return":"liner";
    const duration=kind==="nibble"?920+random()*580:
      kind==="dip-return"?650+random()*400:
      kind==="liner"?400+random()*420:280+random()*510;
    if(at+duration+1000>=biteAt)break;
    touches.push({at,duration,kind,direction:random()<.5?-1:1});
    at+=duration+700+random()*1400;
  }
  return {seed,biteAt,touches,baitId};
}

// Returns purely visual offsets; the fishing state machine alone determines
// whether a Space strike hooks a fish. "dip-return" is NOT a bite despite
// briefly hiding part of the colored tip.
export function floatPose(now,sequence,mode="waiting",pattern="dive",biteStartedAt=0,biteExpires=0){
  const time=now/1000,seed=sequence?.seed??0;
  const waveY=Math.sin(time*2.1+seed)*2.3+Math.sin(time*1.12+seed*1.7)*1.5;
  const waveX=Math.sin(time*.87+seed*.8)*4.3+Math.sin(time*1.37+seed)*1.8;
  let dx=waveX,dy=waveY,rotation=Math.sin(time*1.8+seed)*.034;
  let disturbance=0;
  const touch=sequence?.touches?.find(e=>now>=e.at&&now<e.at+e.duration);
  if(mode==="waiting"&&touch){
    const p=floatClamp((now-touch.at)/touch.duration,0,1);
    const envelope=Math.sin(Math.PI*p)**2;
    if(touch.kind==="nibble"){
      // Fast, shallow, repeated fish-fry nibbles; do not look like a solid run.
      dy+=envelope*(3.7+1.8*Math.sin(p*24*Math.PI));
      dx+=envelope*Math.sin(p*18*Math.PI)*1.4;
      rotation+=envelope*.035*Math.sin(p*20*Math.PI);
      disturbance=envelope*.2;
    }else if(touch.kind==="peck"){
      // A few tentative, noncommittal knocks.
      dy+=envelope*(4+5*Math.abs(Math.sin(p*24)));
      dx+=envelope*Math.sin(p*17)*2.4;
      rotation+=envelope*.075*Math.sin(p*14);
      disturbance=envelope*.34;
    }else if(touch.kind==="dip-return"){
      // Stronger false signal: the tip briefly sinks, then surfaces again.
      // Distinguish it from a genuine, sustained submersion by persistence.
      const downThenUp=Math.sin(Math.PI*p)**1.45;
      dy+=27*downThenUp;
      dx+=touch.direction*4*downThenUp;
      rotation+=touch.direction*.12*downThenUp;
      disturbance=downThenUp*.39;
    }else if(touch.kind==="liner"){
      // A glancing line touch drifts sideways and rebounds.
      dx+=touch.direction*15*envelope;
      dy+=4*envelope;
      rotation+=touch.direction*.07*envelope;
      disturbance=envelope*.3;
    }
  }
  if(mode==="bite"){
    const window=Math.max(1,biteExpires-biteStartedAt);
    const p=floatClamp((now-biteStartedAt)/window,0,1);
    const take=smooth(p/.65);
    if(pattern==="dive"){
      dy+=78*take;
      dx+=Math.sin(p*8)*3*take;
      disturbance=take*.34;
    }else if(pattern==="slide"){
      dx+=124*take;
      dy+=14*take;
      rotation+=.14*take;
      disturbance=take*.28;
    }else if(pattern==="lift"){
      dy-=42*take;
      dx-=23*take;
      rotation+=1.12*take;
      disturbance=take*.22;
    }
  }
  if(mode==="reeling"){
    dx+=Math.sin(time*4.1)*14;
    dy+=Math.sin(time*5.4)*7;
    disturbance=.4;
  }
  return {dx,dy,rotation,disturbance,waveY,waveX};
}
