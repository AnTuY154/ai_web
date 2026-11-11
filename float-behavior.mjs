// Float-fishing visual simulation: no on-screen bite notification.
// Inspired by real-world float behavior: subtle surface chop, cautious pecks,
// line touches, then occasionally a decisive dive, sail-away or lift bite.
// This is deliberately a gameplay approximation, not a fish behavior predictor.
export const floatClamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const smooth=t=>{const x=floatClamp(t,0,1);return x*x*(3-2*x)};

// All moments are performance.now() timestamps. Random is injectable for
// deterministic tests. The next bite is never hinted to the player by a clock.
export function planFloatCast(now,random=Math.random){
  const seed=random()*Math.PI*2;
  const biteAt=now+6500+random()*8000;
  const count=1+Math.floor(random()*3);
  const touches=[];
  for(let i=0;i<count;i++){
    const ideal=now+1400+i*2600+random()*1500;
    const at=Math.min(ideal,biteAt-1200);
    if(at<=now+750)continue;
    touches.push({
      at,
      duration:320+random()*510,
      kind:random()<.62?"peck":"liner",
      direction:random()<.5?-1:1
    });
  }
  return {seed,biteAt,touches};
}

// Returns pure physical pose deltas. The caller decides how to render them,
// including clipping the float at the surface so a dive truly disappears.
export function floatPose(now,sequence,mode="waiting",pattern="dive",biteStartedAt=0,biteExpires=0){
  const time=now/1000,seed=sequence?.seed??0;
  const waveY=Math.sin(time*2.1+seed)*2.3+Math.sin(time*1.12+seed*1.7)*1.5;
  const waveX=Math.sin(time*.87+seed*.8)*4.3+Math.sin(time*1.37+seed)*1.8;
  let dx=waveX,dy=waveY,rotation=Math.sin(time*1.8+seed)*.034;
  let disturbance=0;
  const touch=sequence?.touches?.find(e=>now>=e.at&&now<e.at+e.duration);
  if(mode==="waiting"&&touch){
    const p=(now-touch.at)/touch.duration;
    const envelope=Math.sin(Math.PI*p)**2;
    if(touch.kind==="peck"){
      // Quick irregular tip shakes that settle back down — NOT a real take.
      dy+=envelope*(4+5*Math.abs(Math.sin(p*24)));
      dx+=envelope*Math.sin(p*19)*2.9;
      rotation+=envelope*.09*Math.sin(p*15);
    }else{
      // Fish touches the line or weak breeze pulls it, then the float rebounds.
      dx+=touch.direction*15*envelope;
      dy+=4*envelope;
      rotation+=touch.direction*.07*envelope;
    }
    disturbance=envelope*.48;
  }
  if(mode==="bite"){
    const window=Math.max(1,biteExpires-biteStartedAt);
    const progress=floatClamp((now-biteStartedAt)/window,0,1);
    // A decisive, sustained movement (not a separate flashing signal).
    const grow=smooth(progress/.67);
    if(pattern==="dive"){
      dy+=58*grow;
      dx+=Math.sin(progress*8)*4*grow;
      disturbance=grow*.72;
    }else if(pattern==="slide"){
      dx+=112*grow;
      dy+=15*grow;
      rotation+=.16*grow;
      disturbance=grow*.62;
    }else if(pattern==="lift"){
      dy-=40*grow;
      dx-=22*grow;
      rotation+=1.17*grow;
      disturbance=grow*.32;
    }
  }
  if(mode==="reeling"){
    dx+=Math.sin(time*4.1)*14;
    dy+=Math.sin(time*5.4)*7;
    disturbance=.54;
  }
  return {dx,dy,rotation,disturbance,waveY,waveX};
}
