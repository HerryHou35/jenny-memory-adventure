const {chromium}=require('C:/Users/18731/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/?version=19.14');await page.waitForFunction(()=>images.jenny&&images.herry&&images.peanut);
 const result=await page.evaluate(()=>{
  const assert=(v,m)=>{if(!v)throw Error(m);};direction.devPreview=true;update=()=>{};draw=()=>{};
  ['我们的第一次见面','认真学英语的我们','明洞的邂逅'].forEach((copy,i)=>{chapterIntro(i);assert(document.getElementById('intro-title').textContent===copy,'intro '+i);});
  assert(CHAPTERS[0].title==='镜子里的小姚明'&&CHAPTERS[3].title==='第一次约会的蓝','unrequested title changed');
  const lines=fn=>{clearInteraction();fn();return [ui.dialogueText.textContent,...game.dialogueQueue.map(l=>l.text)];};
  game.photoRevealAt=0;assert(lines(closeMirrorPhoto)[2]==='我们站一起还挺合适的。','01-04');
  assert(lines(revealEnglishTruth)[1]==='看似我们在上英语课，其实我眼中没有单词只有你。','02-06');
  showMemoryLetter(2);assert(ui.letterCopy.textContent==='我们都把课上得很认真，尤其认真研究下次什么时候见面。','02-07');
  assert(lines(openMyeongdongBox)[2]==='颜色好适合你呀妈妈。','03-04');
  assert(lines(wearMyeongdongCoat)[1]==='你好漂亮。','03-06');
  showMemoryLetter(3);assert(ui.letterCopy.textContent==='明洞那天，你觉得冷。我把大衣带来给你穿。然后，我们之间多了一颗小小的爱心。','03-11');
  setDailyStreet();game.daily.hairBrushes=2;assert(lines(brushHerryHair)[0]==='好像颜色有点不均匀。','05-08');
  assert(ENDING_COPIES[1]==='study，again，tomorrow。\n认真学英语，也认真找借口了解你。','montage copy changed');
  showMemoryLetter(1);assert(ui.letterTitle.textContent==='镜子里的第一次','film title changed');
  return {introTitles:3,changedLines:7,otherTitlesAndMontageUnchanged:true};
 });if(errors.length)throw Error(errors.join('\n'));console.log(JSON.stringify({passed:true,...result}));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
