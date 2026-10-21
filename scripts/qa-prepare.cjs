const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),crypto=require('node:crypto');
const {chromium}=require('C:/Users/18731/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'../dist'),base='/jenny-memory-adventure/',out=path.resolve(__dirname,'../.sites-runtime/qa');
let failure='http';const errors=[],assert=(v,m)=>{if(!v)throw Error(m);};
const server=http.createServer((req,res)=>{
 const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(!pathname.startsWith(base)){res.writeHead(404).end();return;}
 const file=path.join(root,pathname.slice(base.length)||'index.html');if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 if(failure&&pathname.endsWith('/album/1/002.webp')&&req.headers['x-jenny-prepare']){if(failure==='http'){res.writeHead(503).end('test failure');return;}const corrupt=fs.readFileSync(file);corrupt[0]^=1;res.writeHead(200,{'Content-Type':'image/webp','Content-Length':corrupt.length}).end(corrupt);return;}
 fs.stat(file,(err,stat)=>{if(err){res.writeHead(404).end();return;}const headers={'Content-Type':({'.js':'text/javascript','.css':'text/css','.html':'text/html','.json':'application/json','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.mp4':'video/mp4','.mp3':'audio/mpeg','.ogg':'audio/ogg'}[path.extname(file)])||'application/octet-stream','Accept-Ranges':'bytes'};let start=0,end=stat.size-1,status=200;if(req.headers.range){const m=/bytes=(\d+)-(\d*)/.exec(req.headers.range);start=Number(m[1]);end=m[2]?Math.min(end,Number(m[2])):end;status=206;headers['Content-Range']=`bytes ${start}-${end}/${stat.size}`;}headers['Content-Length']=end-start+1;res.writeHead(status,headers);fs.createReadStream(file,{start,end}).pipe(res);});
});
(async()=>{await new Promise(r=>server.listen(4183,'127.0.0.1',r));const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 try{
  const context=await browser.newContext({viewport:{width:1440,height:900}}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  const url='http://127.0.0.1:4183'+base+'?version=19.22';await page.goto(url);await page.locator('#start-button').click();await page.locator('#prepare-panel').waitFor({state:'visible'});
  assert(await page.evaluate(()=>!game.running),'game started without complete preparation');
  await page.locator('#prepare-download').click();await page.waitForFunction(()=>!preparedShow.busy);
  assert(await page.evaluate(()=>!preparedShow.ready&&!game.running&&document.getElementById('prepare-play').hidden),'failure incorrectly marked complete');
  const partial=await page.evaluate(async()=>{const c=await caches.open('jenny-prepared-'+preparedShow.manifest.version);return (await c.keys()).length;});
  failure='corrupt';await page.locator('#prepare-download').click();await page.waitForFunction(()=>!preparedShow.busy);
  assert(await page.evaluate(()=>!preparedShow.ready&&document.getElementById('prepare-status').textContent.includes('不符')),'corrupt file was accepted');
  failure='';await page.locator('#prepare-download').click();await page.waitForFunction(()=>preparedShow.ready&&!preparedShow.busy,null,{timeout:90000});
  await page.screenshot({path:path.join(out,'19-22-prepared-desktop.png')});
  assert(await page.evaluate(()=>document.getElementById('prepare-progress').value===1),'progress incomplete');
  await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(out,'19-22-prepared-mobile.png')});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'mobile overflow');
  // The same tab and a fresh tab must both reopen without a network connection.
  await context.setOffline(true);await page.reload();await page.locator('#start-button').click();await page.waitForFunction(()=>game.running);
  await page.evaluate(()=>{clearInteraction();game.soundOn=false;startEnding();});await page.waitForFunction(()=>direction.photos.length===61,null,{timeout:20000});
  await page.evaluate(()=>{const e=direction.ending;e.musicCancelled=true;e.music?.pause();e.start=direction.now-48001;updateEnding(direction.now);e.blackoutAt=direction.now-4100;updateEnding(direction.now);e.rushAt=direction.now-1800;drawEnding(direction.now);});
  assert(await page.evaluate(()=>direction.ending.media==='photoRush'&&direction.photos[0].naturalWidth===1600),'offline real photos failed');
  const range=await page.evaluate(async()=>{const r=await fetch('assets/easter-eggs/01.mp4',{headers:{Range:'bytes=128-1151'}}),b=await r.arrayBuffer();return {status:r.status,length:b.byteLength,range:r.headers.get('Content-Range'),bytes:[...new Uint8Array(b)]};});
  const original=fs.readFileSync(path.join(root,'assets/easter-eggs/01.mp4')).subarray(128,1152);
  assert(range.status===206&&range.length===1024&&Buffer.from(range.bytes).equals(original),'offline video range is not byte exact');
  await page.evaluate(()=>startEasterEggs());await page.waitForFunction(()=>document.getElementById('easter-video').currentTime>.1);
  await page.evaluate(()=>document.getElementById('easter-video').currentTime=20);await page.waitForFunction(()=>!document.getElementById('easter-video').seeking&&document.getElementById('easter-video').readyState>=2);
  // A newer timestamp in an older release must not contaminate this release.
  await page.evaluate(async()=>{const version='aaaaaaaaaaaaaaaa',c=await caches.open('jenny-prepared-'+version),url=p=>new URL(p,location.href);await c.put(url('_prepared/ready'),new Response(JSON.stringify({version,release:'19.21',completedAt:Date.now()+100000})));await c.put(url('assets/memories/album/1/001.webp'),new Response('wrong old bytes'));});
  const photoBytes=await page.evaluate(async()=>[...new Uint8Array(await(await fetch('assets/memories/album/1/001.webp')).arrayBuffer())]);
  assert(Buffer.from(photoBytes).equals(fs.readFileSync(path.join(root,'assets/memories/album/1/001.webp'))),'old cache contaminated current photos');
  const fresh=await context.newPage();fresh.on('pageerror',e=>errors.push(e.message));await fresh.goto(url);await fresh.locator('#start-button').click();await fresh.waitForFunction(()=>game.running);
  // Cache eviction must close the gate rather than pretending that data remains.
  await fresh.evaluate(async()=>{const c=await caches.open('jenny-prepared-'+preparedShow.manifest.version);await c.delete(new URL('assets/easter-eggs/01.mp4',location.href));});
  await fresh.reload();await fresh.locator('#start-button').click();await fresh.locator('#prepare-panel').waitFor({state:'visible'});assert(await fresh.evaluate(()=>!game.running),'evicted cache bypassed gate');
  await context.close();
  const denied=await browser.newContext();await denied.addInitScript(()=>{Cache.prototype.put=()=>Promise.reject(new DOMException('Storage full','QuotaExceededError'));});const p=await denied.newPage();await p.goto(url);await p.locator('#prepare-open').click();await p.locator('#prepare-download').click();await p.waitForFunction(()=>!preparedShow.busy);assert(await p.evaluate(()=>!preparedShow.ready&&document.getElementById('prepare-play').hidden),'quota failure pretended to succeed');await denied.close();
  assert(!errors.length,errors.join('\n'));console.log(JSON.stringify({passed:true,partialFilesReused:partial,corruptFileRejected:true,versionIsolation:true,offlineReload:true,freshOfflineTab:true,all61Media:true,originalBytes:true,videoRangeAndSeek:true,evictionGate:true,quotaFailure:true,mobile:true,errors}));
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e.stack);server.close();process.exitCode=1;});
