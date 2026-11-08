import { makeFight, stepFight, biteConfig, clamp } from "./fishing-engine.mjs";
const $ = (id) => document.getElementById(id);
const LAKE_FOCUS = "bay-mau";
const FISH = [
  {id:"ro-phi",name:"Rô phi",rarity:"common",reward:6},
  {id:"ro-dong",name:"Rô đồng",rarity:"common",reward:7},
  {id:"diec",name:"Diếc",rarity:"common",reward:8},
  {id:"troi",name:"Trôi",rarity:"common",reward:9},
  {id:"me-trang",name:"Mè trắng",rarity:"common",reward:10},
  {id:"chep",name:"Chép",rarity:"rare",reward:19},
  {id:"tram-co",name:"Trắm cỏ",rarity:"rare",reward:22},
  {id:"tre",name:"Trê",rarity:"rare",reward:23},
  {id:"tram-den",name:"Trắm đen",rarity:"epic",reward:48},
  {id:"ca-qua",name:"Cá quả",rarity:"epic",reward:55}
];
const RODS = {
  hand:{name:"Cần tay",bonus:0,reelBonus:0},
  reel:{name:"Cần máy",bonus:800,reelBonus:1},
  lure:{name:"Cần lure",bonus:-150,reelBonus:0}
};
const MAX_ANGLERS=15, MAX_SPECTATORS=30;
const FREE_SECONDS=300, DEMO_RENT_COINS=20, RENT_SECONDS=300;
const state={
  lakes:[], selected:LAKE_FOCUS, screen:"map", coins:50,
  avatar:{x:456,y:479}, pressed:new Set(), gotoSpot:null, gotoPoint:null, spot:null,
  freeRemaining:FREE_SECONDS, paidRemaining:0, freeUsed:false,
  fishing:"idle", biteAt:0, biteStartedAt:0, biteExpires:0, nibbleAt:0, nibbleUntil:0,
  currentFish:null, fight:null, held:false, lastCatch:null,
  caught:0, score:0, fishCounts:Object.fromEntries(FISH.map(f=>[f.id,0])),
  mapZoom:1, mapDX:0, mapDY:0, mapDragging:false, lastTime:0
};
const SPOTS=Array.from({length:MAX_ANGLERS},(_,i)=>{
  const a=-Math.PI/2+i*2*Math.PI/MAX_ANGLERS;
  return {id:i+1,a,x:456+294*Math.cos(a),y:255+195*Math.sin(a)};
});
function hash(s){let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function coords(lake){
  const t=(lake.area||"").toLocaleLowerCase("vi");
  let p=[.50,.48];
  if(t.includes("sóc sơn"))p=[.79,.20];
  else if(t.includes("ba vì"))p=[.12,.33];
  else if(t.includes("sơn tây"))p=[.19,.48];
  else if(t.includes("mỹ đức"))p=[.36,.83];
  else if(t.includes("đông anh"))p=[.66,.30];
  else if(t.includes("tây hồ"))p=[.49,.37];
  else if(t.includes("ba đình"))p=[.48,.46];
  else if(t.includes("hoàn kiếm"))p=[.55,.51];
  else if(t.includes("hai bà trưng"))p=[.59,.59];
  else if(t.includes("đống đa"))p=[.46,.57];
  else if(t.includes("hoàng mai"))p=[.59,.72];
  else if(t.includes("hà đông"))p=[.38,.66];
  else if(t.includes("thanh xuân"))p=[.48,.64];
  else if(t.includes("thanh trì"))p=[.60,.77];
  const h=hash(lake.id);
  return {x:Math.min(.9,Math.max(.09,p[0]+((h%11)-5)*.016)),y:Math.min(.89,Math.max(.09,p[1]+((Math.floor(h/11)%11)-5)*.014))};
}
function normalizeName(name){return (name||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/đ/g,"d").toLowerCase();}
function addLakeB7(lakes){
  if(!lakes.some(x=>x.id===LAKE_FOCUS)){
    lakes.push({id:LAKE_FOCUS,name:"Hồ Bảy Mẫu",area:"Công viên Thống Nhất, Hai Bà Trưng",category:"noi_do",scene_priority:"mvp"});
  }
  return lakes.sort((a,b)=>a.id===LAKE_FOCUS?-1:b.id===LAKE_FOCUS?1:a.name.localeCompare(b.name,"vi"));
}
async function loadLakes(){
  try{
    const response=await fetch("./data/hanoi-lakes.json");
    if(!response.ok)throw Error("HTTP "+response.status);
    const data=await response.json();
    state.lakes=addLakeB7(data.lakes||[]);
  }catch(err){
    console.warn("Không nạp được JSON hồ; hiển thị hồ mẫu:",err);
    state.lakes=addLakeB7([]);
  }
  drawMap();
  updatePreview();
}
function drawMap(){
  const q=normalizeName($("searchLake").value);
  const lakes=state.lakes.filter(l=>normalizeName(l.name+" "+l.area+" "+(l.park_name||"")).includes(q));
  $("lakeCount").textContent=lakes.length;
  const list=$("lakeList"),pins=$("mapPins");list.replaceChildren();pins.replaceChildren();
  for(const lake of lakes){
    const playable=lake.id===LAKE_FOCUS;
    const card=document.createElement("button");
    card.className="lake-card"+(playable?" is-playable":"")+(state.selected===lake.id?" is-selected":"");
    const name=document.createElement("span");
    const strong=document.createElement("strong");strong.textContent=lake.name;
    const small=document.createElement("small");small.textContent=playable?"Công viên Thống Nhất":(lake.area||"Hà Nội");
    name.append(strong,small);
    const status=document.createElement("span");status.className="status-dot";status.textContent=playable?"● DEMO":"○ SẮP MỞ";
    card.append(name,status);card.addEventListener("click",()=>chooseLake(lake.id));list.append(card);
    const pos=coords(lake);
    const pin=document.createElement("button");
    pin.className="map-pin"+(playable?" is-playable":"")+(state.selected===lake.id?" is-selected":"");
    pin.style.left=(pos.x*100)+"%";pin.style.top=(pos.y*100)+"%";
    pin.title=lake.name+" — "+(lake.area||"Hà Nội");
    pin.setAttribute("aria-label","Chọn "+lake.name);
    const symbol=document.createElement("span");symbol.className="pin-glyph";
    const label=document.createElement("span");label.className="pin-label";label.textContent=lake.name;
    pin.append(symbol,label);pin.addEventListener("click",()=>chooseLake(lake.id));pins.append(pin);
  }
}
function chooseLake(id){
  state.selected=id;drawMap();updatePreview();
}
function updatePreview(){
  const lake=state.lakes.find(x=>x.id===state.selected);
  if(!lake)return;
  $("previewName").textContent=lake.id===LAKE_FOCUS?"Hồ Bảy Mẫu — Công viên Thống Nhất":lake.name;
  $("previewInfo").textContent=(lake.area||"Hà Nội")+" · Bối cảnh game câu cá ảo";
  const playable=lake.id===LAKE_FOCUS;
  $("previewSlots").textContent=playable?"15 vị trí câu · 30 khán giả / phòng (dự kiến)":"Địa danh đã nghiên cứu · chưa có cảnh chơi";
  $("enterLake").disabled=!playable;
  $("enterLake").textContent=playable?"VÀO HỒ BẢY MẪU ↗":"CẢNH HỒ ĐANG PHÁT TRIỂN";
}
function renderMapTransform(){
  $("mapWorld").style.transform="translate("+state.mapDX+"px,"+state.mapDY+"px) scale("+state.mapZoom+")";
  $("mapZoom").textContent=Math.round(state.mapZoom*100)+"%";
}
function zoom(d){state.mapZoom=Math.max(.66,Math.min(2.3,Math.round((state.mapZoom+d)*100)/100));renderMapTransform();}
$("searchLake").addEventListener("input",drawMap);
$("zoomIn").addEventListener("click",()=>zoom(.2));
$("zoomOut").addEventListener("click",()=>zoom(-.2));
$("mapFrame").addEventListener("wheel",e=>{e.preventDefault();zoom(e.deltaY<0?.1:-.1)},{passive:false});
let dragOrigin=null;
$("mapFrame").addEventListener("pointerdown",e=>{
  if(e.target.closest("button"))return;
  state.mapDragging=true;dragOrigin={x:e.clientX,y:e.clientY,dx:state.mapDX,dy:state.mapDY};
  $("mapFrame").setPointerCapture(e.pointerId);
});
$("mapFrame").addEventListener("pointermove",e=>{
  if(!state.mapDragging||!dragOrigin)return;
  state.mapDX=dragOrigin.dx+e.clientX-dragOrigin.x;
  state.mapDY=dragOrigin.dy+e.clientY-dragOrigin.y;renderMapTransform();
});
function stopDrag(){state.mapDragging=false;dragOrigin=null}
$("mapFrame").addEventListener("pointerup",stopDrag);
$("mapFrame").addEventListener("pointercancel",stopDrag);
$("enterLake").addEventListener("click",()=>{if(state.selected!==LAKE_FOCUS)return;openGame()});
$("backMap").addEventListener("click",closeGame);
function openGame(){
  state.screen="game";$("mapScreen").classList.add("hidden");$("gameScreen").classList.remove("hidden");
  $("fishingView").classList.toggle("hidden",state.spot===null);
  $("gameLayout").classList.toggle("hidden",state.spot!==null);
  window.scrollTo(0,0);$("gameCanvas").focus();displayStatus();
}
function closeGame(){
  if(state.spot!==null)releaseSpot();
  state.screen="map";$("gameScreen").classList.add("hidden");$("mapScreen").classList.remove("hidden");
  state.held=false;
  window.scrollTo(0,0);updateHUD();
}
function isWater(x,y){
  const d=((x-456)/264)**2+((y-255)/166)**2;
  return d<1.03;
}
function canWalk(x,y){return x>24&&x<875&&y>18&&y<525&&!isWater(x,y)}
function setHint(text){$("hint").textContent=text}
function displayStatus(message){
  if(message)$("fishingStatus").textContent=message;
  else $("fishingStatus").textContent=state.spot===null?
    "Bạn đang ở khu chờ. Chọn một vị trí quanh hồ để đến đó.":
    "Đang ở vị trí #"+state.spot+". Chọn cần, mồi rồi thả câu.";
}
function chooseSpot(n){
  if(state.spot!==null){setHint("Trả vị trí hiện tại trước khi chuyển sang chỗ khác.");return}
  state.gotoSpot=n;state.gotoPoint=null;
  setHint("Đang tự đi dọc bờ tới vị trí câu #"+n+".");
}
function occupySpot(n){
  state.gotoSpot=null;state.spot=n;
  state.avatar.x=SPOTS[n-1].x;state.avatar.y=SPOTS[n-1].y;
  $("seatNumber").textContent="#"+String(n).padStart(2,"0");
  $("gameLayout").classList.add("hidden");
  $("fishingView").classList.remove("hidden");
  displayStatus("Đã tới chỗ ngồi. Thả câu rồi quan sát đầu phao. Space đúng lúc phao cắn!");
  setHint("Bạn đang câu tại vị trí #"+n+".");
  window.scrollTo(0,0);
  updateHUD();
}
function releaseSpot(){
  state.gotoSpot=null;state.spot=null;state.fishing="idle";state.currentFish=null;
  state.fight=null;state.held=false;
  $("fishingView").classList.add("hidden");
  $("gameLayout").classList.remove("hidden");
  state.avatar.x=456;state.avatar.y=478;
  displayStatus("Đã trả vị trí. Bạn có thể di chuyển hoặc chọn chỗ khác.");
  setHint("Bạn trở lại khu chờ. 5 phút miễn phí không tự làm mới khi đổi chỗ.");
  updateHUD();
}
$("leaveSpot").addEventListener("click",releaseSpot);
function chooseFish(){
  // Tỉ lệ 70% phổ biến / 25% hiếm / 5% cực hiếm — cấu hình thử nghiệm.
  const rod=$("rodSelect").value,bait=$("baitSelect").value;
  let epic=.05,rare=.25;
  if(rod==="lure"&&bait==="lure")epic+=.015;
  if(rod==="reel")rare+=.02;
  const r=Math.random();
  const tier=r<epic?"epic":r<epic+rare?"rare":"common";
  const pool=FISH.filter(f=>f.rarity===tier);
  return pool[Math.floor(Math.random()*pool.length)];
}
function canFish(){return state.spot!==null&&(state.freeRemaining>0||state.paidRemaining>0)}
function castLine(){
  if(state.fishing!=="idle"||!canFish())return;
  const now=performance.now();
  state.fishing="waiting";state.currentFish=chooseFish();state.fight=null;state.held=false;
  state.nibbleAt=now+950+Math.random()*1100;
  state.nibbleUntil=state.nibbleAt+440+Math.random()*500;
  state.biteAt=now+4200+Math.random()*3900;
  state.biteStartedAt=0;state.biteExpires=0;
  displayStatus("Phao nổi trên nước. Những cú nhấp nhẹ có thể là cá thử mồi; đợi tín hiệu cắn rõ ràng.");
  updateHUD();
}
function missFish(text){
  state.fishing="idle";state.currentFish=null;state.fight=null;state.held=false;
  displayStatus(text||"Cá đã thoát. Bạn có thể thả câu lại!");
  $("lastCatch").textContent=text||"Cá đã thoát. Hãy thử lại.";
  $("catchTier").textContent="TRƯỢT CÁ";
  updateHUD();
}
function landFish(){
  const fish=state.currentFish;
  if(!fish||state.fishing!=="reeling")return;
  state.coins+=fish.reward;state.caught++;state.score+=fish.reward*10;
  state.fishCounts[fish.id]++;
  state.lastCatch=fish;
  state.fishing="idle";state.currentFish=null;state.fight=null;state.held=false;
  const tier=fish.rarity==="epic"?"CỰC HIẾM":fish.rarity==="rare"?"HIẾM":"PHỔ BIẾN";
  const message="Đã câu được "+fish.name+" · "+tier+" · +"+fish.reward+" xu demo!";
  displayStatus("🎉 "+message+" Tiếp tục thả câu nhé.");
  $("lastCatch").textContent="🎉 "+message;
  $("catchTier").textContent=tier;
  drawFishList();updateHUD();
}
function attemptStrike(){
  if(!canFish())return;
  if(state.fishing==="idle"){castLine();return}
  if(state.fishing==="waiting"){
    missFish("Giật quá sớm! Phao mới nhấp nhô/thử mồi, cá chưa ngậm chắc.");
    return;
  }
  if(state.fishing==="bite"){
    if(performance.now()>state.biteExpires){missFish("Bạn giật hơi muộn, cá đã nhả mồi.");return}
    state.fight=makeFight(state.currentFish.id,$("rodSelect").value);
    state.fishing="reeling";state.held=true;
    displayStatus("Cá đã mắc câu! GIỮ Space để tăng lực, THẢ để giảm; giữ kim trong vùng xanh.");
    updateHUD();
  }
}
$("castBtn").addEventListener("click",castLine);
const reelControl=$("reelBtn");
reelControl.addEventListener("pointerdown",e=>{
  e.preventDefault();
  if(state.fishing==="waiting"||state.fishing==="bite")attemptStrike();
  else if(state.fishing==="reeling")state.held=true;
  try{reelControl.setPointerCapture(e.pointerId)}catch{}
});
function releaseReel(){state.held=false}
for(const event of ["pointerup","pointercancel","lostpointercapture"])reelControl.addEventListener(event,releaseReel);
reelControl.addEventListener("keydown",e=>{
  if(e.key==="Enter"){e.preventDefault();if(!e.repeat)attemptStrike()}
});
$("rentBtn").addEventListener("click",()=>{
  if(state.spot===null||state.freeRemaining>0||state.paidRemaining>0)return;
  if(state.coins<DEMO_RENT_COINS){displayStatus("Không đủ 20 xu demo để thuê tiếp. Giá trong bản demo chưa phải giá cuối.");return}
  if(!window.confirm("Thuê thêm 5 phút với 20 xu DEMO? Không có thanh toán tiền thật."))return;
  state.coins-=DEMO_RENT_COINS;state.paidRemaining=RENT_SECONDS;
  displayStatus("Đã gia hạn 5 phút bằng xu demo. Chúc bạn câu vui!");
  updateHUD();
});
function updateHUD(){
  $("coins").textContent=state.coins;
  $("anglerCount").textContent=state.spot===null?0:1;
  $("spectatorCount").textContent=state.spot===null?1:0;
  $("spotLabel").textContent=state.spot===null?"CHƯA CHỌN":"VỊ TRÍ #"+state.spot;
  const seconds=state.freeRemaining>0?Math.ceil(state.freeRemaining):Math.ceil(state.paidRemaining);
  $("freeClock").textContent=String(Math.floor(seconds/60)).padStart(2,"0")+":"+String(seconds%60).padStart(2,"0");
  $("timeFill").style.width=(Math.min(1,seconds/FREE_SECONDS)*100)+"%";
  $("rentHint").textContent=state.freeRemaining>0?"Thời gian miễn phí · 5 phút/phiên thử":state.paidRemaining>0?"Đang sử dụng thời gian thuê bằng xu demo":"Hết giờ miễn phí · thuê thêm để câu.";
  $("castBtn").classList.toggle("hidden",state.fishing!=="idle");
  $("castBtn").disabled=!canFish()||state.fishing!=="idle";
  $("reelBtn").classList.toggle("hidden",state.fishing==="idle");
  $("reelBtn").textContent=state.fishing==="reeling"?"GIỮ / THẢ ĐỂ ĐIỀU LỰC":state.fishing==="bite"?"⚡ GIẬT CẦN NGAY!":"GIẬT CẦN · SPACE (ĐÚNG LÚC)";
  $("reelBtn").classList.toggle("is-holding",state.held);
  $("rentBtn").classList.toggle("hidden",state.spot===null||state.freeRemaining>0||state.paidRemaining>0);
  $("leaveSpot").disabled=state.spot===null;
  $("caughtCount").textContent=state.caught;$("totalScore").textContent=state.score;
  $("sessionCatch").textContent=state.caught;$("sessionScore").textContent=state.score;
  const stage=state.fishing;
  const nibbling=stage==="waiting"&&performance.now()>=state.nibbleAt&&performance.now()<=state.nibbleUntil;
  $("floatStage").textContent=stage==="idle"?"CHƯA THẢ CÂU":stage==="waiting"?(nibbling?"ĐANG NHẤP MỒI":"ĐANG CHỜ CẮN"):stage==="bite"?"CÁ ĐANG CẮN!":"ĐANG KÉO CÁ";
  $("floatLabel").textContent=stage==="idle"?"PHAO CHƯA THẢ":stage==="waiting"?(nibbling?"PHAO RUNG NHẸ — HÃY ĐỢI":"PHAO NỔI YÊN — QUAN SÁT"):stage==="bite"?"PHAO BIẾN ĐỘNG MẠNH!":"DÂY ĐÃ CĂNG — GIỮ LỰC";
  $("keyGuide").textContent=stage==="idle"?"Nhấn để thả câu":stage==="waiting"?"Đợi phao cắn dứt khoát rồi mới giật":stage==="bite"?"GIẬT NGAY TRƯỚC KHI CÁ NHẢ MỒI!":"Giữ tăng lực, thả giảm lực";
  $("biteBanner").classList.toggle("hidden",stage!=="bite");
  $("fightPanel").classList.toggle("hidden",stage!=="reeling");
  if(state.fight&&stage==="reeling"){
    const f=state.fight;
    $("safeBand").style.left=f.safeLeft.toFixed(2)+"%";
    $("safeBand").style.width=f.width+"%";
    $("tensionMarker").style.left=f.tension.toFixed(2)+"%";
    $("tensionTrack").setAttribute("aria-valuenow",String(Math.round(f.tension)));
    $("fightClock").textContent=Math.max(0,f.seconds-f.elapsed).toFixed(1)+"s";
    $("fishFightName").textContent="🐟 "+state.currentFish.name+" · "+f.seconds+" giây · vùng xanh "+f.width+"%";
    const stable=Math.round(clamp(100*(1-f.danger/f.tolerance),0,100));
    $("fightStability").style.width=stable+"%";$("fightStabilityText").textContent=stable+"%";
    const elapsed=Math.round(clamp(f.elapsed/f.seconds*100,0,100));
    $("fightElapsed").style.width=elapsed+"%";$("fightElapsedText").textContent=elapsed+"%";
    $("fightFeedback").textContent=f.tension>f.safeRight?"⚠ Lực quá cao! THẢ Space để tránh đứt dây.":f.tension<f.safeLeft?"⚠ Lực quá thấp! GIỮ Space để tránh tuột cá.":"✓ Lực vừa đủ. Giữ nhịp kéo và thả khi cá vùng.";
  }
}
function drawFishList(){
  const div=$("fishList");div.replaceChildren();
  for(const f of FISH){
    const item=document.createElement("div");item.className="fish-item"+(f.rarity==="rare"?" rare":f.rarity==="epic"?" epic":"");
    const name=document.createElement("span");name.textContent=f.name;
    const count=document.createElement("b");count.textContent="×"+state.fishCounts[f.id];
    item.append(name,count);div.append(item);
  }
}
document.addEventListener("keydown",e=>{
  if(state.screen!=="game")return;
  if(["INPUT","SELECT","TEXTAREA"].includes(document.activeElement.tagName))return;
  if(state.spot!==null){
    if(e.code==="Space"||e.key===" "){
      e.preventDefault();
      if(!e.repeat){
        if(state.fishing==="reeling")state.held=true;
        else attemptStrike();
      }
    }
    return;
  }
  if(!["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","w","a","s","d","W","A","S","D"].includes(e.key))return;
  state.pressed.add(e.key.toLowerCase());e.preventDefault();
});
document.addEventListener("keyup",e=>{
  if(e.code==="Space"||e.key===" "){state.held=false}
  state.pressed.delete(e.key.toLowerCase());
});
window.addEventListener("blur",()=>{state.pressed.clear();state.held=false});
for(const btn of document.querySelectorAll("[data-move]")){
  const key=btn.dataset.move.toLowerCase();
  btn.addEventListener("pointerdown",e=>{e.preventDefault();state.pressed.add(key);btn.setPointerCapture(e.pointerId)});
  btn.addEventListener("pointerup",()=>state.pressed.delete(key));
  btn.addEventListener("pointercancel",()=>state.pressed.delete(key));
  btn.addEventListener("lostpointercapture",()=>state.pressed.delete(key));
}
const canvas=$("gameCanvas"),ctx=canvas.getContext("2d",{alpha:false});
const floatCanvas=$("floatCanvas"),floatCtx=floatCanvas.getContext("2d",{alpha:false});
floatCtx.imageSmoothingEnabled=false;
ctx.imageSmoothingEnabled=false;
function rect(x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(Math.floor(x),Math.floor(y),Math.ceil(w),Math.ceil(h))}
function seed01(n){let x=Math.sin(n*127.1+78.233)*43758.5453;return x-Math.floor(x)}
function drawTree(x,y,s=1){
  rect(x-5*s,y-3*s,10*s,15*s,"#614f3f");
  rect(x-17*s,y-22*s,34*s,26*s,"#365e48");
  rect(x-13*s,y-30*s,27*s,22*s,"#528e5b");
  rect(x-7*s,y-33*s,17*s,9*s,"#8eba70");
  rect(x-8*s,y-18*s,8*s,7*s,"#75ae6a");
}
function drawSceneBase(){
  // Pre-render world to a cached canvas; crisp rectangular pixel tiles.
  const c=ctx.canvas;
  rect(0,0,900,540,"#9bc57e");
  for(let y=0;y<540;y+=12){
    for(let x=0;x<900;x+=12){
      const u=((x-456)/276)**2+((y-255)/181)**2;
      const w=((x-456)/261)**2+((y-255)/168)**2;
      if(w<=1){
        rect(x,y,12,12,seed01(x+3*y)>.80?"#5cb1b8":seed01(y+5*x)>.64?"#66bec5":"#4da2b2");
      }else if(u<=1){
        rect(x,y,12,12,seed01(x+17*y)>.55?"#e6cb8a":"#d8c18a");
      }else if(seed01(x*2+y*11)>.91)rect(x+4,y+5,4,4,"#80b86d");
    }
  }
  // Pathway, fences and small pixel details in the spectator zone.
  for(let x=20;x<860;x+=16){
    if(x<160||x>780){rect(x,474,16,18,"#d8c18c");if(x%32===0)rect(x,478,4,3,"#c7a96e")}
  }
  rect(28,85,116,74,"#d7b777");
  rect(36,94,100,60,"#7d563e");
  rect(42,97,88,51,"#b67a48");
  rect(38,79,97,18,"#ffcf80");
  rect(45,111,82,7,"#e8b56c");
  rect(46,126,35,17,"#3b6054");rect(91,126,35,17,"#3b6054");
  rect(55,133,10,16,"#ffe1a5");rect(110,133,10,16,"#ffe1a5");
  // Ticket kiosk & hut signage.
  rect(49,65,80,20,"#245054");
  ctx.fillStyle="#fff3d4";ctx.font="bold 12px monospace";ctx.textAlign="center";ctx.fillText("THUÊ CẦN",89,79);
  rect(744,455,130,45,"#355b58");rect(753,464,112,30,"#50786d");
  ctx.fillStyle="#f9eac7";ctx.font="bold 11px monospace";ctx.fillText("KHU CHỜ",809,483);
  for(let i=0;i<70;i++){
    const x=28+seed01(i+19)*845,y=24+seed01(i+700)*479;
    const val=((x-456)/326)**2+((y-255)/216)**2;
    if(val>1.5&&((x<200||x>690||y>440||y<55)) && (x>160||y>210))drawTree(x,y,.65+seed01(i*19)*.32);
  }
  // Small pier blocks sticking toward the water from each fishing position.
  for(const sp of SPOTS){
    const x=sp.x,y=sp.y;
    const tx=x-17*Math.cos(sp.a),ty=y-17*Math.sin(sp.a);
    rect(tx-8,ty-6,16,12,"#7f5c3d");rect(tx-6,ty-4,12,8,"#c99b61");
  }
}
const bgCanvas=document.createElement("canvas");bgCanvas.width=900;bgCanvas.height=540;
const originalCtx=ctx;
function createBackground(){
  const temp=ctx.canvas;
  // Use the main context once; then copy pixels to offscreen canvas.
  drawSceneBase();
  bgCanvas.getContext("2d").drawImage(temp,0,0);
}
function drawAvatar(x,y,time){
  const run=state.pressed.size>0||state.gotoSpot!==null||state.gotoPoint!==null;
  const bob=run&&Math.floor(time/160)%2===0?-3:0;
  rect(x-11,y+4,22,5,"#426a4c");
  rect(x-8,y-6+bob,7,13,"#283d4b");rect(x+2,y-6-bob,7,13,"#283d4b");
  rect(x-11,y-19+bob,22,16,"#e5ad6d");
  rect(x-8,y-20+bob,16,15,"#4387a0");
  rect(x-9,y-32+bob,18,15,"#f5c790");
  rect(x-12,y-37+bob,24,9,"#493b42");
  rect(x-15,y-36+bob,29,5,"#65484b");
  rect(x-4,y-24+bob,3,3,"#253944");rect(x+5,y-24+bob,3,3,"#253944");
  if(state.spot!==null){
    rect(x+12,y-28,3,34,"#634b33");rect(x+13,y-32,3,7,"#f9dfa0");
  }
}
function drawGame(now){
  ctx.drawImage(bgCanvas,0,0);
  // Water sparkles are low-cost and deliberately blocky.
  for(let i=0;i<16;i++){
    const x=456+(seed01(i*71)-.5)*405;
    const y=255+(seed01(i*38)-.5)*245;
    if(isWater(x,y)){
      const frame=Math.floor(now/650+i*3)%4;
      if(frame<2)rect(x,y,frame===0?17:9,3,"#98d4c9");
    }
  }
  for(const sp of SPOTS){
    const active=state.spot===sp.id;
    const selected=state.gotoSpot===sp.id;
    rect(sp.x-14,sp.y-14,28,28,"#173e46");
    rect(sp.x-11,sp.y-11,22,22,active?"#ffe6a1":selected?"#d6e99a":"#edbb7b");
    ctx.fillStyle="#24373b";ctx.font="bold 13px monospace";ctx.textAlign="center";
    ctx.fillText(String(sp.id),Math.round(sp.x),Math.round(sp.y)+5);
    if(active){rect(sp.x-15,sp.y-27,30,4,"#f8e7ae")}
  }
  // NPCs in the lounge. Decorative only; never counted as real spectators.
  rect(89,198,14,22,"#604b68");rect(88,183,16,17,"#e5ac7b");rect(86,180,21,6,"#453c43");
  rect(812,439,13,19,"#477a82");rect(811,426,15,15,"#efc695");rect(811,423,18,6,"#464354");
  ctx.fillStyle="#244c4d";ctx.font="bold 13px monospace";ctx.fillText("NPC",96,176);
  if(state.fishing!=="idle"&&state.spot!==null){
    const sp=SPOTS[state.spot-1];
    const fx=sp.x-48*Math.cos(sp.a),fy=sp.y-48*Math.sin(sp.a);
    const x=Math.round(fx),y=Math.round(fy);
    if(state.fishing==="bite"){rect(x-13,y-12,26,24,"#fff0a0");rect(x-6,y-5,12,10,"#ff816d")}
    else{rect(x-4,y-4,8,8,"#f9e7b2");rect(x-4,y-6,8,4,"#fa705f")}
    ctx.strokeStyle="#f1e0ac";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(sp.x,sp.y-23);ctx.lineTo(x,y);ctx.stroke();
  }
  drawAvatar(state.avatar.x,state.avatar.y,now);
  // Label avatar in the scene.
  rect(state.avatar.x-26,state.avatar.y-52,52,14,"#254e4a");
  ctx.fillStyle="#f6eccb";ctx.textAlign="center";ctx.font="bold 10px monospace";ctx.fillText("BẠN",state.avatar.x,state.avatar.y-41);
}
function update(delta){
  if(state.screen!=="game")return;
  const speed=165*delta;
  if(state.spot===null){
    let dx=0,dy=0;
    if(state.pressed.has("arrowleft")||state.pressed.has("a"))dx-=1;
    if(state.pressed.has("arrowright")||state.pressed.has("d"))dx+=1;
    if(state.pressed.has("arrowup")||state.pressed.has("w"))dy-=1;
    if(state.pressed.has("arrowdown")||state.pressed.has("s"))dy+=1;
    if(dx||dy){
      state.gotoSpot=null;state.gotoPoint=null;
      const norm=Math.hypot(dx,dy);
      const nx=state.avatar.x+dx/norm*speed,ny=state.avatar.y+dy/norm*speed;
      if(canWalk(nx,state.avatar.y))state.avatar.x=nx;
      if(canWalk(state.avatar.x,ny))state.avatar.y=ny;
    }else if(state.gotoSpot!==null){
      const sp=SPOTS[state.gotoSpot-1];
      const cur=Math.atan2((state.avatar.y-255)/195,(state.avatar.x-456)/294);
      let dif=Math.atan2(Math.sin(sp.a-cur),Math.cos(sp.a-cur));
      const step=delta*1.22;
      if(Math.abs(dif)<=step){occupySpot(sp.id)}
      else {
        const a=cur+Math.sign(dif)*step;
        state.avatar.x=456+294*Math.cos(a);
        state.avatar.y=255+195*Math.sin(a);
      }
    }else if(state.gotoPoint){
      let v={x:state.gotoPoint.x-state.avatar.x,y:state.gotoPoint.y-state.avatar.y};
      const len=Math.hypot(v.x,v.y);
      if(len<=speed){state.gotoPoint=null}
      else {
        const nx=state.avatar.x+v.x/len*speed,ny=state.avatar.y+v.y/len*speed;
        if(canWalk(nx,ny)){state.avatar.x=nx;state.avatar.y=ny}
        else{state.gotoPoint=null;setHint("Không thể đi xuyên hồ. Hãy chọn số vị trí để đi theo bờ.")}
      }
    }
  }
  if(state.spot!==null){
    if(state.freeRemaining>0)state.freeRemaining=Math.max(0,state.freeRemaining-delta);
    else if(state.paidRemaining>0)state.paidRemaining=Math.max(0,state.paidRemaining-delta);
    if(!canFish()&&state.fishing!=="idle")missFish("Hết thời gian câu. Thuê thêm để tiếp tục.");
  }
  const now=performance.now();
  if(state.fishing==="waiting"&&now>=state.biteAt){
    state.fishing="bite";state.biteStartedAt=now;
    state.biteExpires=now+biteConfig(state.currentFish.id,$("rodSelect").value).windowMs;
    displayStatus("⚡ CÁ CẮN THẬT! Phao chuyển động dứt khoát — GIẬT CẦN (SPACE)!");
    updateHUD();
  }else if(state.fishing==="bite"&&now>=state.biteExpires){
    missFish("Cá đã nhả mồi! Bạn không giật kịp khi phao chìm.");
  }else if(state.fishing==="reeling"&&state.fight){
    stepFight(state.fight,delta,state.held);
    if(state.fight.result==="caught")landFish();
    else if(state.fight.result==="snapped")missFish("Lực căng quá cao! Dây đứt, cá đã thoát.");
    else if(state.fight.result==="escaped")missFish("Không giữ được lực trong vùng xanh! Cá đã tuột.");
  }
}
canvas.addEventListener("click",e=>{
  if(state.screen!=="game"||state.spot!==null)return;
  const r=canvas.getBoundingClientRect();
  const x=(e.clientX-r.left)/r.width*900, y=(e.clientY-r.top)/r.height*540;
  const sp=SPOTS.find(sp=>Math.hypot(sp.x-x,sp.y-y)<22);
  if(sp){chooseSpot(sp.id);return}
  if(canWalk(x,y)){state.gotoPoint={x,y};state.gotoSpot=null;setHint("Đang di chuyển...")}
  else setHint("Chạm vào số vị trí câu, hoặc chọn bãi cỏ/đường đi để di chuyển.");
});
let lastHUD=0;
function frame(t){
  const delta=state.lastTime?Math.min((t-state.lastTime)/1000,.05):.016;state.lastTime=t;
  update(delta);
  if(state.screen==="game"){
    if(state.spot===null)drawGame(t);
    else drawFloatScene(t);
  }
  if(t-lastHUD>200){updateHUD();lastHUD=t}
  requestAnimationFrame(frame);
}
drawFishList();loadLakes();createBackground();updateHUD();renderMapTransform();requestAnimationFrame(frame);
