import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as wait } from "node:timers/promises";

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const port=42000+Math.floor(Math.random()*16000);
const base="http://127.0.0.1:"+port;
const child=spawn(process.execPath,["server.mjs"],{
  cwd:root,
  env:{...process.env,PORT:String(port)},
  stdio:"ignore"
});
try{
  let ready=false;
  for(let i=0;i<50;i++){
    if(child.exitCode!==null)throw Error("Server terminated during startup");
    try{const r=await fetch(base+"/"); if(r.ok){ready=true;break}}catch{}
    await wait(100);
  }
  assert.ok(ready,"HTTP server did not start");
  const expected=[
    ["/","text/html","Hồ Bảy Mẫu"],
    ["/app.js","text/javascript","MAX_ANGLERS=15"],
    ["/fishing-engine.mjs","text/javascript","makeFight"],
    ["/float-behavior.mjs","text/javascript","planFloatCast"],
    ["/styles.css","text/css","map-frame"],
    ["/data/hanoi-lakes.json","application/json","bay-mau"]
  ];
  const fishIds=["ro-phi","ro-dong","diec","troi","me-trang","chep","tram-co","tre","tram-den","ca-qua"];
  for(const id of fishIds)expected.push(["/assets/fish/"+id+".svg","image/svg+xml","<svg"]);
  for(const [path,type,token] of expected){
    const response=await fetch(base+path);
    assert.equal(response.status,200,path);
    assert.ok((response.headers.get("content-type")||"").includes(type),path+" has wrong MIME");
    assert.ok((await response.text()).includes(token),path+" missing expected content");
  }
  const missing=await fetch(base+"/not-found.js");
  assert.equal(missing.status,404,"Missing assets should return 404");
  console.log("✓ HTTP smoke test passed (HTML, JS, CSS, lake JSON, 404)");
}finally{
  child.kill("SIGTERM");
}
