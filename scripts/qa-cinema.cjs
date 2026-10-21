const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('C:/Users/18731/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'../dist'),out=path.resolve(__dirname,'../.sites-runtime/qa');
const server=http.createServer((req,res)=>{const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const file=path.join(root,name==='/'?'index.html':name);if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}fs.readFile(file,(err,data)=>{if(err){res.writeHead(404).end();return;}res.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.html':'text/html','.json':'application/json','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'}[path.extname(file)])||'application/octet-stream');res.end(data);});});
(async()=>{
  await new Promise(r=>server.listen(4179,'127.0.0.1',r));
  const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
  try{
    const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
    await page.goto('http://127.0.0.1:4179/');await page.waitForFunction(()=>Object.keys(images).length===Object.keys(imagePaths).length);
    await require("./qa-prepare-helper.cjs")(page);await page.locator('#start-button').click();await page.waitForFunction(()=>game.running);
    await page.evaluate(()=>{clearInteraction();game.fade=0;});
    await page.locator('#game-canvas').screenshot({path:path.join(out,'19-20-cinema-dark.png')});
    const baseline=await page.evaluate(()=>({stage:game.stage,films:CHAPTERS.filter(c=>game[c.key]).length}));
    if(baseline.stage!==0||baseline.films)throw Error('Opening reveals progress');
    await page.evaluate(()=>{clearInteraction();game.stage=2;updateObjective();});
    await page.waitForTimeout(100);await page.locator('#game-canvas').screenshot({path:path.join(out,'19-20-cinema-lit.png')});
    await page.evaluate(()=>{CHAPTERS.forEach(c=>game[c.key]=true);game.stage=16;updateObjective();});
    await page.waitForTimeout(100);await page.locator('#game-canvas').screenshot({path:path.join(out,'19-20-cinema-complete.png')});
    await page.evaluate(()=>{direction.reduced=true;drawProjectorRoom(1000);const a=cinemaSet.toDataURL();drawProjectorRoom(2000);if(cinemaSet.toDataURL()!==a)throw Error('Static scenery mutated');});
    await page.setViewportSize({width:390,height:844});await page.waitForTimeout(100);await page.screenshot({path:path.join(out,'19-20-cinema-mobile.png')});
    if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Mobile overflow');
    if(errors.length)throw Error(errors.join('\n'));
    console.log(JSON.stringify({passed:true,opening:baseline,lit:true,completed:true,reducedMotion:true,mobile:true,errors}));
  }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e.stack);server.close();process.exitCode=1;});
