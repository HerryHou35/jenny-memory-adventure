/* A small direction layer: chapter mechanics live in app.js; staging, replay,
   the film archive and the ending share one clock and one saved experience. */
const CHAPTERS = [
  { key:'memoryOne', title:'镜子里的小姚明', introTitle:'我们的第一次见面', place:'HONGDAE · SEOUL', scene:'hongdae', enter:setHongdae, ink:'#88c8bd' },
  { key:'memoryTwo', title:'最认真的假英语课', introTitle:'认真学英语的我们', place:'STUDY, AGAIN, TOMORROW', scene:'english', enter:setEnglishClass, ink:'#e0c989' },
  { key:'memoryThree', title:'明洞的浅粉色大衣', introTitle:'明洞的邂逅', place:'MYEONGDONG · A PINK COAT', scene:'myeongdong', enter:setMyeongdong, ink:'#e7abb9' },
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
const pixelMusic={audio:new Audio('assets/pixel-bgm.ogg'),pending:false,blocked:false,failed:false,startedAt:0};
pixelMusic.audio.preload='auto';pixelMusic.audio.loop=true;pixelMusic.audio.volume=0;
pixelMusic.audio.onerror=()=>{pixelMusic.failed=true;$('pixel-music-resume')?.remove();};
function pixelMusicActive(){return game.running&&ui.play.classList.contains('active')&&game.soundOn&&!document.hidden&&(game.scene!=='ending'||direction.ending?.media==='montage');}
function requestPixelMusic(){
  if(pixelMusic.pending||pixelMusic.failed)return;pixelMusic.pending=true;
  pixelMusic.audio.play().then(()=>{pixelMusic.pending=false;pixelMusic.blocked=false;$('pixel-music-resume')?.remove();if(!pixelMusicActive())pixelMusic.audio.pause();}).catch(()=>{
    pixelMusic.pending=false;if(!pixelMusicActive()||pixelMusic.failed)return;pixelMusic.blocked=true;
    let button=$('pixel-music-resume');if(!button){button=document.createElement('button');button.id='pixel-music-resume';button.className='ending-music-resume';button.textContent='♪ 播放配乐';$('canvas-wrap').appendChild(button);}
    button.onclick=()=>{pixelMusic.blocked=false;pixelMusic.startedAt=direction.now;requestPixelMusic();};
  });
}
function syncPixelMusic(time){
  if(pixelMusic.failed)return;
  if(!pixelMusicActive()){pixelMusic.audio.pause();pixelMusic.startedAt=0;$('pixel-music-resume')?.remove();pixelMusic.blocked=false;return;}
  if(!pixelMusic.startedAt)pixelMusic.startedAt=time||performance.now();
  const fade=game.scene==='ending'?Math.max(0,Math.min(1,(48-(time-direction.ending.start)/1000)/4)):1;
  pixelMusic.audio.volume=.45*Math.min(1,Math.max(0,(time-pixelMusic.startedAt)/1200))*fade;
  if(pixelMusic.audio.paused&&!pixelMusic.pending&&!pixelMusic.blocked)requestPixelMusic();
}
$('sound-button').addEventListener('click',()=>syncPixelMusic(direction.now));
document.addEventListener('visibilitychange',()=>syncPixelMusic(direction.now));
const originalPersist=persist;
persist=function(){if(!direction.devPreview)originalPersist();};
const originalStorageSet=storage.set;
storage.set=function(key,value){if(direction.devPreview&&['jenny-films-v19','jenny-checkpoint-v19'].includes(key))return;originalStorageSet(key,value);};
const originalStorageRemove=storage.remove;
storage.remove=function(key){if(direction.devPreview&&['jenny-films-v19','jenny-checkpoint-v19'].includes(key))return;originalStorageRemove(key);};
for(const [key,data] of Object.entries(direction.captures))loadCapture(key,data);
// Real photographs are explicitly selected in ending.json when supplied.
document.body.classList.toggle('reduce-motion',direction.reduced);
$('motion-button').setAttribute('aria-pressed',String(direction.reduced));
function toast(copy){$('toast').textContent=copy;$('toast').hidden=false;direction.toastUntil=direction.now+2100;}
function loadCapture(key,data){const img=new Image();img.onload=()=>direction.captureImages[key]=img;img.src=data;}
function blocked(){return !game.running||game.fade>0||!ui.dialogue.hidden||!ui.letterPanel.hidden||!ui.ringPanel.hidden||!ui.photoControls.hidden||direction.ruler||direction.introUntil>direction.now||game.photoOpen;}
function currentChapter(){return CHAPTERS.findIndex(c=>c.scene===game.scene);}
function clearInteraction(){hideBirthdayLetter();stopEndingMusic();document.body.classList.remove('ending-blackout','ending-rush');canvas.classList.remove('photo-album');game.keys.clear();game.nearby=null;game.dialogueQueue=[];game.dialogueCallback=null;game.photoOpen=false;direction.ruler=false;direction.introUntil=0;direction.toastUntil=0;$('chapter-intro').hidden=true;$('toast').hidden=true;$('ruler-controls').hidden=true;ui.dialogue.hidden=true;ui.action.hidden=true;ui.ringPanel.hidden=true;ui.letterPanel.hidden=true;ui.photoControls.hidden=true;player.moving=false;herry.moving=false;peanut.moving=false;}
function chapterIntro(index){const c=CHAPTERS[index];direction.chapterIndex=index;direction.introUntil=direction.now+(direction.reduced?900:2400);$('intro-number').textContent='A LITTLE MEMORY';$('intro-title').textContent=c.introTitle||c.title;$('intro-place').textContent=c.place;$('chapter-intro').hidden=false;$('chapter-intro').style.animation='none';void $('chapter-intro').offsetWidth;$('chapter-intro').style.animation='';}
function enterChapter(index){clearInteraction();player.speed=185;CHAPTERS[index].enter();chapterIntro(index);sound('enter');}
const originalTransition=transitionTo;
transitionTo=function(callback){game.keys.clear();player.tx=player.x;player.ty=player.y;ui.action.hidden=true;originalTransition(()=>{callback();player.moving=false;herry.frame=1;const index=currentChapter();if(index>=0&&direction.chapterIndex!==index)chapterIntro(index);if(game.scene==='projector')direction.chapterIndex=-1;if(game.scene!=='hangdae'&&game.scene!=='ending'){$('cinema-caption').hidden=true;ui.play.classList.remove('cinematic');}});};
const originalStart=startGame;
startGame=function(continueSaved=false){
  direction.devPreview=false;
  const checkpoint=continueSaved?storage.get('jenny-checkpoint-v19'):null;
  if(!continueSaved){storage.remove('jenny-checkpoint-v19');storage.remove('jenny-films-v19');direction.captures={};direction.captureImages={};direction.ending=null;}
  clearInteraction();direction.chapterIndex=-1;direction.ending=null;$('birthday-video').pause();$('birthday-video').hidden=true;$('video-resume').hidden=true;$('cinema-caption').hidden=true;ui.play.classList.remove('cinematic');
  originalStart(continueSaved);unlockAudio();syncPixelMusic(direction.now||performance.now());
  if(checkpoint&&continueSaved&&CHAPTERS[checkpoint.chapter]&&!game[CHAPTERS[checkpoint.chapter].key])restoreCheckpoint(checkpoint);
};
function requestRestart(){$('restart-panel').hidden=false;game.keys.clear();player.tx=player.x;player.ty=player.y;}
$('restart-cancel').onclick=()=>{$('restart-panel').hidden=true;};
$('restart-confirm').onclick=()=>{$('restart-panel').hidden=true;startGame(false);};
$('home-button').onclick=()=>{if(!game.running||game.scene==='ending')return;saveCheckpoint();clearInteraction();transitionTo(()=>setProjectorRoom(true));};
$('motion-button').onclick=()=>{direction.reduced=!direction.reduced;document.body.classList.toggle('reduce-motion',direction.reduced);$('motion-button').setAttribute('aria-pressed',String(direction.reduced));storage.set('jenny-reduced-motion',direction.reduced);toast(direction.reduced?'已减少光效与镜头移动':'已恢复完整光效');};
const originalObjective=updateObjective;
updateObjective=function(){originalObjective();const found=CHAPTERS.filter(c=>game[c.key]).length;ui.memoryCount.textContent=found?`已找回 ${found} 段回忆`:'还没有找回胶片';if(game.scene==='projector'&&game.memoryEight)ui.objective.textContent='胶片已完整 · 走近放映机，放映我们的故事';if(game.scene==='hangdae'&&game.hangdae?.area==='station'&&game.stage===94)ui.objective.textContent='Herry 正在把花递给 Jenny';syncInventory();if(game.running)saveCheckpoint();};
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
    '我们都把课上得很认真，尤其认真研究下次什么时候见面。',
    '明洞那天，你觉得冷。我把大衣带来给你穿。然后，我们之间多了一颗小小的爱心。',
    '那天海洋馆里有很多鱼，但我一直在看站在身边的你。',
    '你抽中过一等奖，而我抽中了和你一起胡闹的每一天。',
    '我后来才明白，幸福经常只是你在旁边，而我们各自认真做着很普通的事。',
    '我记住一顿饭，从来不是因为它贵，而是因为坐在我对面的人是你。',
    '我一次次站在这里看你回去，也一次次在心里做同一个决定：以后一定要和你永远在一起，不分离。'
  ];ui.letterCopy.textContent=shortLetters[number-1];ui.letterPanel.setAttribute('aria-label',`第${number}张回忆胶片`);
};
const originalMirror=mirrorMoment;
mirrorMoment=function(){player.x=player.tx=753;player.y=player.ty=410;herry.x=691;herry.y=410;herry.dir=0;player.dir=0;herry.tiptoe=1;peanut.x=620;peanut.y=437;direction.ruler=true;direction.hiddenTaps=0;game.nearby=null;ui.action.hidden=true;$('ruler-controls').hidden=false;$('height-ruler').value=230;$('mirror-shutter').hidden=true;toast('小姚明又偷偷踮脚了 · 把尺拉回 188');};
$('height-ruler').oninput=()=>{const v=Number($('height-ruler').value);herry.tiptoe=Math.max(0,(v-188)/42);$('mirror-shutter').hidden=v>190;};
$('mirror-shutter').onclick=()=>{direction.ruler=false;$('ruler-controls').hidden=true;originalMirror();};
takeEnglishCard=function(word){game.stage+=1;updateObjective();toast(`拿起 ${word} · 可以拖到日历上`);sound('paper');};
placeEnglishCard=function(word){if(![21,23,25].includes(game.stage))return;game.stage+=1;updateObjective();direction.restoredAt=direction.now;toast(game.stage===26?'一周都圈满了。是上课，还是想见面？':'日历上又多了一次见面');sound('paper');};
revealEnglishTruth=function(){game.stage=27;peanut.x=480;peanut.y=330;updateObjective();sayMany([['花生','English lesson？擦掉，应该是……想见宝宝。','🐶'],['Herry','看似我们在上英语课，其实我眼中没有单词只有你。','👦']]);};
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
function frameImage(img,x,y,w,h,cover=true){const iw=img?.naturalWidth||img?.videoWidth,ih=img?.naturalHeight||img?.videoHeight;if(!iw||!ih||img instanceof HTMLVideoElement&&img.readyState<2)return;const scale=cover?Math.max(w/iw,h/ih):Math.min(w/iw,h/ih);ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();ctx.drawImage(img,x+(w-iw*scale)/2,y+(h-ih*scale)/2,iw*scale,ih*scale);ctx.restore();}
const filmRects=CHAPTERS.map((_,i)=>({x:i<4?42+(i%2)*115:708+(i%2)*115,y:70+Math.floor((i%4)/2)*106,w:95,h:76}));
drawProjectorRoom=function(time){
  ctx.fillStyle='#10232c';ctx.fillRect(0,0,960,540);ctx.fillStyle='#173640';ctx.fillRect(0,0,960,290);
  for(let x=0;x<960;x+=96){ctx.fillStyle=x%192?'#1a3d44':'#18373e';ctx.fillRect(x+3,0,90,289);}
  ctx.fillStyle='#355350';ctx.fillRect(0,290,960,250);ctx.strokeStyle='#243f40';ctx.lineWidth=1;for(let y=310;y<540;y+=36){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(960,y);ctx.stroke();}for(let x=-300;x<1300;x+=90){ctx.beginPath();ctx.moveTo(480,290);ctx.lineTo(x,540);ctx.stroke();}
  ctx.fillStyle='#091a22';ctx.fillRect(312,45,336,205);ctx.strokeStyle='#679c89';ctx.lineWidth=5;ctx.strokeRect(312,45,336,205);
  const count=CHAPTERS.filter(c=>game[c.key]).length;pixelGlow(480,145,200,'#e9d59e',game.stage>=2?.12:.025);
  ctx.textAlign='center';ctx.fillStyle='#d9d3b7';ctx.font='17px sans-serif';ctx.fillText(count===8?'所有路，最后都走向你。':'有些日子，想和你再过一遍。',480,125);ctx.fillStyle='#8eb8a5';ctx.font='10px Arial';ctx.fillText('A FILM BY HERRY · FOR JENNY',480,154);
  CHAPTERS.filter(c=>game[c.key]).forEach((c,i)=>{ctx.fillStyle=c.ink;ctx.fillRect(480-count*12.5+i*25,185,17,23);});
  filmRects.forEach((r,i)=>{if(!game[CHAPTERS[i].key])return;ctx.fillStyle='#1b292e';ctx.fillRect(r.x-4,r.y-4,r.w+8,r.h+23);ctx.fillStyle='#d9caa2';ctx.fillRect(r.x,r.y,r.w,r.h);frameImage(direction.captureImages[i+1],r.x+3,r.y+3,r.w-6,r.h-6);ctx.fillStyle='#d3d2b5';ctx.textAlign='center';ctx.font='9px sans-serif';ctx.fillText(CHAPTERS[i].title.slice(0,9),r.x+r.w/2,r.y+r.h+14);});
  if(game.stage>=2){ctx.fillStyle='#ffe8a614';ctx.beginPath();ctx.moveTo(480,283);ctx.lineTo(312,74);ctx.lineTo(648,74);ctx.closePath();ctx.fill();}
  drawProjector(game.stage>=2);CHAPTERS.filter(c=>game[c.key]).forEach((c,i)=>{ctx.fillStyle=c.ink;ctx.fillRect(480-count*5.5+i*11,273,7,4);});
  for(const x of [56,197,338,620,761,902]){ctx.drawImage(images.chairBack,x-35,335,70,70);}
  if(game.stage===0)drawKey();const portals={2:drawPortal,4:drawEnglishPortal,6:drawMyeongdongPortal,8:drawAquariumPortal,10:drawDailyPortal,11:drawCampusPortal,12:drawShenzhenPortal,14:drawHangdaePortal};if(portals[game.stage])portals[game.stage](time);
  ctx.fillStyle='#7caaa0';ctx.font='10px sans-serif';ctx.textAlign='left';ctx.fillText(count?'点墙上的胶片，可以再走进那一天':'每找回一张胶片，这里就多亮一盏灯',25,514);
  if(count===8){pixelGlow(480,268,60,'#f7dc8c',.22);ctx.fillStyle='#f7e2ad';ctx.font='bold 13px sans-serif';ctx.textAlign='center';ctx.fillText('放映我们的故事',480,310);}
};
const oldEnglish=drawEnglishClass;
drawEnglishClass=function(time){oldEnglish(time);ctx.save();ctx.fillStyle='#f3e6c9';ctx.fillRect(743,42,182,248);ctx.strokeStyle='#8f7453';ctx.lineWidth=5;ctx.strokeRect(743,42,182,248);ctx.fillStyle='#35554f';ctx.textAlign='center';ctx.font='bold 16px Arial';ctx.fillText('THIS WEEK',834,72);const filled=game.stage>=26?7:game.stage>=24?4:game.stage>=22?2:0;const days=['MON','TUE','WED','THU','FRI','SAT','SUN'];for(let i=0;i<7;i++){const y=90+i*26;ctx.fillStyle='#e4d7ba';ctx.fillRect(755,y,158,23);ctx.fillStyle='#657168';ctx.font='bold 10px Arial';ctx.textAlign='left';ctx.fillText(days[i],763,y+15);if(i<filled){ctx.strokeStyle='#d77987';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(871,y+12,30,10,-.05,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#b35a6b';ctx.font='10px sans-serif';ctx.fillText('见宝宝',850,y+15);}}ctx.restore();};
// Use the 188:178 ratio at every scale, including photos and tiny cutscenes.
const oldSprite=drawSprite;
const originalReflection=drawReflectedSprite;
drawReflectedSprite=function(image,entity,width,height,mirror){const lifted=image===images.herry?Math.min(3,herry.tiptoe||0)*6:0;originalReflection(image,lifted?{...entity,y:entity.y-lifted/.12}:entity,width,height,mirror);};
let spriteQueue=null;
drawSprite=function(image,entity,width,height,yOffset=0){
  if(spriteQueue&&[player,herry,peanut].includes(entity)){spriteQueue.push({image,entity:{...entity},original:entity,width,height,yOffset});return;}
  if((image===images.herry||image===images.herryYellow)&&width===80)height=129;
  if(game.scene==='hongdae'&&image===images.herry)yOffset-=Math.min(3,herry.tiptoe||0)*6;
  ctx.save();if(entity===player||entity===herry||entity===peanut){ctx.fillStyle='#07131c40';ctx.beginPath();ctx.ellipse(entity.x,entity.y-2,width*.25,5,0,0,Math.PI*2);ctx.fill();}oldSprite(image,entity,width,height,yOffset);ctx.restore();
};
const oldPinkCoat=drawPinkSkiCoat;
drawPinkSkiCoat=function(entity,alpha=1){if(spriteQueue){spriteQueue.push({coat:true,entity:{...entity},original:entity,alpha});return;}ctx.save();ctx.globalAlpha=alpha;ctx.translate(entity.x,entity.y);const dir=entity.dir;ctx.fillStyle='#f1b1c5';ctx.beginPath();ctx.moveTo(-12,-84);ctx.lineTo(-22,-74);ctx.lineTo(-24,-18);ctx.lineTo(24,-18);ctx.lineTo(22,-74);ctx.lineTo(12,-84);ctx.closePath();ctx.fill();ctx.fillStyle='#ffd6df';ctx.fillRect(-16,-76,32,9);ctx.fillStyle='#c8809d';ctx.fillRect(-20,-45,40,2);ctx.fillRect(-20,-28,40,2);ctx.fillStyle='#ffe4e8';if(dir!==3){ctx.fillRect(dir===1?-10:dir===2?8:-1,-72,3,51);ctx.fillRect(-17,-36,10,3);ctx.fillRect(8,-36,10,3);}ctx.fillStyle='#e9a4ba';ctx.fillRect(-28,-70,9,42);ctx.fillRect(20,-70,9,42);ctx.restore();};
const oldJacket=drawCoupleJacket;
drawCoupleJacket=function(entity,scale=1){if(spriteQueue&&[player,herry].includes(entity)){spriteQueue.push({jacket:true,entity:{...entity},original:entity,scale});return;}oldJacket(entity,scale);};
const oldDraw=draw;
function setMemoryCanvasResolution(photographic=false){
  // Keep logical game coordinates at 960 x 540. Only the real-media segment
  // uses a screen/DPR-sized backing store, avoiding a low-res upscale.
  const cssWidth=photographic?canvas.getBoundingClientRect().width:960;
  const scale=photographic?Math.max(1,Math.min(4,cssWidth*(window.devicePixelRatio||1)/960)):1;
  const width=Math.round(960*scale),height=Math.round(width*9/16);
  if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
  ctx.setTransform(width/960,0,0,height/540,0,0);
  ctx.imageSmoothingEnabled=photographic;ctx.imageSmoothingQuality='high';
}
draw=function(time){
  if(game.scene==='ending'){drawEnding(time);return;}
  setMemoryCanvasResolution(false);
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
function drawHeightRuler(time){const height=Number($('height-ruler').value);ctx.save();ctx.strokeStyle='#f3dca4';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(852,300);ctx.lineTo(852,106);ctx.stroke();for(let i=0;i<12;i++){ctx.beginPath();ctx.moveTo(852,300-i*16);ctx.lineTo(i%3?859:867,300-i*16);ctx.stroke();}ctx.fillStyle='#fde6b4';ctx.font='bold 12px Arial';ctx.textAlign='right';ctx.fillText(`${height} cm`,875,91);ctx.fillStyle='#8ee4c1';ctx.fillRect(810,300-(height-140)*1.8,62,3);ctx.fillStyle='#f8e5b2';ctx.font='12px sans-serif';ctx.textAlign='center';ctx.fillText(height>190?'光云大学小姚明，正在缩回真实身高':'188 & 178 · 原来刚刚好',700,485);ctx.restore();}
function drawJournal(time){const d=game.daily;ctx.save();ctx.fillStyle='#ede0ba';ctx.fillRect(24,15,300,52);ctx.fillStyle='#c6b894';ctx.fillRect(24,15,7,52);ctx.fillStyle='#39504a';ctx.textAlign='left';ctx.font='bold 11px sans-serif';ctx.fillText('我们的小事',40,35);const items=[d.lottery,d.hair,d.icecream,d.kitty];items.forEach((done,i)=>{const x=130+i*48;ctx.fillStyle=done?['#e0b953','#e4c276','#deaaac','#bfced1'][i]:'#c9c4af';ctx.fillRect(x,24,35,32);ctx.fillStyle=done?'#314840':'#898d7f';ctx.textAlign='center';ctx.font='14px sans-serif';ctx.fillText(done?['★','✦','♧','♡'][i]:'·',x+17,44);});ctx.restore();}
const originalBouquet=drawBouquet;
drawBouquet=function(x,y,complete=true,scale=1){if(spriteQueue&&game.scene==='hangdae'&&x===650)return;originalBouquet(x,y,complete,scale);};
function drawHeldBouquet(time){const h=game.hangdae;
  const t=h.gifted?1:h.giftStart?Math.min(1,(time-h.giftStart)/1500):0;const sx=herry.x-23,sy=herry.y-60,ex=player.x+24,ey=player.y-60;drawBouquet(sx+(ex-sx)*t,sy+(ey-sy)*t-Math.sin(t*Math.PI)*9,h.bouquetReady,.76);
  if(h.eighth&&!h.bouquetReady){ctx.fillStyle='#ffe7a2';ctx.beginPath();ctx.ellipse(player.x+22,player.y-60,11,5,.4,0,Math.PI*2);ctx.fill();}
}
drawStationPetals=function(time){const h=game.hangdae;if(!h||game.stage>90||!h.petalStart)return;const colors=CHAPTERS.map(c=>c.ink);for(let i=0;i<7;i++){const t=Math.max(0,Math.min(1,(time-h.petalStart-i*480)/1000));if(t<=0||t>=1)continue;const sx=95+i*108,sy=130+(i%2)*60,ex=herry.x-23,ey=herry.y-81;ctx.save();ctx.translate(sx+(ex-sx)*t,sy+(ey-sy)*t-Math.sin(t*Math.PI)*70);ctx.rotate(t*4+i);ctx.fillStyle=colors[i];ctx.fillRect(-8,-4,16,8);ctx.fillStyle='#fff4bf';ctx.fillRect(-3,-3,6,6);ctx.restore();}};
returnBouquet=function(){stopWalk();player.x=player.tx=640;player.y=player.ty=425;herry.x=706;herry.y=425;player.dir=2;herry.dir=1;player.frame=herry.frame=1;game.stage=94;Object.assign(game.hangdae,{giftStart:direction.now,gifted:false,confessionAt:0});updateObjective();};
updateHangdae=function(dt,time){const h=game.hangdae;if(!h)return;if(h.area==='station'&&game.stage===94&&h.giftStart&&time-h.giftStart>=1500){h.gifted=true;h.giftStart=0;h.confessionAt=time;say('Herry','其实在圣水洞，我已经忍不住说过一次了。','👦',()=>transitionTo(setHangdaeRoad));}if(h.area==='station'&&game.stage===90&&h.petalStart){const count=Math.min(7,Math.max(0,Math.floor((time-h.petalStart-1000)/480)+1));if(count!==h.petals){h.petals=count;updateObjective();}if(count===7){game.stage=91;updateObjective();}}
  if(h.area!=='road')return;
  if([94,95].includes(game.stage)){const lampX=[210,335,460,585,710,825];lampX.forEach((x,i)=>{if(!h.lamps[i]&&Math.min(player.x,herry.x)>x-65){h.lamps[i]=true;sound('lamp');updateObjective();}});const targetX=Math.min(782,player.x-52),dx=targetX-herry.x,dy=player.y-herry.y,d=Math.hypot(dx,dy);herry.moving=d>5;if(herry.moving){const step=Math.min(d,player.speed*1.1*dt);herry.x+=dx/d*step;herry.y+=dy/d*step;herry.dir=Math.abs(dx)>Math.abs(dy)?dx<0?1:2:dy<0?3:0;herry.frame=Math.floor(time/180)%4;}else herry.frame=1;if(game.stage===94&&player.x>824&&herry.x>740){game.stage=95;stopWalk();updateObjective();}}
  if(game.stage===96&&h.dormStart){const t=Math.min(1,(time-h.dormStart)/1900);player.x=h.enterFromX+(844-h.enterFromX)*t;player.y=h.enterFromY+(351-h.enterFromY)*t;player.dir=3;player.frame=Math.floor(time/180)%4;player.tx=player.x;player.ty=player.y;herry.dir=3;herry.moving=false;herry.frame=1;peanut.moving=false;if(t===1)h.jennyEntered=true;if(time-h.dormStart>3300&&!h.narrationShown){h.narrationShown=true;updateObjective();$('cinema-caption').hidden=false;$('cinema-caption').textContent='我一次次站在这里看你回去，\n也一次次在心里做同一个决定：\n以后一定要和你永远在一起，不分离。';h.captionUntil=time+8800;}if(h.narrationShown&&time>=h.captionUntil){game.stage=97;updateObjective();}}
};
enterDorm=function(){stopWalk();Object.assign(game.hangdae,{dormStart:direction.now,enterFromX:player.x,enterFromY:player.y});game.stage=96;player.speed=0;game.nearby=null;ui.action.hidden=true;ui.play.classList.add('cinematic');updateObjective();};
const originalNearby=updateNearby;
updateNearby=function(){originalNearby();if(game.scene==='projector'&&game.memoryEight&&distance(player,{x:480,y:300})<110)game.nearby={label:'放映我们的故事',action:startEnding};if(game.scene==='hangdae'&&game.stage===97&&direction.now<(game.hangdae.captionUntil||0)){game.nearby=null;}if(blocked()||game.scene==='ending'||game.scene==='hangdae'&&game.stage===96)game.nearby=null;ui.action.hidden=!game.nearby;if(game.nearby)ui.action.textContent=game.nearby.label;};
const oldUpdate=update;
update=function(dt,time){direction.now=time;syncPixelMusic(time);const oldTime=direction.runtimeTime;direction.runtimeTime=time;const frozen=blocked()||!$('restart-panel').hidden||document.hidden;
  if(frozen){for(const obj of [game.campus,game.shenzhen,game.hangdae]){if(!obj)continue;for(const key of ['timeStart','photoStart','discountAt','warmStart','petalStart'])if(obj[key])obj[key]+=Math.max(0,time-oldTime);if(obj.ball?.start)obj.ball.start+=Math.max(0,time-oldTime);}player.moving=herry.moving=peanut.moving=false;}
  if(direction.introUntil&&time>=direction.introUntil){direction.introUntil=0;$('chapter-intro').hidden=true;}
  if(direction.toastUntil&&time>direction.toastUntil)$('toast').hidden=true;
  if(game.scene==='ending'){updateEnding(time);syncPixelMusic(time);return;}
  if(direction.ruler){updateNearby();return;}
  if(frozen){if(game.scene==='aquarium')updateFishSchool(dt,time);return;}
  if(game.scene==='hangdae'&&(game.stage>=96||game.hangdae?.area==='station'&&game.stage===94)){updateHangdae(dt,time);updateNearby();return;}
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
  if(game.scene==='projector'){const index=filmRects.findIndex((r,i)=>game[CHAPTERS[i].key]&&p.x>=r.x&&p.x<=r.x+r.w&&p.y>=r.y&&p.y<=r.y+r.h+20);if(index>=0){e.stopImmediatePropagation();transitionTo(()=>enterChapter(index));return;}}
  if(game.scene==='hongdae'&&game.stage>=11&&p.x>665&&p.y<330){direction.hiddenTaps++;herry.tiptoe=Math.min(3,direction.hiddenTaps);toast(direction.hiddenTaps>=3?'再踮脚也只有 188 啦，小姚明':'他又偷偷踮了一点点脚');}
},true);
window.addEventListener('blur',()=>{game.keys.clear();stopWalk();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!$('restart-panel').hidden)$('restart-panel').hidden=true;else if(!ui.ringPanel.hidden)ui.ringPanel.hidden=true;}if([' ','Enter'].includes(e.key)&&!ui.dialogue.hidden){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)advanceDialogue();}},true);
function walkFloor(){return {projector:350,hongdae:350,english:365,myeongdong:365,aquarium:375,daily:360,campus:game.campus?.area==='court'?335:400,shenzhen:game.shenzhen?.area==='home'?405:365,hangdae:game.hangdae?.area==='road'?418:370}[game.scene]||285;}
setTarget=function(x,y){player.tx=Math.max(55,Math.min(905,x));player.ty=Math.max(walkFloor(),Math.min(480,y));};
function drawAtmosphere(time){if(game.photoOpen||game.scene==='campus'&&game.stage===68)return;ctx.save();const vignette=ctx.createRadialGradient(480,270,180,480,270,570);vignette.addColorStop(0,'#020c1600');vignette.addColorStop(1,'#020c1648');ctx.fillStyle=vignette;ctx.fillRect(0,0,960,540);if(!direction.reduced){ctx.fillStyle='#e6efd21b';for(let i=0;i<12;i++){const x=(i*83+time*(.003+i%3*.002))%960,y=52+(i*71+Math.sin(time/1700+i)*12)%440;ctx.fillRect(x,y,2,2);}}if(direction.restoredAt&&time-direction.restoredAt<1700){const t=(time-direction.restoredAt)/1700;ctx.strokeStyle=`rgba(168,230,191,${(1-t)*.4})`;ctx.lineWidth=2;ctx.beginPath();ctx.arc(player.x,player.y-60,t*800,0,Math.PI*2);ctx.stroke();}ctx.restore();}
function targets(){if(game.scene==='projector'){if(game.stage===0)return[{x:185,y:405}];if(game.stage===1||game.memoryEight)return[{x:480,y:305}];return game.stage>=2?[{x:805,y:385}]:[];}if(game.scene==='hongdae')return game.stage===10?[{x:765,y:370}]:game.stage===11?[{x:160,y:395}]:game.stage===12?[{x:480,y:345}]:[];if(game.scene==='english'){const map={20:[300,430],21:[805,330],22:[410,430],23:[805,330],24:[520,430],25:[805,330],26:[480,330],27:[480,345]};return map[game.stage]?[{x:map[game.stage][0],y:map[game.stage][1]}]:[];}if(game.scene==='myeongdong')return game.stage<=31?[{x:555,y:410}]:game.stage===32?[herry]:game.stage===33?[{x:480,y:345}]:[];if(game.scene==='aquarium'){const map={40:[210,390],41:[450,350],42:[690,410],43:[850,425],46:[480,345]};return map[game.stage]?[{x:map[game.stage][0],y:map[game.stage][1]}]:[];}if(game.scene==='daily'){if(dailyFoundCount()===4)return[{x:480,y:345}];if(game.daily.iceActive)return[{x:708,y:430}];return [[!game.daily.lottery,145,405],[!game.daily.hair,350,410],[!game.daily.icecream,555,410],[!game.daily.kitty,game.daily.kittyStarted?895:800,425]].filter(a=>a[0]).map(a=>({x:a[1],y:a[2]}));}if(game.scene==='campus'){const c=game.campus;if(game.stage===60)return [[!c.laptops,190],[!c.books,350],[!c.drinks,510]].filter(a=>a[0]).map(a=>({x:a[1],y:415})).concat(c.laptops&&c.books&&c.drinks?[{x:760,y:410}]:[]);const map={62:[885,405],63:[245,430],66:[320,426],67:[815,405],69:[480,345]};return map[game.stage]?[{x:map[game.stage][0],y:map[game.stage][1]}]:[];}if(game.scene==='shenzhen'){const s=game.shenzhen;if(game.stage===81)return s.foods.filter((f,i)=>!s.selected.some(item=>item.index===i));if(game.stage===82)return[{x:875,y:420}];if(game.stage===83)return s.carrying?[{x:540,y:405}]:s.selected.filter(item=>!s.plates.some(p=>p.item.index===item.index)).map(item=>({x:135+s.selected.indexOf(item)*82,y:430}));if(game.stage===85)return[{x:480,y:345}];}if(game.scene==='hangdae'){if(game.stage===91)return[peanut];if(game.stage===92)return[{x:650,y:395}];if(game.stage===93)return[herry];if(game.stage===95)return[{x:855,y:410}];}return[];}
function drawInteractionHints(time){if(blocked()||game.scene==='ending'||game.scene==='hangdae'&&game.stage>=96)return;ctx.save();for(const point of targets()){const pulse=direction.reduced?0:Math.sin(time/400)*2;ctx.strokeStyle='#c2e2b190';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(point.x,point.y+4,20+pulse,6+pulse*.2,0,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#d5eab5';ctx.fillRect(point.x-2,point.y-140,4,4);}ctx.restore();}
// Each chapter contributes its actual result to the film, including the photo
// Jenny framed and the meal she chose. Media is loaded only for the ending.
const ENDING_COPIES=[
  '弘大。你站到我身边的第一天。',
  'study，again，tomorrow。\n认真学英语，也认真找借口了解你。',
  '明洞，为你披上大衣，\n让你暖暖的，我的心也暖暖的',
  '第一次约会。\n鱼很多，但我一直在看你。',
  '一等奖、乱掉的黄头发，\n还有那只“谁掉了”的 Hello Kitty。',
  '自习、捡球、穿情侣装。\n最后一格，我们笑到画面外。',
  '九点后的打折食物，\n也能摆成很丰盛的一顿晚餐。',
  '这条路，我送你走过一次又一次。'
];
function stopEndingMusic(){direction.photos.forEach(m=>{if(m instanceof HTMLVideoElement)m.pause();});const e=direction.ending;if(e?.music){e.musicCancelled=true;e.music.pause();try{e.music.currentTime=0;}catch{}e.musicStarted=false;}$('ending-music-resume')?.remove();}
function requestEndingMusic(e){
  if(!e.music||e.musicPending)return;e.musicPending=true;
  Promise.resolve(e.music.play()).then(()=>{e.musicPending=false;if(direction.ending!==e||e.musicCancelled){e.music.pause();return;}e.musicStarted=true;e.musicBlocked=false;$('ending-music-resume')?.remove();}).catch(()=>{
    e.musicPending=false;if(direction.ending!==e||e.musicFailed||e.musicCancelled)return;e.musicBlocked=true;
    let button=$('ending-music-resume');if(!button){button=document.createElement('button');button.id='ending-music-resume';button.className='ending-music-resume';button.textContent='♪ 播放配乐';$('canvas-wrap').appendChild(button);}
    button.onclick=()=>{game.soundOn=true;e.musicBlocked=false;requestEndingMusic(e);};
  });
}
function syncEndingMusic(e,time){
  if(!e.music||e.musicFailed||e.musicCancelled||e.musicFinished)return;
  const active=['photoRush','birthday'].includes(e.media)&&!e.videoPlayed&&game.soundOn&&!document.hidden;
  if(!active){if(e.musicStarted){e.music.pause();e.musicStarted=false;}$('ending-music-resume')?.setAttribute('hidden','');return;}
  if(e.musicBlocked)$('ending-music-resume')?.removeAttribute('hidden');
  e.music.volume=(e.musicVolume??.65)*Math.min(1,Math.max(0,(time-e.rushAt)/1500));
  if(!e.musicStarted&&!e.musicBlocked&&!e.musicPending)requestEndingMusic(e);
}
function startEnding(){
  clearInteraction();game.scene='ending';game.stage=100;ui.scene.textContent='终章 · 所有路，最后都走向你';ui.objective.textContent='放映我们的故事';ui.play.classList.add('cinematic');
  canvas.classList.remove('photo-album');direction.photos=[];direction.ending={start:direction.now,segment:-1,media:'montage',video:null,videoPlayed:false,photoSeconds:2.4,completed:false};
  const run=direction.ending;
  $('cinema-caption').hidden=false;
  fetch('assets/ending.json').then(r=>r.ok?r.json():{}).then(config=>{
    if(direction.ending!==run)return;
    run.photoSeconds=Math.max(2,Number(config.photo_seconds)||2.4);run.letterBgm=config.letter_bgm||null;
    if(config.bgm){const music=new Audio(config.bgm);music.preload='auto';music.loop=false;music.volume=0;run.music=music;run.musicVolume=Math.max(0,Math.min(1,Number(config.bgm_volume)||.65));music.onended=()=>run.musicFinished=true;music.onerror=()=>{run.musicFailed=true;$('ending-music-resume')?.setAttribute('hidden','');};}
    if(config.video){direction.ending.video=config.video;$('birthday-video').src=config.video;$('birthday-video').load();}
    return Promise.all((config.media||config.photos?.map(src=>({type:'photo',src}))||[]).map(item=>new Promise(resolve=>{
      if(item.type==='video'){const clip=document.createElement('video');clip.muted=true;clip.playsInline=true;clip.preload='auto';clip.loop=true;clip.onloadeddata=()=>resolve(clip);clip.onerror=()=>resolve(null);clip.src=item.src;clip.load();}
      else {const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>resolve(null);img.src=item.src;}
    })));
  }).then(photos=>{if(direction.ending!==run)return;if(photos)direction.photos=photos.filter(Boolean);if(run.previewPhotos)run.start=direction.now-48001;}).catch(()=>{});
  sound('enter');
}
function updateEnding(time){
  const e=direction.ending;if(!e)return;const elapsed=(time-e.start)/1000,index=Math.min(7,Math.floor(Math.max(0,elapsed-2)/5));
  if(e.media==='montage'){
    if(index!==e.segment){e.segment=index;sound('paper');}
    if(elapsed<2)$('cinema-caption').textContent='散落的日子，慢慢接成一卷。';
    else if(elapsed<42)$('cinema-caption').textContent=ENDING_COPIES[index];
    else if(elapsed<46)$('cinema-caption').textContent='走过的那些地方，\n最后都回到你身边。';
    else $('cinema-caption').textContent='';
      if(elapsed>=48){e.media='blackout';e.blackoutAt=time;$('cinema-caption').textContent='';document.body.classList.add('ending-blackout');muteAmbient();}
    }else if(e.media==='blackout'){
      if(time>=e.blackoutAt+4000){
        document.body.classList.remove('ending-blackout');document.body.classList.add('ending-rush');
        canvas.classList.add('photo-album');e.media=direction.photos.length?'photoRush':'birthday';e.rushAt=time;e.birthdayAt=time;
        const schedule=memorySchedule(direction.photos,e.music?.duration,e.photoSeconds);e.photoBeats=schedule.beats;e.rushSeconds=schedule.duration;e.photoIndex=-1;
      }
    }else if(e.media==='photoRush'){
      $('cinema-caption').textContent='';
      if(memoryPlaybackAge(e,time)>=e.rushSeconds-.02){direction.photos.forEach(m=>{if(m instanceof HTMLVideoElement)m.pause();});e.media='birthday';e.birthdayAt=time;$('cinema-caption').textContent='宝宝，生日快乐。\n我们的故事，还在继续。';}
  }else if(e.media==='birthday'){
    canvas.classList.toggle('photo-album',direction.photos.length>0);
      const duration=7200,age=time-e.birthdayAt;
    if(e.video&&!e.videoPlayed&&age>=duration){playBirthdayVideo();return;}
    if(age>10000&&age<duration)$('cinema-caption').textContent='';
    if(age>=duration){
      if(!e.letterShown){openBirthdayLetter();return;}
      $('cinema-caption').textContent='宝宝，生日快乐。\n我们的故事，还在继续。';e.completed=true;
      game.nearby={label:'再读一次 Herry 的信',action:openBirthdayLetter};ui.action.hidden=false;ui.action.textContent=game.nearby.label;
    }
  }
    syncEndingMusic(e,time);
    if(!['blackout','photoRush','birthday','letter'].includes(e.media))ambient(time);
}
let letterWriting=null,letterMusic=null,letterMusicSource=null,letterTextNodes=null,letterMusicPending=false;
function stopLetterMusic(){if(letterMusic){letterMusic.pause();letterMusic.currentTime=0;}letterMusicPending=false;}
function syncLetterMusic(){
  const button=$('letter-music-toggle');
  if(!letterMusicSource){button.hidden=true;return;}
  button.hidden=false;
  if($('birthday-letter').hidden||document.hidden||!game.soundOn){letterMusic?.pause();button.textContent='♪ 播放晴天';return;}
  if(!letterMusic){letterMusic=new Audio(letterMusicSource);letterMusic.loop=true;letterMusic.preload='auto';letterMusic.volume=0;letterMusic.onerror=()=>{button.textContent='配乐加载失败 · 点击重试';};}
  if(letterMusic.paused&&!letterMusicPending){const active=letterMusic;letterMusicPending=true;
    active.play().then(()=>{if(active!==letterMusic)return;letterMusicPending=false;if($('birthday-letter').hidden||document.hidden||!game.soundOn){active.pause();return;}button.textContent='♪ 静音';}).catch(()=>{if(active!==letterMusic)return;letterMusicPending=false;button.textContent='♪ 播放晴天';});
  }
}
function stopLetterWriting(){if(letterWriting)cancelAnimationFrame(letterWriting.raf);letterWriting=null;$('birthday-letter').classList.remove('is-writing');}
function finishLetterWriting(){
  const writing=letterWriting;if(!writing)return;
  writing.nodes.forEach(part=>{part.node.data=part.text;part.paragraph.hidden=false;part.paragraph.classList.remove('is-current');});
  writing.done=true;writing.index=writing.nodes.length;
  $('birthday-letter').classList.remove('is-writing');$('letter-show-all').hidden=true;
  document.querySelector('.birthday-letter-signature').hidden=false;document.querySelector('.birthday-letter-bottom').hidden=false;
}
function startLetterWriting(){
  stopLetterWriting();const screen=$('birthday-letter'),body=screen.querySelector('.birthday-letter-body');
  if(!letterTextNodes){const walker=document.createTreeWalker(body,NodeFilter.SHOW_TEXT);letterTextNodes=[];let node;
    while(node=walker.nextNode())if(node.data.trim())letterTextNodes.push({node,text:node.data,chars:Array.from(node.data),paragraph:node.parentElement.closest('p')});
  }
  letterTextNodes.forEach(part=>{part.node.data='';part.paragraph.hidden=true;part.paragraph.classList.remove('is-current');});
  document.querySelector('.birthday-letter-signature').hidden=true;document.querySelector('.birthday-letter-bottom').hidden=true;
  screen.classList.add('is-writing');$('letter-show-all').hidden=false;$('letter-follow').hidden=true;
  const writing=letterWriting={nodes:letterTextNodes,index:0,offset:0,elapsed:0,last:0,delay:800,follow:true,done:false,raf:0,musicAge:0};
  const frame=now=>{
    if(letterWriting!==writing||screen.hidden)return;
    const dt=writing.last?Math.min(80,Math.max(0,now-writing.last)):0;writing.last=now;
    if(!document.hidden){writing.elapsed+=dt;writing.musicAge+=dt;
      if(!writing.done&&writing.elapsed>=writing.delay){
        writing.elapsed=0;const part=writing.nodes[writing.index];part.paragraph.hidden=false;part.paragraph.classList.add('is-current');
        const character=part.chars[writing.offset++];part.node.data+=character;
        writing.delay=/[，。！？,.!?]/.test(character)?280:character===' '?55:110;
        if(writing.offset===part.chars.length){const next=writing.nodes[writing.index+1];writing.index++;writing.offset=0;if(!next)finishLetterWriting();else if(next.paragraph!==part.paragraph){part.paragraph.classList.remove('is-current');writing.delay=650;}}
      }
      if(writing.follow){const last=writing.done?screen.querySelector('.birthday-letter-signature'):writing.nodes[Math.min(writing.index,writing.nodes.length-1)]?.paragraph;
        if(last&&!last.hidden){const overflow=last.getBoundingClientRect().bottom-(innerHeight-110);if(overflow>0)screen.scrollTop+=Math.max(1,overflow*.14);}
      }
      if(letterMusic&&!letterMusic.paused)letterMusic.volume=.45*Math.min(1,writing.musicAge/1500);
    }
    writing.raf=requestAnimationFrame(frame);
  };
  writing.raf=requestAnimationFrame(frame);
}
function pauseLetterFollow(){if(letterWriting&&!letterWriting.done){letterWriting.follow=false;$('letter-follow').hidden=false;}}
$('letter-follow').onclick=()=>{if(letterWriting){letterWriting.follow=true;$('letter-follow').hidden=true;}};
$('letter-show-all').onclick=finishLetterWriting;
$('letter-music-toggle').onclick=()=>{game.soundOn=letterMusic?.paused!==false;syncLetterMusic();};
document.addEventListener('visibilitychange',syncLetterMusic);
$('birthday-letter').addEventListener('wheel',event=>{if(event.deltaY<0)pauseLetterFollow();},{passive:true});
let letterTouchY=0;
$('birthday-letter').addEventListener('touchstart',event=>{letterTouchY=event.touches[0]?.clientY||0;},{passive:true});
$('birthday-letter').addEventListener('touchmove',event=>{if((event.touches[0]?.clientY||0)>letterTouchY+5)pauseLetterFollow();},{passive:true});
function hideBirthdayLetter(){
  stopLetterWriting();stopLetterMusic();
  $('birthday-letter').hidden=true;document.body.classList.remove('reading-birthday-letter');
  if($('game-shell').inert)$('game-shell').inert=false;
}
function openBirthdayLetter(){
  const e=direction.ending;if(!e||game.scene!=='ending')return;
  e.media='letter';e.letterShown=true;e.completed=true;
  stopEndingMusic();game.nearby=null;ui.action.hidden=true;$('cinema-caption').hidden=true;
  $('birthday-video').pause();$('birthday-video').hidden=true;$('video-resume').hidden=true;
  document.body.classList.remove('ending-blackout','ending-rush');document.body.classList.add('reading-birthday-letter');
  $('game-shell').inert=true;const letter=$('birthday-letter');letter.hidden=false;letter.scrollTop=0;
  letter.querySelector('article').focus({preventScroll:true});
  const source=e.letterBgm||null;if(source!==letterMusicSource){stopLetterMusic();letterMusic=null;letterMusicSource=source;}
  startLetterWriting();syncLetterMusic();
}
$('birthday-letter-close').onclick=()=>{
  hideBirthdayLetter();const e=direction.ending;if(e){e.media='birthday';$('cinema-caption').hidden=false;}
  game.nearby={label:'再读一次 Herry 的信',action:openBirthdayLetter};ui.action.hidden=false;ui.action.textContent=game.nearby.label;ui.action.focus({preventScroll:true});
};
$('birthday-letter-home').onclick=()=>{
  hideBirthdayLetter();clearInteraction();direction.ending=null;ui.play.classList.remove('cinematic');$('cinema-caption').hidden=true;
  transitionTo(()=>setProjectorRoom(true));$('home-button').focus({preventScroll:true});
};
$('birthday-letter').addEventListener('keydown',event=>{
  event.stopPropagation();
  if(['ArrowUp','PageUp','Home'].includes(event.key))pauseLetterFollow();
  if(event.key==='Escape'){event.preventDefault();$('birthday-letter-close').click();return;}
  if(event.key==='Tab'){
    const buttons=Array.from(event.currentTarget.querySelectorAll('button')).filter(button=>!button.hidden&&button.getClientRects().length),first=buttons[0],last=buttons[buttons.length-1];
    if(event.shiftKey&&(document.activeElement===first||document.activeElement===event.currentTarget.querySelector('article'))){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  }
});
  // Readable main-photo holds with a gentle first/last slowdown for a BGM edit.
  // The S curve is a depth trajectory, not a grid of tiny thumbnails.
  function photoArrivalTimes(count,hold=direction.ending?.photoSeconds||2.4){const beats=[];let time=0;for(let i=0;i<count;i++){if(i)time+=i===1?Math.max(3.5,hold):i>=count-3?hold+.6+(i-(count-3))*.4:hold;beats.push(time);}return beats;}
  function memorySchedule(media,musicDuration,hold=2.4){
    const weights=media.map((m,i)=>m instanceof HTMLVideoElement?Math.max(4,Math.min(8,m.duration||6)):i===0?3.5:i===media.length-1?4.5:hold);
    const minimum=media.map(m=>m instanceof HTMLVideoElement?Math.min(4,m.duration||4):2);
    const base=minimum.reduce((a,b)=>a+b,0),normal=weights.reduce((a,b)=>a+b,0);
    const target=Number.isFinite(musicDuration)&&musicDuration>=base?musicDuration:normal;
    const extras=weights.map((w,i)=>Math.max(.1,w-minimum[i])),sum=extras.reduce((a,b)=>a+b,0);
    let cursor=0;const beats=weights.map((_,i)=>{const start=cursor;cursor+=minimum[i]+(target-base)*extras[i]/sum;return start;});
    return {beats,duration:target};
  }
  function memoryPlaybackAge(e,time){
    // Use the audio playhead so delayed autoplay or a background tab cannot
    // leave the final memory ahead of the piano's ending.
    if(e.music&&!e.musicFailed&&!e.musicCancelled){if(e.musicStarted||e.musicFinished)return e.music.currentTime;if(e.musicPending||e.musicBlocked)return 0;}
    return Math.max(0,(time-e.rushAt)/1000);
  }
  function drawPhotoRibbon(time,settled=false){
    const e=direction.ending,count=direction.photos.length;if(!count)return;
    const age=memoryPlaybackAge(e,time),beats=e.photoBeats||photoArrivalTimes(count);
    let head=0;while(head<count-1&&age>=beats[head+1])head++;
    if(settled)head=count-1;
    const next=beats[head+1],phase=next==null?0:Math.min(1,(age-beats[head])/(next-beats[head]));
    const drift=Math.max(0,Math.min(1,(phase-.65)/.35));
    const progress=head+(direction.reduced?0:drift*drift*(3-2*drift));
    ctx.fillStyle='#050e19';ctx.fillRect(0,0,960,540);pixelGlow(480,245,480,'#7cbbb3',.15);pixelGlow(780,120,240,'#e8c690',.07);
    if(!direction.reduced){ctx.save();ctx.strokeStyle='#beded414';ctx.lineWidth=1;for(let ring=0;ring<3;ring++){ctx.beginPath();for(let n=0;n<130;n++){const a=n*.055+age*.09,r=60+n*(2.5+ring*.35),x=480+Math.cos(a)*r,y=245+Math.sin(a)*r*.48;if(n)ctx.lineTo(x,y);else ctx.moveTo(x,y);}ctx.stroke();}ctx.restore();}
    ctx.save();ctx.imageSmoothingEnabled=true;e.visiblePhotos=0;e.photoIndex=head;e.revealedCount=head+1;
    for(let i=Math.max(0,head-8);i<=head;i++){
      const local=settled&&i===head?1:Math.max(0,age-beats[i]);if(local<=0)continue;
      const arrivalDuration=i===0?1.2:Math.min(.42,((beats[i+1]??beats[i]+1)-beats[i])*.75);
      const d=progress-i,t=Math.min(1,local/arrivalDuration),ease=1-Math.pow(1-t,3);
      const x=direction.reduced?480+(i-head)*110:480+Math.sin(d*.91)*340+(1-ease)*210;
      const y=direction.reduced?245:245+Math.sin(d*1.22)*98-(1-ease)*55;
      const depth=direction.reduced?i===head?1:.48:1/(1+d*.28),fade=Math.max(0,Math.min(1,(8-d)/2));
      if(fade<=0)continue;e.visiblePhotos++;
      const img=direction.photos[i];
      if(img instanceof HTMLVideoElement){if(i===head&&!settled){if(!img._memoryPlaying){img._memoryPlaying=true;img.currentTime=0;img.play().catch(()=>{img._memoryPlaying=false;});}}else if(img._memoryPlaying){img.pause();img._memoryPlaying=false;}}
      const ratio=(img.naturalWidth||img.videoWidth)/(img.naturalHeight||img.videoHeight),w=Math.min(590,350*ratio),h=w/ratio;
      ctx.save();ctx.globalAlpha=Math.min(1,i===0?t:t*4)*fade;ctx.translate(x,y);
      ctx.rotate(direction.reduced?0:Math.sin(d*.76)*.17-(1-ease)*.18);
      const scale=depth*(direction.reduced?1:.78+ease*.22);ctx.scale(scale,scale);
      ctx.shadowColor='#000b';ctx.shadowBlur=26;ctx.shadowOffsetY=12;ctx.fillStyle='#eee7d6';ctx.fillRect(-w/2-7,-h/2-7,w+14,h+24);ctx.shadowBlur=0;ctx.shadowOffsetY=0;
      frameImage(img,-w/2,-h/2,w,h,false);ctx.fillStyle=`rgba(3,13,22,${(1-depth)*.24})`;ctx.fillRect(-w/2,-h/2,w,h);ctx.restore();
    }
    ctx.restore();ctx.imageSmoothingEnabled=false;
    const shade=ctx.createRadialGradient(480,245,180,480,245,590);shade.addColorStop(0,'#02081000');shade.addColorStop(1,'#020810a0');ctx.fillStyle=shade;ctx.fillRect(0,0,960,540);
  }
function memoryCard(index,x,y,w,angle,scale,alpha){
  const h=w*.61,img=direction.captureImages[index+1];ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);ctx.rotate(angle);ctx.scale(scale,scale);
  ctx.shadowColor='#03101cc0';ctx.shadowBlur=18;ctx.fillStyle='#f2e7c9';ctx.fillRect(-w/2-9,-h/2-9,w+18,h+34);ctx.shadowBlur=0;
  ctx.fillStyle=CHAPTERS[index].ink;ctx.fillRect(-w/2,-h/2,w,h);
  if(img)frameImage(img,-w/2,-h/2,w,h,false);
  else {drawSprite(images.herry,{x:-27,y:h*.37,frame:1,dir:0},54,91);drawSprite(images.jenny,{x:20,y:h*.37,frame:1,dir:0},50,86);drawSprite(images.peanut,{x:87,y:h*.4,frame:1,dir:0},37,48);}
  ctx.fillStyle='#466359';ctx.font='11px sans-serif';ctx.textAlign='center';ctx.fillText(CHAPTERS[index].title,0,h/2+24);ctx.restore();
}
function drawEnding(time){
  setMemoryCanvasResolution(['photoRush','birthday'].includes(direction.ending?.media)&&direction.photos.length>0);
  const e=direction.ending;if(!e)return;const elapsed=(time-e.start)/1000;ctx.fillStyle='#071725';ctx.fillRect(0,0,960,540);
  if(e.media==='montage'){
    const fade=Math.max(0,Math.min(1,(elapsed-42)/6));const phase=elapsed*.28;
    pixelGlow(480,245,470,'#78b5c5',.15*(1-fade));
    if(!direction.reduced){ctx.save();ctx.strokeStyle='#a8d4d025';ctx.lineWidth=1;for(let ring=0;ring<3;ring++){ctx.beginPath();for(let n=0;n<160;n++){const a=n*.045+phase,r=30+n*(2+ring*.4);const x=480+Math.cos(a)*r,y=260+Math.sin(a)*r*.57;if(n===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.stroke();}ctx.restore();}
    for(let k=0;k<7;k++){
      const a=phase+k*Math.PI*2/7,r=360+(k%3)*65;
      const x=480+Math.cos(a)*r,y=250+Math.sin(a)*r*.52;
      memoryCard((Math.max(0,e.segment)+k+1)%8,x,y,190,direction.reduced?0:a*.35,1,.26*(1-fade));
    }
    if(elapsed<2){memoryCard(0,480,244,470,0,.8+elapsed*.1,elapsed/2);}
    else if(elapsed<42){const t=(elapsed-2)%5/5,spin=direction.reduced?0:(1-t)*(1-t)*-.32+.025*Math.sin(phase);const scale=direction.reduced?1:.75+Math.min(1,t*4)*.25;const alpha=Math.min(1,t*5)*Math.min(1,(1-t)*7);memoryCard(e.segment,480,245,615,spin,scale,alpha);if(t<.3&&e.segment>0)memoryCard(e.segment-1,480-t*800,245-t*200,615,t*.8,1-t,.65*(1-t/.3));}
    else {ctx.save();ctx.globalAlpha=1-fade;const scale=direction.reduced?1:1-fade*.22;ctx.translate(480,270);ctx.scale(scale,scale);ctx.rotate(direction.reduced?0:fade*.08);ctx.translate(-480,-270);drawMemoryVignette(8,time);ctx.restore();}
    if(!direction.reduced){ctx.fillStyle='#e0ecb9';for(let i=0;i<40;i++){const a=phase+i*.81,r=40+(i*37+elapsed*12)%510;ctx.globalAlpha=.16*(1-fade);ctx.fillRect(480+Math.cos(a)*r,260+Math.sin(a)*r*.56,2,2);}ctx.globalAlpha=1;}
    ctx.fillStyle='#061a2480';ctx.fillRect(0,395,960,145);
      ctx.fillStyle=`rgba(0,0,0,${fade})`;ctx.fillRect(0,0,960,540);
    }else if(e.media==='blackout'){
      ctx.fillStyle='#000';ctx.fillRect(0,0,960,540);
    }else if(e.media==='photoRush'){
      drawPhotoRibbon(time);
  }else if(e.media==='birthday'){
      if(direction.photos.length&&e.rushAt!=null){drawPhotoRibbon(time,true);ctx.fillStyle='#05101980';ctx.fillRect(0,385,960,155);return;}
    const t=(time-e.birthdayAt)/1000,alpha=Math.min(1,t/2.8);ctx.fillStyle='#f1f1de';ctx.fillRect(0,0,960,540);
    if(direction.photos.length){
      const hold=e.photoSeconds||4,index=Math.min(direction.photos.length-1,Math.floor(Math.max(0,t-2.8)/hold));
      const local=t-2.8-index*hold,blend=index===0?alpha:Math.max(0,Math.min(1,local/1.2));
      ctx.save();ctx.imageSmoothingEnabled=true;
      if(index>0){ctx.globalAlpha=1-blend;frameImage(direction.photos[index-1],100,30,760,470,false);}
      ctx.globalAlpha=blend;const z=direction.reduced?1:1+Math.max(0,local)*.006;ctx.translate(480,270);ctx.scale(z,z);ctx.translate(-480,-270);frameImage(direction.photos[index],100,30,760,470,false);ctx.restore();ctx.imageSmoothingEnabled=false;
      e.photoIndex=index;
      if($('cinema-caption').textContent){ctx.fillStyle='#15333e66';ctx.fillRect(0,400,960,140);}
    }
    else {ctx.save();ctx.globalAlpha=alpha;drawMemoryVignette(8,time);ctx.restore();}
    ctx.fillStyle='#334e4b';ctx.font='11px Arial';ctx.textAlign='center';ctx.fillText('10.25 · HAPPY BIRTHDAY, JENNY',480,25);
  }
}
function drawMemoryVignette(i,time){ctx.fillStyle=['#23474f','#365346','#524453','#164f69','#514854','#415c4d','#705841','#263c53','#24464c'][i];ctx.fillRect(30,35,900,450);pixelGlow(480,250,220,'#ecd8a0',.15);drawPoseSprite(images.herry,{x:446,y:375,frame:1,dir:0},90,150,.025);drawPoseSprite(images.jenny,{x:502,y:375,frame:1,dir:0},84,142,-.025);drawSprite(images.peanut,{x:606,y:390,frame:1,dir:0},64,82);ctx.fillStyle='#e3a5b0';ctx.font='25px serif';ctx.textAlign='center';ctx.fillText('♥',476,231);}
function playBirthdayVideo(){const e=direction.ending;e.media='video';e.videoPlayed=true;stopEndingMusic();$('cinema-caption').hidden=true;const v=$('birthday-video');v.hidden=false;muteAmbient();v.play().catch(()=>{$('video-resume').hidden=false;});}
$('video-resume').onclick=()=>{$('birthday-video').play().then(()=>$('video-resume').hidden=true).catch(()=>{});};
$('birthday-video').onended=()=>{$('birthday-video').hidden=true;direction.ending.media='birthday';direction.ending.birthdayAt=direction.now;$('cinema-caption').hidden=false;$('cinema-caption').textContent='宝宝，生日快乐。\n我好爱你。';};
$('birthday-video').onerror=()=>{if(direction.ending?.media==='video'){$('birthday-video').hidden=true;$('video-resume').hidden=true;direction.ending.media='birthday';direction.ending.birthdayAt=direction.now;$('cinema-caption').hidden=false;$('cinema-caption').textContent='苏雨菲 Jenny，生日快乐。\n从那些日子，到以后每一天。';}};
function unlockAudio(){if(!game.soundOn)return;try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;direction.audio ||= new AC();if(direction.audio.state==='suspended')direction.audio.resume();}catch{}}
function tone(freq,duration=.25,volume=.025,type='sine'){if(!game.soundOn||!direction.audio||document.hidden)return;try{const a=direction.audio,o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(.0001,a.currentTime);g.gain.exponentialRampToValueAtTime(volume,a.currentTime+.025);g.gain.exponentialRampToValueAtTime(.0001,a.currentTime+duration);o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+duration+.02);}catch{}}
function sound(kind){unlockAudio();const notes={paper:[392,523],film:[392,494,659],enter:[261,392,523],lamp:[523]};(notes[kind]||[]).forEach((f,i)=>setTimeout(()=>tone(f,.3,.035,'triangle'),i*100));}
function ambient(time){if(!pixelMusic.failed||!game.soundOn||blocked()||time<direction.nextTone||direction.ending?.media==='video')return;direction.nextTone=time+1600;const chords=game.scene==='aquarium'?[196,294,392,440]:game.scene==='hangdae'?[220,330,392,494]:[261.6,329.6,392,523];tone(chords[Math.floor(time/1600)%4],2.1,.012);}
function muteAmbient(){direction.nextTone=direction.now+6000;}
// Opening screen: a tiny city on a blue evening, with the three protagonists
// together rather than a generic landing-page illustration.
const titleCanvas=$('title-art'),titleCtx=titleCanvas.getContext('2d');
function drawTitle(time) {
  if(!ui.title.classList.contains('active')){requestAnimationFrame(drawTitle);return;}
  const c=titleCtx;c.imageSmoothingEnabled=false;
  const sky=c.createLinearGradient(0,0,0,540);
  sky.addColorStop(0,'#071521');sky.addColorStop(.68,'#102b36');sky.addColorStop(1,'#0b202a');
  c.fillStyle=sky;c.fillRect(0,0,960,540);
  for(let i=0;i<32;i++){c.fillStyle='#ceddcd35';c.fillRect((i*139)%960,18+(i*71)%280,1,1);}
  const glow=c.createRadialGradient(480,255,45,480,255,320);
  glow.addColorStop(0,'#6bafa11a');glow.addColorStop(1,'#6bafa100');
  c.fillStyle=glow;c.fillRect(0,0,960,540);
  c.fillStyle='#152e38';
  for(let i=0;i<16;i++){const x=i*65,h=35+(i*19)%72;c.fillRect(x,470-h,53,h);
    c.fillStyle='#b8b78426';for(let y=480-h;y<465;y+=19){for(let wx=0;wx<3;wx++)if((i+wx)%3)c.fillRect(x+9+wx*14,y,3,5);}
    c.fillStyle='#152e38';
  }
  c.fillStyle='#112933';c.fillRect(0,470,960,70);
  c.strokeStyle='#2c454733';for(let y=493;y<540;y+=22){c.beginPath();c.moveTo(0,y);c.lineTo(960,y);c.stroke();}
  const cast=$('title-cast-art'),a=cast.getContext('2d');a.clearRect(0,0,360,170);a.imageSmoothingEnabled=false;
  const poses=[{img:images.herry,x:139,y:150,w:70,h:122},{img:images.jenny,x:185,y:150,w:65,h:115},{img:images.peanut,x:263,y:153,w:49,h:64}];
  for(const p of poses){a.fillStyle='#020e1948';a.beginPath();a.ellipse(p.x,p.y,19,4,0,0,Math.PI*2);a.fill();
    if(p.img){const fw=p.img.width/4,fh=p.img.height/4;a.drawImage(p.img,fw,0,fw,fh,p.x-p.w/2,p.y-p.h,p.w,p.h);}
  }
  a.fillStyle='#e8a5b4';a.font='16px serif';a.textAlign='center';a.fillText('♥',162,25);
  if(!direction.reduced){a.fillStyle='#d9d3977a';for(let i=0;i<5;i++)a.fillRect(65+i*54,55+Math.sin(time/1800+i)*9+(i%2)*38,2,2);}
  requestAnimationFrame(drawTitle);
}
requestAnimationFrame(drawTitle);

// This switch is absent on the hosted birthday site: Jenny never sees the
// chapter list. Preview jumps run in memory and do not change the normal save.
if(['localhost','127.0.0.1','[::1]','::1'].includes(location.hostname)||location.protocol==='file:'){
  const toggle=document.createElement('button');toggle.className='dev-jump-toggle';toggle.id='dev-jump-toggle';toggle.textContent='开发 · 跳到某一幕';toggle.setAttribute('aria-expanded','false');
  const panel=document.createElement('section');panel.id='dev-jump-panel';panel.className='dev-jump-panel';panel.hidden=true;panel.setAttribute('aria-label','开发场景跳转');
  const note=document.createElement('p');note.textContent='直接预览场景，不清空或覆盖正式存档。这个菜单只在本地开发显示。';
  const grid=document.createElement('div');grid.className='dev-jump-grid';panel.append(note,grid);document.body.append(toggle,panel);
  toggle.onclick=()=>{panel.hidden=!panel.hidden;toggle.setAttribute('aria-expanded',String(!panel.hidden));};
  const scenes=[
    ['放映室',()=>{game.stage=0;setProjectorRoom(false);}],
    ['弘大 · 身高镜子',()=>{CHAPTERS[0].enter();clearInteraction();mirrorMoment();}],
    ['弘大 · 戒指小摊',()=>{CHAPTERS[0].enter();game.stage=11;player.x=player.tx=160;player.y=player.ty=405;herry.x=235;herry.y=405;herry.tiptoe=0;}],
    ['假英语课堂',()=>CHAPTERS[1].enter()],
    ['明洞 · 浅粉色大衣',()=>CHAPTERS[2].enter()],
    ['海洋馆',()=>CHAPTERS[3].enter()],
    ['首尔日常街区',()=>CHAPTERS[4].enter()],
    ['校园 · 咖啡店',()=>CHAPTERS[5].enter()],
    ['校园 · 篮球场',()=>{setCampusCafe();setCampusCourt();}],
    ['篮球 · Herry 投篮',()=>{setCampusCafe();setCampusCourt();clearInteraction();startHerryShot();}],
    ['人生四格',()=>{setCampusCafe();setCampusCourt();clearInteraction();game.campus.couple=true;startPhotoBooth();}],
    ['深圳 · 沃尔玛',()=>CHAPTERS[6].enter()],
    ['深圳 · 摆晚餐',()=>{setShenzhenMarket();game.shenzhen.selected=game.shenzhen.foods.slice(0,3).map((f,index)=>({...f,index}));setShenzhenHome();}],
    ['KAU · 站台送花',()=>CHAPTERS[7].enter()],
    ['KAU · 宿舍夜路',()=>{setHangdaeStation();setHangdaeRoad();}],
    ['KAU · 楼下告别',()=>{setHangdaeStation();setHangdaeRoad();clearInteraction();game.hangdae.lamps.fill(true);player.x=player.tx=855;player.y=player.ty=435;herry.x=782;herry.y=435;peanut.x=720;peanut.y=450;enterDorm();}],
    ['终章 · 旋转蒙太奇',()=>startEnding()],
    ['真人照片 · 漂浮回忆',()=>{startEnding();direction.ending.previewPhotos=true;}],
    ['终章 · Herry 的信',()=>{startEnding();openBirthdayLetter();}]
  ];
  for(const [label,setup]of scenes){const button=document.createElement('button');button.type='button';button.textContent=label;grid.append(button);button.onclick=()=>{
    if(!images.jenny||!images.herry||!images.peanut){note.textContent='角色素材还在加载，稍等一下再跳转。';return;}
    direction.devPreview=true;clearInteraction();game.fade=0;game.transition=null;game.running=true;direction.ending=null;direction.chapterIndex=-1;herry.tiptoe=0;player.speed=185;$('birthday-video').pause();$('birthday-video').hidden=true;$('video-resume').hidden=true;$('cinema-caption').hidden=true;$('restart-panel').hidden=true;ui.title.classList.remove('active');ui.play.classList.add('active');ui.play.classList.remove('cinematic');
    setup();seedPeanutTrail();updateObjective();if(!game.loopStarted){game.loopStarted=true;requestAnimationFrame(loop);}panel.hidden=true;toggle.setAttribute('aria-expanded','false');toast('开发预览 · '+label);
  };}
  document.addEventListener('keydown',event=>{if(event.key==='Escape'){panel.hidden=true;toggle.setAttribute('aria-expanded','false');}});
}
