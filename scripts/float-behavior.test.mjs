import test from "node:test";
import assert from "node:assert/strict";
import { planFloatCast, floatPose } from "../float-behavior.mjs";

const fixed=()=>.36;
const now=1000;
const cast=planFloatCast(now,fixed);

test("bites are delayed unpredictably, with only pre-bite decoy movements",()=>{
  assert.ok(cast.biteAt>=now+6500&&cast.biteAt<=now+14500);
  assert.ok(cast.touches.length>=1&&cast.touches.length<=3);
  for(const touch of cast.touches){
    assert.ok(touch.at>now);
    assert.ok(touch.at+touch.duration<cast.biteAt);
    assert.ok(["peck","liner"].includes(touch.kind));
    assert.ok(touch.duration>=320&&touch.duration<=830);
  }
  const other=planFloatCast(now,()=>.86);
  assert.notEqual(other.biteAt,cast.biteAt);
});
test("calm-water drift remains subtle, not a direct bite signal",()=>{
  for(let t=0;t<10000;t+=80){
    const pose=floatPose(now+t,cast);
    assert.ok(Math.abs(pose.dy)<4.2||cast.touches.some(e=>now+t>=e.at&&now+t<e.at+e.duration));
    assert.ok(Math.abs(pose.waveY)<4.2);
    assert.ok(Math.abs(pose.waveX)<6.3);
  }
});
test("weak pecks and line touches settle back to the surface",()=>{
  for(const touch of cast.touches){
    const mid=touch.at+touch.duration*.5;
    const pose=floatPose(mid,cast);
    if(touch.kind==="peck")assert.ok(pose.dy<15,"peck shouldn't look like a decisive sinking take");
    else assert.ok(Math.abs(pose.dx)<24,"line brush should reverse instead of sailing away");
    const finished=floatPose(touch.at+touch.duration+2,cast);
    assert.ok(Math.abs(finished.dy)<4.2);
    assert.ok(Math.abs(finished.dx)<6.4);
  }
});
test("genuine dive goes visibly under, sideways take travels, lift rises and tilts",()=>{
  const biteStart=cast.biteAt,biteEnd=biteStart+1700;
  const at=biteStart+1250;
  const dive=floatPose(at,cast,"bite","dive",biteStart,biteEnd);
  const sail=floatPose(at,cast,"bite","slide",biteStart,biteEnd);
  const lift=floatPose(at,cast,"bite","lift",biteStart,biteEnd);
  assert.ok(dive.dy>75,"real float dive should almost completely vanish beneath the water");
  assert.ok(sail.dx>99,"real sail-away is a sustained unmistakable lateral travel");
  assert.ok(lift.dy<-34,"lift bite must show more float than normal");
  assert.ok(lift.rotation>.9,"lift bite should tilt onto its side");
});
test("fake signals never register as a genuine bite unless the game phase says so",()=>{
  const t=cast.touches[0].at+120;
  const waiting=floatPose(t,cast,"waiting","dive");
  assert.ok(waiting.dy<14,"false tip movement must remain small");
  const real=floatPose(cast.biteAt+1400,cast,"bite","dive",cast.biteAt,cast.biteAt+1700);
  assert.ok(real.dy>50);
});

test("a sideways line knock looks like a brief rebound, not a sail-away",()=>{
  const sequence={seed:.3,biteAt:14000,touches:[{at:2500,duration:700,kind:"liner",direction:-1}]};
  const onset=floatPose(2501,sequence);
  const peak=floatPose(2850,sequence);
  const end=floatPose(3201,sequence);
  assert.ok(peak.dx<onset.dx-8,"temporary knock should drift sideways");
  assert.ok(Math.abs(peak.dx)<23,"false pull must remain small");
  assert.ok(Math.abs(end.dx)<7,"the float must return to wave baseline");
  assert.ok(Math.abs(end.dy)<4.2,"the float must settle vertically as well");
});
