/* Version-pinned local delivery, including byte ranges for audio and video. */
const PREFIX='jenny-prepared-',META='jenny-prepared-client-pins',scope=new URL(self.registration.scope);
const key=path=>new URL(path,scope).href;
async function marker(version){if(!/^[a-f0-9]{16}$/.test(version||''))return null;const cache=await caches.open(PREFIX+version),r=await cache.match(key('_prepared/ready'));return r?{cache,info:await r.json()}:null;}
async function bind(id,version){if(id){const pins=await caches.open(META);await pins.put(key('_prepared/client/'+id),new Response(version));}}
async function pinned(id){if(!id)return null;const r=await(await caches.open(META)).match(key('_prepared/client/'+id));return r?marker(await r.text()):null;}
self.addEventListener('install',e=>e.waitUntil(self.skipWaiting()));
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('message',e=>{if(e.data?.type==='PIN_PREPARED')e.waitUntil((async()=>{const ready=await marker(e.data.version);if(ready)await bind(e.source.id,e.data.version);e.ports[0]?.postMessage({ok:Boolean(ready)});})());});
async function selection(e){
  let selected=await pinned(e.clientId);const requested=new URL(e.request.url).searchParams.get('version');
  if(!selected){const choices=[];for(const name of await caches.keys()){if(name.startsWith(PREFIX)){const item=await marker(name.slice(PREFIX.length));if(item)choices.push(item);}}choices.sort((a,b)=>b.info.completedAt-a.info.completedAt);selected=choices.find(c=>c.info.release===requested)||choices[0];}
  return selected;
}
async function fallbackNavigation(e,selected){
  if(!selected)return new Response('尚未在这台设备准备完整网站，请联网后打开。',{status:503,headers:{'Content-Type':'text/plain;charset=utf-8'}});
  await bind(e.resultingClientId,selected.info.version);return await selected.cache.match(key('index.html'))||new Response('本机页面缓存已失效，请联网重新准备。',{status:503});
}
async function deliver(e){
  const req=e.request,url=new URL(req.url);
  if(req.mode==='navigate'){
    const selected=await selection(e),c=new AbortController(),timer=selected?setTimeout(()=>c.abort(),3500):null;
    try{
      const r=await fetch(req,{signal:c.signal});if(!r.ok&&selected)return fallbackNavigation(e,selected);
      if(selected){const html=await r.clone().text(),release=/name="jenny-release" content="([^"]+)"/.exec(html)?.[1];if(release===selected.info.release)await bind(e.resultingClientId,selected.info.version);}
      return r;
    }catch{return fallbackNavigation(e,selected);}finally{clearTimeout(timer);}
  }
  if(req.headers.has('X-Jenny-Prepare'))return fetch(req);
  const ready=await pinned(e.clientId);if(!ready)return fetch(req);
  if(url.pathname===new URL('precache-manifest.json',scope).pathname){try{return await fetch(req);}catch{return await ready.cache.match(key('precache-manifest.json'))||Response.error();}}
  const v=url.searchParams.get('v');if(v&&v!==ready.info.release)return fetch(req);
  url.search='';const cached=await ready.cache.match(url.href);if(!cached)return fetch(req);
  if(!req.headers.has('Range'))return cached;
  const blob=await cached.blob(),range=/^bytes=(\d*)-(\d*)$/.exec(req.headers.get('Range'));
  let start,end;
  if(range&&(range[1]||range[2])){
    start=range[1]?Number(range[1]):Math.max(0,blob.size-Number(range[2]));end=range[1]?(range[2]?Math.min(blob.size-1,Number(range[2])):blob.size-1):blob.size-1;
  }
  if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>end||start>=blob.size)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${blob.size}`}});
  const headers=new Headers(cached.headers);headers.set('Content-Range',`bytes ${start}-${end}/${blob.size}`);headers.set('Content-Length',String(end-start+1));headers.set('Accept-Ranges','bytes');
  return new Response(blob.slice(start,end+1),{status:206,headers});
}
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method==='GET'&&u.origin===scope.origin&&u.pathname.startsWith(scope.pathname))e.respondWith(deliver(e));});
