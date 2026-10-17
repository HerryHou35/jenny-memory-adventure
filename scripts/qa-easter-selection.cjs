const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('C:/Users/18731/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'../dist');
const server=http.createServer((req,res)=>{
 const file=path.join(root,decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/$/,'/index.html'));
 if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 fs.stat(file,(err,stat)=>{if(err||!stat.isFile()){res.writeHead(404).end();return;}
  const headers={'Content-Type':({'.mp4':'video/mp4','.mp3':'audio/mpeg','.svg':'image/svg+xml','.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.json':'application/json','.ogg':'audio/ogg'}[path.extname(file)])||'application/octet-stream','Accept-Ranges':'bytes'};
  let start=0,end=stat.size-1,status=200;
  if(req.headers.range){const match=/bytes=(\d+)-(\d*)/.exec(req.headers.range);if(!match){res.writeHead(416).end();return;}start=Number(match[1]);end=match[2]?Math.min(end,Number(match[2])):end;if(start>end){res.writeHead(416).end();return;}headers['Content-Range']=`bytes ${start}-${end}/${stat.size}`;status=206;}
  headers['Content-Length']=end-start+1;res.writeHead(status,headers);if(req.method==='HEAD'){res.end();return;}fs.createReadStream(file,{start,end}).pipe(res);
 });
});
(async()=>{await new Promise(r=>server.listen(4178,'127.0.0.1',r));let browser;try{
 browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));const assert=(v,m)=>{if(!v)throw Error(m);};
 await page.goto('http://127.0.0.1:4178/?version=19.19');await page.waitForFunction(()=>Object.keys(images).length===Object.keys(imagePaths).length);
 await page.locator('#start-button').click();await page.evaluate(()=>{direction.devPreview=true;clearInteraction();for(let i=0;i<12;i++)say('花生','连续点击检查 '+i);});
 await page.locator('#dialogue-text').click({clickCount:3});assert(await page.evaluate(()=>!getSelection().toString()&&getComputedStyle(ui.dialogueText).userSelect==='none'),'rapid clicks selected dialogue');
 assert(await page.evaluate(()=>{const range=document.createRange();range.selectNodeContents(ui.dialogueText);const s=getSelection();s.removeAllRanges();s.addRange(range);advanceDialogue();return s.rangeCount===0;}),'stale selection survived next line');
 await page.locator('#dev-jump-toggle').click();await page.getByRole('button',{name:'终章 · Herry 的信',exact:true}).click();await page.waitForFunction(()=>direction.ending.easterClips?.length===4);
 assert(await page.locator('#letter-easter-start').isHidden(),'easter egg spoiled before letter completion');await page.locator('#letter-show-all').click();
 assert(await page.evaluate(()=>{const p=document.querySelector('.birthday-letter-body p');const r=document.createRange();r.selectNodeContents(p);getSelection().addRange(r);const ok=getSelection().toString().includes('时光过得好快');getSelection().removeAllRanges();return ok;}),'letter selection was disabled globally');
 if(await page.evaluate(()=>letterMusic?.paused))await page.locator('#letter-music-toggle').click();await page.waitForFunction(()=>letterMusic&&!letterMusic.paused);
 await page.locator('#letter-easter-start').click();
 const played=[];
 for(let index=0;index<4;index++){
  await page.waitForFunction(i=>easterPlayback.index===i&&document.getElementById('easter-video').readyState>=2&&!document.getElementById('easter-video').paused&&document.getElementById('easter-video').currentTime>.05,index,{timeout:15000});
  const clip=await page.evaluate(()=>({index:easterPlayback.index,src:$('easter-video').src,duration:$('easter-video').duration,width:$('easter-video').videoWidth,height:$('easter-video').videoHeight,muted:$('easter-video').muted,bgmPaused:(!letterMusic||letterMusic.paused)&&pixelMusic.audio.paused&&(!direction.ending.music||direction.ending.music.paused)}));played.push(clip);
  assert(clip.src.endsWith(`/0${index+1}.mp4`)&&clip.duration>30&&clip.width===720&&clip.height===1280&&clip.bgmPaused,'clip decode, order, or audio isolation failed: '+JSON.stringify(clip));
  await page.evaluate(()=>$('easter-video').currentTime=$('easter-video').duration-.12);
  if(index<3){await page.waitForFunction(i=>easterPlayback.index===i,index+1);await page.evaluate(()=>$('easter-video').dispatchEvent(new Event('ended')));assert(await page.evaluate(()=>easterPlayback.index)===index+1,'duplicate ended skipped a clip');}
  else await page.waitForFunction(()=>direction.ending.media==='easterDone');
 }
 assert(await page.locator('#easter-done').isVisible(),'missing closing screen');fs.mkdirSync(path.resolve(__dirname,'../.sites-runtime/qa'),{recursive:true});await page.screenshot({path:path.resolve(__dirname,'../.sites-runtime/qa/19-19-easter-done.png')});await page.locator('#easter-replay').click();await page.waitForFunction(()=>easterPlayback.index===0&&$('easter-video').currentTime>.05);
 await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>{const r=$('easter-video').getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.bottom<=innerHeight&&getComputedStyle($('easter-video')).objectFit==='contain';}),'mobile video cropped or overflowed');
 await page.locator('#easter-back').click();assert(await page.evaluate(()=>$('easter-screen').hidden&&!$('birthday-letter').hidden&&letterWriting.done&&!$('easter-video').getAttribute('src')),'back to letter did not clean playback');
 await page.locator('#letter-easter-start').click();await page.waitForFunction(()=>!$('easter-video').paused);
 await page.evaluate(async()=>{const v=$('easter-video');window.realEasterPlay=v.play;v.play=()=>Promise.reject(Error('test autoplay block'));loadEasterClip(1);await Promise.resolve();await Promise.resolve();});assert(await page.locator('#easter-resume').isVisible(),'missing manual autoplay fallback');
 await page.evaluate(()=>$('easter-video').play=window.realEasterPlay);await page.locator('#easter-resume').click();await page.waitForFunction(()=>!$('easter-video').paused);
 await page.keyboard.press('Escape');assert(await page.locator('#easter-screen').isHidden(),'Escape did not return to letter');
 await page.evaluate(()=>{clearInteraction();});assert(await page.evaluate(()=>$('easter-video').paused&&!$('easter-video').getAttribute('src')&&!$('game-shell').inert),'playback leaked after cleanup');
 assert(!errors.length,errors.join('\n'));console.log(JSON.stringify({passed:true,dialogueSelectionFixed:true,letterCopyable:true,orderedPlayback:played,automaticAdvance:true,replay:true,mobile:true,fallback:true,cleanup:true}));
}finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1;});
