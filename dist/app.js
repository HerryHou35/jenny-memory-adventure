const canvas = document.querySelector("#game-canvas");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const ui = {
  title: document.querySelector("#title-screen"), play: document.querySelector("#play-screen"), start: document.querySelector("#start-button"), continue: document.querySelector("#continue-button"), restart: document.querySelector("#restart-button"),
  loading: document.querySelector("#loading"), objective: document.querySelector("#objective"), scene: document.querySelector("#scene-label"),
  action: document.querySelector("#action-button"), dialogue: document.querySelector("#dialogue"), speaker: document.querySelector("#speaker"),
  avatar: document.querySelector("#speaker-avatar"), dialogueText: document.querySelector("#dialogue-text"), tapMarker: document.querySelector("#tap-marker"),
  ringPanel: document.querySelector("#ring-panel"), letterPanel: document.querySelector("#letter-panel"), memoryCount: document.querySelector("#memory-count")
};

const images = {};
const imagePaths = { jenny: "assets/sprites/jenny-walk-v2.png", herry: "assets/sprites/herry-walk-v2.png", peanut: "assets/sprites/peanut-walk-v2.png", chairBack: "assets/props/cinema-chair-back.png", key: "assets/props/key-yellow.png", film: "assets/props/film-white.png", ringBlue: "assets/props/ring-blue.png", ringGreen: "assets/props/ring-green.png", ringDiamond: "assets/props/ring-diamond.png" };
const save = JSON.parse(localStorage.getItem("jenny-adventure-prototype") || "{}") || {};
const game = { scene: "projector", stage: save.memoryOne ? 4 : 0, memoryOne: Boolean(save.memoryOne), running: false, loopStarted: false, lastTime: 0, keys: new Set(), dialogueQueue: [], dialogueCallback: null, nearby: null, fade: 0, transition: null };
const player = { x: 480, y: 410, tx: 480, ty: 410, speed: 185, dir: 0, moving: false, frame: 1 };
const peanut = { x: 420, y: 430, dir: 0, moving: false, frame: 1, trail: [] };
const herry = { x: 730, y: 355, dir: 0, frame: 1, tiptoe: 0 };

function loadImages() { return Promise.all(Object.entries(imagePaths).map(([key, src]) => new Promise((resolve, reject) => { const image = new Image(); image.onload = () => { images[key] = image; resolve(); }; image.onerror = reject; image.src = src; }))); }
function persist() { localStorage.setItem("jenny-adventure-prototype", JSON.stringify({ memoryOne: game.memoryOne })); }

function startGame(continueSaved = false) {
  if (!continueSaved) { localStorage.removeItem("jenny-adventure-prototype"); game.memoryOne = false; game.stage = 0; }
  game.dialogueQueue = []; game.dialogueCallback = null; game.nearby = null; game.fade = 0; game.transition = null; ui.dialogue.hidden = true; ui.ringPanel.hidden = true; ui.letterPanel.hidden = true; ui.action.hidden = true;
  ui.title.classList.remove("active"); ui.play.classList.add("active"); game.running = true;
  if (continueSaved && game.memoryOne) { game.stage = 4; setProjectorRoom(true); say("花生", "第一张胶片已经回来了。剩下的六扇光门，还在等我们。", "🐶"); }
  else { setProjectorRoom(false); sayMany([["花生", "Jenny！你终于来了。我本来想给你放一部很重要的电影……", "🐶"],["花生", "可放映机不动了，胶片也少了七格。先在房间里找找能让它转起来的东西吧。", "🐶"]]); }
  if (!game.loopStarted) { game.loopStarted = true; requestAnimationFrame(loop); }
}

