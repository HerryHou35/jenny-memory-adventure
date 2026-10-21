/* Exercise the real blackout boundary BEFORE allowing media to finish loading. */
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('C:/Users/18731/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'../dist'),out=path.resolve(__dirname,'../.sites-runtime/qa');
const server=http.createServer((req,res)=>{
  const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=path.join(root,name==='/'?'index.html':name);
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  try{
    const size=fs.statSync(file).size;res.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.html':'text/html','.json':'application/json','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.mp4':'video/mp4','.ogg':'audio/ogg','.mp3':'audio/mpeg'}[path.extname(file)])||'application/octet-stream');
    res.setHeader('Accept-Ranges','bytes');let start=0,end=size-1;
    if(req.headers.range){const parts=/bytes=(\d+)-(\d*)/.exec(req.headers.range);start=Number(parts[1]);end=Math.min(end,parts[2]?Number(parts[2]):end);res.statusCode=206;res.setHeader('Content-Range',`bytes ${start}-${end}/${size}`);}
    res.setHeader('Content-Length',end-start+1);fs.createReadStream(file,{start,end}).pipe(res);
  }catch{res.writeHead(404).end();}
});
const assert=(value,message)=>{if(!value)throw Error(message);};
(async()=>{
  await new Promise(r=>server.listen(4182,'127.0.0.1',r));
  const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
  try{
    const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    let releaseConfig;const configGate=new Promise(r=>releaseConfig=r);
    await page.route('**/assets/ending.json',async route=>{await configGate;await route.continue();});
    await page.goto('http://127.0.0.1:4182/');await page.waitForFunction(()=>Object.keys(images).length===Object.keys(imagePaths).length);
    // Isolate the defensive ending gate; the earlier entry gate is tested in qa-prepare.
    await page.evaluate(()=>startGame(false));
    await page.evaluate(()=>{clearInteraction();game.fade=0;game.soundOn=false;startEnding();game.running=false;const e=direction.ending;e.start=direction.now-48001;updateEnding(direction.now);e.blackoutAt=direction.now-3999;updateEnding(direction.now);});
    assert(await page.evaluate(()=>direction.ending.media==='blackout'),'four-second blackout changed');
    const blocked=await page.evaluate(()=>{const e=direction.ending;e.blackoutAt=direction.now-4100;updateEnding(direction.now);drawEnding(direction.now);return {phase:e.media,photos:direction.photos.length,letter:!$('birthday-letter').hidden};});
    console.log(JSON.stringify({delayedConfigBoundary:blocked}));
    assert(blocked.phase==='blackout'&&!blocked.letter,'BUG: unloaded real photographs were skipped');
    assert(await page.locator('#ending-load').isVisible(),'slow network has no waiting feedback');
    await page.screenshot({path:path.join(out,'19-21-photo-waiting.png')});
    releaseConfig();await page.waitForFunction(()=>direction.photos.length===61);
    await page.evaluate(()=>{updateEnding(direction.now);drawEnding(direction.now+500);});
    assert(await page.evaluate(()=>direction.ending.media==='photoRush'&&direction.ending.photoIndex===0),'did not begin on requested first photo after waiting');
    await page.evaluate(()=>{direction.ending.rushAt=direction.now-1800;drawEnding(direction.now);});
    await page.screenshot({path:path.join(out,'19-21-photo-after-wait.png')});
    const originals=await page.evaluate(()=>direction.photos.map(m=>m.getAttribute('src')));
    // One broken photograph must block playback, then retry without losing order.
    await page.unroute('**/assets/ending.json');let failOnce=true;
    await page.route('**/album/1/002.webp',route=>{if(failOnce){failOnce=false;return route.fulfill({status:503,body:'temporarily unavailable'});}return route.continue();});
    await page.evaluate(()=>{startEnding();game.running=false;});
    await page.waitForFunction(()=>direction.ending.assets?.status==='error');
    await page.evaluate(()=>{const e=direction.ending;e.start=direction.now-48001;updateEnding(direction.now);e.blackoutAt=direction.now-4100;updateEnding(direction.now);});
    assert(await page.evaluate(()=>direction.ending.media==='blackout'&&direction.photos.length===0),'failed photo was silently filtered out');
    await page.locator('#ending-load-retry').click();await page.waitForFunction(()=>direction.ending.assets.status==='ready');
    assert(await page.evaluate(list=>JSON.stringify(direction.photos.map(m=>m.getAttribute('src')))===JSON.stringify(list),originals),'retry changed media order');
    await page.evaluate(()=>{updateEnding(direction.now);const e=direction.ending;for(let i=0;i<direction.photos.length;i++){drawEnding(e.rushAt+(e.photoBeats[i]+.4)*1000);if(e.photoIndex!==i)throw Error('Missing media '+i);}updateEnding(e.rushAt+e.rushSeconds*1000+100);});
    assert(await page.evaluate(()=>direction.ending.media==='birthday'),'complete album did not finish normally');
    // In-flight callbacks from an abandoned ending cannot overwrite a new run.
    let releaseOld;const oldGate=new Promise(r=>releaseOld=r);
    await page.route('**/assets/ending.json',async route=>{await oldGate;await route.continue();});
    await page.evaluate(()=>{startEnding();clearInteraction();direction.ending=null;setProjectorRoom(true);game.running=false;});
    releaseOld();await page.waitForTimeout(200);
    assert(await page.evaluate(()=>game.scene==='projector'&&$('ending-load').hidden),'cancelled preload leaked UI');
    assert(!errors.length,errors.join('\n'));
    console.log(JSON.stringify({passed:true,delayedConfig:true,all61InOrder:true,failedPhotoRetry:true,noSilentSkip:true,cancelledRunSafe:true,errors}));
  }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e.stack);server.close();process.exitCode=1;});
