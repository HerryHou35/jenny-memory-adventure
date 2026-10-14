/* A small direction layer: chapter mechanics live in app.js; staging, replay,
   the film archive and the ending share one clock and one saved experience. */
const CHAPTERS = [
  { key:'memoryOne', title:'镜子里的小姚明', place:'HONGDAE · SEOUL', scene:'hongdae', enter:setHongdae, ink:'#88c8bd' },
  { key:'memoryTwo', title:'最认真的假英语课', place:'STUDY, AGAIN, TOMORROW', scene:'english', enter:setEnglishClass, ink:'#e0c989' },
  { key:'memoryThree', title:'明洞的静电事故', place:'MYEONGDONG · A PINK COAT', scene:'myeongdong', enter:setMyeongdong, ink:'#e7abb9' },
  { key:'memoryFour', title:'第一次约会的蓝', place:'OUR FIRST DATE · AQUARIUM', scene:'aquarium', enter:setAquarium, ink:'#87cadc' },
  { key:'memoryFive', title:'日常里的每个一等奖', place:'SEOUL · LITTLE THINGS', scene:'daily', enter:setDailyStreet, ink:'#e5c271' },
  { key:'memorySix', title:'很普通，很喜欢', place:'COFFEE, BASKETBALL & US', scene:'campus', enter:setCampusCafe, ink:'#a6c4a2' },
  { key:'memorySeven', title:'九点后的晚餐', place:'SHENZHEN · COMING HOME', scene:'shenzhen', enter:setShenzhenMarket, ink:'#dea975' },
  { key:'memoryEight', title:'再送你回去一次', place:'KAU · THE WAY BACK', scene:'hangdae', enter:setHangdaeStation, ink:'#acc1df' }
];
const $ = id => document.getElementById(id);
const storage = {
  get(key,fallback=null) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } },
  set(key,value) { try { localStorage.setItem(key,JSON.stringify(value)); } catch { toast('这台设备的存储已满，游戏仍可继续'); } },
  remove(key) { try { localStorage.removeItem(key); } catch {} }
};
const direction = {
  now:0, introUntil:0, toastUntil:0, ruler:false, hiddenTaps:0,
  restoredAt:0, chapterIndex:-1, lastScene:'', lastStage:-1,
  captures:storage.get('jenny-films-v19',{}), captureImages:{},
  reduced:storage.get('jenny-reduced-motion',matchMedia('(prefers-reduced-motion: reduce)').matches),
  photos:[], ending:null, lastCheckpoint:'', journalAt:0, audio:null,
  nextTone:0, pointer:null, runtimeTime:performance.now()
};
for(const [key,data] of Object.entries(direction.captures))loadCapture(key,data);
for(const src of ['assets/memories/together-01.jpg','assets/memories/together-02.jpg','assets/memories/together-03.jpg']){
  const img=new Image();img.onload=()=>direction.photos.push(img);img.src=src;
}
document.body.classList.toggle('reduce-motion',direction.reduced);
$('motion-button').setAttribute('aria-pressed',String(direction.reduced));
function toast(copy){$('toast').textContent=copy;$('toast').hidden=false;direction.toastUntil=direction.now+2100;}
function loadCapture(key,data){const img=new Image();img.onload=()=>direction.captureImages[key]=img;img.src=data;}
function blocked(){return !game.running||game.fade>0||!ui.dialogue.hidden||!ui.letterPanel.hidden||!ui.ringPanel.hidden||!ui.photoControls.hidden||direction.ruler||direction.introUntil>direction.now||game.photoOpen;}
function currentChapter(){return CHAPTERS.findIndex(c=>c.scene===game.scene);}
function clearInteraction(){game.keys.clear();game.nearby=null;game.dialogueQueue=[];game.dialogueCallback=null;game.photoOpen=false;direction.ruler=false;$('ruler-controls').hidden=true;ui.dialogue.hidden=true;ui.action.hidden=true;ui.ringPanel.hidden=true;ui.letterPanel.hidden=true;ui.photoControls.hidden=true;player.moving=false;herry.moving=false;peanut.moving=false;}
function chapterIntro(index){const c=CHAPTERS[index];direction.chapterIndex=index;direction.introUntil=direction.now+(direction.reduced?900:2400);$('intro-number').textContent=`MEMORY ${String(index+1).padStart(2,'0')} / 08`;$('intro-title').textContent=c.title;$('intro-place').textContent=c.place;$('chapter-intro').hidden=false;$('chapter-intro').style.animation='none';void $('chapter-intro').offsetWidth;$('chapter-intro').style.animation='';}
function enterChapter(index){clearInteraction();player.speed=185;CHAPTERS[index].enter();chapterIntro(index);sound('enter');}
const originalTransition=transitionTo;
transitionTo=function(callback){game.keys.clear();player.tx=player.x;player.ty=player.y;ui.action.hidden=true;originalTransition(()=>{callback();player.moving=false;herry.frame=1;const index=currentChapter();if(index>=0&&direction.chapterIndex!==index)chapterIntro(index);if(game.scene==='projector')direction.chapterIndex=-1;if(game.scene!=='hangdae'&&game.scene!=='ending'){$('cinema-caption').hidden=true;ui.play.classList.remove('cinematic');}});};
const originalStart=startGame;
startGame=function(continueSaved=false){
  const checkpoint=continueSaved?storage.get('jenny-checkpoint-v19'):null;
  if(!continueSaved){storage.remove('jenny-checkpoint-v19');storage.remove('jenny-films-v19');direction.captures={};direction.captureImages={};direction.ending=null;}
  clearInteraction();direction.chapterIndex=-1;direction.ending=null;$('birthday-video').pause();$('birthday-video').hidden=true;$('video-resume').hidden=true;$('cinema-caption').hidden=true;ui.play.classList.remove('cinematic');
  originalStart(continueSaved);unlockAudio();
  if(checkpoint&&continueSaved&&CHAPTERS[checkpoint.chapter]&&!game[CHAPTERS[checkpoint.chapter].key])restoreCheckpoint(checkpoint);
};
function requestRestart(){$('restart-panel').hidden=false;game.keys.clear();player.tx=player.x;player.ty=player.y;}
$('restart-cancel').onclick=()=>{$('restart-panel').hidden=true;};
$('restart-confirm').onclick=()=>{$('restart-panel').hidden=true;startGame(false);};
$('home-button').onclick=()=>{if(!game.running||game.scene==='ending')return;saveCheckpoint();clearInteraction();transitionTo(()=>setProjectorRoom(true));};
$('motion-button').onclick=()=>{direction.reduced=!direction.reduced;document.body.classList.toggle('reduce-motion',direction.reduced);$('motion-button').setAttribute('aria-pressed',String(direction.reduced));storage.set('jenny-reduced-motion',direction.reduced);toast(direction.reduced?'已减少光效与镜头移动':'已恢复完整光效');};
const originalObjective=updateObjective;
updateObjective=function(){originalObjective();if(game.scene==='projector'&&game.memoryEight)ui.objective.textContent='胶片已完整 · 走近放映机，放映我们的故事';syncInventory();if(game.running)saveCheckpoint();};
const stableStages=new Set([10,11,12,20,21,22,23,24,25,26,27,30,31,32,33,40,41,42,43,46,50,60,62,63,66,67,69,81,82,83,85,91,92,93,94,95]);
function saveCheckpoint(){const chapter=currentChapter();if(chapter<0||!stableStages.has(game.stage)||game[CHAPTERS[chapter].key])return;const stamp=JSON.stringify([game.scene,game.stage,game.daily?dailyFoundCount():0,game.daily?.hairBrushes,game.daily?.kittyStarted,game.campus?.laptops,game.campus?.books,game.campus?.drinks,game.campus?.rounds,game.shenzhen?.selected.length,game.shenzhen?.plates.length,game.shenzhen?.carrying?.index]);if(stamp===direction.lastCheckpoint)return;direction.lastCheckpoint=stamp;storage.set('jenny-checkpoint-v19',{chapter,scene:game.scene,stage:game.stage,player:{x:player.x,y:player.y},herry:{x:herry.x,y:herry.y},daily:game.daily,campus:game.campus,shenzhen:game.shenzhen,hangdae:game.hangdae,pose:game.photoPose});}
function restoreCheckpoint(cp){clearInteraction();CHAPTERS[cp.chapter].enter();clearInteraction();game.scene=cp.scene;game.stage=cp.stage;game.daily=cp.daily;game.campus=cp.campus;game.shenzhen=cp.shenzhen;game.hangdae=cp.hangdae;game.photoPose=cp.pose||game.photoPose;player.x=player.tx=cp.player.x;player.y=player.ty=cp.player.y;herry.x=cp.herry.x;herry.y=cp.herry.y;peanut.x=player.x-62;peanut.y=player.y+15;seedPeanutTrail();player.speed=game.scene==='hangdae'&&game.hangdae?.area==='road'?82:185;if(game.scene==='campus'&&game.stage===66&&game.campus.ball){Object.assign(game.campus.ball,{mode:'waiting',x:320,y:426});}direction.chapterIndex=cp.chapter;direction.lastCheckpoint='';updateObjective();toast('从刚才走到的地方继续');}
const originalLetter=showMemoryLetter;
showMemoryLetter=function(number){
  if(number===1&&direction.mirrorData)direction.captures[number]=direction.mirrorData;
  else if(number===6&&direction.boothData)direction.captures[number]=direction.boothData;
  else if(number===4&&game.aquariumPhotoData){direction.captures[number]=game.aquariumPhotoData;}
  else {draw(direction.now);const shot=document.createElement('canvas');shot.width=640;shot.height=360;shot.getContext('2d').drawImage(canvas,0,0,640,360);direction.captures[number]=shot.toDataURL('image/jpeg',.72);}
  loadCapture(number,direction.captures[number]);storage.set('jenny-films-v19',direction.captures);storage.remove('jenny-checkpoint-v19');direction.lastCheckpoint='';originalLetter(number);direction.restoredAt=direction.now;sound('film');
  const shortLetters=[
    '第一次见你时，我已经在镜子里偷偷练习，怎样站在你身边。',
    '我们都把课上得很认真，尤其认真研究明天什么时候再见。',
    '浅粉色大衣穿上了，两个人中间也真的闪了一下。花生坚持认为：这不是静电，是证据。',
    '那天海洋馆里有很多鱼，但我一直在看站在身边的你。',
    '你抽中过一等奖，而我抽中了和你一起胡闹的每一天。',
    '我后来才明白，幸福经常只是你在旁边，而我们各自认真做着很普通的事。',
    '我记住一顿饭，从来不是因为它贵，而是因为坐在我对面的人是你。',
    '我一次次站在这里看你回去，也一次次在心里做同一个决定：以后一定要和你永远在一起，不分离。'
  ];ui.letterCopy.textContent=shortLetters[number-1];ui.letterPanel.setAttribute('aria-label',`第${number}张回忆胶片`);
};
const originalMirror=mirrorMoment;
mirrorMoment=function(){player.x=player.tx=753;player.y=player.ty=410;herry.x=691;herry.y=410;herry.dir=0;player.dir=0;peanut.x=620;peanut.y=437;direction.ruler=true;direction.hiddenTaps=0;game.nearby=null;ui.action.hidden=true;$('ruler-controls').hidden=false;$('height-ruler').value=230;$('mirror-shutter').hidden=true;toast('188 和 178，原来只差十厘米');};
$('height-ruler').oninput=()=>{const v=Number($('height-ruler').value);herry.tiptoe=Math.max(0,(v-188)/42);$('mirror-shutter').hidden=v>190;};
$('mirror-shutter').onclick=()=>{direction.ruler=false;$('ruler-controls').hidden=true;originalMirror();};
takeEnglishCard=function(word){game.stage+=1;updateObjective();toast(`拿起 ${word} · 可以拖到日历上`);sound('paper');};
placeEnglishCard=function(word){if(![21,23,25].includes(game.stage))return;game.stage+=1;updateObjective();direction.restoredAt=direction.now;toast(game.stage===26?'一周都圈满了。是上课，还是想见面？':'日历上又多了一次见面');sound('paper');};
revealEnglishTruth=function(){game.stage=27;peanut.x=480;peanut.y=330;updateObjective();sayMany([['花生','English lesson？擦掉，应该是……想见宝宝。','🐶'],['Herry','这门课好像被拆穿了。','👦']]);};
const originalHair=brushHerryHair;
brushHerryHair=function(){originalHair();if(game.daily.hair){direction.restoredAt=direction.now;sound('film');}};
const originalCloseMirror=closeMirrorPhoto;
closeMirrorPhoto=function(){if(direction.now<game.photoRevealAt)return;const shot=document.createElement('canvas');shot.width=640;shot.height=460;shot.getContext('2d').drawImage(canvas,186,56,588,428,0,0,640,460);direction.mirrorData=shot.toDataURL('image/jpeg',.82);originalCloseMirror();};
moveAquariumPose=function(action){if(game.stage!==44)return;const p=game.photoPose;if(action==='jenny-left')p.jennyX-=12;if(action==='jenny-right')p.jennyX+=12;if(action==='herry-left')p.herryX-=12;if(action==='herry-right')p.herryX+=12;p.jennyX=Math.max(345,Math.min(490,p.jennyX));p.herryX=Math.max(p.jennyX+46,Math.min(620,p.herryX));};
takeAquariumPhoto=function(){draw(direction.now);const photo=document.createElement('canvas');photo.width=720;photo.height=680;const c=photo.getContext('2d');c.fillStyle='#fff6df';c.fillRect(0,0,720,680);c.imageSmoothingEnabled=false;c.drawImage(canvas,305,92,360,302,32,32,656,550);c.fillStyle='#31535b';c.font='bold 24px sans-serif';c.textAlign='center';c.fillText('第一次约会 · 蓝色海洋馆',360,628);c.font='13px Arial';c.fillText('JENNY + HERRY + PEANUT',360,654);game.aquariumPhotoData=photo.toDataURL('image/png');game.stage=45;game.cameraFlashUntil=direction.now+360;playShutter();updateObjective();ui.aquariumShutter.hidden=true;ui.aquariumDownload.hidden=false;ui.aquariumPhotoDone.hidden=false;};
const originalSpark=sparkHeartMoment;
sparkHeartMoment=function(){herry.x=690;herry.y=420;originalSpark();player.dir=2;herry.dir=1;player.frame=herry.frame=1;};
const originalBooth=startPhotoBooth;
startPhotoBooth=function(){direction.boothData=null;originalBooth();};
chooseShenzhenFood=function(index){const s=game.shenzhen;if(game.stage!==81||s.selected.length>=3||s.selected.some(i=>i.index===index))return;const food=s.foods[index];s.selected.push({...food,index});if(s.selected.length===3)game.stage=82;updateObjective();toast(`${food.name}放进车里了 · ${s.selected.length}/3`);sound('paper');};
function syncInventory(){const items=[];if(game.scene==='projector'&&game.stage===1)items.push('旧发条');if(game.scene==='english'&&[21,23,25].includes(game.stage))items.push(game.stage===21?'study':game.stage===23?'again':'tomorrow');if(game.scene==='aquarium'){if(game.stage>=41&&game.stage<=43)items.push('相机');if(game.stage>=42&&game.stage<=43)items.push('相机带');if(game.stage===43)items.push('海蓝色贴纸');}if(game.scene==='shenzhen'&&game.shenzhen?.carrying)items.push(game.shenzhen.carrying.name);if(game.scene==='hangdae'&&game.stage===92)items.push('第八片花瓣');const box=$('inventory');if(box.dataset.items===items.join('|'))return;box.dataset.items=items.join('|');box.replaceChildren();box.hidden=!items.length;items.forEach(item=>{const b=document.createElement('button');b.textContent=item;b.type='button';box.appendChild(b);if(game.scene==='english')wireCardDrag(b,item);});}
function wireCardDrag(button,word){button.onpointerdown=e=>{e.preventDefault();button.setPointerCapture(e.pointerId);const ghost=document.createElement('div');ghost.className='drag-ghost';ghost.textContent=word;document.body.appendChild(ghost);const move=ev=>{ghost.style.left=ev.clientX+'px';ghost.style.top=ev.clientY+'px';};move(e);button.onpointermove=move;button.onpointerup=ev=>{const p=worldPoint(ev);ghost.remove();button.onpointermove=null;button.onpointerup=null;if(p.x>738&&p.x<930&&p.y>35&&p.y<292)placeEnglishCard(word);else toast('把卡片拖到右边的一周日历');};button.onpointercancel=()=>ghost.remove();};}
function stopWalk(){player.tx=player.x;player.ty=player.y;game.keys.clear();player.moving=false;}
function pixelGlow(x,y,r,color,alpha=.2){const g=ctx.createRadialGradient(x,y,1,x,y,r);g.addColorStop(0,color+Math.round(alpha*255).toString(16).padStart(2,'0'));g.addColorStop(1,color+'00');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);}
function frameImage(img,x,y,w,h,cover=true){if(!img?.complete||!img.naturalWidth)return;const scale=cover?Math.max(w/img.width,h/img.height):Math.min(w/img.width,h/img.height);ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();ctx.drawImage(img,x+(w-img.width*scale)/2,y+(h-img.height*scale)/2,img.width*scale,img.height*scale);ctx.restore();}
const filmRects=CHAPTERS.map((_,i)=>({x:i<4?42+(i%2)*115:708+(i%2)*115,y:70+Math.floor((i%4)/2)*106,w:95,h:76}));
drawProjectorRoom=function(time){
  ctx.fillStyle='#10232c';ctx.fillRect(0,0,960,540);ctx.fillStyle='#173640';ctx.fillRect(0,0,960,290);
  for(let x=0;x<960;x+=96){ctx.fillStyle=x%192?'#1a3d44':'#18373e';ctx.fillRect(x+3,0,90,289);}
  ctx.fillStyle='#355350';ctx.fillRect(0,290,960,250);ctx.strokeStyle='#243f40';ctx.lineWidth=1;for(let y=310;y<540;y+=36){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(960,y);ctx.stroke();}for(let x=-300;x<1300;x+=90){ctx.beginPath();ctx.moveTo(480,290);ctx.lineTo(x,540);ctx.stroke();}
  ctx.fillStyle='#091a22';ctx.fillRect(312,45,336,205);ctx.strokeStyle='#679c89';ctx.lineWidth=5;ctx.strokeRect(312,45,336,205);
  const count=CHAPTERS.filter(c=>game[c.key]).length;pixelGlow(480,145,200,'#e9d59e',game.stage>=2?.12:.025);
  ctx.textAlign='center';ctx.fillStyle='#d9d3b7';ctx.font='17px sans-serif';ctx.fillText(count===8?'所有路，最后都走向你。':'有些日子，想和你再过一遍。',480,125);ctx.fillStyle='#8eb8a5';ctx.font='10px Arial';ctx.fillText('A FILM BY HERRY · FOR JENNY',480,154);
  for(let i=0;i<8;i++){ctx.fillStyle=game[CHAPTERS[i].key]?CHAPTERS[i].ink:'#2c474b';ctx.fillRect(383+i*25,185,17,23);ctx.fillStyle='#122830';ctx.fillRect(385+i*25,188,3,4);ctx.fillRect(385+i*25,201,3,4);}
  filmRects.forEach((r,i)=>{const unlocked=game[CHAPTERS[i].key];ctx.fillStyle='#1b292e';ctx.fillRect(r.x-4,r.y-4,r.w+8,r.h+23);ctx.fillStyle=unlocked?'#d9caa2':'#435353';ctx.fillRect(r.x,r.y,r.w,r.h);if(unlocked){frameImage(direction.captureImages[i+1]||direction.photos[i%direction.photos.length],r.x+3,r.y+3,r.w-6,r.h-6);ctx.fillStyle=CHAPTERS[i].ink;}else{ctx.fillStyle='#263f46';ctx.fillRect(r.x+3,r.y+3,r.w-6,r.h-6);ctx.fillStyle='#657e7c';}ctx.textAlign='center';ctx.font='bold 10px Arial';ctx.fillText(String(i+1).padStart(2,'0'),r.x+r.w/2,r.y+r.h/2+4);ctx.fillStyle=unlocked?'#d3d2b5':'#6d8281';ctx.font='9px sans-serif';ctx.fillText(CHAPTERS[i].title.slice(0,9),r.x+r.w/2,r.y+r.h+14);});
  if(game.stage>=2){ctx.fillStyle='#ffe8a614';ctx.beginPath();ctx.moveTo(480,283);ctx.lineTo(312,74);ctx.lineTo(648,74);ctx.closePath();ctx.fill();}
  drawProjector(game.stage>=2);for(let i=0;i<8;i++){ctx.fillStyle=game[CHAPTERS[i].key]?CHAPTERS[i].ink:'#273c3f';ctx.fillRect(439+i*11,273,7,4);}
  for(const x of [56,197,338,620,761,902]){ctx.drawImage(images.chairBack,x-35,335,70,70);}
  if(game.stage===0)drawKey();const portals={2:drawPortal,4:drawEnglishPortal,6:drawMyeongdongPortal,8:drawAquariumPortal,10:drawDailyPortal,11:drawCampusPortal,12:drawShenzhenPortal,14:drawHangdaePortal};if(portals[game.stage])portals[game.stage](time);
  ctx.fillStyle='#7caaa0';ctx.font='10px sans-serif';ctx.textAlign='left';ctx.fillText(count?'点墙上的胶片，可以再走进那一天':'每找回一张胶片，这里就多亮一盏灯',25,514);
  if(count===8){pixelGlow(480,268,60,'#f7dc8c',.22);ctx.fillStyle='#f7e2ad';ctx.font='bold 13px sans-serif';ctx.textAlign='center';ctx.fillText('放映我们的故事',480,310);}
};
const oldEnglish=drawEnglishClass;
drawEnglishClass=function(time){oldEnglish(time);ctx.save();ctx.fillStyle='#f3e6c9';ctx.fillRect(743,42,182,248);ctx.strokeStyle='#8f7453';ctx.lineWidth=5;ctx.strokeRect(743,42,182,248);ctx.fillStyle='#35554f';ctx.textAlign='center';ctx.font='bold 16px Arial';ctx.fillText('THIS WEEK',834,72);const filled=game.stage>=26?7:game.stage>=24?4:game.stage>=22?2:0;const days=['MON','TUE','WED','THU','FRI','SAT','SUN'];for(let i=0;i<7;i++){const y=90+i*26;ctx.fillStyle='#e4d7ba';ctx.fillRect(755,y,158,23);ctx.fillStyle='#657168';ctx.font='bold 10px Arial';ctx.textAlign='left';ctx.fillText(days[i],763,y+15);if(i<filled){ctx.strokeStyle='#d77987';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(871,y+12,30,10,-.05,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#b35a6b';ctx.font='10px sans-serif';ctx.fillText('见宝宝',850,y+15);}}ctx.restore();};
// Use the 188:178 ratio at every scale, including photos and tiny cutscenes.
const oldSprite=drawSprite;
let spriteQueue=null;
drawSprite=function(image,entity,width,height,yOffset=0){
  if(spriteQueue&&[player,herry,peanut].includes(entity)){spriteQueue.push({image,entity:{...entity},original:entity,width,height,yOffset});return;}
  if((image===images.herry||image===images.herryYellow)&&width===80)height=129;
  ctx.save();if(entity===player||entity===herry||entity===peanut){ctx.fillStyle='#07131c40';ctx.beginPath();ctx.ellipse(entity.x,entity.y-2,width*.25,5,0,0,Math.PI*2);ctx.fill();}oldSprite(image,entity,width,height,yOffset);ctx.restore();
};
const oldPinkCoat=drawPinkSkiCoat;
drawPinkSkiCoat=function(entity,alpha=1){if(spriteQueue){spriteQueue.push({coat:true,entity:{...entity},original:entity,alpha});return;}ctx.save();ctx.globalAlpha=alpha;ctx.translate(entity.x,entity.y);const dir=entity.dir;ctx.fillStyle='#f1b1c5';ctx.beginPath();ctx.moveTo(-12,-84);ctx.lineTo(-22,-74);ctx.lineTo(-24,-18);ctx.lineTo(24,-18);ctx.lineTo(22,-74);ctx.lineTo(12,-84);ctx.closePath();ctx.fill();ctx.fillStyle='#ffd6df';ctx.fillRect(-16,-76,32,9);ctx.fillStyle='#c8809d';ctx.fillRect(-20,-45,40,2);ctx.fillRect(-20,-28,40,2);ctx.fillStyle='#ffe4e8';if(dir!==3){ctx.fillRect(dir===1?-10:dir===2?8:-1,-72,3,51);ctx.fillRect(-17,-36,10,3);ctx.fillRect(8,-36,10,3);}ctx.fillStyle='#e9a4ba';ctx.fillRect(-28,-70,9,42);ctx.fillRect(20,-70,9,42);ctx.restore();};
const oldJacket=drawCoupleJacket;
drawCoupleJacket=function(entity,scale=1){if(spriteQueue&&[player,herry].includes(entity)){spriteQueue.push({jacket:true,entity:{...entity},original:entity,scale});return;}oldJacket(entity,scale);};
const oldDraw=draw;
draw=function(time){
  if(game.scene==='ending'){drawEnding(time);return;}
  // Capture character draws and render them together, in ground-depth order.
  spriteQueue=[];oldDraw(time);const queue=spriteQueue;spriteQueue=null;
  if(game.scene==='hangdae'&&game.hangdae?.area==='road'&&game.stage===96&&!game.hangdae.jennyEntered)queue.push({image:images.jenny,entity:{...player},original:player,width:70,height:122,yOffset:0});
  if(direction.ruler)queue.push({image:images.herry,entity:{...herry},original:herry,width:80,height:129,yOffset:0});
  const cinema=game.photoOpen||game.scene==='campus'&&game.stage===68;
  if(!cinema){queue.filter(x=>!x.coat&&!x.jacket).sort((a,b)=>a.entity.y-b.entity.y).forEach(item=>{ctx.save();if(game.scene==='hangdae'&&item.original===player&&game.stage===96)ctx.globalAlpha=Math.max(0,1-(time-game.hangdae.dormStart)/1900);drawSprite(item.image,item.entity,item.width,item.height,item.yOffset);queue.filter(q=>(q.coat||q.jacket)&&q.original===item.original).forEach(q=>q.coat?drawPinkSkiCoat(q.entity,q.alpha):drawCoupleJacket(q.entity,q.scale));ctx.restore();});}
  if(game.scene==='hongdae'){drawShoeWall();if(direction.ruler)drawHeightRuler(time);}
  if(game.scene==='daily')drawJournal(time);
  if(game.scene==='hangdae'&&game.hangdae?.area==='station')drawHeldBouquet(time);
  if(game.scene==='myeongdong'){drawSparkHeart(time);if(game.stage===33&&time-game.sparkStartedAt<2500){ctx.save();ctx.translate(peanut.x,peanut.y-47);ctx.fillStyle='#fff0a4';for(let i=0;i<8;i++){const a=i*Math.PI/4;ctx.fillRect(Math.cos(a)*32,Math.sin(a)*26,3,8);}ctx.restore();}}
  if(game.photoOpen)drawMirrorPhoto(time);
  drawAtmosphere(time);drawInteractionHints(time);
  if(game.fade>0){ctx.fillStyle=`rgba(8,22,30,${Math.min(1,game.fade)})`;ctx.fillRect(0,0,960,540);}
  if(time<game.cameraFlashUntil){ctx.fillStyle=`rgba(255,255,255,${Math.min(1,(game.cameraFlashUntil-time)/180)})`;ctx.fillRect(0,0,960,540);}
  if(game.scene==='campus'&&game.stage===68&&time-game.campus.photoStart>4200&&!direction.boothData){const photo=document.createElement('canvas');photo.width=640;photo.height=600;photo.getContext('2d').drawImage(canvas,215,25,530,490,0,0,640,600);direction.boothData=photo.toDataURL('image/jpeg',.82);}
};
function drawShoeWall(){ctx.save();ctx.fillStyle='#1c3540';ctx.fillRect(300,65,288,155);ctx.strokeStyle='#64838a';ctx.lineWidth=2;for(let row=0;row<3;row++){const y=98+row*45;ctx.beginPath();ctx.moveTo(310,y+20);ctx.lineTo(578,y+20);ctx.stroke();for(let col=0;col<5;col++){const x=317+col*53;ctx.fillStyle=['#dddbcd','#a5c9be','#dfb183'][(row+col)%3];ctx.beginPath();ctx.moveTo(x,y-3);ctx.lineTo(x+13,y+4);ctx.lineTo(x+28,y+7);ctx.lineTo(x+30,y+14);ctx.lineTo(x,y+14);ctx.closePath();ctx.fill();ctx.fillStyle='#24434e';for(let k=0;k<3;k++)ctx.fillRect(x+9+k*5,y+5,3,6);}}ctx.restore();}
const originalMyeongdongDraw=drawMyeongdong;
drawMyeongdong=function(time){originalMyeongdongDraw(time);ctx.save();for(let i=0;i<4;i++){const x=105+i*73,y=136;ctx.fillStyle=['#71b5c7','#cda365','#d987a4','#89bea1'][i];ctx.beginPath();ctx.moveTo(x-11,y);ctx.lineTo(x-23,y+14);ctx.lineTo(x-19,y+26);ctx.lineTo(x-13,y+20);ctx.lineTo(x-13,y+57);ctx.lineTo(x+13,y+57);ctx.lineTo(x+13,y+20);ctx.lineTo(x+19,y+26);ctx.lineTo(x+23,y+14);ctx.lineTo(x+11,y);ctx.closePath();ctx.fill();ctx.fillStyle='#eee7c566';ctx.fillRect(x-1,y+6,2,50);}ctx.fillStyle='#efc99a';ctx.fillRect(15,68,7,230);ctx.fillRect(445,68,7,230);pixelGlow(28,248,100,'#f3bf91',.1);pixelGlow(435,248,100,'#f3bf91',.1);ctx.fillStyle='#213643';ctx.fillRect(60,291,222,8);ctx.fillStyle='#f9d987';ctx.font='bold 11px sans-serif';ctx.textAlign='left';ctx.fillText('따뜻한 겨울 · 冬天也要暖暖的',75,288);ctx.restore();};
drawKauEmblem=function(x,y,r=34){ctx.save();ctx.translate(x,y);ctx.fillStyle='#ecebda';ctx.beginPath();ctx.arc(0,0,r+3,0,Math.PI*2);ctx.fill();ctx.fillStyle='#14385e';ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#e9e7d3';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,0,r-4,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#e9e7d3';ctx.beginPath();ctx.moveTo(-r*.64,1);ctx.lineTo(-r*.16,-r*.2);ctx.lineTo(0,-r*.54);ctx.lineTo(r*.16,-r*.2);ctx.lineTo(r*.64,1);ctx.lineTo(r*.2,r*.08);ctx.lineTo(0,r*.42);ctx.lineTo(-r*.2,r*.08);ctx.closePath();ctx.fill();ctx.font=`bold ${r*.25}px serif`;ctx.textAlign='center';ctx.fillText('1952',0,r*.72);ctx.fillStyle='#14385e';ctx.font=`bold ${r*.24}px serif`;ctx.fillText('航大',0,r*.04);ctx.restore();};
function drawHeightRuler(time){const height=Number($('height-ruler').value);ctx.save();ctx.strokeStyle='#f3dca4';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(852,300);ctx.lineTo(852,106);ctx.stroke();for(let i=0;i<12;i++){ctx.beginPath();ctx.moveTo(852,300-i*16);ctx.lineTo(i%3?859:867,300-i*16);ctx.stroke();}ctx.fillStyle='#fde6b4';ctx.font='bold 12px Arial';ctx.textAlign='right';ctx.fillText(`${height} cm`,875,91);ctx.fillStyle='#8ee4c1';ctx.fillRect(810,300-(height-140)*1.8,62,3);ctx.fillStyle='#f8e5b2';ctx.font='12px sans-serif';ctx.textAlign='center';ctx.fillText(height>190?'光云大学小姚明，正在缩回真实身高':'188 & 178 · 原来刚刚好',700,485);if(height>204){drawSprite(images.peanut,{...peanut,x:player.x-90,y:player.y-Math.abs(Math.sin(time/180))*18},60,78);}ctx.restore();}
function drawJournal(time){const d=game.daily;ctx.save();ctx.fillStyle='#ede0ba';ctx.fillRect(24,15,300,52);ctx.fillStyle='#c6b894';ctx.fillRect(24,15,7,52);ctx.fillStyle='#39504a';ctx.textAlign='left';ctx.font='bold 11px sans-serif';ctx.fillText('我们的小事',40,35);const items=[d.lottery,d.hair,d.icecream,d.kitty];items.forEach((done,i)=>{const x=130+i*48;ctx.fillStyle=done?['#e0b953','#e4c276','#deaaac','#bfced1'][i]:'#c9c4af';ctx.fillRect(x,24,35,32);ctx.fillStyle=done?'#314840':'#898d7f';ctx.textAlign='center';ctx.font='14px sans-serif';ctx.fillText(done?['★','✦','♧','♡'][i]:'·',x+17,44);});ctx.restore();}
const originalBouquet=drawBouquet;
drawBouquet=function(x,y,complete=true,scale=1){if(spriteQueue&&game.scene==='hangdae'&&x===650)return;originalBouquet(x,y,complete,scale);};
function drawHeldBouquet(time){const h=game.hangdae;
  const holding=h.confessionAt?herry:game.stage===93?player:herry;drawBouquet(holding.x+(holding===player?25:-23),holding.y-60,h.bouquetReady,.76);
  if(h.eighth&&!h.bouquetReady){ctx.fillStyle='#ffe7a2';ctx.beginPath();ctx.ellipse(player.x+22,player.y-60,11,5,.4,0,Math.PI*2);ctx.fill();}
}
drawStationPetals=function(time){const h=game.hangdae;if(!h||game.stage>90||!h.petalStart)return;const colors=CHAPTERS.map(c=>c.ink);for(let i=0;i<7;i++){const t=Math.max(0,Math.min(1,(time-h.petalStart-i*480)/1000));if(t<=0||t>=1)continue;const sx=95+i*108,sy=130+(i%2)*60,ex=herry.x-23,ey=herry.y-81;ctx.save();ctx.translate(sx+(ex-sx)*t,sy+(ey-sy)*t-Math.sin(t*Math.PI)*70);ctx.rotate(t*4+i);ctx.fillStyle=colors[i];ctx.fillRect(-8,-4,16,8);ctx.fillStyle='#fff4bf';ctx.fillRect(-3,-3,6,6);ctx.restore();}};
updateHangdae=function(dt,time){const h=game.hangdae;if(!h)return;if(h.area==='station'&&game.stage===90&&h.petalStart){const count=Math.min(7,Math.max(0,Math.floor((time-h.petalStart-1000)/480)+1));if(count!==h.petals){h.petals=count;updateObjective();}if(count===7){game.stage=91;updateObjective();}}
  if(h.area!=='road')return;
  if([94,95].includes(game.stage)){const lampX=[210,335,460,585,710,825];lampX.forEach((x,i)=>{if(!h.lamps[i]&&Math.min(player.x,herry.x)>x-65){h.lamps[i]=true;sound('lamp');updateObjective();}});const targetX=Math.min(782,player.x-52),dx=targetX-herry.x,dy=player.y-herry.y,d=Math.hypot(dx,dy);herry.moving=d>5;if(herry.moving){const step=Math.min(d,player.speed*1.1*dt);herry.x+=dx/d*step;herry.y+=dy/d*step;herry.dir=Math.abs(dx)>Math.abs(dy)?dx<0?1:2:dy<0?3:0;herry.frame=Math.floor(time/180)%4;}else herry.frame=1;if(game.stage===94&&player.x>824&&herry.x>740){game.stage=95;stopWalk();updateObjective();}}
  if(game.stage===96&&h.dormStart){const t=Math.min(1,(time-h.dormStart)/1900);player.x=h.enterFromX+(844-h.enterFromX)*t;player.y=h.enterFromY+(351-h.enterFromY)*t;player.dir=3;player.frame=Math.floor(time/180)%4;player.tx=player.x;player.ty=player.y;herry.dir=3;herry.moving=false;herry.frame=1;peanut.moving=false;if(t===1)h.jennyEntered=true;if(time-h.dormStart>3300&&!h.narrationShown){h.narrationShown=true;updateObjective();$('cinema-caption').hidden=false;$('cinema-caption').textContent='我一次次站在这里看你回去，\n也一次次在心里做同一个决定：\n以后一定要和你永远在一起，不分离。';h.captionUntil=time+8800;}if(h.narrationShown&&time>=h.captionUntil){game.stage=97;updateObjective();}}
};
enterDorm=function(){stopWalk();Object.assign(game.hangdae,{dormStart:direction.now,enterFromX:player.x,enterFromY:player.y});game.stage=96;player.speed=0;game.nearby=null;ui.action.hidden=true;ui.play.classList.add('cinematic');updateObjective();};
const originalNearby=updateNearby;
updateNearby=function(){originalNearby();if(game.scene==='projector'&&game.memoryEight&&distance(player,{x:480,y:300})<110)game.nearby={label:'放映我们的故事',action:startEnding};if(game.scene==='hangdae'&&game.stage===97&&direction.now<(game.hangdae.captionUntil||0)){game.nearby=null;}if(blocked()||game.scene==='ending'||game.scene==='hangdae'&&game.stage===96)game.nearby=null;ui.action.hidden=!game.nearby;if(game.nearby)ui.action.textContent=game.nearby.label;};
const oldUpdate=update;
update=function(dt,time){direction.now=time;const oldTime=direction.runtimeTime;direction.runtimeTime=time;const frozen=blocked()||!$('restart-panel').hidden||document.hidden;
  if(frozen){for(const obj of [game.campus,game.shenzhen,game.hangdae]){if(!obj)continue;for(const key of ['timeStart','photoStart','discountAt','warmStart','petalStart'])if(obj[key])obj[key]+=Math.max(0,time-oldTime);if(obj.ball?.start)obj.ball.start+=Math.max(0,time-oldTime);}player.moving=herry.moving=peanut.moving=false;}
  if(direction.introUntil&&time>=direction.introUntil){direction.introUntil=0;$('chapter-intro').hidden=true;}
  if(direction.toastUntil&&time>direction.toastUntil)$('toast').hidden=true;
  if(game.scene==='ending'){updateEnding(time);return;}
  if(direction.ruler){updateNearby();return;}
  if(frozen){if(game.scene==='aquarium')updateFishSchool(dt,time);return;}
  if(game.scene==='hangdae'&&game.stage>=96){updateHangdae(dt,time);updateNearby();return;}
  oldUpdate(dt,time);
  if(game.scene==='hangdae'&&game.hangdae.area==='road'){player.y=Math.max(418,Math.min(464,player.y));player.ty=Math.max(418,Math.min(464,player.ty));}
  if(game.scene==='campus'&&game.stage===61){stopWalk();}
  player.y=Math.max(walkFloor(),Math.min(480,player.y));
  if((game.scene==='hongdae'&&game.stage>=11)||(game.scene==='campus'&&[62,67,69].includes(game.stage))){const target=peanut.trail[Math.max(0,peanut.trail.length-10)]||{x:player.x-60,y:player.y};const dx=target.x-herry.x,dy=target.y-herry.y,d=Math.hypot(dx,dy);herry.moving=d>12;if(herry.moving){const step=Math.min(d,175*dt);herry.x+=dx/d*step;herry.y+=dy/d*step;herry.dir=Math.abs(dx)>Math.abs(dy)?dx<0?1:2:dy<0?3:0;herry.frame=Math.floor(time/160)%4;}else herry.frame=1;}
  if(game.scene==='daily'&&game.daily?.iceActive)player.speed=100;else if(!['hangdae'].includes(game.scene))player.speed=185;
  if(time%800<34)saveCheckpoint();ambient(time);
};
const oldPointer=onPointer;
canvas.addEventListener('pointerdown',e=>{
  if(game.photoOpen)return;
  if(blocked()||game.scene==='ending'||game.scene==='hangdae'&&game.stage>=96){e.stopImmediatePropagation();return;}const p=worldPoint(e);
  if(game.scene==='projector'){const index=filmRects.findIndex(r=>p.x>=r.x&&p.x<=r.x+r.w&&p.y>=r.y&&p.y<=r.y+r.h+20);if(index>=0){e.stopImmediatePropagation();if(game[CHAPTERS[index].key])transitionTo(()=>enterChapter(index));else toast('这格画面还在等你找回来');return;}}
  if(game.scene==='hongdae'&&game.stage>=11&&p.x>665&&p.y<330){direction.hiddenTaps++;herry.tiptoe=Math.min(3,direction.hiddenTaps);toast(direction.hiddenTaps>=3?'再踮脚也只有 188 啦，小姚明':'他又偷偷踮了一点点脚');}
},true);
window.addEventListener('blur',()=>{game.keys.clear();stopWalk();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!$('restart-panel').hidden)$('restart-panel').hidden=true;else if(!ui.ringPanel.hidden)ui.ringPanel.hidden=true;}if([' ','Enter'].includes(e.key)&&!ui.dialogue.hidden){e.preventDefault();e.stopImmediatePropagation();advanceDialogue();}},true);
function walkFloor(){return {projector:350,hongdae:350,english:365,myeongdong:365,aquarium:375,daily:360,campus:game.campus?.area==='court'?335:400,shenzhen:game.shenzhen?.area==='home'?405:365,hangdae:game.hangdae?.area==='road'?418:370}[game.scene]||285;}
setTarget=function(x,y){player.tx=Math.max(55,Math.min(905,x));player.ty=Math.max(walkFloor(),Math.min(480,y));};
function drawAtmosphere(time){if(game.photoOpen||game.scene==='campus'&&game.stage===68)return;ctx.save();const vignette=ctx.createRadialGradient(480,270,180,480,270,570);vignette.addColorStop(0,'#020c1600');vignette.addColorStop(1,'#020c1648');ctx.fillStyle=vignette;ctx.fillRect(0,0,960,540);if(!direction.reduced){ctx.fillStyle='#e6efd21b';for(let i=0;i<12;i++){const x=(i*83+time*(.003+i%3*.002))%960,y=52+(i*71+Math.sin(time/1700+i)*12)%440;ctx.fillRect(x,y,2,2);}}if(direction.restoredAt&&time-direction.restoredAt<1700){const t=(time-direction.restoredAt)/1700;ctx.strokeStyle=`rgba(168,230,191,${(1-t)*.4})`;ctx.lineWidth=2;ctx.beginPath();ctx.arc(player.x,player.y-60,t*800,0,Math.PI*2);ctx.stroke();}ctx.restore();}
function targets(){if(game.scene==='projector'){if(game.stage===0)return[{x:185,y:405}];if(game.stage===1||game.memoryEight)return[{x:480,y:305}];return game.stage>=2?[{x:805,y:385}]:[];}if(game.scene==='hongdae')return game.stage===10?[{x:765,y:370}]:game.stage===11?[{x:160,y:395}]:game.stage===12?[{x:480,y:345}]:[];if(game.scene==='english'){const map={20:[300,430],21:[805,330],22:[410,430],23:[805,330],24:[520,430],25:[805,330],26:[480,330],27:[480,345]};return map[game.stage]?[{x:map[game.stage][0],y:map[game.stage][1]}]:[];}if(game.scene==='myeongdong')return game.stage<=31?[{x:555,y:410}]:game.stage===32?[herry]:game.stage===33?[{x:480,y:345}]:[];if(game.scene==='aquarium'){const map={40:[210,390],41:[450,350],42:[690,410],43:[850,425],46:[480,345]};return map[game.stage]?[{x:map[game.stage][0],y:map[game.stage][1]}]:[];}if(game.scene==='daily'){if(dailyFoundCount()===4)return[{x:480,y:345}];if(game.daily.iceActive)return[{x:708,y:430}];return [[!game.daily.lottery,145,405],[!game.daily.hair,350,410],[!game.daily.icecream,555,410],[!game.daily.kitty,game.daily.kittyStarted?895:800,425]].filter(a=>a[0]).map(a=>({x:a[1],y:a[2]}));}if(game.scene==='campus'){const c=game.campus;if(game.stage===60)return [[!c.laptops,190],[!c.books,350],[!c.drinks,510]].filter(a=>a[0]).map(a=>({x:a[1],y:415})).concat(c.laptops&&c.books&&c.drinks?[{x:760,y:410}]:[]);const map={62:[885,405],63:[245,430],66:[320,426],67:[815,405],69:[480,345]};return map[game.stage]?[{x:map[game.stage][0],y:map[game.stage][1]}]:[];}if(game.scene==='shenzhen'){const s=game.shenzhen;if(game.stage===81)return s.foods.filter((f,i)=>!s.selected.some(item=>item.index===i));if(game.stage===82)return[{x:875,y:420}];if(game.stage===83)return s.carrying?[{x:540,y:405}]:s.selected.filter(item=>!s.plates.some(p=>p.item.index===item.index)).map(item=>({x:135+s.selected.indexOf(item)*82,y:430}));if(game.stage===85)return[{x:480,y:345}];}if(game.scene==='hangdae'){if(game.stage===91)return[peanut];if(game.stage===92)return[{x:650,y:395}];if(game.stage===93)return[herry];if(game.stage===95)return[{x:855,y:410}];}return[];}
function drawInteractionHints(time){if(blocked()||game.scene==='ending'||game.scene==='hangdae'&&game.stage>=96)return;ctx.save();for(const point of targets()){const pulse=direction.reduced?0:Math.sin(time/400)*2;ctx.strokeStyle='#c2e2b190';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(point.x,point.y+4,20+pulse,6+pulse*.2,0,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#d5eab5';ctx.fillRect(point.x-2,point.y-140,4,4);}ctx.restore();}
// Each chapter contributes its actual result to the film, including the photo
// Jenny framed and the meal she chose. Media is loaded only for the ending.
const ENDING_COPIES=[
  '弘大。你站到我身边的第一天。',
  'study，again，tomorrow。\n认真学英语，也认真找借口见你。',
  '明洞。浅粉色大衣穿上了，\n我们中间还闪了一下。',
  '第一次约会。\n鱼很多，但我一直在看你。',
  '一等奖、乱掉的黄头发，\n还有那只“谁掉了”的 Hello Kitty。',
  '自习、捡球、穿情侣装。\n最后一格，我们笑到画面外。',
  '九点后的打折食物，\n也能摆成很丰盛的一顿晚餐。',
  '这条路，我送你走过一次又一次。'
];
function startEnding(){clearInteraction();game.scene='ending';game.stage=100;ui.scene.textContent='终章 · 所有路，最后都走向你';ui.objective.textContent='八张胶片，一部只属于我们的电影';ui.play.classList.add('cinematic');direction.ending={start:direction.now,segment:-1,media:'montage',video:null,completed:false};$('cinema-caption').hidden=false;fetch('assets/ending.json').then(r=>r.ok?r.json():{}).then(c=>{if(c.video){direction.ending.video=c.video;const v=$('birthday-video');v.src=c.video;v.load();}}).catch(()=>{});sound('enter');}
function updateEnding(time){const e=direction.ending;if(!e)return;const elapsed=(time-e.start)/1000,index=Math.min(8,Math.floor(Math.max(0,elapsed-2)/5));if(e.media==='montage'){if(index!==e.segment){e.segment=index;sound('paper');}if(elapsed<2)$('cinema-caption').textContent='八段回忆，终于接成一卷。';else if(elapsed<42)$('cinema-caption').textContent=ENDING_COPIES[index];else if(elapsed<47)$('cinema-caption').textContent='我只能陪你走到这里。\n接下来，他想亲自告诉你。';else if(elapsed>=48){if(e.video)playBirthdayVideo();else {e.media='birthday';e.birthdayAt=time;$('cinema-caption').textContent='苏雨菲 Jenny，生日快乐。\n从那些日子，到以后每一天。';}}}else if(e.media==='birthday'&&time-e.birthdayAt>7200){e.completed=true;game.nearby={label:'回放映室，再看一次',action:()=>{clearInteraction();direction.ending=null;ui.play.classList.remove('cinematic');$('cinema-caption').hidden=true;transitionTo(()=>setProjectorRoom(true));}};ui.action.hidden=false;ui.action.textContent=game.nearby.label;}ambient(time);}
function drawEnding(time){const e=direction.ending;ctx.fillStyle='#071722';ctx.fillRect(0,0,960,540);if(!e)return;const elapsed=(time-e.start)/1000;
  if(e.media==='montage'&&elapsed<42&&e.segment>=0&&e.segment<8){const i=e.segment,img=direction.captureImages[i+1];ctx.save();const t=((elapsed-2)%5)/5,zoom=direction.reduced?1:1.015+t*.035;ctx.translate(480,270);ctx.scale(zoom,zoom);ctx.translate(-480,-270);if(img)frameImage(img,35,40,890,435);else drawMemoryVignette(i,time);ctx.restore();ctx.fillStyle='#06152190';ctx.fillRect(0,385,960,155);ctx.fillStyle=CHAPTERS[i].ink;ctx.font='11px Arial';ctx.textAlign='left';ctx.fillText(`MEMORY ${String(i+1).padStart(2,'0')} · ${CHAPTERS[i].place}`,55,39);}
  else if(e.media==='birthday'){const img=direction.photos[Math.floor((time-e.birthdayAt)/3200)%Math.max(1,direction.photos.length)];if(img){ctx.imageSmoothingEnabled=true;ctx.globalAlpha=.95;frameImage(img,180,0,600,540,false);ctx.imageSmoothingEnabled=false;ctx.globalAlpha=1;ctx.fillStyle='#06142165';ctx.fillRect(0,385,960,155);}else drawMemoryVignette(8,time);ctx.fillStyle='#f4dc9e';ctx.font='11px Arial';ctx.textAlign='center';ctx.fillText('10.25 · HAPPY BIRTHDAY, JENNY',480,47);}
  else if(elapsed<2){ctx.fillStyle='#ddc58c';for(let i=0;i<8;i++){const x=190+i*75,y=235;ctx.fillRect(x,y,56,42);ctx.fillStyle='#254943';ctx.fillRect(x+8,y+6,40,30);ctx.fillStyle='#ddc58c';}}
  else {drawMemoryVignette(8,time);const a=Math.max(0,Math.min(1,(elapsed-47)*2));ctx.fillStyle=`rgba(255,244,218,${a})`;ctx.fillRect(0,0,960,540);}
  ctx.fillStyle='#040c13';ctx.fillRect(0,0,960,24);ctx.fillRect(0,510,960,30);if(!direction.reduced&&e.media==='montage'){ctx.fillStyle='#e3eaca04';for(let y=24;y<510;y+=4)ctx.fillRect(0,y,960,1);}
}
function drawMemoryVignette(i,time){ctx.fillStyle=['#23474f','#365346','#524453','#164f69','#514854','#415c4d','#705841','#263c53','#24464c'][i];ctx.fillRect(30,35,900,450);pixelGlow(480,250,220,'#ecd8a0',.15);drawPoseSprite(images.herry,{x:446,y:375,frame:1,dir:0},90,150,.025);drawPoseSprite(images.jenny,{x:502,y:375,frame:1,dir:0},84,142,-.025);drawSprite(images.peanut,{x:606,y:390,frame:1,dir:0},64,82);ctx.fillStyle='#e3a5b0';ctx.font='25px serif';ctx.textAlign='center';ctx.fillText('♥',476,231);}
function playBirthdayVideo(){const e=direction.ending;e.media='video';$('cinema-caption').hidden=true;const v=$('birthday-video');v.hidden=false;muteAmbient();v.play().catch(()=>{$('video-resume').hidden=false;});}
$('video-resume').onclick=()=>{$('birthday-video').play().then(()=>$('video-resume').hidden=true).catch(()=>{});};
$('birthday-video').onended=()=>{$('birthday-video').hidden=true;direction.ending.media='birthday';direction.ending.birthdayAt=direction.now;$('cinema-caption').hidden=false;$('cinema-caption').textContent='宝宝，生日快乐。\n我好爱你。';};
$('birthday-video').onerror=()=>{if(direction.ending?.media==='video'){$('birthday-video').hidden=true;$('video-resume').hidden=true;direction.ending.media='birthday';direction.ending.birthdayAt=direction.now;$('cinema-caption').hidden=false;$('cinema-caption').textContent='苏雨菲 Jenny，生日快乐。\n从那些日子，到以后每一天。';}};
function unlockAudio(){if(!game.soundOn)return;try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;direction.audio ||= new AC();if(direction.audio.state==='suspended')direction.audio.resume();}catch{}}
function tone(freq,duration=.25,volume=.025,type='sine'){if(!game.soundOn||!direction.audio||document.hidden)return;try{const a=direction.audio,o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(.0001,a.currentTime);g.gain.exponentialRampToValueAtTime(volume,a.currentTime+.025);g.gain.exponentialRampToValueAtTime(.0001,a.currentTime+duration);o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+duration+.02);}catch{}}
function sound(kind){unlockAudio();const notes={paper:[392,523],film:[392,494,659],enter:[261,392,523],lamp:[523]};(notes[kind]||[]).forEach((f,i)=>setTimeout(()=>tone(f,.3,.035,'triangle'),i*100));}
function ambient(time){if(!game.soundOn||blocked()||time<direction.nextTone||direction.ending?.media==='video')return;direction.nextTone=time+1600;const chords=game.scene==='aquarium'?[196,294,392,440]:game.scene==='hangdae'?[220,330,392,494]:[261.6,329.6,392,523];tone(chords[Math.floor(time/1600)%4],2.1,.012);}
function muteAmbient(){direction.nextTone=direction.now+6000;}
// Opening screen: a tiny city on a blue evening, with the three protagonists
// together rather than a generic landing-page illustration.
const titleCanvas=$('title-art'),titleCtx=titleCanvas.getContext('2d');
function drawTitle(time){if(!ui.title.classList.contains('active')){requestAnimationFrame(drawTitle);return;}const c=titleCtx;c.imageSmoothingEnabled=false;c.fillStyle='#0a1c2b';c.fillRect(0,0,960,540);const g=c.createLinearGradient(0,0,0,540);g.addColorStop(0,'#10243a');g.addColorStop(.65,'#244453');g.addColorStop(1,'#0a1c27');c.fillStyle=g;c.fillRect(0,0,960,540);for(let i=0;i<45;i++){c.fillStyle='#dae6cb55';c.fillRect((i*139)%960,20+(i*79)%245,2,2);}c.fillStyle='#c2d6c5';c.beginPath();c.arc(790,104,23,0,Math.PI*2);c.fill();c.fillStyle='#132c3d';for(let i=0;i<12;i++){const x=i*84,h=70+(i*29)%130;c.fillRect(x,360-h,72,h);c.fillStyle='#d4b67666';for(let y=365-h;y<345;y+=24){for(let wx=0;wx<3;wx++)if((wx+i+y)%4)c.fillRect(x+12+wx*18,y,5,8);}c.fillStyle='#132c3d';}c.fillStyle='#244049';c.fillRect(0,355,960,185);c.strokeStyle='#365459';c.lineWidth=1;for(let y=390;y<540;y+=32){c.beginPath();c.moveTo(0,y);c.lineTo(960,y);c.stroke();}c.fillStyle='#263e45';c.fillRect(815,215,7,223);c.fillRect(794,212,49,8);c.fillStyle='#f3d893';c.fillRect(797,220,44,15);const light=c.createRadialGradient(820,265,8,820,330,190);light.addColorStop(0,'#f5dda93c');light.addColorStop(1,'#f5dda900');c.fillStyle=light;c.fillRect(630,140,330,380);function sprite(img,x,y,w,h){if(!img)return;const fw=img.width/4,fh=img.height/4;c.drawImage(img,fw,0,fw,fh,x-w/2,y-h,w,h);}sprite(images.herry,723,453,74,129);sprite(images.jenny,771,453,68,122);sprite(images.peanut,842,459,49,64);c.fillStyle='#df9fae';c.font='17px serif';c.fillText('♥',746,326);if(!direction.reduced)for(let i=0;i<15;i++){c.fillStyle='#dcd99f88';c.fillRect(620+(i*43+time*.009)%330,270+Math.sin(time/1400+i)*12+i*10,2,2);}requestAnimationFrame(drawTitle);}
requestAnimationFrame(drawTitle);