function seedPeanutTrail() { peanut.trail = Array.from({ length: 16 }, (_, index) => ({ x: peanut.x + (player.x - peanut.x) * index / 15, y: peanut.y + (player.y - peanut.y) * index / 15 })); }
function setProjectorRoom(restored) { game.scene = "projector"; player.x = player.tx = 480; player.y = player.ty = 420; peanut.x = 410; peanut.y = 430; seedPeanutTrail(); game.stage = restored ? 4 : game.stage; ui.scene.textContent = "序章 · 坏掉的放映室"; updateObjective(); }
function setHongdae() { game.scene = "hongdae"; game.stage = 10; player.x = player.tx = 470; player.y = player.ty = 430; peanut.x = 400; peanut.y = 445; seedPeanutTrail(); ui.scene.textContent = "第一章 · 弘大镜子里的小姚明"; updateObjective(); say("花生", "这里就是故事开始的地方。去看看那面镜子，它好像还记得你们。", "🐶"); }

function updateObjective() {
  let text = "";
  if (game.scene === "projector") { if (game.stage === 0) text = "在放映室里寻找发条"; if (game.stage === 1) text = "把发条装回放映机"; if (game.stage === 2) text = "走进亮起的回忆光门"; if (game.stage >= 4) text = "第一张胶片已归位 · 后续光门正在制作"; }
  else { if (game.stage === 10) text = "走到阿迪店的镜子前"; if (game.stage === 11) text = "去戒指小摊看看"; if (game.stage === 12) text = "拾起恢复的回忆胶片"; if (game.stage >= 13) text = "弘大回忆已经修复"; }
  ui.objective.textContent = text; ui.memoryCount.textContent = `胶片 ${game.memoryOne ? 1 : 0} / 7`;
}

function say(name, text, avatar = "🐶", callback) { game.dialogueQueue.push({ name, text, avatar, callback }); if (ui.dialogue.hidden) showNextDialogue(); }
function sayMany(lines, callback) { lines.forEach((line, index) => say(line[0], line[1], line[2], index === lines.length - 1 ? callback : null)); }
function showNextDialogue() { const next = game.dialogueQueue.shift(); if (!next) { ui.dialogue.hidden = true; return; } ui.speaker.textContent = next.name; ui.dialogueText.textContent = next.text; ui.avatar.textContent = next.avatar; ui.dialogue.hidden = false; game.dialogueCallback = next.callback || null; }
function advanceDialogue() { if (ui.dialogue.hidden) return; const callback = game.dialogueCallback; game.dialogueCallback = null; ui.dialogue.hidden = true; if (callback) callback(); showNextDialogue(); }

