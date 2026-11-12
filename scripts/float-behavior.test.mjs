import test from "node:test";
import assert from "node:assert/strict";
import { planFloatCast, floatPose } from "../float-behavior.mjs";

const at=1000;
const sequence=planFloatCast(at,()=>.36,"worm");
const baseline=(time,seq=sequence)=>floatPose(time,seq,"waiting");

test("timing varies and every false movement finishes before a genuine take",()=>{
  assert.ok(sequence.biteAt>=at+6200&&sequence.biteAt<=at+23200);
  assert.ok(sequence.touches.length>=1&&sequence.touches.length<=4);
  for(const touch of sequence.touches){
    assert.ok(touch.at>at&&touch.at+touch.duration+1000<sequence.biteAt);
    assert.ok(["nibble","peck","dip-return","liner"].includes(touch.kind));
    assert.ok(touch.duration>=280&&touch.duration<=1500);
  }
  const other=planFloatCast(at,()=>.85,"worm");
  assert.notEqual(other.biteAt,sequence.biteAt);
});

test("rare long still-water waits exist without revealing an alert",()=>{
  const choices=[.3,.85,.05,.9,.4,.6,.4,.7,.5];
  const seq=planFloatCast(at,()=>choices.shift()??.5,"snail");
  assert.ok(seq.biteAt-at>20000);
  assert.ok(seq.touches.every(t=>t.at+t.duration<seq.biteAt));
});

test("wind and current create low, steady baseline movement",()=>{
  const empty={seed:.7,biteAt:90000,touches:[]};
  for(let t=0;t<16000;t+=37){
    const p=baseline(t,empty);
    assert.ok(Math.abs(p.dy)<4.2);
    assert.ok(Math.abs(p.dx)<6.4);
    assert.ok(Math.abs(p.rotation)<.04);
  }
});

test("rapid small-fish nibbling stays shallow and cycles repeatedly",()=>{
  const seq={seed:.1,biteAt:15000,touches:[{at:3000,duration:1200,kind:"nibble",direction:1}]};
  const values=[];
  for(let t=3150;t<4050;t+=30){
    const p=baseline(t,seq);
    const baselineY=baseline(t,{...seq,touches:[]}).dy;
    values.push(p.dy-baselineY);
    assert.ok(Math.abs(p.dy-baselineY)<6);
  }
  const sharpCount=values.slice(1).filter((v,i)=>Math.abs(v-values[i])>1.2).length;
  assert.ok(sharpCount>=8,"repeated nibbles should create multiple quick shallow movements");
});

test("the false dip-and-return briefly hides the tip then resurfaces",()=>{
  const seq={seed:.3,biteAt:12000,touches:[{at:2500,duration:900,kind:"dip-return",direction:1}]};
  const during=baseline(2950,seq);
  const after=baseline(3410,seq);
  const duringBase=baseline(2950,{...seq,touches:[]});
  assert.ok(during.dy-duringBase.dy>22&&during.dy-duringBase.dy<29);
  assert.ok(Math.abs(after.dy)<4.2,"false dip must return all the way to wave level");
});

test("a tentative peck and liner both settle, unlike persistent take",()=>{
  for(const kind of ["peck","liner"]){
    const seq={seed:.5,biteAt:16000,touches:[{at:2800,duration:600,kind,direction:-1}]};
    const middle=baseline(3100,seq),after=baseline(3402,seq);
    if(kind==="liner")assert.ok(middle.dx<-7,"side knock should be noticeable");
    else assert.ok(middle.dy>2,"peck makes the tip nod slightly");
    assert.ok(Math.abs(after.dy)<4.2&&Math.abs(after.dx)<6.4);
  }
});

test("real bite cues are sustained dive, horizontal travel and rising lift",()=>{
  const start=8000,end=9700,when=9250;
  const dive=floatPose(when,sequence,"bite","dive",start,end);
  const slide=floatPose(when,sequence,"bite","slide",start,end);
  const lift=floatPose(when,sequence,"bite","lift",start,end);
  assert.ok(dive.dy>73,"solid dive must move the tip below the surface");
  assert.ok(slide.dx>115,"a real sideways run must far exceed liner knock");
  assert.ok(lift.dy< -36&&lift.rotation>1,"lift rises and tilts rather than merely bobbing");
  const finished=floatPose(end,sequence,"waiting","dive",start,end);
  assert.ok(Math.abs(finished.dy)<4.2,"once fish departs the float returns to baseline");
});

test("chunky bait reduces fish-fry nuisance nibbling relative to soft bait",()=>{
  const worm=planFloatCast(at,()=>.2,"worm");
  const corn=planFloatCast(at,()=>.2,"corn");
  assert.ok(worm.touches.some(t=>t.kind==="nibble"));
  assert.ok(corn.touches.every(t=>t.kind!=="nibble"));
  assert.ok(worm.touches.length>=corn.touches.length);
  assert.equal(worm.baitId,"worm");assert.equal(corn.baitId,"corn");
});

test("all float poses are finite and valid at beginning, midpoint and end",()=>{
  for(const kind of ["nibble","peck","dip-return","liner"]){
    const seq={seed:1.2,touches:[{at:5000,duration:750,kind,direction:1}]};
    for(const t of [4999,5000,5150,5375,5590,5750,5751]){
      const p=baseline(t,seq);
      for(const key of ["dx","dy","rotation","waveX","waveY","disturbance"])
        assert.ok(Number.isFinite(p[key]),kind+" "+t+" "+key);
    }
  }
});
