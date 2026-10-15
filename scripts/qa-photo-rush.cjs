const path=require('node:path');
const {chromium}=require('C:/Users/18731/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
 const assert=(v,m)=>{if(!v)throw Error(m);};
 try {
  await page.goto('http://127.0.0.1:4173/?revision=19.10');
  await page.waitForFunction(()=>Object.keys(images).length===Object.keys(imagePaths).length);
  await page.locator('#dev-jump-toggle').click();
  await page.getByRole('button',{name:'终章 · 旋转蒙太奇',exact:true}).click();
  await page.waitForFunction(()=>direction.photos.length===61);
  await page.waitForFunction(()=>Number.isFinite(direction.ending.music.duration));
  await page.evaluate(()=>{direction.ending.start=direction.now-48001;});
  await page.waitForFunction(()=>direction.ending.media==='blackout');
  await page.evaluate(()=>{direction.ending.musicCancelled=true;direction.ending.music.pause();});
  const black=await page.evaluate(()=>{game.running=false;update=()=>{};draw=()=>{};const e=direction.ending;updateEnding(e.blackoutAt+3999);drawEnding(e.blackoutAt+3999);const c=ctx.getImageData(0,0,960,540).data;return {stage:e.media,black:c.every((v,i)=>i%4===3?v===255:v===0),hud:getComputedStyle(document.querySelector('.hud')).visibility};});
  assert(black.stage==='blackout'&&black.black&&black.hud==='hidden','blackout is not complete or did not hold for 2 seconds');
  await page.screenshot({path:path.resolve('.sites-runtime/qa/rush-blackout.png')});
  await page.evaluate(()=>{const e=direction.ending;updateEnding(e.blackoutAt+4000);drawEnding(e.rushAt+350);});
  const burst=await page.evaluate(()=>({media:direction.ending.media,visible:direction.ending.visiblePhotos,at:direction.ending.blackoutAt,rush:direction.ending.rushAt}));
  assert(burst.media==='photoRush'&&burst.visible===1,'first photo must appear alone: '+JSON.stringify(burst));
  await page.screenshot({path:path.resolve('.sites-runtime/qa/rush-start.png')});
  const samples=await page.evaluate(()=>{const e=direction.ending,result=[];for(let i=0;i<direction.photos.length;i++){drawEnding(e.rushAt+(e.photoBeats[i]+.06)*1000);result.push({index:e.photoIndex,revealed:e.revealedCount,visible:e.visiblePhotos});}return result;});
  assert(samples.every((p,i)=>p.index===i&&p.revealed===i+1&&p.visible<=9),'arrival order or depth trail failed');
  assert(await page.evaluate(()=>{const e=direction.ending,b=e.photoBeats;return b.every((v,i)=>!i||v-b[i-1]>=1.999)&&Math.abs(e.rushSeconds-e.music.duration)<.001;}),'readable music-aligned pacing failed');
  const holds=await page.evaluate(()=>{const e=direction.ending;return e.photoBeats.map((b,i)=>{drawEnding(e.rushAt+(b+1.4)*1000);return e.photoIndex===i;});});
  assert(holds.every(Boolean),'main photograph was replaced before readable hold');
  const videoIndices=await page.evaluate(()=>direction.photos.map((m,i)=>m instanceof HTMLVideoElement?i:-1).filter(i=>i>=0));
  assert(videoIndices.length===2,'new memory clips are missing');
  for(const index of videoIndices){
    await page.evaluate(index=>{const e=direction.ending;drawPhotoRibbon(e.rushAt+(e.photoBeats[index]+.5)*1000);},index);
    await page.waitForFunction(index=>direction.photos[index].currentTime>.2&&!direction.photos[index].paused,index);
    assert(await page.evaluate(index=>direction.photos[index].muted&&direction.photos[index].videoWidth>0,index),'clip is not decoded/muted');
    await page.screenshot({path:path.resolve(`.sites-runtime/qa/memory-video-${index}.png`)});
    await page.evaluate(index=>{const e=direction.ending;drawPhotoRibbon(e.rushAt+(e.photoBeats[index+1]+.5)*1000);},index);
    assert(await page.evaluate(index=>direction.photos[index].paused,index),'past clip keeps playing');
  }
  await page.evaluate(()=>drawEnding(direction.ending.rushAt+direction.ending.rushSeconds*500));
  await page.screenshot({path:path.resolve('.sites-runtime/qa/rush-middle.png')});
  await page.evaluate(()=>{const e=direction.ending;updateEnding(e.rushAt+e.rushSeconds*1000+1);drawEnding(e.birthdayAt);});
  assert(await page.evaluate(()=>direction.ending.media==='birthday'&&direction.ending.photoIndex===direction.photos.length-1),'rush did not finish on final photo');
  await page.screenshot({path:path.resolve('.sites-runtime/qa/rush-finish.png')});
  const music=await page.evaluate(async()=>{
    const e=direction.ending;e.music?.pause();let plays=0,pauses=0,allowed=false;
    e.music={volume:0,currentTime:12,play(){plays++;return allowed?Promise.resolve():Promise.reject(Error('autoplay blocked'));},pause(){pauses++;}};
    e.musicVolume=.65;e.musicStarted=false;e.musicPending=false;e.musicBlocked=false;e.musicCancelled=false;game.soundOn=true;e.media='photoRush';
    syncEndingMusic(e,e.rushAt+750);await new Promise(r=>setTimeout(r,0));
    const fallback=Boolean(document.getElementById('ending-music-resume'));
    allowed=true;document.getElementById('ending-music-resume').click();await new Promise(r=>setTimeout(r,0));
    const playing=e.musicStarted&&!document.getElementById('ending-music-resume'),fade=e.music.volume===.325;
    e.media='video';syncEndingMusic(e,e.rushAt+2000);const paused=pauses>0&&!e.musicStarted;
    clearInteraction();return {fallback,playing,fade,paused,cleaned:e.music.currentTime===0&&e.musicCancelled,plays};
  });
  assert(music.fallback&&music.playing&&music.fade&&music.paused&&music.cleaned,'BGM lifecycle failed: '+JSON.stringify(music));
  await page.evaluate(()=>direction.ending.media='birthday');
  await page.evaluate(()=>clearInteraction());
  assert(await page.evaluate(()=>!document.body.classList.contains('ending-blackout')&&!document.body.classList.contains('ending-rush')),'ending classes leak into replay');
  assert(errors.length===0,errors.join('\n'));
  await page.evaluate(()=>{direction.reduced=true;drawEnding(direction.ending.birthdayAt);});
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:path.resolve('.sites-runtime/qa/rush-mobile.png')});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'mobile overflow');
  console.log(JSON.stringify({passed:true,media:61,blackoutMs:4000,oneByOne:true,depthTrail:true,readableHold:true,bgmLifecycle:true,musicAligned:true,mobile:true}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
