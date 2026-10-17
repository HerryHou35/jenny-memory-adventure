/* Private midnight cinema. Pixel Agents chairs are reused under the existing
   MIT attribution; architecture, curtains and lighting are original Canvas art. */
const cinemaSet = document.createElement('canvas');
cinemaSet.width=960;cinemaSet.height=540;
function paintCinemaSet(c){
  const rect=(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
  rect(0,0,960,540,'#10282d');
  // Acoustic fabric, walnut pilasters, and a restrained brass picture rail.
  for(let x=0;x<960;x+=12)rect(x,24,1,263,x%24?'#1b3739':'#204040');
  for(const x of [12,264,680,936]){
    rect(x,24,12,278,'#142d30');rect(x+2,24,3,278,'#40534b');
    rect(x-4,22,20,8,'#846f4c');rect(x-4,282,20,15,'#695d43');
  }
  rect(0,0,960,13,'#081c23');rect(0,13,960,4,'#665b40');
  rect(0,19,960,7,'#263d39');rect(0,28,960,2,'#8a7851');
  rect(0,263,960,31,'#213a37');
  for(let x=30;x<960;x+=62){rect(x,267,48,23,'#30463e');rect(x+2,269,44,19,'#253d37');}
  rect(0,294,960,6,'#736446');rect(0,300,960,6,'#11272a');
  // Walnut floor with staggered joints. Cache rather than repaint every frame.
  rect(0,306,960,234,'#37433b');
  for(let row=0;row<9;row++){
    const y=306+row*28;
    for(let col=-1;col<9;col++){
      const x=col*144+(row%2)*72;
      rect(x,y,142,26,['#3f493d','#414a3f','#39453b'][(row+col+9)%3]);
      rect(x+5,y+4,126,1,'#4a5344');rect(x+18,y+19,96,1,'#354037');
    }
  }
  // Low stage, upholstered screen surround and gathered velvet curtains.
  rect(277,39,406,224,'#0a1c23');rect(284,42,392,217,'#304c49');
  rect(288,45,384,211,'#9b8156');rect(292,49,376,203,'#182c30');
  for(const side of [0,1])for(let i=0;i<7;i++){
    const x=side?650+i*4:282+i*4;
    const bottom=253-i*7;
    rect(x,50,5,bottom-50,['#17383b','#2e5350','#234743','#3c6157'][i%4]);
    rect(x,bottom,5,3,'#a18a55');
  }
  rect(282,36,396,12,'#244642');rect(282,47,396,3,'#a68d5b');
  for(let x=288;x<670;x+=18){rect(x,38,9,8,'#36594f');rect(x+2,46,7,3,'#c2a16a');}
  rect(292,254,376,8,'#8c7951');rect(279,262,402,10,'#203832');
  rect(273,272,414,6,'#5f6248');rect(273,278,414,5,'#142c2b');
  // Woven aisle runner: kept clear for Jenny and Peanut to walk through.
  c.beginPath();c.moveTo(415,322);c.lineTo(545,322);c.lineTo(625,540);c.lineTo(335,540);c.closePath();c.fillStyle='#1e393a';c.fill();
  for(const inset of [0,8]){c.beginPath();c.moveTo(419+inset,326);c.lineTo(541-inset,326);c.lineTo(611-inset,540);c.lineTo(349+inset,540);c.closePath();c.strokeStyle=inset?'#365550':'#89764e';c.lineWidth=2;c.stroke();}
  for(let y=348;y<540;y+=26){const half=55+(y-322)*.28;c.fillStyle='#3b5750';c.fillRect(480-half,y,half*2,1);}
  // Brass sconces and a small cinema plaque, no empty chapter slots.
  for(const x of [28,264,696,932]){
    rect(x-2,119,5,40,'#8b7752');rect(x-7,131,15,4,'#b29a68');
    rect(x-10,103,21,25,'#8b805a');rect(x-8,105,17,20,'#ddc18b');
    rect(x-11,102,23,3,'#c3aa73');rect(x-10,126,21,3,'#6b644b');
  }
  // A few low shelves and film tins give the room a lived-in quality.
  for(const x of [68,720]){
    rect(x,283,156,4,'#947953');rect(x+5,287,146,13,'#2a3b32');
    rect(x+12,300,4,8,'#172c29');rect(x+137,300,4,8,'#172c29');
    for(let i=0;i<3;i++){
      rect(x+10,276-i*5,43,4,'#889586');rect(x+13,277-i*5,36,1,'#bfbd9a');
    }
    for(let i=0;i<5;i++){
      rect(x+71+i*11,265+(i%2)*4,8,18-(i%2)*4,['#a08b61','#627d6c','#4e6962'][i%3]);
      rect(x+73+i*11,269+(i%2)*4,4,2,'#c1af84');
    }
  }
  // Tiny festoon bulbs above the picture walls, never an empty chapter grid.
  for(const start of [38,710]){
    c.beginPath();c.moveTo(start,43);c.quadraticCurveTo(start+101,67,start+204,43);c.strokeStyle='#657665';c.lineWidth=1;c.stroke();
    for(let i=0;i<9;i++){
      const t=i/8,x=start+t*204,y=43+48*t*(1-t);
      rect(Math.round(x),Math.round(y),1,5,'#79816a');rect(Math.round(x)-1,Math.round(y)+5,3,4,'#d5bd88');
    }
  }
  // Foreground foliage frames the stage without crossing the walkable aisle.
  for(const x of [13,947]){
    rect(x-12,518,24,22,'#75684e');rect(x-14,516,28,5,'#a18d65');
    for(let i=0;i<7;i++){
      const sx=x+(i-3)*7,sy=481+(i%3)*10;
      c.strokeStyle='#3b6250';c.lineWidth=2;c.beginPath();c.moveTo(x,516);c.lineTo(sx,sy);c.stroke();
      rect(sx-6,sy,12,5,'#406651');rect(sx-4,sy-3,9,4,'#57795d');
    }
  }
  rect(390,10,180,22,'#142a2a');c.textAlign='center';c.fillStyle='#c6b182';c.font='9px Georgia';c.fillText('HERRY & JENNY  /  PRIVATE CINEMA',480,24);
  // Projector console: an actual object instead of a machine floating in space.
  rect(423,282,114,37,'#10282a');rect(428,286,104,27,'#35443a');
  rect(426,280,108,6,'#99815c');rect(437,290,35,16,'#20332e');
  rect(480,290,42,16,'#20332e');rect(458,296,7,2,'#b29c68');
  rect(489,296,7,2,'#b29c68');rect(431,317,7,10,'#0e2528');rect(522,317,7,10,'#0e2528');
  // Doorway surround stays behind the existing interactive portal.
  rect(748,286,132,163,'#0a2027');rect(750,284,128,6,'#7b7758');
  rect(747,290,8,159,'#43534a');rect(873,290,8,159,'#43534a');
  rect(741,449,145,6,'#7b7758');
  rect(758,294,112,151,'#283e39');rect(762,298,104,143,'#3b5145');
  rect(771,308,86,67,'#9a8860');rect(775,312,78,59,'#192e34');
  rect(780,317,68,49,'#263f43');rect(813,312,2,59,'#a39570');
  rect(775,341,78,2,'#a39570');rect(774,385,80,48,'#2b433a');
  rect(778,389,72,40,'#344c3f');rect(847,397,8,4,'#c5ab6e');
  rect(795,322,2,2,'#bdb98f');rect(830,353,2,2,'#a2bba9');
}
paintCinemaSet(cinemaSet.getContext('2d'));

drawProjectorRoom=function(time){
  ctx.save();ctx.drawImage(cinemaSet,0,0);
  const lit=game.stage>=2,count=CHAPTERS.filter(c=>game[c.key]).length;
  // Screen glow is strongest at the stage, with a subtle spill onto the rug.
  pixelGlow(480,163,285,'#d7d7b0',lit?.13:.025);
  pixelGlow(480,327,155,'#a4c0a0',lit?.055:.012);
  const screen=ctx.createLinearGradient(0,58,0,245);
  screen.addColorStop(0,lit?'#b0c3b2':'#233e41');
  screen.addColorStop(.55,lit?'#cad3b9':'#2e4949');
  screen.addColorStop(1,lit?'#95afa3':'#233b40');
  ctx.fillStyle=screen;ctx.fillRect(313,58,334,187);
  for(let y=61;y<244;y+=4){ctx.fillStyle=lit?'#102d3010':'#9dbb9a05';ctx.fillRect(313,y,334,1);}
  ctx.textAlign='center';ctx.fillStyle=lit?'#2c4d47':'#a3b7a5';ctx.font='10px Georgia';
  ctx.fillText('THE DAYS WE KEEP',480,94);
  ctx.fillStyle=lit?'#234940':'#becbb4';ctx.font='17px sans-serif';
  ctx.fillText(count===8?'所有路，最后都走向你。':'有些日子，想和你再过一遍。',480,132);
  ctx.fillStyle=lit?'#587368':'#829c91';ctx.font='9px Arial';ctx.fillText('A FILM BY HERRY · FOR JENNY',480,158);
  ctx.fillRect(464,175,32,1);ctx.font='11px Georgia';ctx.fillText('10 . 25',480,198);
  // Warm lights return gradually; the lighting never reveals a chapter count.
  for(const [i,x] of [28,264,696,932].entries()){
    const power=.10+(lit?.07:0)+Math.min(count,4)*.015;
    pixelGlow(x,116,75,'#ffd197',power);
    ctx.fillStyle=lit?'#ffe1a9':'#c5b181';ctx.fillRect(x-7,106,15,18);
  }
  filmRects.forEach((r,i)=>{
    if(!game[CHAPTERS[i].key])return;
    pixelGlow(r.x+r.w/2,r.y+r.h/2,79,CHAPTERS[i].ink,.09);
    ctx.fillStyle='#071b21';ctx.fillRect(r.x-5,r.y-5,r.w+10,r.h+26);
    ctx.fillStyle='#9b835b';ctx.fillRect(r.x-3,r.y-3,r.w+6,r.h+22);
    ctx.fillStyle='#e1d8b8';ctx.fillRect(r.x,r.y,r.w,r.h+18);
    frameImage(direction.captureImages[i+1],r.x+3,r.y+3,r.w-6,r.h-6);
    ctx.fillStyle='#374f45';ctx.textAlign='center';ctx.font='9px sans-serif';ctx.fillText(CHAPTERS[i].title.slice(0,9),r.x+r.w/2,r.y+r.h+12);
    ctx.fillStyle='#cab481';ctx.fillRect(r.x+r.w/2-3,r.y-7,6,4);
  });
  if(lit){
    ctx.save();ctx.globalCompositeOperation='screen';
    const beam=ctx.createLinearGradient(480,244,480,75);beam.addColorStop(0,'#ffe8ac25');beam.addColorStop(1,'#d8e5c802');
    ctx.fillStyle=beam;ctx.beginPath();ctx.moveTo(480,247);ctx.lineTo(313,70);ctx.lineTo(647,70);ctx.closePath();ctx.fill();
    if(!direction.reduced)for(let i=0;i<28;i++){
      const phase=(time*.000025+i*.073)%1,y=82+phase*155;
      const spread=(247-y)*.86,x=480+Math.sin(i*19.3+time*.00012)*spread;
      ctx.globalAlpha=Math.sin(phase*Math.PI)*.28;ctx.fillStyle='#fff0c3';ctx.fillRect(Math.round(x),Math.round(y),i%5?1:2,1);
    }
    ctx.restore();
  }
  drawProjector(lit);
  // Animated reel spokes stay anchored on the existing machine sprite.
  if(lit)for(const x of [455,505]){
    ctx.save();ctx.translate(x,215);ctx.rotate(direction.reduced?0:time*.0007);ctx.fillStyle='#1b3434';
    for(let j=0;j<3;j++){ctx.rotate(Math.PI*2/3);ctx.fillRect(4,-2,6,4);}ctx.restore();
  }
  // Retain the licensed upholstered seats; leave key, aisle and portal clear.
  for(const x of [68,285,625,700]){
    ctx.fillStyle='#091e2344';ctx.beginPath();ctx.ellipse(x,402,37,8,0,0,Math.PI*2);ctx.fill();
    ctx.drawImage(images.chairBack,x-35,331,70,70);
  }
  if(game.stage===0)drawKey();
  const portals={2:drawPortal,4:drawEnglishPortal,6:drawMyeongdongPortal,8:drawAquariumPortal,10:drawDailyPortal,11:drawCampusPortal,12:drawShenzhenPortal,14:drawHangdaePortal};
  if(portals[game.stage])portals[game.stage](time);
  ctx.fillStyle='#c6b990';ctx.font='10px sans-serif';ctx.textAlign='left';
  ctx.fillText(count?'点墙上的胶片，可以再走进那一天':'每找回一张胶片，这里就多亮一盏灯',25,520);
  if(count===8){pixelGlow(480,268,60,'#f7dc8c',.22);ctx.fillStyle='#f7e2ad';ctx.font='bold 13px sans-serif';ctx.textAlign='center';ctx.fillText('放映我们的故事',480,345);}
  const shade=ctx.createRadialGradient(480,240,170,480,240,550);shade.addColorStop(0,'#07182000');shade.addColorStop(1,'#07182070');ctx.fillStyle=shade;ctx.fillRect(0,0,960,540);
  ctx.restore();
};
