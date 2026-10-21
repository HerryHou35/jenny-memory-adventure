const {chromium}=require('C:/Users/18731/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 try{
  const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/?version=19.11');
  await page.waitForFunction(()=>images.jenny&&images.herry&&images.peanut);
  if(!await page.evaluate(()=>pixelMusic.audio.paused))throw Error('cover autoplay');
  await require("./qa-prepare-helper.cjs")(page);await page.locator('#start-button').click();await page.waitForFunction(()=>game.running);
  if(await page.locator('#pixel-music-resume').isVisible())await page.locator('#pixel-music-resume').click();
  await page.waitForFunction(()=>pixelMusic.audio.currentTime>.3&&!pixelMusic.audio.paused);
  const duration=await page.evaluate(()=>pixelMusic.audio.duration);
  await page.locator('#sound-button').click();
  if(!await page.evaluate(()=>pixelMusic.audio.paused))throw Error('mute does not pause pixel music');
  await page.locator('#sound-button').click();
  await page.waitForFunction(()=>!pixelMusic.audio.paused);
  await page.locator('#dev-jump-toggle').click();await page.getByRole('button',{name:'假英语课堂',exact:true}).click();
  await page.waitForFunction(()=>game.scene==='english'&&!pixelMusic.audio.paused);
  await page.locator('#dev-jump-toggle').click();await page.getByRole('button',{name:'终章 · 旋转蒙太奇',exact:true}).click();
  await page.waitForFunction(()=>direction.photos.length===61);
  await page.evaluate(()=>direction.ending.start=direction.now-47000);
  await page.waitForFunction(()=>pixelMusic.audio.volume<.15&&!pixelMusic.audio.paused);
  await page.evaluate(()=>direction.ending.start=direction.now-48001);
  await page.waitForFunction(()=>direction.ending.media==='blackout'&&pixelMusic.audio.paused);
  await page.waitForFunction(()=>direction.ending.media==='photoRush'&&direction.ending.music.currentTime>.2);
  if(!await page.evaluate(()=>pixelMusic.audio.paused&&!direction.ending.music.paused))throw Error('tracks overlap');
  await page.locator('#dev-jump-toggle').click();await page.getByRole('button',{name:'放映室',exact:true}).click();
  await page.waitForFunction(()=>game.scene==='projector'&&!pixelMusic.audio.paused);
  if(errors.length)throw Error(errors.join('\n'));
  console.log(JSON.stringify({passed:true,pixelDuration:duration,muting:true,chapters:true,fadeOut:true,noOverlap:true,replay:true}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
