// Produce display-sized copies; originals in memory/ remain untouched.
const fs=require('node:fs'),path=require('node:path');
const sharp=require('C:/Users/18731/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root=path.resolve(__dirname,'..'),collator=new Intl.Collator('zh-CN',{numeric:true});
(async()=>{
  const order=[];
  for(const group of ['1','2']){
    const folder=path.join(root,'memory',group);
    const names=fs.readdirSync(folder).filter(name=>/\.(jpe?g|png|webp|mp4|webm|mov)$/i.test(name)).sort(collator.compare);
    if(group==='1'){const first=names.findIndex(name=>name.includes('第一张播这个'));if(first<0)throw Error('Missing requested first photo');names.unshift(...names.splice(first,1));}
    const dest=path.join(root,'dist','assets','memories','album',group);fs.mkdirSync(dest,{recursive:true});
    for(let i=0;i<names.length;i++){
      const video=/\.(mp4|webm|mov)$/i.test(names[i]),filename=String(i+1).padStart(3,'0')+(video?path.extname(names[i]).toLowerCase():'.webp');
      if(video)fs.copyFileSync(path.join(folder,names[i]),path.join(dest,filename));
      else await sharp(path.join(folder,names[i])).rotate().resize({width:1600,height:1600,fit:'inside',withoutEnlargement:true}).webp({quality:85,effort:4}).toFile(path.join(dest,filename));
      order.push({source:'memory/'+group+'/'+names[i],url:'assets/memories/album/'+group+'/'+filename,type:video?'video':'photo'});
    }
  }
  const configPath=path.join(root,'dist','assets','ending.json'),config=JSON.parse(fs.readFileSync(configPath,'utf8'));
  config.photos=order.filter(m=>m.type==='photo').map(m=>m.url);config.media=order.map(m=>({type:m.type,src:m.url}));
  fs.writeFileSync(configPath,JSON.stringify(config,null,2)+'\n');
  fs.writeFileSync(path.join(root,'docs','MEMORY-PHOTO-ORDER.json'),JSON.stringify({total:order.length,order},null,2)+'\n');
  console.log(JSON.stringify({total:order.length,photos:config.photos.length,videos:order.filter(m=>m.type==='video').length}));
})().catch(error=>{console.error(error.message);process.exitCode=1;});
