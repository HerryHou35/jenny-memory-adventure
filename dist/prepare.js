/* Explicit, verified preparation. No game/media contents are modified here. */
const preparedShow={manifest:null,busy:false,ready:false,pending:null,bypass:false,controllers:new Set(),registration:null};
(()=>{
  const $=id=>document.getElementById(id),base=new URL('./',location.href),release=document.querySelector('meta[name="jenny-release"]').content;
  const cacheName=m=>'jenny-prepared-'+m.version,readyURL=new URL('_prepared/ready',base).href;
  const mb=n=>(n/1048576).toFixed(1)+' MB';
  function detail(copy){$('prepare-detail').textContent=copy;}
  function show(){ $('prepare-panel').hidden=false;$('game-shell').inert=true;$('prepare-close').focus({preventScroll:true}); }
  function close(){pause();$('prepare-panel').hidden=true;$('game-shell').inert=false;$('prepare-open').focus({preventScroll:true});}
  function pause(){preparedShow.cancelled=true;for(const c of preparedShow.controllers)c.abort();}
  async function manifest(){
    if(preparedShow.manifest)return preparedShow.manifest;
    if(!isSecureContext||!navigator.serviceWorker||!window.caches||!crypto.subtle)throw Error('此浏览器不能可靠保存完整素材。请用 HTTPS 地址，在普通模式下用 Chrome、Edge 或 Safari 打开。');
    const c=new AbortController(),timer=setTimeout(()=>c.abort(),30000);
    try{
      const r=await fetch(new URL('precache-manifest.json',base),{cache:'no-store',signal:c.signal});if(!r.ok)throw Error('准备清单暂时无法读取，请联网后重试。');
      const m=await r.json();
      if(m.release!==release)throw Error('网站版本已更新，请刷新页面后重新准备，避免混用新旧素材。');
      if(!/^[a-f0-9]{16}$/.test(m.version)||!Array.isArray(m.files)||!m.files.length)throw Error('素材清单不完整，请刷新后重试。');
      for(const f of m.files){const u=new URL(f.path,base);if(u.origin!==base.origin||!u.pathname.startsWith(base.pathname)||!Number.isSafeInteger(f.bytes)||f.bytes<1||!/^[a-f0-9]{64}$/.test(f.sha256))throw Error('素材清单校验失败。');}
      preparedShow.manifest=m;return m;
    }finally{clearTimeout(timer);}
  }
  async function worker(){
    if(!preparedShow.registration)preparedShow.registration=await navigator.serviceWorker.register(new URL('offline-worker.js',base),{scope:base.pathname,updateViaCache:'none'});
    await navigator.serviceWorker.ready;
    if(!navigator.serviceWorker.controller)await new Promise((resolve,reject)=>{
      const listener=()=>{clearTimeout(timer);navigator.serviceWorker.removeEventListener('controllerchange',listener);resolve();};
      const timer=setTimeout(()=>{navigator.serviceWorker.removeEventListener('controllerchange',listener);reject(Error('本地缓存尚未接管页面，请刷新后重试。'));},12000);
      navigator.serviceWorker.addEventListener('controllerchange',listener);if(navigator.serviceWorker.controller)listener();
    });
  }
  async function pin(m){
    await worker();await new Promise((resolve,reject)=>{
      const channel=new MessageChannel(),timer=setTimeout(()=>{channel.port1.close();reject(Error('缓存连接超时，请刷新后重试。'));},10000);
      channel.port1.onmessage=e=>{clearTimeout(timer);channel.port1.close();e.data?.ok?resolve():reject(Error('完整缓存未就绪，请重新准备。'));};
      navigator.serviceWorker.controller.postMessage({type:'PIN_PREPARED',version:m.version},[channel.port2]);
    });
  }
  async function valid(cache,f){const r=await cache.match(new URL(f.path,base));return Boolean(r&&r.status===200&&r.headers.get('X-Jenny-SHA256')===f.sha256&&Number(r.headers.get('X-Jenny-Bytes'))===f.bytes);}
  async function inspect(m){
    const cache=await caches.open(cacheName(m));let bytes=0,count=0;const missing=[];
    for(const f of m.files){if(await valid(cache,f)){bytes+=f.bytes;count++;}else missing.push(f);}
    return {cache,bytes,count,missing};
  }
  async function hydrate(m){
    if(preparedShow.hydratedVersion===m.version)return;
    if(typeof loadImages==='function'){await loadImages(m.version);ui.loading.style.display='none';ui.continue.hidden=!game.memoryOne;ui.start.textContent=game.memoryOne?'从头重玩':'进入放映室';}
    if(typeof pixelMusic!=='undefined'){pixelMusic.audio.pause();pixelMusic.audio.src='assets/pixel-bgm.ogg?prepared='+m.version;pixelMusic.audio.load();pixelMusic.failed=false;}
    preparedShow.hydratedVersion=m.version;
  }
  function progress(m,bytes,count){$('prepare-progress').value=bytes/m.totalBytes;detail(`${mb(bytes)} / ${mb(m.totalBytes)} · 已校验 ${count}/${m.files.length} 项`);}
  async function check(){
    const m=await manifest(),state=await inspect(m);
    if(state.missing.length)return false;
    const marker=await state.cache.match(readyURL);if(!marker)return false;
    await pin(m);await hydrate(m);preparedShow.ready=true;return true;
  }
  async function download(){
    if(preparedShow.busy)return;preparedShow.busy=true;preparedShow.ready=false;preparedShow.cancelled=false;
    $('prepare-download').hidden=true;$('prepare-play').hidden=true;$('prepare-close').textContent='暂停准备，返回首页';$('prepare-status').textContent='正在读取完整清单…';
    try{
      const m=await manifest();await worker();if(preparedShow.cancelled)throw new DOMException('Paused','AbortError');const state=await inspect(m);let bytes=state.bytes,count=state.count,cursor=0;const errors=[];
      const storage=await navigator.storage?.estimate?.();const needed=m.totalBytes-bytes;
      if(storage?.quota&&storage.quota-(storage.usage||0)<needed*1.1)throw Error('当前浏览器剩余空间不足。请释放空间后重试；不会删除你的游戏存档。');
      navigator.storage?.persist?.().catch(()=>false);
      $('prepare-status').textContent='正在下载并校验完整素材，请保持页面打开。';progress(m,bytes,count);
      await Promise.all(Array.from({length:Math.min(3,state.missing.length)},async()=>{
        while(cursor<state.missing.length&&!errors.length&&!preparedShow.cancelled){
          const f=state.missing[cursor++],c=new AbortController(),timer=setTimeout(()=>c.abort(),180000);preparedShow.controllers.add(c);
          try{
            const r=await fetch(new URL(f.path,base),{cache:'reload',signal:c.signal,headers:{'X-Jenny-Prepare':'1'}});
            if(r.status!==200)throw Error('素材请求失败');const buffer=await r.arrayBuffer();
            if(buffer.byteLength!==f.bytes)throw Error('素材未下载完整');
            const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',buffer)),b=>b.toString(16).padStart(2,'0')).join('');
            if(hash!==f.sha256)throw Error('素材版本或完整性不符');
            const headers=new Headers(r.headers);headers.set('X-Jenny-SHA256',hash);headers.set('X-Jenny-Bytes',String(f.bytes));headers.set('Content-Length',String(f.bytes));headers.delete('Content-Encoding');
            await state.cache.put(new URL(f.path,base),new Response(buffer,{status:200,headers}));bytes+=f.bytes;count++;progress(m,bytes,count);
          }catch(e){errors.push(e);for(const other of preparedShow.controllers)other.abort();}
          finally{clearTimeout(timer);preparedShow.controllers.delete(c);}
        }
      }));
      if(errors.length)throw errors[0];if(preparedShow.cancelled)throw new DOMException('Paused','AbortError');if((await inspect(m)).missing.length)throw Error('仍有素材未准备好，请重试。');
      await state.cache.put(new URL('precache-manifest.json',base),new Response(JSON.stringify(m),{headers:{'Content-Type':'application/json'}}));
      await state.cache.put(readyURL,new Response(JSON.stringify({version:m.version,release:m.release,completedAt:Date.now()}),{headers:{'Content-Type':'application/json'}}));
      await pin(m);await hydrate(m);preparedShow.ready=true;
      $('prepare-status').textContent='全部素材已下载并校验完成，可以开始。';$('prepare-play').hidden=false;
      $('prepare-summary').textContent='完整素材已在本机准备好 · 开始前会再次检查';$('prepare-open').textContent='检查本机完整素材';
    }catch(e){
      preparedShow.ready=false;$('prepare-status').textContent=e.name==='AbortError'?'准备已暂停或连接超时，已完成的文件会保留。':e.name==='QuotaExceededError'?'本地空间不足，未标记为准备完成。请释放空间后重试。':e.message;
      $('prepare-download').hidden=false;$('prepare-download').textContent='重试／继续准备';
    }finally{preparedShow.busy=false;$('prepare-close').textContent='返回首页';}
  }
  $('prepare-open').onclick=()=>{preparedShow.pending=$('continue-button').hidden?'start-button':'continue-button';$('prepare-play').textContent=preparedShow.pending==='continue-button'?'准备好了，继续':'准备好了，开始';show();detail('包含全部原有素材，不降低照片清晰度。');};
  $('prepare-download').onclick=download;$('prepare-close').onclick=close;
  $('prepare-play').onclick=()=>{const target=preparedShow.pending;close();if(target)document.getElementById(target).click();};
  document.addEventListener('click',async event=>{
    const button=event.target.closest('#start-button,#continue-button');if(!button)return;
    if(preparedShow.bypass){preparedShow.bypass=false;return;}
    event.preventDefault();event.stopImmediatePropagation();preparedShow.pending=button.id;
    try{if(await check()){preparedShow.bypass=true;button.click();return;}}catch(e){$('prepare-status').textContent=e.message;}
    show();
  },true);
  $('prepare-panel').addEventListener('keydown',e=>{
    e.stopPropagation();if(e.key==='Escape'){e.preventDefault();close();}
    if(e.key==='Tab'){const items=[...$('prepare-panel').querySelectorAll('button')].filter(b=>!b.hidden&&!b.disabled),first=items[0],last=items[items.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
  });
})();
