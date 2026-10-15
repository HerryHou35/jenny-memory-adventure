const {chromium}=require('C:/Users/18731/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 try{
  const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/?version=19.12');await page.waitForFunction(()=>images.jenny&&images.herry&&images.peanut);
  await page.locator('#start-button').click();
  const result=await page.evaluate(()=>{
    const check=(v,m)=>{if(!v)throw Error(m);};
    while(!ui.dialogue.hidden)advanceDialogue();
    player.x=player.tx=185;player.y=player.ty=405;game.fade=0;updateNearby();
    for(let i=0;i<20;i++)ui.action.click();
    check(game.stage===1&&game.dialogueQueue.length===1,'rapid clicks repeated collect-key dialogue');
    check(ui.action.hidden&&game.nearby===null,'action remains usable during dialogue');
    const line=ui.dialogueText.textContent;
    for(let i=0;i<20;i++)document.dispatchEvent(new KeyboardEvent('keydown',{key:' ',repeat:true,bubbles:true}));
    check(ui.dialogueText.textContent===line&&game.dialogueQueue.length===1,'held space repeats dialogue/action');
    while(!ui.dialogue.hidden)advanceDialogue();clearInteraction();
    let callbacks=0;const done=()=>callbacks++;
    for(let i=0;i<20;i++)sayMany([['花生','同一条开场提示','🐶'],['花生','同一条结束提示','🐶']],done);
    check(game.dialogueQueue.length===1,'duplicate lines accumulated in queue');
    advanceDialogue();advanceDialogue();check(callbacks===1&&ui.dialogue.hidden,'callback should finish once');
    sayMany([['花生','同一条开场提示','🐶'],['花生','同一条结束提示','🐶']],done);
    check(!ui.dialogue.hidden,'intentional replay was suppressed');advanceDialogue();advanceDialogue();check(callbacks===2,'replay callback missing');
    say('花生','外层结束','🐶',()=>sayMany([['花生','新段第一句','🐶'],['Herry','新段第二句','👦']]));
    advanceDialogue();check(ui.dialogueText.textContent==='新段第一句','callback skips first new line');
    advanceDialogue();check(ui.dialogueText.textContent==='新段第二句','new conversation order broken');advanceDialogue();
    clearInteraction();game.stage=10;game.scene='hongdae';let fires=0;game.nearby={action:()=>fires++};ui.action.hidden=false;
    for(let i=0;i<20;i++)ui.action.click();check(fires===1,'rapid click repeats no-dialogue action');
    return {rapidClick:true,heldSpace:true,queueDedup:true,callbacksOnce:true,replay:true,nestedConversation:true};
  });
  if(errors.length)throw Error(errors.join('\n'));console.log(JSON.stringify({passed:true,...result}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
