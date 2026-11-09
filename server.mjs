import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const root = dirname(fileURLToPath(import.meta.url));
const allowed = new Map([
  ["/",["index.html","text/html; charset=utf-8"]],
  ["/index.html",["index.html","text/html; charset=utf-8"]],
  ["/styles.css",["styles.css","text/css; charset=utf-8"]],
  ["/app.js",["app.js","text/javascript; charset=utf-8"]],
  ["/fishing-engine.mjs",["fishing-engine.mjs","text/javascript; charset=utf-8"]],
  ["/data/hanoi-lakes.json",["data/hanoi-lakes.json","application/json; charset=utf-8"]]
]);
const FISH_IDS=["ro-phi","ro-dong","diec","troi","me-trang","chep","tram-co","tre","tram-den","ca-qua"];
for(const id of FISH_IDS)allowed.set("/assets/fish/"+id+".svg",["assets/fish/"+id+".svg","image/svg+xml; charset=utf-8"]);
const port = Number(process.env.PORT || 3000);
createServer(async (req,res)=>{
  let pathname;
  try{pathname=new URL(req.url,"http://localhost").pathname}catch{res.writeHead(400).end("Bad URL");return}
  const entry=allowed.get(pathname);
  if(!entry){res.writeHead(404,{"Content-Type":"text/plain; charset=utf-8"}).end("Not found");return}
  try{
    const content=await readFile(join(root,entry[0]));
    res.writeHead(200,{"Content-Type":entry[1],"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"});
    if(req.method==="HEAD")res.end();else res.end(content);
  }catch(e){console.error(e);res.writeHead(500).end("Server error")}
}).listen(port,()=>console.log("Hanoi Fishing Pixel demo: http://localhost:"+port));
