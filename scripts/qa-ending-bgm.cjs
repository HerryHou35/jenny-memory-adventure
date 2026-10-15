const {chromium}=require('C:/Users/18731/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 try{
  const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/?version=19.10');
  await page.waitForFunction(()=>images.jenny&&images.herry&&images.peanut);
  await page.locator('#dev-jump-toggle').click();
  await page.getByRole('button',{name:'真人照片 · 漂浮回忆',exact:true}).click();
  await page.waitForFunction(()=>direction.ending?.music?.readyState>=2);
  await page.waitForFunction(()=>direction.ending?.media==='photoRush');
  if(await page.locator('#ending-music-resume').isVisible())await page.locator('#ending-music-resume').click();
  await page.waitForFunction(()=>direction.ending.music.currentTime>.5&&!direction.ending.music.paused);
  const result=await page.evaluate(()=>{const e=direction.ending,m=e.music;return {src:m.src,duration:m.duration,currentTime:m.currentTime,volume:m.volume,failed:!!m.error,photos:direction.photos.length};});
  if(result.failed||!Number.isFinite(result.duration)||errors.length)throw Error(JSON.stringify({result,errors}));
  if(!await page.evaluate(()=>Math.abs(direction.ending.rushSeconds-direction.ending.music.duration)<.001&&!direction.ending.music.loop))throw Error('timeline does not match one music play');
  // Local static preview does not advertise byte ranges, so OGG seeking can
  // clamp to zero. Accelerate real decoding instead of faking an ended event.
  await page.evaluate(()=>direction.ending.music.playbackRate=16);
  try{await page.waitForFunction(()=>direction.ending.media==='birthday'&&direction.ending.musicFinished,null,{timeout:20000});}
  catch(error){const state=await page.evaluate(()=>({media:direction.ending.media,finished:direction.ending.musicFinished,time:direction.ending.music.currentTime,duration:direction.ending.music.duration,paused:direction.ending.music.paused,state:direction.ending.music.readyState,rush:direction.ending.rushSeconds}));throw Error(JSON.stringify(state));}
  if(!await page.evaluate(()=>direction.ending.photoIndex===direction.photos.length-1))throw Error('music ended before final memory');
  await page.evaluate(()=>clearInteraction());
  if(!await page.evaluate(()=>direction.ending.music.paused&&direction.ending.music.currentTime===0))throw Error('music continues after leaving ending');
  console.log(JSON.stringify({passed:true,...result,musicAndMemoriesFinishTogether:true,stoppedOnExit:true}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