function worldPoint(event) { const rect = canvas.getBoundingClientRect(); return { x: (event.clientX - rect.left) * canvas.width / rect.width, y: (event.clientY - rect.top) * canvas.height / rect.height }; }
function setTarget(x, y) { player.tx = Math.max(55, Math.min(905, x)); player.ty = Math.max(285, Math.min(480, y)); }
function onPointer(event) { if (!ui.dialogue.hidden || !ui.ringPanel.hidden || !ui.letterPanel.hidden) return; const p = worldPoint(event); setTarget(p.x, p.y); const rect = canvas.getBoundingClientRect(); ui.tapMarker.style.left = `${event.clientX - rect.left}px`; ui.tapMarker.style.top = `${event.clientY - rect.top}px`; ui.tapMarker.style.display = "block"; ui.tapMarker.style.animation = "none"; void ui.tapMarker.offsetWidth; ui.tapMarker.style.animation = "marker .55s ease-out forwards"; }
function distance(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

function update(dt, time) {
  if (!game.running || !ui.dialogue.hidden || !ui.ringPanel.hidden || !ui.letterPanel.hidden) return;
  let dx = 0, dy = 0;
  if (game.keys.has("ArrowLeft") || game.keys.has("a")) dx -= 1; if (game.keys.has("ArrowRight") || game.keys.has("d")) dx += 1; if (game.keys.has("ArrowUp") || game.keys.has("w")) dy -= 1; if (game.keys.has("ArrowDown") || game.keys.has("s")) dy += 1;
  if (dx || dy) { const length = Math.hypot(dx,dy); dx /= length; dy /= length; player.tx = player.x + dx * 24; player.ty = player.y + dy * 24; }
  const vx = player.tx - player.x, vy = player.ty - player.y, d = Math.hypot(vx,vy); player.moving = d > 2;
  if (player.moving) { const step = Math.min(d, player.speed * dt); player.x += vx / d * step; player.y += vy / d * step; if (Math.abs(vx) > Math.abs(vy)) player.dir = vx < 0 ? 1 : 2; else player.dir = vy < 0 ? 3 : 0; player.frame = Math.floor(time / 150) % 4; } else player.frame = 1;
  player.x = Math.max(55, Math.min(905, player.x)); player.y = Math.max(285, Math.min(480, player.y));
  const newestTrailPoint = peanut.trail[peanut.trail.length - 1];
  if (!newestTrailPoint || Math.hypot(player.x - newestTrailPoint.x, player.y - newestTrailPoint.y) > 4) peanut.trail.push({x:player.x, y:player.y});
  if (peanut.trail.length > 120) peanut.trail.shift();
  const follow = peanut.trail[Math.max(0, peanut.trail.length - 16)] || {x:player.x - 65, y:player.y + 15}; const pdx = follow.x - peanut.x, pdy = follow.y - peanut.y, pd = Math.hypot(pdx,pdy); peanut.moving = pd > 4;
  if (peanut.moving) { const step = Math.min(pd, 150 * dt); peanut.x += pdx / pd * step; peanut.y += pdy / pd * step; if (Math.abs(pdx) > Math.abs(pdy)) peanut.dir = pdx < 0 ? 1 : 2; else peanut.dir = pdy < 0 ? 3 : 0; peanut.frame = Math.floor(time / 170) % 4; } else peanut.frame = 1;
  updateNearby();
}

function updateNearby() {
  game.nearby = null;
  if (game.scene === "projector") { if (game.stage === 0 && distance(player,{x:185,y:405}) < 85) game.nearby = {label:"捡起发条", action:collectKey}; if (game.stage === 1 && distance(player,{x:480,y:305}) < 105) game.nearby = {label:"装上发条", action:startProjector}; if (game.stage === 2 && distance(player,{x:805,y:385}) < 95) game.nearby = {label:"走进回忆", action:()=>transitionTo(setHongdae)}; }
  else { if (game.stage === 10 && distance(player,{x:765,y:370}) < 95) game.nearby = {label:"站到镜子前", action:mirrorMoment}; if (game.stage === 11 && distance(player,{x:160,y:395}) < 95) game.nearby = {label:"看看戒指", action:()=>{ui.ringPanel.hidden=false;}}; if (game.stage === 12 && distance(player,{x:480,y:350}) < 85) game.nearby = {label:"拾起胶片", action:collectFilm}; }
  ui.action.hidden = !game.nearby; if (game.nearby) ui.action.textContent = game.nearby.label;
}

function collectKey() { game.stage = 1; updateObjective(); sayMany([["Jenny", "找到一枚旧发条。", "👧"],["花生", "它和放映机侧面的缺口好像正合适！", "🐶"]]); }
function startProjector() { game.stage = 2; updateObjective(); sayMany([["花生", "转起来了！房间里出现了一扇通往过去的光门。", "🐶"],["花生", "别担心，我会一直跟着你。", "🐶"]]); }
function mirrorMoment() { game.stage = 11; herry.tiptoe = 1; updateObjective(); sayMany([["Herry", "听说你最早知道我的外号，是光云大学小姚明。", "👦"],["花生", "所以他为什么还要偷偷踮脚？", "🐶"],["Jenny", "明明只差十厘米。", "👧"]], () => { herry.tiptoe = 0; }); }
function chooseRing(name) { ui.ringPanel.hidden = true; game.stage = 12; updateObjective(); sayMany([["Jenny", `就这枚${name}吧。`, "👧"],["Herry", "好。你挑的，我会一直留着。", "👦"],["花生", "镜子里的颜色回来了！还有什么东西掉在了地上。", "🐶"]]); }
function collectFilm() { game.stage = 13; game.memoryOne = true; persist(); updateObjective(); ui.letterPanel.hidden = false; }
function transitionTo(callback) { game.transition = callback; game.fade = 0.01; }

function drawSprite(image, entity, width, height, yOffset = 0) { const fw = image.width / 4, fh = image.height / 4; const sx = entity.frame * fw, sy = entity.dir * fh; ctx.drawImage(image, sx, sy, fw, fh, entity.x - width/2, entity.y - height + yOffset, width, height); }
function drawProjectorRoom(time) {
  const restored = game.stage >= 2; ctx.fillStyle = restored ? "#153b43" : "#18262b"; ctx.fillRect(0,0,960,540); ctx.fillStyle = restored ? "#1f5960" : "#25383d"; ctx.fillRect(0,0,960,275); ctx.fillStyle = restored ? "#376a67" : "#344448"; ctx.fillRect(0,275,960,265);
  for(let y=285;y<540;y+=34){ctx.strokeStyle=restored?"#295551":"#2a393c";ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(960,y);ctx.stroke();} for(let x=-200;x<1160;x+=90){ctx.strokeStyle=restored?"#295551":"#2a393c";ctx.beginPath();ctx.moveTo(480,275);ctx.lineTo(x,540);ctx.stroke();}
  ctx.fillStyle="#061116"; ctx.fillRect(330,42,300,170); ctx.strokeStyle=restored?"#9be8c2":"#45585d"; ctx.lineWidth=6; ctx.strokeRect(330,42,300,170); if(restored){const g=ctx.createRadialGradient(480,125,10,480,125,150);g.addColorStop(0,"rgba(255,240,167,.42)");g.addColorStop(1,"rgba(255,240,167,0)");ctx.fillStyle=g;ctx.fillRect(320,30,320,200);}
  drawProjector(restored); drawSeats(); if(game.stage===0) drawKey(); if(game.stage===2) drawPortal(time); if(game.stage>=4){ctx.fillStyle="#122a31";ctx.fillRect(760,302,110,130);ctx.strokeStyle="#3c565b";ctx.strokeRect(760,302,110,130);}
}
function drawProjector(on){ctx.fillStyle="#172329";ctx.fillRect(430,220,100,62);ctx.fillStyle="#34474b";ctx.fillRect(448,202,64,28);ctx.fillStyle=on?"#f7c94a":"#6a7777";ctx.beginPath();ctx.arc(480,234,16,0,Math.PI*2);ctx.fill();if(on){ctx.strokeStyle="#f7c94a";ctx.lineWidth=4;ctx.beginPath();ctx.arc(455,215,14,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(505,215,14,0,Math.PI*2);ctx.stroke();}}
function drawSeats(){for(let x=72;x<890;x+=142){ctx.drawImage(images.chairBack,x,306,88,88);}}
function drawKey(){ctx.save();ctx.translate(185,375);ctx.rotate(-.2);ctx.shadowColor="rgba(247,201,74,.75)";ctx.shadowBlur=18;ctx.drawImage(images.key,-30,-30,60,60);ctx.restore();}
function drawPortal(time){const pulse=8+Math.sin(time/220)*5;ctx.fillStyle="rgba(111,225,181,.16)";ctx.fillRect(755-pulse/2,282-pulse/2,120+pulse,170+pulse);ctx.strokeStyle="#7be0ae";ctx.lineWidth=6;ctx.strokeRect(765,292,100,150);ctx.fillStyle="rgba(87,182,210,.35)";ctx.fillRect(771,298,88,138);ctx.fillStyle="#fff2cf";ctx.font="bold 12px sans-serif";ctx.textAlign="center";ctx.fillText("弘大 · 过去",815,475);}
function drawHongdae(time){
  const restored=game.stage>=12;ctx.fillStyle=restored?"#163746":"#25333a";ctx.fillRect(0,0,960,540);ctx.fillStyle=restored?"#31596a":"#3d484c";ctx.fillRect(0,0,960,270);ctx.fillStyle=restored?"#455a61":"#444b4d";ctx.fillRect(0,270,960,270);
  ctx.fillStyle=restored?"#d9eff0":"#8a9595";ctx.fillRect(675,70,200,235);ctx.fillStyle=restored?"#80b6c3":"#748184";ctx.fillRect(690,85,170,205);ctx.strokeStyle="#f2ead7";ctx.lineWidth=7;ctx.strokeRect(675,70,200,235);
  ctx.fillStyle=restored?"#25576a":"#414d51";ctx.fillRect(38,155,240,165);ctx.fillStyle="#17282e";ctx.fillRect(55,175,205,120);[images.ringBlue,images.ringGreen,images.ringDiamond].forEach((ring,i)=>ctx.drawImage(ring,82+i*58,211,46,46));ctx.fillStyle="#fff2cf";ctx.font="bold 14px sans-serif";ctx.textAlign="center";ctx.fillText("RING",158,193);
  if(game.stage>=11){herry.y=game.stage===11?355-Math.sin(time/120)*3:355;drawSprite(images.herry,herry,80,130);} if(game.stage===12) drawFilm(time);ctx.fillStyle="rgba(255,255,255,.5)";ctx.font="12px sans-serif";ctx.textAlign="left";ctx.fillText("HONGDAE · SEOUL",32,40);
}
function drawFilm(time){ctx.save();ctx.translate(480,335+Math.sin(time/250)*7);ctx.fillStyle="#f7c94a";ctx.fillRect(-30,-30,60,60);ctx.shadowColor="rgba(247,201,74,.75)";ctx.shadowBlur=18;ctx.drawImage(images.film,-23,-23,46,46);ctx.restore();}
function draw(time) { ctx.clearRect(0,0,960,540); if(game.scene==="projector") drawProjectorRoom(time); else drawHongdae(time); [{type:"peanut",e:peanut,w:60,h:78},{type:"jenny",e:player,w:70,h:122}].sort((a,b)=>a.e.y-b.e.y).forEach(a=>drawSprite(images[a.type],a.e,a.w,a.h)); if(game.fade>0){ctx.fillStyle=`rgba(255,248,220,${Math.min(1,game.fade)})`;ctx.fillRect(0,0,960,540);} }
function loop(time) { const dt=Math.min(.034,(time-game.lastTime)/1000||0);game.lastTime=time;update(dt,time);if(game.fade>0){if(game.transition){game.fade+=dt*2.5;if(game.fade>=1){const cb=game.transition;game.transition=null;cb();game.fade=.99;}}else{game.fade-=dt*3;if(game.fade<=0)game.fade=0;}}draw(time);requestAnimationFrame(loop); }

ui.start.addEventListener("click",()=>startGame(false));ui.continue.addEventListener("click",()=>startGame(true));ui.restart.addEventListener("click",()=>startGame(false));canvas.addEventListener("pointerdown",onPointer);ui.action.addEventListener("click",()=>game.nearby?.action());ui.dialogue.addEventListener("click",advanceDialogue);
document.addEventListener("keydown",e=>{if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","w","a","s","d"].includes(e.key)){game.keys.add(e.key);e.preventDefault();}if((e.key===" "||e.key==="Enter")&&game.nearby&&!ui.action.hidden)game.nearby.action();});document.addEventListener("keyup",e=>game.keys.delete(e.key));
document.querySelectorAll("[data-ring]").forEach(button=>button.addEventListener("click",()=>chooseRing(button.dataset.ring)));document.querySelector("#return-button").addEventListener("click",()=>{ui.letterPanel.hidden=true;game.stage=4;transitionTo(()=>setProjectorRoom(true));});document.querySelector("#sound-button").addEventListener("click",e=>{e.currentTarget.textContent=e.currentTarget.textContent==="♪"?"×":"♪";});
loadImages().then(()=>{ui.loading.style.display="none"; ui.continue.hidden=!game.memoryOne; ui.start.textContent=game.memoryOne?"从头重玩":"进入放映室";}).catch(()=>{ui.loading.textContent="角色素材加载失败，请刷新重试。";});
